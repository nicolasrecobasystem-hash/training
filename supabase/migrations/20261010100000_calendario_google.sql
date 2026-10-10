-- Calendario: eventos de Google Calendar (dirección secreta iCal) y avisos a Levi. Idempotente.
--  · La función «calendario» lee el iCal (secreto «gcal» en Supabase) cada 5 min y guarda aquí los próximos 60 días.
--  · cal_avisar() corre cada minuto y emite por el mismo webhook del Reloj (destinos activos = Levi), con "canal": "calendario":
--      eventos_hoy     06:00 hora de Madrid (los de hoy)
--      eventos_manana  21:00 hora de Madrid (los de mañana)
--      evento_en_1h    1 hora antes de cada evento con hora
--      evento_empieza  cuando empieza
--    Cada aviso sale una sola vez (clave única en reloj_eventos); si el evento se mueve, se avisa de la nueva hora.

create table if not exists public.cal_eventos (
  fuente text not null default 'env',           -- id de cal_fuentes (o 'env' si viene del secreto gcal)
  uid text not null,
  inicio timestamptz not null,
  fin timestamptz,
  todo_el_dia boolean not null default false,
  titulo text not null default '',
  lugar text,
  descripcion text,
  calendario text,
  enlace text,
  visto timestamptz not null default now(),
  primary key (fuente, uid, inicio)
);
create index if not exists cal_eventos_inicio on public.cal_eventos (inicio);
alter table public.cal_eventos enable row level security;
revoke all on public.cal_eventos from anon;
grant select on public.cal_eventos to authenticated;
drop policy if exists cal_eventos_lectura on public.cal_eventos;
create policy cal_eventos_lectura on public.cal_eventos for select to authenticated using (public.reloj_es_dueno());

-- Estado de la última sincronización (una fila)
create table if not exists public.cal_estado (
  id int primary key default 1 check (id = 1),
  ultima timestamptz, ok boolean, eventos int, error text
);
insert into public.cal_estado (id) values (1) on conflict do nothing;
alter table public.cal_estado enable row level security;
revoke all on public.cal_estado from anon;
grant select on public.cal_estado to authenticated;
drop policy if exists cal_estado_lectura on public.cal_estado;
create policy cal_estado_lectura on public.cal_estado for select to authenticated using (public.reloj_es_dueno());

-- Token del cron para llamar a la función (vive solo en Vault; la función lo comprueba con cal_token_valido)
do $$ begin
  if not exists (select 1 from vault.secrets where name = 'cal_cron_token') then
    perform vault.create_secret(encode(extensions.gen_random_bytes(32), 'hex'), 'cal_cron_token', 'Token del cron para la función calendario');
  end if;
end $$;

create or replace function public.cal_token_valido(p_token text) returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select coalesce(length(p_token) >= 40 and exists (select 1 from vault.decrypted_secrets where name = 'cal_cron_token' and decrypted_secret = p_token), false)
$$;
revoke all on function public.cal_token_valido(text) from public;
grant execute on function public.cal_token_valido(text) to anon, authenticated;

