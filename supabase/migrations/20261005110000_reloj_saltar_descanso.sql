-- Saltar el descanso del pomodoro (por webhook de un bot o desde el panel). Idempotente.
--  · Si estás EN un descanso: se corta ya y el siguiente pomodoro empieza ahora.
--  · Si estás en un POMODORO: el descanso que venía se cancela y, al acabar este pomodoro, empieza el siguiente sin pausa.
-- Las fases que venían detrás se vuelven a planificar desde ahí. Se emite «descanso_saltado» a los destinos.

-- El aviso previo no sale si tras el pomodoro viene otro pomodoro (no se para nada)
create or replace function public.reloj_aviso_fase(p_fase uuid, p_cambio jsonb, p_hora timestamptz) returns uuid
language plpgsql as $$
declare f record; s record; c record; v_txt text;
begin
  select * into f from public.reloj_fases where id = p_fase;
  if not found then return null; end if;
  select * into s from public.reloj_sesiones where id = f.sesion_id;
  select * into c from public.reloj_config where id = 1;
  if not (f.tipo = any (c.fases_con_parada)) then return null; end if;
  -- pomodoro seguido de otro pomodoro (descanso saltado): no hay parada que avisar
  if f.tipo = 'pomodoro' and p_cambio ->> 'fase' = 'pomodoro' then return null; end if;
  v_txt := 'A las ' || public.reloj_hhmm(p_hora) || ' termina ' ||
           case when f.tipo = 'pomodoro' then 'el pomodoro ' || f.ciclo else 'el ' || public.reloj_nombre_fase(f.tipo) end ||
           case when p_cambio ->> 'fase' is not null then ' y empieza el ' || public.reloj_nombre_fase(p_cambio ->> 'fase')
                else ' y se acaba el modo ' || public.reloj_nombre_modo(s.modo) end ||
           ': se parará la música y las luces de esta fase.';
  return public.reloj_emitir('aviso_previo:' || f.id, 'aviso_previo', jsonb_build_object(
    'modo', s.modo, 'fase', f.tipo, 'ciclo', f.ciclo, 'hora_madrid', public.reloj_hora_madrid(public.reloj_ahora()),
    'siguiente_cambio', p_cambio, 'implica_parar', true, 'mensaje', v_txt));
end $$;

create or replace function public.reloj_saltar_descanso(p_origen text) returns jsonb
language plpgsql security definer set search_path = public, extensions, pg_temp as $$
declare s public.reloj_sesiones; fa public.reloj_fases; d public.reloj_fases; v_ahora timestamptz := public.reloj_ahora(); v_txt text; v_caso text;
begin
  perform pg_advisory_xact_lock(4242);
  select * into s from public.reloj_sesiones where estado = 'activa';
  if s.id is null or s.modo <> 'concentracion' then
    return jsonb_build_object('ok', false, 'error', 'no hay un modo concentración (pomodoro) activo');
  end if;
  select * into fa from public.reloj_fases where sesion_id = s.id and estado = 'activa' limit 1;
  if fa.id is null then return jsonb_build_object('ok', false, 'error', 'no hay fase activa'); end if;

  if fa.tipo in ('descanso_corto', 'descanso_largo') then
    -- cortar el descanso en curso y rehacer lo que viene desde ahora
    update public.reloj_fases set estado = 'terminada', terminada_en = v_ahora, fin_previsto = v_ahora,
      motivo = 'saltado por ' || p_origen where id = fa.id;
    delete from public.reloj_fases where sesion_id = s.id and estado = 'programada';
    d := fa; v_caso := 'descanso_cortado';
    v_txt := 'Descanso saltado (lo pidió ' || p_origen || '): el pomodoro ' || (fa.ciclo + 1) || ' empieza ya.';
  elsif fa.tipo = 'pomodoro' then
    select * into d from public.reloj_fases where sesion_id = s.id and estado = 'programada' order by orden limit 1;
    if d.id is null or d.tipo not in ('descanso_corto', 'descanso_largo') then
      return jsonb_build_object('ok', false, 'error', 'después de este pomodoro no viene ningún descanso');
    end if;
    update public.reloj_fases set estado = 'cancelada', motivo = 'saltado por ' || p_origen,
      inicio_previsto = fa.fin_previsto, fin_previsto = fa.fin_previsto where id = d.id;
    delete from public.reloj_fases where sesion_id = s.id and estado = 'programada' and orden > d.orden;
    v_caso := 'descanso_cancelado';
    v_txt := 'Sin descanso tras el pomodoro ' || fa.ciclo || ' (lo pidió ' || p_origen || '): a las ' ||
             public.reloj_hhmm(fa.fin_previsto) || ' empieza directamente el pomodoro ' || (fa.ciclo + 1) || '.';
  else
    return jsonb_build_object('ok', false, 'error', 'la fase actual no es ni pomodoro ni descanso');
  end if;

  perform public.reloj_planificar(s.id, v_ahora + interval '3 hours');
  perform public.reloj_emitir('descanso_saltado:' || d.id, 'descanso_saltado', jsonb_build_object(
    'modo', s.modo, 'fase', fa.tipo, 'ciclo', fa.ciclo, 'hora_madrid', public.reloj_hora_madrid(v_ahora),
    'caso', v_caso, 'origen', p_origen,
    'siguiente_cambio', public.reloj_siguiente(s.id, case when v_caso = 'descanso_cortado' then fa.orden else d.orden end),
    'mensaje', v_txt));
  perform public.reloj_log('accion', 'descanso_saltado', v_txt);
  -- si el descanso se cortó, el pomodoro nuevo arranca en este mismo momento (y avisa con fase_iniciada)
  if v_caso = 'descanso_cortado' then perform public.reloj_tick(v_ahora); end if;
  return jsonb_build_object('ok', true, 'caso', v_caso, 'mensaje', v_txt);
end $$;

-- Desde el panel (sesión de Diego)
create or replace function public.reloj_saltar_descanso_panel() returns jsonb
language plpgsql security definer set search_path = public, extensions, pg_temp as $$
begin
  perform public.reloj_comprobar_dueno();
  return public.reloj_saltar_descanso('Diego (panel)');
end $$;

-- Desde un bot: nueva acción «saltar_descanso» en reloj_bot (se envuelve la función existente)
create or replace function public.reloj_bot_acciones(p_token text, p_accion text, p_datos jsonb default '{}') returns jsonb
language plpgsql security definer set search_path = public, extensions, pg_temp as $$
declare b public.reloj_bots;
begin
  if p_accion <> 'saltar_descanso' then return public.reloj_bot(p_token, p_accion, p_datos); end if;
  if p_token is null or length(p_token) < 20 then return jsonb_build_object('ok', false, 'error', 'token'); end if;
  select * into b from public.reloj_bots where token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex') and activo;
  if not found then return jsonb_build_object('ok', false, 'error', 'token'); end if;
  update public.reloj_bots set ultimo_uso = now() where id = b.id;
  return public.reloj_saltar_descanso(b.nombre);
end $$;

revoke execute on function public.reloj_saltar_descanso(text), public.reloj_saltar_descanso_panel(), public.reloj_bot_acciones(text, text, jsonb) from public, anon, authenticated;
grant execute on function public.reloj_saltar_descanso_panel() to authenticated;
grant execute on function public.reloj_bot_acciones(text, text, jsonb) to anon, authenticated;
revoke execute on function public.reloj_aviso_fase(uuid, jsonb, timestamptz) from public, anon, authenticated;
