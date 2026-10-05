-- Bots que hablan con la app (entrada): el bot elige y pone la música en el Mac; aquí apunta qué suena,
-- las notas 1–5 que le dice Diego y los «cambia», y consulta el contexto (modo/fase del reloj + historial
-- para no repetir). El bot guarda su propio perfil; la app es la bitácora y lo enseña en el panel.
-- Cada bot tiene su token (en la base solo su hash). Idempotente.

create table if not exists public.reloj_bots (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique check (char_length(nombre) between 1 and 60),
  token_hash text not null unique,
  activo boolean not null default true,
  creado timestamptz not null default now(),
  ultimo_uso timestamptz
);

create table if not exists public.reloj_musica (
  id uuid primary key default gen_random_uuid(),
  creado timestamptz not null default now(),
  bot_id uuid references public.reloj_bots(id) on delete set null,
  titulo text not null check (char_length(titulo) <= 200),
  artista text check (char_length(artista) <= 120),
  semilla text check (char_length(semilla) <= 200),          -- búsqueda o playlist de la que salió
  familia text check (char_length(familia) <= 60),           -- orquestal, ambient, deep house…
  energia text check (energia in ('baja', 'media', 'alta')),
  voz boolean,
  url text check (url ~ '^https?://' and char_length(url) <= 500),
  nuevo boolean not null default false,                      -- descubrimiento
  modo text, fase text, ciclo int, sesion_id uuid,           -- contexto del reloj en ese momento
  nota smallint check (nota between 1 and 5),
  valorada_en timestamptz,
  cambiada boolean not null default false,
  cambiada_en timestamptz,
  datos jsonb
);
create index if not exists reloj_musica_creado on public.reloj_musica (creado desc);

alter table public.reloj_bots enable row level security;
alter table public.reloj_musica enable row level security;
revoke all on public.reloj_bots, public.reloj_musica from anon, authenticated;
grant select (id, nombre, activo, creado, ultimo_uso) on public.reloj_bots to authenticated;
grant select on public.reloj_musica to authenticated;
drop policy if exists reloj_bots_dueno on public.reloj_bots;
create policy reloj_bots_dueno on public.reloj_bots for select to authenticated using (public.reloj_es_dueno());
drop policy if exists reloj_musica_dueno on public.reloj_musica;
create policy reloj_musica_dueno on public.reloj_musica for select to authenticated using (public.reloj_es_dueno());

-- ---------- lo que llama el bot (función «bot», sin sesión: solo con su token) ----------
create or replace function public.reloj_bot(p_token text, p_accion text, p_datos jsonb default '{}') returns jsonb
language plpgsql security definer set search_path = public, extensions, pg_temp as $$
declare
  b public.reloj_bots; s public.reloj_sesiones; fa public.reloj_fases; m public.reloj_musica;
  d jsonb := coalesce(p_datos, '{}'); v_id uuid; v_nota int; v_txt text;
begin
  if p_token is null or length(p_token) < 20 then return jsonb_build_object('ok', false, 'error', 'token'); end if;
  select * into b from public.reloj_bots where token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex') and activo;
  if not found then return jsonb_build_object('ok', false, 'error', 'token'); end if;
  -- freno: un bot no puede escribir más de 60 veces por minuto
  if p_accion <> 'contexto' and (select count(*) from public.reloj_musica where bot_id = b.id and creado > now() - interval '1 minute') >= 60 then
    return jsonb_build_object('ok', false, 'error', 'demasiadas peticiones');
  end if;
  update public.reloj_bots set ultimo_uso = now() where id = b.id;

  select * into s from public.reloj_sesiones where estado = 'activa';
  if s.id is not null then select * into fa from public.reloj_fases where sesion_id = s.id and estado = 'activa' limit 1; end if;

  if p_accion = 'contexto' then
    return jsonb_build_object('ok', true,
      'hora_madrid', public.reloj_hora_madrid(now()),
      'modo', s.modo, 'fase', fa.tipo, 'ciclo', fa.ciclo,
      'fase_inicio', public.reloj_hora_madrid(fa.inicio_previsto), 'fase_fin', public.reloj_hora_madrid(fa.fin_previsto),
      'minutos_en_fase', case when fa.id is null then null else round(extract(epoch from now() - fa.inicio_previsto) / 60) end,
      'minutos_en_modo', case when s.id is null then null else round(extract(epoch from now() - s.inicio) / 60) end,
      'siguiente_cambio', case when fa.id is null then null else public.reloj_siguiente(s.id, fa.orden) end,
      'historial', coalesce((select jsonb_agg(x order by x.creado desc) from (
          select creado, public.reloj_hora_madrid(creado) as hora_madrid, titulo, artista, semilla, familia, energia, voz, nuevo, modo, fase, nota, cambiada
          from public.reloj_musica where creado > now() - interval '3 days' order by creado desc limit least(greatest(coalesce((d ->> 'limite')::int, 50), 1), 200)) x), '[]'));
  end if;

  if p_accion = 'sonando' then
    if coalesce(trim(d ->> 'titulo'), '') = '' then return jsonb_build_object('ok', false, 'error', 'falta titulo'); end if;
    insert into public.reloj_musica (bot_id, titulo, artista, semilla, familia, energia, voz, url, nuevo, modo, fase, ciclo, sesion_id, datos)
    values (b.id, left(trim(d ->> 'titulo'), 200), left(nullif(trim(d ->> 'artista'), ''), 120), left(nullif(trim(d ->> 'semilla'), ''), 200),
            left(nullif(lower(trim(d ->> 'familia')), ''), 60),
            case when lower(d ->> 'energia') in ('baja', 'media', 'alta') then lower(d ->> 'energia') end,
            case when d ? 'voz' then (d ->> 'voz')::boolean end,
            case when d ->> 'url' ~ '^https?://' then left(d ->> 'url', 500) end,
            coalesce((d ->> 'nuevo')::boolean, false), s.modo, fa.tipo, fa.ciclo, s.id,
            case when jsonb_typeof(d -> 'extra') = 'object' then d -> 'extra' end)
    returning id into v_id;
    return jsonb_build_object('ok', true, 'id', v_id);
  end if;

  if p_accion in ('valoracion', 'cambio') then
    if d ? 'id' then select * into m from public.reloj_musica where id = (d ->> 'id')::uuid;
    else select * into m from public.reloj_musica where creado > now() - interval '12 hours' order by creado desc limit 1; end if;
    if m.id is null then return jsonb_build_object('ok', false, 'error', 'no hay pieza a la que aplicarlo'); end if;
    if p_accion = 'valoracion' then
      v_nota := (d ->> 'nota')::int;
      if v_nota is null or v_nota not between 1 and 5 then return jsonb_build_object('ok', false, 'error', 'nota 1-5'); end if;
      update public.reloj_musica set nota = v_nota, valorada_en = now() where id = m.id;
    else
      update public.reloj_musica set cambiada = true, cambiada_en = now() where id = m.id;
    end if;
    return jsonb_build_object('ok', true, 'id', m.id, 'titulo', m.titulo);
  end if;

  if p_accion = 'mensaje' then
    v_txt := left(trim(coalesce(d ->> 'texto', '')), 500);
    if v_txt = '' then return jsonb_build_object('ok', false, 'error', 'falta texto'); end if;
    perform public.reloj_log('accion', 'bot', b.nombre || ': ' || v_txt);
    return jsonb_build_object('ok', true);
  end if;

  return jsonb_build_object('ok', false, 'error', 'accion desconocida');