-- Sustituye los eventos de la ventana [p_desde, p_hasta) por los que trae la función.
-- p_eventos: [{uid, inicio, fin, todo_el_dia, titulo, lugar, descripcion, calendario, enlace}]
create or replace function public.cal_guardar(p_token text, p_eventos jsonb, p_desde timestamptz, p_hasta timestamptz, p_error text default null, p_fuente text default 'env')
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_n int := 0;
begin
  if not (public.reloj_es_dueno() or public.cal_token_valido(p_token)) then raise exception 'No autorizado'; end if;
  if p_error is not null then
    update public.cal_estado set ultima = now(), ok = false, error = left(p_error, 300) where id = 1;
    return jsonb_build_object('ok', false);
  end if;
  if jsonb_typeof(p_eventos) <> 'array' or jsonb_array_length(p_eventos) > 3000 then raise exception 'Eventos no válidos'; end if;
  delete from public.cal_eventos where fuente = p_fuente and inicio >= p_desde and inicio < p_hasta;
  insert into public.cal_eventos (fuente, uid, inicio, fin, todo_el_dia, titulo, lugar, descripcion, calendario, enlace, visto)
  select left(p_fuente, 60), left(e->>'uid', 300), (e->>'inicio')::timestamptz, nullif(e->>'fin', '')::timestamptz, coalesce((e->>'todo_el_dia')::boolean, false),
         left(coalesce(e->>'titulo', ''), 300), left(nullif(e->>'lugar', ''), 300), left(nullif(e->>'descripcion', ''), 2000),
         left(nullif(e->>'calendario', ''), 120), left(nullif(e->>'enlace', ''), 500), now()
  from jsonb_array_elements(p_eventos) e
  where e->>'uid' is not null and e->>'inicio' is not null
  on conflict (fuente, uid, inicio) do update set fin = excluded.fin, todo_el_dia = excluded.todo_el_dia, titulo = excluded.titulo,
    lugar = excluded.lugar, descripcion = excluded.descripcion, calendario = excluded.calendario, enlace = excluded.enlace, visto = now();
  get diagnostics v_n = row_count;
  delete from public.cal_eventos where inicio < now() - interval '60 days';
  update public.cal_estado set ultima = now(), ok = true, eventos = (select count(*) from public.cal_eventos where inicio >= now()), error = null where id = 1;
  return jsonb_build_object('ok', true, 'eventos', v_n);
end $$;
revoke all on function public.cal_guardar(text, jsonb, timestamptz, timestamptz, text, text) from public;
grant execute on function public.cal_guardar(text, jsonb, timestamptz, timestamptz, text, text) to anon, authenticated;

-- Un evento en el formato del webhook
create or replace function public.cal_json(e public.cal_eventos) returns jsonb
language sql stable as $$
  select jsonb_build_object('titulo', e.titulo, 'todo_el_dia', e.todo_el_dia,
    'hora', case when e.todo_el_dia then null else public.reloj_hhmm(e.inicio) end,
    'hora_fin', case when e.todo_el_dia or e.fin is null then null else public.reloj_hhmm(e.fin) end,
    'inicio_madrid', public.reloj_hora_madrid(e.inicio), 'fin_madrid', public.reloj_hora_madrid(e.fin),
    'lugar', e.lugar, 'descripcion', left(e.descripcion, 500), 'calendario', e.calendario, 'enlace', e.enlace)
$$;

-- Eventos de un día (fecha de Madrid): los que empiezan ese día y los de todo el día que lo cubren
create or replace function public.cal_del_dia(p_fecha date) returns setof public.cal_eventos
language sql stable as $$
  select * from public.cal_eventos e
  where (not e.todo_el_dia and (e.inicio at time zone 'Europe/Madrid')::date = p_fecha)
     or (e.todo_el_dia and (e.inicio at time zone 'Europe/Madrid')::date <= p_fecha
         and coalesce(((e.fin at time zone 'Europe/Madrid')::date), (e.inicio at time zone 'Europe/Madrid')::date + 1) > p_fecha)
  order by e.todo_el_dia desc, e.inicio, e.titulo
$$;

create or replace function public.cal_resumen(p_fecha date, p_cual text) returns jsonb
language plpgsql stable as $$
declare v_lista jsonb; v_txt text; v_n int; v_dia text;
begin
  select coalesce(jsonb_agg(public.cal_json(e)), '[]'::jsonb),
         string_agg(case when e.todo_el_dia then 'todo el día' else public.reloj_hhmm(e.inicio) end || ' ' || e.titulo, ' · '),
         count(*)
  into v_lista, v_txt, v_n from public.cal_del_dia(p_fecha) e;
  v_dia := case p_cual when 'hoy' then 'Hoy' else 'Mañana' end;
  return jsonb_build_object('fecha', p_fecha, 'total', v_n, 'eventos', v_lista,
    'mensaje', case when v_n = 0 then v_dia || ' no hay eventos en el calendario.'
                    else v_dia || ' hay ' || v_n || case when v_n = 1 then ' evento: ' else ' eventos: ' end || v_txt || '.' end);
end $$;

create or replace function public.cal_avisar(p_ahora timestamptz default now()) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_local timestamp := p_ahora at time zone 'Europe/Madrid'; v_hoy date := (p_ahora at time zone 'Europe/Madrid')::date;
        e public.cal_eventos; v_n int := 0; v_min int; v_r jsonb;
