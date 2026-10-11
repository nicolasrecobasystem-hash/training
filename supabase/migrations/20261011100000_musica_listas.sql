-- Música: listas de canciones que el agente (y Diego desde musica.html) leen y escriben. Idempotente.
-- Cada canción: título, artista, enlace, beat (BPM + ritmo), nota de Diego 1–5, 3 moods que elige el agente
-- y una combinación de colores para las 4 luces (escritorio, techo 1, techo 2, pizarra).
-- Los colores solo se aplican a las luces cuando se pide (botón en la página o acción musica_luces del bot).

create table if not exists public.mus_listas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(nombre) between 1 and 80),
  descripcion text check (char_length(descripcion) <= 500),
  creada_por text,
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now()
);
create unique index if not exists mus_listas_nombre on public.mus_listas (lower(nombre));

create table if not exists public.mus_canciones (
  id uuid primary key default gen_random_uuid(),
  lista_id uuid not null references public.mus_listas(id) on delete cascade,
  posicion int not null default 0,
  titulo text not null check (char_length(titulo) between 1 and 200),
  artista text check (char_length(artista) <= 200),
  url text check (url is null or (url ~ '^https?://' and char_length(url) <= 1000)),
  bpm int check (bpm is null or bpm between 20 and 300),
  ritmo text check (char_length(ritmo) <= 60),
  nota smallint check (nota is null or nota between 1 and 5),
  moods text[] not null default '{}' check (cardinality(moods) <= 3),
  luces jsonb not null default '{}',
  notas text check (char_length(notas) <= 1000),
  creada_por text,
  editada_por text,
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now()
);
create index if not exists mus_canciones_lista on public.mus_canciones (lista_id, posicion);

-- Qué luz Govee es cada zona (por su nombre en la app de Govee)
create table if not exists public.mus_zonas (
  zona text primary key check (zona in ('escritorio', 'techo1', 'techo2', 'pizarra')),
  etiqueta text not null,
  nombre_govee text not null,
  orden int not null default 0
);
insert into public.mus_zonas (zona, etiqueta, nombre_govee, orden) values
  ('escritorio', 'Escritorio', 'Escritorio', 1),
  ('techo1', 'Techo 1', 'Techo 1', 2),
  ('techo2', 'Techo 2', 'Oficina Vigo 2', 3),
  ('pizarra', 'Pizarra', 'Oficina Vigo', 4)
on conflict (zona) do nothing;

-- Seguridad: la página lee y escribe directamente (solo la cuenta de Diego); los bots pasan por mus_bot()
alter table public.mus_listas enable row level security;
alter table public.mus_canciones enable row level security;
alter table public.mus_zonas enable row level security;
revoke all on public.mus_listas, public.mus_canciones, public.mus_zonas from anon;
grant select, insert, update, delete on public.mus_listas, public.mus_canciones to authenticated;
grant select, update on public.mus_zonas to authenticated;
drop policy if exists mus_listas_dueno on public.mus_listas;
create policy mus_listas_dueno on public.mus_listas for all to authenticated using (public.reloj_es_dueno()) with check (public.reloj_es_dueno());
drop policy if exists mus_canciones_dueno on public.mus_canciones;
create policy mus_canciones_dueno on public.mus_canciones for all to authenticated using (public.reloj_es_dueno()) with check (public.reloj_es_dueno());
drop policy if exists mus_zonas_dueno on public.mus_zonas;
create policy mus_zonas_dueno on public.mus_zonas for all to authenticated using (public.reloj_es_dueno()) with check (public.reloj_es_dueno());

-- ---------- validación compartida ----------
-- Color '#RRGGBB' (acepta 'RRGGBB'); null si no vale
create or replace function public.mus_color(p text) returns text
language sql immutable as $$
  select case when p ~* '^#?[0-9a-f]{6}$' then '#' || upper(right(p, 6)) end
