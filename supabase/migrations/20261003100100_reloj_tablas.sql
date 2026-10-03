-- Reloj del día · 2/4 · Tablas y seguridad (RLS)
-- Todas las horas se guardan en timestamptz; lo que se muestra y se manda va en Europe/Madrid.
-- Escritura: solo a través de funciones (security definer) que comprueban la cuenta de Diego.
-- Lectura directa (panel): solo la cuenta de Diego, por RLS.

-- ¿Es la cuenta de Diego? (mismo correo que CORREO_PERMITIDO en las edge functions)
create or replace function public.reloj_es_dueno() returns boolean
language sql stable as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = 'nicolasrecobasystem@gmail.com'
$$;

-- Configuración (una sola fila)
create table if not exists public.reloj_config (
  id int primary key default 1 check (id = 1),
  pomodoro_min numeric not null default 25 check (pomodoro_min > 0),
  descanso_corto_min numeric not null default 5 check (descanso_corto_min > 0),
  descanso_largo_min numeric not null default 15 check (descanso_largo_min > 0),
  pomodoros_por_largo int not null default 4 check (pomodoros_por_largo > 0),
  descanso_min numeric not null default 15 check (descanso_min > 0),
  entreno_min numeric not null default 60 check (entreno_min > 0),
  manana_min numeric not null default 120 check (manana_min > 0),
  aviso_previo_min numeric not null default 2 check (aviso_previo_min >= 0),
  -- fases cuyo FINAL implica parar música o luces (antes de acabar sale aviso_previo)
  fases_con_parada text[] not null default array['pomodoro','descanso_corto','descanso_largo','descanso','entreno','manana'],
  actualizado timestamptz not null default now()
);
insert into public.reloj_config (id) values (1) on conflict (id) do nothing;

-- Agenda diaria (horas en Madrid; dias = día ISO 1=lunes … 7=domingo)
create table if not exists public.reloj_agenda (
  id uuid primary key default gen_random_uuid(),
  nombre text not null default '',
  modo text not null check (modo in ('concentracion','descanso','entreno','manana')),
  hora_inicio time not null,
  hora_fin time not null,
  dias smallint[] not null default array[1,2,3,4,5,6,7]::smallint[],
  activo boolean not null default true,
  creado timestamptz not null default now()
);

-- Cada arranque de un modo
create table if not exists public.reloj_sesiones (
  id uuid primary key default gen_random_uuid(),
  modo text not null check (modo in ('concentracion','descanso','entreno','manana')),
  origen text not null check (origen in ('manual','agenda')),
  agenda_id uuid references public.reloj_agenda(id) on delete set null,
  fecha_agenda date,
  estado text not null default 'activa' check (estado in ('activa','terminada','cancelada')),
  inicio timestamptz not null,
  fin_previsto timestamptz,           -- null = hasta que se pare a mano
  fin timestamptz,
  motivo_fin text,
  creado timestamptz not null default now(),
  unique (agenda_id, fecha_agenda)    -- un bloque de agenda arranca una sola vez por día
);
-- Solo un modo activo a la vez
create unique index if not exists reloj_sesiones_una_activa on public.reloj_sesiones ((true)) where estado = 'activa';

-- Fases concretas
create table if not exists public.reloj_fases (
  id uuid primary key default gen_random_uuid(),
  sesion_id uuid not null references public.reloj_sesiones(id) on delete cascade,
  orden int not null,
  tipo text not null check (tipo in ('pomodoro','descanso_corto','descanso_largo','descanso','entreno','manana')),
  ciclo int,
  inicio_previsto timestamptz not null,
  fin_previsto timestamptz not null,
  estado text not null default 'programada' check (estado in ('programada','activa','terminada','cancelada')),
  motivo text,                        -- p. ej. 'saltada' si el tick llegó tarde y pasó de largo
  iniciada_en timestamptz,
  terminada_en timestamptz,
  unique (sesion_id, orden)
);
create index if not exists reloj_fases_programadas on public.reloj_fases (inicio_previsto) where estado = 'programada';