begin
  perform pg_advisory_xact_lock(4243);
  -- Resumen de hoy (06:00) y de mañana (21:00), hora de Madrid. Ventana de 1 h por si el cron se salta un minuto.
  if v_local::time >= time '06:00' and v_local::time < time '07:00' then
    v_r := public.cal_resumen(v_hoy, 'hoy');
    if public.reloj_emitir('cal:hoy:' || v_hoy, 'eventos_hoy', v_r || jsonb_build_object('canal', 'calendario', 'hora_madrid', public.reloj_hora_madrid(p_ahora))) is not null then v_n := v_n + 1; end if;
  end if;
  if v_local::time >= time '21:00' and v_local::time < time '22:00' then
    v_r := public.cal_resumen(v_hoy + 1, 'manana');
    if public.reloj_emitir('cal:manana:' || (v_hoy + 1), 'eventos_manana', v_r || jsonb_build_object('canal', 'calendario', 'hora_madrid', public.reloj_hora_madrid(p_ahora))) is not null then v_n := v_n + 1; end if;
  end if;
  -- 1 hora antes (si el evento entró tarde, avisa en cuanto lo ve, con los minutos que faltan) y al empezar
  for e in select * from public.cal_eventos where not todo_el_dia and inicio > p_ahora - interval '10 minutes' and inicio <= p_ahora + interval '60 minutes' loop
    v_min := ceil(extract(epoch from (e.inicio - p_ahora)) / 60);
    if e.inicio > p_ahora + interval '2 minutes' then
      if public.reloj_emitir('cal:1h:' || md5(e.uid) || ':' || extract(epoch from e.inicio)::bigint, 'evento_en_1h',
           jsonb_build_object('canal', 'calendario', 'hora_madrid', public.reloj_hora_madrid(p_ahora), 'minutos_faltan', v_min,
             'evento_cal', public.cal_json(e),
             'mensaje', 'En ' || case when v_min >= 58 then '1 hora' else v_min || ' min' end || ' (' || public.reloj_hhmm(e.inicio) || '): ' || e.titulo || coalesce(' · ' || e.lugar, '') || '.')) is not null then v_n := v_n + 1; end if;
    elsif e.inicio <= p_ahora then
      if public.reloj_emitir('cal:empieza:' || md5(e.uid) || ':' || extract(epoch from e.inicio)::bigint, 'evento_empieza',
           jsonb_build_object('canal', 'calendario', 'hora_madrid', public.reloj_hora_madrid(p_ahora),
             'evento_cal', public.cal_json(e),
             'mensaje', 'Empieza ahora (' || public.reloj_hhmm(e.inicio) || '): ' || e.titulo || coalesce(' · ' || e.lugar, '') || '.')) is not null then v_n := v_n + 1; end if;
    end if;
  end loop;
  return jsonb_build_object('avisos', v_n);
end $$;
revoke all on function public.cal_avisar(timestamptz) from public;

-- Sincronizar desde el cron: llama a la función con el token de Vault
create or replace function public.cal_sincronizar() returns bigint
language plpgsql security definer set search_path = public, extensions, pg_temp as $$
declare v_tok text;
begin
  select decrypted_secret into v_tok from vault.decrypted_secrets where name = 'cal_cron_token';
  return net.http_post(url := 'https://idjlewvzuzqywthrwibv.supabase.co/functions/v1/calendario',
    body := '{"accion":"sincronizar"}'::jsonb,
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-token', v_tok), timeout_milliseconds := 30000);
end $$;
revoke all on function public.cal_sincronizar() from public;

select cron.schedule('cal-sincronizar', '*/5 * * * *', $$select public.cal_sincronizar()$$);
select cron.schedule('cal-avisos', '* * * * *', $$select public.cal_avisar()$$);

-- ---------- Calendarios conectados (se añaden desde la app: ⚙ en la agenda del calendario) ----------
-- El enlace es secreto: se guarda en Vault; la tabla solo tiene nombre, tipo y una pista (••••abcd) para mostrarlo.
create table if not exists public.cal_fuentes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(nombre) between 1 and 60),
  tipo text not null default 'otro' check (tipo in ('google', 'apple', 'otro')),
  pista text,
  secreto_id uuid,
  activo boolean not null default true,
  ultima timestamptz, ok boolean, eventos int, error text,
  creado timestamptz not null default now()
);
alter table public.cal_fuentes enable row level security;
revoke all on public.cal_fuentes from anon;
grant select on public.cal_fuentes to authenticated;
drop policy if exists cal_fuentes_lectura on public.cal_fuentes;
create policy cal_fuentes_lectura on public.cal_fuentes for select to authenticated using (public.reloj_es_dueno());