$$;
-- Luces: solo las 4 zonas, solo colores válidos (null o '' borra la zona)
create or replace function public.mus_luces(p jsonb, p_base jsonb default '{}') returns jsonb
language plpgsql immutable as $$
declare r jsonb := coalesce(p_base, '{}'); z text; v text;
begin
  if p is null or jsonb_typeof(p) <> 'object' then return r; end if;
  foreach z in array array['escritorio', 'techo1', 'techo2', 'pizarra'] loop
    if p ? z then
      v := public.mus_color(p ->> z);
      if v is null then r := r - z; else r := r || jsonb_build_object(z, v); end if;
    end if;
  end loop;
  return r;
end $$;
-- Moods: hasta 3, en minúsculas, sin repetir (en el orden en que llegan)
create or replace function public.mus_moods(p jsonb) returns text[]
language plpgsql immutable as $$
declare r text[] := '{}'; x text;
begin
  if p is null or jsonb_typeof(p) <> 'array' then return r; end if;
  for x in select lower(trim(v)) from jsonb_array_elements_text(p) v loop
    if char_length(x) between 1 and 30 and not (x = any(r)) then r := r || x; end if;
    exit when cardinality(r) >= 3;
  end loop;
  return r;
end $$;
create or replace function public.mus_json_cancion(c public.mus_canciones) returns jsonb
language sql stable as $$
  select jsonb_build_object('id', c.id, 'lista_id', c.lista_id, 'posicion', c.posicion, 'titulo', c.titulo, 'artista', c.artista,
    'url', c.url, 'bpm', c.bpm, 'ritmo', c.ritmo, 'nota', c.nota, 'moods', to_jsonb(c.moods), 'luces', c.luces,
    'notas', c.notas, 'creada_por', c.creada_por, 'editada_por', c.editada_por, 'actualizado', c.actualizado)
$$;

-- ---------- API de los bots (la llama la función «bot» con el token del bot) ----------
-- acciones: musica_listas · musica_lista · musica_crear_lista · musica_editar_lista · musica_borrar_lista
--           musica_agregar · musica_editar · musica_borrar · musica_buscar · musica_luces (devuelve qué color va a cada luz)
create or replace function public.mus_bot(p_token text, p_accion text, p_datos jsonb default '{}') returns jsonb
language plpgsql security definer set search_path = public, extensions, pg_temp as $$
declare
  b public.reloj_bots; d jsonb := coalesce(p_datos, '{}'); l public.mus_listas; c public.mus_canciones;
  v_lista uuid; v_quien text; v_pos int; v_q text; v_n int;