end $$;

-- ---------- panel ----------
create or replace function public.reloj_crear_bot(p_nombre text) returns text
language plpgsql security definer set search_path = public, extensions, pg_temp as $$
declare v_tok text := encode(extensions.gen_random_bytes(24), 'hex'); v_nombre text := left(trim(coalesce(p_nombre, '')), 60);
begin
  perform public.reloj_comprobar_dueno();
  if v_nombre = '' then raise exception 'Falta el nombre del bot'; end if;
  insert into public.reloj_bots (nombre, token_hash) values (v_nombre, encode(extensions.digest(v_tok, 'sha256'), 'hex'))
  on conflict (nombre) do update set token_hash = excluded.token_hash, activo = true;
  perform public.reloj_log('accion', 'bot', 'Token nuevo para ' || v_nombre);
  return v_tok;
end $$;

create or replace function public.reloj_borrar_bot(p_id uuid) returns void
language plpgsql security definer set search_path = public, extensions, pg_temp as $$
declare v text;
begin
  perform public.reloj_comprobar_dueno();
  delete from public.reloj_bots where id = p_id returning nombre into v;
  if v is not null then perform public.reloj_log('accion', 'bot', 'Bot borrado: ' || v); end if;
end $$;

create or replace function public.reloj_musica_estado() returns jsonb
language plpgsql stable security definer set search_path = public, extensions, pg_temp as $$
begin
  perform public.reloj_comprobar_dueno();
  return jsonb_build_object(
    'bots', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'nombre', nombre, 'activo', activo, 'ultimo_uso', ultimo_uso) order by creado) from public.reloj_bots), '[]'),
    'historial', coalesce((select jsonb_agg(to_jsonb(x) order by x.creado desc) from (
        select m.id, m.creado, m.titulo, m.artista, m.semilla, m.familia, m.energia, m.voz, m.url, m.nuevo, m.modo, m.fase, m.nota, m.cambiada, b.nombre as bot
        from public.reloj_musica m left join public.reloj_bots b on b.id = m.bot_id order by m.creado desc limit 20) x), '[]'),
    'familias', coalesce((select jsonb_agg(to_jsonb(x) order by x.media desc nulls last, x.piezas desc) from (
        select coalesce(familia, 'sin familia') as familia, count(*) as piezas, round(avg(nota), 1) as media,
               count(*) filter (where cambiada) as cambiadas
        from public.reloj_musica where creado > now() - interval '30 days' group by 1) x), '[]')
  );
end $$;

revoke execute on function public.reloj_bot(text, text, jsonb), public.reloj_crear_bot(text), public.reloj_borrar_bot(uuid), public.reloj_musica_estado() from public, anon, authenticated;
grant execute on function public.reloj_bot(text, text, jsonb) to anon, authenticated;
grant execute on function public.reloj_crear_bot(text), public.reloj_borrar_bot(uuid), public.reloj_musica_estado() to authenticated;
