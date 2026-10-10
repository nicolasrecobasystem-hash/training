-- Calendario: calendarios subidos como archivo .ics (p. ej. «Cumpleaños» exportado del Calendario de Apple). Idempotente.
-- El archivo se guarda entero y se vuelve a leer en cada sincronización (los cumpleaños se repiten cada año).

alter table public.cal_fuentes add column if not exists ics text;
alter table public.cal_fuentes drop constraint if exists cal_fuentes_tipo_check;
alter table public.cal_fuentes add constraint cal_fuentes_tipo_check check (tipo in ('google', 'apple', 'otro', 'archivo'));
alter table public.cal_fuentes drop constraint if exists cal_fuentes_ics_largo;
alter table public.cal_fuentes add constraint cal_fuentes_ics_largo check (ics is null or length(ics) <= 3000000);

-- La app no necesita leer el contenido del archivo
revoke select on public.cal_fuentes from authenticated;
grant select (id, nombre, tipo, pista, activo, ultima, ok, eventos, error, creado) on public.cal_fuentes to authenticated;

create or replace function public.cal_guardar_archivo(p_nombre text, p_ics text) returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_id uuid := gen_random_uuid(); v_n int;
begin
  if not public.reloj_es_dueno() then raise exception 'No autorizado'; end if;
  if p_ics is null or position('BEGIN:VCALENDAR' in p_ics) = 0 then raise exception 'El archivo no es un calendario .ics'; end if;
  if length(p_ics) > 3000000 then raise exception 'El archivo es demasiado grande (máx. 3 MB)'; end if;
  if (select count(*) from public.cal_fuentes) >= 10 then raise exception 'Como mucho 10 calendarios'; end if;
  v_n := (length(p_ics) - length(replace(p_ics, 'BEGIN:VEVENT', ''))) / length('BEGIN:VEVENT');
  insert into public.cal_fuentes (id, nombre, tipo, pista, ics)
  values (v_id, left(coalesce(nullif(trim(p_nombre), ''), 'Archivo'), 60), 'archivo', 'archivo .ics · ' || v_n || ' en total', p_ics);
  return v_id;
end $$;
revoke all on function public.cal_guardar_archivo(text, text) from public;
grant execute on function public.cal_guardar_archivo(text, text) to authenticated;

-- Ahora devuelve también los archivos (url null, ics con el contenido)
drop function if exists public.cal_fuentes_urls(text);
create function public.cal_fuentes_urls(p_token text) returns table (id uuid, nombre text, url text, ics text)
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if not (public.reloj_es_dueno() or public.cal_token_valido(p_token)) then raise exception 'No autorizado'; end if;
  return query select f.id, f.nombre, s.decrypted_secret, f.ics from public.cal_fuentes f
    left join vault.decrypted_secrets s on s.id = f.secreto_id
    where f.activo and (s.decrypted_secret is not null or f.ics is not null) order by f.creado;
end $$;
revoke all on function public.cal_fuentes_urls(text) from public;
grant execute on function public.cal_fuentes_urls(text) to anon, authenticated;