begin
  if p_token is null or length(p_token) < 20 then return jsonb_build_object('ok', false, 'error', 'token'); end if;
  select * into b from public.reloj_bots where token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex') and activo;
  if not found then return jsonb_build_object('ok', false, 'error', 'token'); end if;
  v_quien := 'bot:' || b.nombre;
  -- freno de escritura: 120 cambios por minuto por bot
  if p_accion not in ('musica_listas', 'musica_lista', 'musica_buscar', 'musica_luces')
     and (select count(*) from public.mus_canciones where editada_por = v_quien and actualizado > now() - interval '1 minute') >= 120 then
    return jsonb_build_object('ok', false, 'error', 'demasiadas peticiones');
  end if;
  update public.reloj_bots set ultimo_uso = now() where id = b.id;

  -- lista por id o por nombre
  if d ? 'lista_id' and nullif(d ->> 'lista_id', '') is not null then
    select * into l from public.mus_listas where id = (d ->> 'lista_id')::uuid;
  elsif nullif(trim(coalesce(d ->> 'lista', '')), '') is not null then
    select * into l from public.mus_listas where lower(nombre) = lower(trim(d ->> 'lista'));
  end if;

  if p_accion = 'musica_listas' then
    return jsonb_build_object('ok', true, 'listas', coalesce((select jsonb_agg(x order by x.actualizado desc) from (
      select li.id, li.nombre, li.descripcion, li.actualizado, (select count(*) from public.mus_canciones k where k.lista_id = li.id) as canciones
      from public.mus_listas li) x), '[]'), 'zonas', (select jsonb_agg(jsonb_build_object('zona', zona, 'etiqueta', etiqueta) order by orden) from public.mus_zonas));
  end if;

  if p_accion = 'musica_lista' then
    if l.id is null then return jsonb_build_object('ok', false, 'error', 'lista no encontrada (usa lista_id o lista con el nombre)'); end if;
    return jsonb_build_object('ok', true, 'lista', jsonb_build_object('id', l.id, 'nombre', l.nombre, 'descripcion', l.descripcion),
      'canciones', coalesce((select jsonb_agg(public.mus_json_cancion(k) order by k.posicion, k.creado) from public.mus_canciones k where k.lista_id = l.id), '[]'));
  end if;

  if p_accion = 'musica_crear_lista' then
    if l.id is not null then return jsonb_build_object('ok', true, 'lista_id', l.id, 'ya_existia', true); end if;
    if nullif(trim(coalesce(d ->> 'nombre', d ->> 'lista', '')), '') is null then return jsonb_build_object('ok', false, 'error', 'falta nombre'); end if;
    insert into public.mus_listas (nombre, descripcion, creada_por) values (left(trim(coalesce(d ->> 'nombre', d ->> 'lista')), 80), left(d ->> 'descripcion', 500), v_quien)
    on conflict (lower(nombre)) do update set actualizado = now() returning * into l;
    return jsonb_build_object('ok', true, 'lista_id', l.id);
  end if;

  if p_accion = 'musica_editar_lista' then
    if l.id is null then return jsonb_build_object('ok', false, 'error', 'lista no encontrada'); end if;
    update public.mus_listas set nombre = coalesce(left(nullif(trim(d ->> 'nombre'), ''), 80), nombre),
      descripcion = case when d ? 'descripcion' then left(d ->> 'descripcion', 500) else descripcion end, actualizado = now()
    where id = l.id returning * into l;
    return jsonb_build_object('ok', true, 'lista_id', l.id);
  end if;

  if p_accion = 'musica_borrar_lista' then
    if l.id is null then return jsonb_build_object('ok', false, 'error', 'lista no encontrada'); end if;
    delete from public.mus_listas where id = l.id;
    return jsonb_build_object('ok', true, 'borrada', l.id);
  end if;

  if p_accion = 'musica_agregar' then
    if nullif(trim(coalesce(d ->> 'titulo', '')), '') is null then return jsonb_build_object('ok', false, 'error', 'falta titulo'); end if;
    if l.id is null then
      if nullif(trim(coalesce(d ->> 'lista', '')), '') is null then return jsonb_build_object('ok', false, 'error', 'falta lista_id o lista (nombre; si no existe se crea)'); end if;
      insert into public.mus_listas (nombre, creada_por) values (left(trim(d ->> 'lista'), 80), v_quien)
      on conflict (lower(nombre)) do update set actualizado = now() returning * into l;
    end if;
    select coalesce(max(posicion), 0) + 1 into v_pos from public.mus_canciones where lista_id = l.id;
    insert into public.mus_canciones (lista_id, posicion, titulo, artista, url, bpm, ritmo, nota, moods, luces, notas, creada_por, editada_por)
    values (l.id, v_pos, left(trim(d ->> 'titulo'), 200), left(nullif(trim(d ->> 'artista'), ''), 200), nullif(trim(d ->> 'url'), ''),
      nullif(d ->> 'bpm', '')::numeric::int, left(nullif(trim(d ->> 'ritmo'), ''), 60), nullif(d ->> 'nota', '')::numeric::smallint,
      public.mus_moods(d -> 'moods'), public.mus_luces(d -> 'luces'), left(d ->> 'notas', 1000), v_quien, v_quien)
    returning * into c;
    update public.mus_listas set actualizado = now() where id = l.id;
    return jsonb_build_object('ok', true, 'cancion', public.mus_json_cancion(c), 'lista_id', l.id);
  end if;

  if p_accion in ('musica_editar', 'musica_borrar', 'musica_luces') then
    select * into c from public.mus_canciones where id = nullif(d ->> 'cancion_id', '')::uuid;
    if c.id is null then return jsonb_build_object('ok', false, 'error', 'cancion no encontrada (usa cancion_id)'); end if;
    if p_accion = 'musica_borrar' then
      delete from public.mus_canciones where id = c.id;
      return jsonb_build_object('ok', true, 'borrada', c.id);
    end if;
    if p_accion = 'musica_luces' then
      return jsonb_build_object('ok', true, 'cancion', jsonb_build_object('id', c.id, 'titulo', c.titulo),
        'luces', coalesce((select jsonb_agg(jsonb_build_object('zona', z.zona, 'etiqueta', z.etiqueta, 'nombre_govee', z.nombre_govee, 'color', c.luces ->> z.zona) order by z.orden)
                           from public.mus_zonas z where c.luces ? z.zona), '[]'));
    end if;
    update public.mus_canciones set
      titulo = coalesce(left(nullif(trim(d ->> 'titulo'), ''), 200), titulo),
      artista = case when d ? 'artista' then left(nullif(trim(d ->> 'artista'), ''), 200) else artista end,
      url = case when d ? 'url' then nullif(trim(d ->> 'url'), '') else url end,
      bpm = case when d ? 'bpm' then nullif(d ->> 'bpm', '')::numeric::int else bpm end,
      ritmo = case when d ? 'ritmo' then left(nullif(trim(d ->> 'ritmo'), ''), 60) else ritmo end,
      nota = case when d ? 'nota' then nullif(d ->> 'nota', '')::numeric::smallint else nota end,
      moods = case when d ? 'moods' then public.mus_moods(d -> 'moods') else moods end,
      luces = case when d ? 'luces' then public.mus_luces(d -> 'luces', luces) else luces end,
      notas = case when d ? 'notas' then left(d ->> 'notas', 1000) else notas end,
      lista_id = case when d ? 'mover_a_lista_id' then (d ->> 'mover_a_lista_id')::uuid else lista_id end,
      posicion = case when d ? 'posicion' then (d ->> 'posicion')::int else posicion end,
      editada_por = v_quien, actualizado = now()
    where id = c.id returning * into c;
    return jsonb_build_object('ok', true, 'cancion', public.mus_json_cancion(c));
  end if;

  if p_accion = 'musica_buscar' then
    v_q := lower(trim(coalesce(d ->> 'q', '')));
    v_n := least(greatest(coalesce(nullif(d ->> 'limite', '')::int, 50), 1), 200);
    return jsonb_build_object('ok', true, 'canciones', coalesce((select jsonb_agg(x) from (
      select public.mus_json_cancion(k) || jsonb_build_object('lista', li.nombre) as x
      from public.mus_canciones k join public.mus_listas li on li.id = k.lista_id
      where (v_q = '' or lower(k.titulo || ' ' || coalesce(k.artista, '') || ' ' || coalesce(k.ritmo, '') || ' ' || array_to_string(k.moods, ' ')) like '%' || v_q || '%')
        and (nullif(d ->> 'mood', '') is null or lower(d ->> 'mood') = any(k.moods))
        and (nullif(d ->> 'nota_min', '') is null or k.nota >= (d ->> 'nota_min')::int)
        and (nullif(d ->> 'bpm_min', '') is null or k.bpm >= (d ->> 'bpm_min')::int)
        and (nullif(d ->> 'bpm_max', '') is null or k.bpm <= (d ->> 'bpm_max')::int)
        and (l.id is null or k.lista_id = l.id)
      order by k.nota desc nulls last, k.actualizado desc limit v_n) s), '[]'));
  end if;

  return jsonb_build_object('ok', false, 'error', 'accion desconocida');
exception
  when check_violation then
    return jsonb_build_object('ok', false, 'error', 'dato no válido: nota 1–5, bpm 20–300, url con http(s)://, título hasta 200 caracteres, nombre de lista hasta 80');
  when invalid_text_representation or numeric_value_out_of_range then
    return jsonb_build_object('ok', false, 'error', 'formato no válido en algún dato (id, bpm, nota o posicion)');
  when foreign_key_violation then
    return jsonb_build_object('ok', false, 'error', 'la lista de destino no existe');
end $$;
revoke all on function public.mus_bot(text, text, jsonb) from public;
grant execute on function public.mus_bot(text, text, jsonb) to anon, authenticated;
