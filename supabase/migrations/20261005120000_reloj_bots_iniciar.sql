-- Los bots (Grok Bot, Levi…) pueden iniciar y parar modos del reloj con su token, igual que el panel. Idempotente.
-- La lógica pasa a funciones internas (_por) que no comprueban la sesión; el panel y los bots las llaman tras
-- comprobar cada uno lo suyo (correo de Diego o token del bot).

create or replace function public.reloj_iniciar_por(p_modo text, p_minutos numeric, p_quien text) returns jsonb
language plpgsql security definer set search_path = public, extensions, pg_temp as $$
declare v_fin timestamptz; v_id uuid;
begin
  if p_modo is null or p_modo not in ('concentracion','descanso','entreno','manana') then
    return jsonb_build_object('ok', false, 'error', 'modo tiene que ser concentracion, descanso, entreno o manana');
  end if;
  if p_minutos is not null and (p_minutos <= 0 or p_minutos > 720) then
    return jsonb_build_object('ok', false, 'error', 'minutos entre 1 y 720');
  end if;
  perform pg_advisory_xact_lock(4242);
  v_fin := case when p_minutos is not null then now() + public.reloj_minutos(p_minutos)
                when p_modo <> 'concentracion' then now() + public.reloj_duracion_modo(p_modo) end;
  v_id := public.reloj_crear_sesion(p_modo, 'manual', now(), v_fin);
  perform public.reloj_log('accion', 'iniciar', 'Inicio (' || p_quien || '): ' || public.reloj_nombre_modo(p_modo) || coalesce(' (' || p_minutos || ' min)', ''));
  perform public.reloj_tick(now());
  return jsonb_build_object('ok', true, 'sesion', v_id, 'modo', p_modo,
    'fin_madrid', case when v_fin is null then null else public.reloj_hora_madrid(v_fin) end);
end $$;

create or replace function public.reloj_parar_por(p_inmediato boolean, p_quien text) returns jsonb
language plpgsql security definer set search_path = public, extensions, pg_temp as $$
declare s record; c record; v_t timestamptz;
begin
  perform pg_advisory_xact_lock(4242);
  select * into s from public.reloj_sesiones where estado = 'activa';
  if not found then return jsonb_build_object('ok', true, 'nada', true); end if;
  select * into c from public.reloj_config where id = 1;
  if coalesce(p_inmediato, false) or c.aviso_previo_min = 0 then
    perform public.reloj_detener(s.id, now(), 'parada manual');
    perform public.reloj_log('accion', 'parar', 'Parada inmediata (' || p_quien || '): ' || public.reloj_nombre_modo(s.modo));
  else
    v_t := now() + public.reloj_minutos(c.aviso_previo_min);
    update public.reloj_sesiones set fin_previsto = least(coalesce(fin_previsto, v_t), v_t) where id = s.id;
    update public.reloj_fases set fin_previsto = least(fin_previsto, v_t) where sesion_id = s.id and estado = 'activa';
    update public.reloj_fases set estado = 'cancelada', motivo = 'parada manual' where sesion_id = s.id and estado = 'programada';
    perform public.reloj_log('accion', 'parar', 'Parada a las ' || public.reloj_hhmm(v_t) || ' (' || p_quien || '): ' || public.reloj_nombre_modo(s.modo));
  end if;
  perform public.reloj_tick(now());
  return jsonb_build_object('ok', true, 'modo', s.modo);
end $$;

-- Panel: mismas firmas que antes (la función «reloj» no cambia)
create or replace function public.reloj_iniciar(p_modo text, p_minutos numeric default null) returns jsonb
language plpgsql security definer set search_path = public, extensions, pg_temp as $$
declare r jsonb;
begin
  perform public.reloj_comprobar_dueno();
  r := public.reloj_iniciar_por(p_modo, case when p_minutos > 0 then p_minutos end, 'panel');
  if not (r ->> 'ok')::boolean then raise exception '%', r ->> 'error'; end if;
  return r;
end $$;

create or replace function public.reloj_parar(p_inmediato boolean default false) returns jsonb
language plpgsql security definer set search_path = public, extensions, pg_temp as $$
begin
  perform public.reloj_comprobar_dueno();
  return public.reloj_parar_por(p_inmediato, 'panel');
end $$;

-- Bots: iniciar, parar y saltar_descanso (con su token); el resto sigue en reloj_bot
create or replace function public.reloj_bot_acciones(p_token text, p_accion text, p_datos jsonb default '{}') returns jsonb
language plpgsql security definer set search_path = public, extensions, pg_temp as $$
declare b public.reloj_bots; d jsonb := coalesce(p_datos, '{}'); v_min numeric;
begin
  if p_accion not in ('saltar_descanso', 'iniciar', 'parar') then return public.reloj_bot(p_token, p_accion, p_datos); end if;
  if p_token is null or length(p_token) < 20 then return jsonb_build_object('ok', false, 'error', 'token'); end if;
  select * into b from public.reloj_bots where token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex') and activo;
  if not found then return jsonb_build_object('ok', false, 'error', 'token'); end if;
  update public.reloj_bots set ultimo_uso = now() where id = b.id;
  if p_accion = 'saltar_descanso' then return public.reloj_saltar_descanso(b.nombre); end if;
  if p_accion = 'parar' then return public.reloj_parar_por(coalesce((d ->> 'inmediato')::boolean, false), b.nombre); end if;
  v_min := nullif(d ->> 'minutos', '')::numeric;
  return public.reloj_iniciar_por(lower(coalesce(d ->> 'modo', '')), v_min, b.nombre);
end $$;

revoke execute on function public.reloj_iniciar_por(text, numeric, text), public.reloj_parar_por(boolean, text) from public, anon, authenticated;
revoke execute on function public.reloj_iniciar(text, numeric), public.reloj_parar(boolean), public.reloj_bot_acciones(text, text, jsonb) from public, anon;
grant execute on function public.reloj_iniciar(text, numeric), public.reloj_parar(boolean) to authenticated;
grant execute on function public.reloj_bot_acciones(text, text, jsonb) to anon, authenticated;