create or replace function public.cal_guardar_fuente(p_nombre text, p_url text) returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_url text := trim(coalesce(p_url, '')); v_id uuid := gen_random_uuid(); v_sec uuid; v_tipo text;
begin
  if not public.reloj_es_dueno() then raise exception 'No autorizado'; end if;
  v_url := regexp_replace(v_url, '^webcals?://', 'https://', 'i');
  if v_url !~ '^https://[^\s]+$' or length(v_url) > 1000 then raise exception 'El enlace no es válido: debe empezar por https:// o webcal://'; end if;
  if (select count(*) from public.cal_fuentes) >= 10 then raise exception 'Como mucho 10 calendarios'; end if;
  v_tipo := case when v_url ~* 'calendar\.google\.com' then 'google' when v_url ~* 'icloud\.com' then 'apple' else 'otro' end;
  v_sec := vault.create_secret(v_url, 'cal_fuente_' || v_id, 'Enlace iCal de un calendario conectado');
  insert into public.cal_fuentes (id, nombre, tipo, pista, secreto_id)
  values (v_id, left(coalesce(nullif(trim(p_nombre), ''), case v_tipo when 'google' then 'Google' when 'apple' then 'Apple' else 'Calendario' end), 60),
          v_tipo, '••••' || right(regexp_replace(regexp_replace(v_url, '[?#].*$', ''), '(/basic)?\.ics$', ''), 6), v_sec);
  return v_id;
end $$;

create or replace function public.cal_borrar_fuente(p_id uuid) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare f record;
begin
  if not public.reloj_es_dueno() then raise exception 'No autorizado'; end if;
  select * into f from public.cal_fuentes where id = p_id;
  if not found then return; end if;
  if f.secreto_id is not null then delete from vault.secrets where id = f.secreto_id; end if;
  delete from public.cal_fuentes where id = p_id;
  delete from public.cal_eventos where fuente = p_id::text;   -- sus eventos y avisos pendientes se van ya
end $$;

-- Para la función calendario: los enlaces descifrados (cron con token o sesión de Diego)
create or replace function public.cal_fuentes_urls(p_token text) returns table (id uuid, nombre text, url text)
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if not (public.reloj_es_dueno() or public.cal_token_valido(p_token)) then raise exception 'No autorizado'; end if;
  return query select f.id, f.nombre, s.decrypted_secret from public.cal_fuentes f
    join vault.decrypted_secrets s on s.id = f.secreto_id where f.activo order by f.creado;
end $$;

-- Resultado por calendario (para que la app enseñe cuál falla)
create or replace function public.cal_marcar_fuente(p_token text, p_id uuid, p_ok boolean, p_eventos int, p_error text) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if not (public.reloj_es_dueno() or public.cal_token_valido(p_token)) then raise exception 'No autorizado'; end if;
  update public.cal_fuentes set ultima = now(), ok = p_ok, eventos = p_eventos, error = left(p_error, 300) where id = p_id;
end $$;

revoke all on function public.cal_guardar_fuente(text, text) from public;
revoke all on function public.cal_borrar_fuente(uuid) from public;
revoke all on function public.cal_fuentes_urls(text) from public;
revoke all on function public.cal_marcar_fuente(text, uuid, boolean, int, text) from public;
grant execute on function public.cal_guardar_fuente(text, text) to authenticated;
grant execute on function public.cal_borrar_fuente(uuid) to authenticated;
grant execute on function public.cal_fuentes_urls(text) to anon, authenticated;
grant execute on function public.cal_marcar_fuente(text, uuid, boolean, int, text) to anon, authenticated;