-- Destinos de webhook. El header NUNCA va aquí: va cifrado en Vault (secreto_id).
-- secreto_env: nombre de un secreto de las edge functions para importarlo a Vault la primera vez.
create table if not exists public.reloj_destinos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  url text not null check (url ~ '^https://'),
  secreto_id uuid,                    -- vault.secrets.id
  secreto_env text,
  pista text,                         -- '••••a1b2' para mostrar en el panel
  activo boolean not null default true,
  creado timestamptz not null default now()
);
-- Primer destino: el agente de Cursor que ya usa la función voz (CURSOR_WEBHOOK_KEY)
insert into public.reloj_destinos (nombre, url, secreto_env)
select 'Grok Bot (Cursor)', 'https://api2.cursor.sh/automations/webhook/286c4eee-8d0a-5487-a3bd-9c478ccae5f4', 'CURSOR_WEBHOOK_KEY'
where not exists (select 1 from public.reloj_destinos);

-- Registro de todo: eventos de webhook (con clave única = idempotencia), entregas, latidos, alertas, acciones.
create table if not exists public.reloj_eventos (
  id uuid primary key default gen_random_uuid(),   -- = id_evento del webhook
  clave text unique,                               -- p. ej. 'fase:<id>', 'aviso_previo:<id>'
  tipo text not null default 'evento' check (tipo in ('evento','entrega','latido','alerta','accion','error')),
  evento text,
  payload jsonb,
  detalle text,
  creado timestamptz not null default now()
);
create index if not exists reloj_eventos_creado on public.reloj_eventos (creado desc);

-- Bandeja de salida
create table if not exists public.reloj_entregas (
  id uuid primary key default gen_random_uuid(),
  id_evento uuid not null references public.reloj_eventos(id) on delete cascade,
  destino_id uuid not null references public.reloj_destinos(id) on delete cascade,
  payload jsonb not null,
  estado text not null default 'pendiente' check (estado in ('pendiente','enviando','entregada','fallida')),
  intentos int not null default 0,
  proximo_intento timestamptz not null default now(),
  enviada_en timestamptz,
  peticion_id bigint,                 -- id de pg_net
  ultimo_estado int,
  ultimo_error text,
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now(),
  unique (id_evento, destino_id)
);
create index if not exists reloj_entregas_pendientes on public.reloj_entregas (proximo_intento) where estado in ('pendiente','enviando');

-- Dispositivos (el Mac) y sus latidos. Del token solo se guarda el hash.
create table if not exists public.reloj_dispositivos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  token_hash text not null unique,
  activo boolean not null default true,
  creado timestamptz not null default now()
);
create table if not exists public.reloj_latidos (
  dispositivo_id uuid primary key references public.reloj_dispositivos(id) on delete cascade,
  ultimo timestamptz not null,
  info jsonb,
  total bigint not null default 1
);
create table if not exists public.reloj_latidos_hist (
  id bigserial primary key,
  dispositivo_id uuid not null references public.reloj_dispositivos(id) on delete cascade,
  en timestamptz not null default now()
);
create index if not exists reloj_latidos_hist_en on public.reloj_latidos_hist (en);

-- Alertas: una por incidente (clave única mientras está abierta)
create table if not exists public.reloj_alertas (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('mac_sin_senal','fase_perdida','entrega_fallida')),
  clave text not null,
  detalle text,
  abierta boolean not null default true,
  abierta_en timestamptz not null default now(),
  cerrada_en timestamptz
);
create unique index if not exists reloj_alertas_una_abierta on public.reloj_alertas (clave) where abierta;

-- RLS: todo cerrado salvo lectura para la cuenta de Diego. Nadie escribe directo.
do $$
declare t text;
begin
  foreach t in array array['reloj_config','reloj_agenda','reloj_sesiones','reloj_fases','reloj_destinos','reloj_eventos',
                           'reloj_entregas','reloj_dispositivos','reloj_latidos','reloj_latidos_hist','reloj_alertas'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I on public.%I', t || '_lectura_diego', t);
    execute format('create policy %I on public.%I for select to authenticated using (public.reloj_es_dueno())', t || '_lectura_diego', t);
    execute format('revoke insert, update, delete, truncate on public.%I from anon, authenticated', t);
  end loop;
end $$;
-- El hash del token del Mac ni siquiera se lee desde el panel
revoke select on public.reloj_dispositivos from anon, authenticated;
grant select (id, nombre, activo, creado) on public.reloj_dispositivos to authenticated;
