-- Reloj del día · 3/4 · Lógica (tick, entregas, vigilante, latido y acciones del panel)
-- El tiempo lo marca la base: pg_cron llama a reloj_tick() y reloj_vigilar() cada minuto.
-- Idempotencia: cada transición es un UPDATE condicional (… where estado = 'programada' returning),
-- cada evento tiene una clave única y cada entrega es única por (id_evento, destino). Además, tick,
-- vigilante y acciones del panel se serializan con un bloqueo de transacción (pg_advisory_xact_lock).

-- ---------- utilidades ----------
-- Hora "actual" del reloj: la del tick en curso (permite probar con fechas simuladas); si no, public.reloj_ahora()
create or replace function public.reloj_ahora() returns timestamptz
language sql stable as $$ select coalesce(nullif(current_setting('reloj.ahora', true), '')::timestamptz, now()) $$;
create or replace function public.reloj_hora_madrid(p timestamptz) returns text
language sql immutable as $$
  select case when p is null then null else
    to_char(p at time zone 'Europe/Madrid', 'YYYY-MM-DD"T"HH24:MI:SS') ||
    (with o as (select (p at time zone 'Europe/Madrid') - (p at time zone 'UTC') as d)
     select case when d < interval '0' then '-' else '+' end || to_char(abs(extract(epoch from d))::int / 3600, 'FM00') || ':' ||
            to_char((abs(extract(epoch from d))::int % 3600) / 60, 'FM00') from o)
  end
$$;
create or replace function public.reloj_hhmm(p timestamptz) returns text
language sql immutable as $$ select to_char(p at time zone 'Europe/Madrid', 'HH24:MI') $$;
create or replace function public.reloj_minutos(p numeric) returns interval
language sql immutable as $$ select make_interval(secs => p * 60) $$;
create or replace function public.reloj_nombre_modo(m text) returns text
language sql immutable as $$
  select case m when 'concentracion' then 'concentración' when 'manana' then 'mañana' else m end
$$;
create or replace function public.reloj_nombre_fase(f text) returns text
language sql immutable as $$
  select case f when 'descanso_corto' then 'descanso corto' when 'descanso_largo' then 'descanso largo'
                when 'manana' then 'mañana' else f end
$$;
create or replace function public.reloj_capital(t text) returns text
language sql immutable as $$ select upper(left(t, 1)) || substr(t, 2) $$;
create or replace function public.reloj_log(p_tipo text, p_evento text, p_detalle text, p_payload jsonb default null) returns void
language sql as $$
  insert into public.reloj_eventos (tipo, evento, detalle, payload) values (p_tipo, p_evento, p_detalle, p_payload)
$$;

-- Header de un destino (descifrado desde Vault). Solo lo usa la propia base al enviar.
create or replace function public.reloj_header(p_destino uuid) returns text
language sql stable security definer set search_path = public, pg_temp as $$
  select s.decrypted_secret from public.reloj_destinos d
  join vault.decrypted_secrets s on s.id = d.secreto_id
  where d.id = p_destino
$$;

-- Crea un evento (una sola vez por clave) y lo encola para los destinos activos.
-- Devuelve el id_evento, o null si ese evento ya existía.
create or replace function public.reloj_emitir(p_clave text, p_evento text, p_datos jsonb, p_destino uuid default null)
returns uuid language plpgsql as $$
declare v_id uuid := gen_random_uuid(); v_ins uuid; v_payload jsonb;
begin
  insert into public.reloj_eventos (id, clave, tipo, evento) values (v_id, p_clave, 'evento', p_evento)
  on conflict (clave) do nothing returning id into v_ins;
  if v_ins is null then return null; end if;
  v_payload := jsonb_build_object('fuente', 'mi-semana', 'version', 1, 'id_evento', v_id, 'evento', p_evento,
                 'modo', null, 'fase', null, 'ciclo', null, 'hora_madrid', null, 'siguiente_cambio', null, 'mensaje', null)
               || coalesce(p_datos, '{}'::jsonb);
  update public.reloj_eventos set payload = v_payload where id = v_id;
  insert into public.reloj_entregas (id_evento, destino_id, payload)
  select v_id, d.id, v_payload from public.reloj_destinos d
  where d.activo and (p_destino is null or d.id = p_destino)
  on conflict (id_evento, destino_id) do nothing;
  return v_id;
end $$;

-- Qué cambio viene después de la fase de orden p_orden en una sesión
create or replace function public.reloj_siguiente(p_sesion uuid, p_orden int) returns jsonb
language plpgsql stable as $$
declare f record; s record;
begin
  select * into f from public.reloj_fases where sesion_id = p_sesion and orden > p_orden and estado = 'programada' order by orden limit 1;
  if found then return jsonb_build_object('fase', f.tipo, 'ciclo', f.ciclo, 'hora_madrid', public.reloj_hora_madrid(f.inicio_previsto)); end if;
  select * into s from public.reloj_sesiones where id = p_sesion;
  if s.fin_previsto is not null then
    return jsonb_build_object('fase', null, 'evento', 'modo_detenido', 'hora_madrid', public.reloj_hora_madrid(s.fin_previsto));
  end if;
  return null;
end $$;

-- Datos del modo/fase activos (para eventos de alerta)
create or replace function public.reloj_contexto() returns jsonb
language sql stable as $$
  select coalesce((
    select jsonb_build_object('modo', s.modo, 'fase', f.tipo, 'ciclo', f.ciclo)
    from public.reloj_sesiones s left join public.reloj_fases f on f.sesion_id = s.id and f.estado = 'activa'
    where s.estado = 'activa' limit 1), '{}'::jsonb)
$$;

-- ---------- planificación ----------
create or replace function public.reloj_duracion_modo(p_modo text) returns interval
language sql stable as $$
  select public.reloj_minutos(case p_modo when 'descanso' then c.descanso_min when 'entreno' then c.entreno_min
                                          when 'manana' then c.manana_min else c.pomodoro_min end)
  from public.reloj_config c where c.id = 1
$$;

-- Añade fases a una sesión activa hasta p_hasta (o hasta su fin previsto).
create or replace function public.reloj_planificar(p_sesion uuid, p_hasta timestamptz) returns int
language plpgsql as $$
declare s record; c record; f record; v_t0 timestamptz; v_t1 timestamptz; v_tipo text; v_ciclo int; v_dur interval; n int := 0;
begin
  select * into s from public.reloj_sesiones where id = p_sesion;
  if not found or s.estado <> 'activa' then return 0; end if;
  select * into c from public.reloj_config where id = 1;
  loop
    select * into f from public.reloj_fases where sesion_id = p_sesion order by orden desc limit 1;
    if not found then v_t0 := s.inicio;
    else
      exit when s.modo <> 'concentracion';            -- los demás modos son una sola fase
      v_t0 := f.fin_previsto;
    end if;
    exit when s.fin_previsto is not null and v_t0 >= s.fin_previsto;
    exit when v_t0 > p_hasta;
    if s.modo = 'concentracion' then
      if f.id is null then v_tipo := 'pomodoro'; v_ciclo := 1; v_dur := public.reloj_minutos(c.pomodoro_min);
      elsif f.tipo = 'pomodoro' then
        v_ciclo := f.ciclo;
        if f.ciclo % c.pomodoros_por_largo = 0 then v_tipo := 'descanso_largo'; v_dur := public.reloj_minutos(c.descanso_largo_min);
        else v_tipo := 'descanso_corto'; v_dur := public.reloj_minutos(c.descanso_corto_min); end if;
      else v_tipo := 'pomodoro'; v_ciclo := f.ciclo + 1; v_dur := public.reloj_minutos(c.pomodoro_min);
      end if;
    else
      v_tipo := s.modo; v_ciclo := null; v_dur := public.reloj_duracion_modo(s.modo);
    end if;
    -- duraciones absolutas en timestamptz: el cambio de hora no las alarga ni las acorta
    v_t1 := v_t0 + v_dur;
    if s.fin_previsto is not null then v_t1 := least(v_t1, s.fin_previsto); end if;
    insert into public.reloj_fases (sesion_id, orden, tipo, ciclo, inicio_previsto, fin_previsto)
    values (p_sesion, coalesce(f.orden, 0) + 1, v_tipo, v_ciclo, v_t0, v_t1)
    on conflict (sesion_id, orden) do nothing;
    n := n + 1;
    exit when n > 500;                                 -- seguro contra bucles
  end loop;
  return n;
end $$;

-- ---------- avisos y paradas ----------
-- aviso_previo antes de que termine la fase activa (si su final implica parar música o luces)
create or replace function public.reloj_aviso_fase(p_fase uuid, p_cambio jsonb, p_hora timestamptz) returns uuid
language plpgsql as $$
declare f record; s record; c record; v_txt text;
begin
  select * into f from public.reloj_fases where id = p_fase;
  if not found then return null; end if;
  select * into s from public.reloj_sesiones where id = f.sesion_id;
  select * into c from public.reloj_config where id = 1;
  if not (f.tipo = any (c.fases_con_parada)) then return null; end if;
  v_txt := 'A las ' || public.reloj_hhmm(p_hora) || ' termina ' ||
           case when f.tipo = 'pomodoro' then 'el pomodoro ' || f.ciclo else 'el ' || public.reloj_nombre_fase(f.tipo) end ||
           case when p_cambio ->> 'fase' is not null then ' y empieza el ' || public.reloj_nombre_fase(p_cambio ->> 'fase')
                else ' y se acaba el modo ' || public.reloj_nombre_modo(s.modo) end ||
           ': se parará la música y las luces de esta fase.';
  return public.reloj_emitir('aviso_previo:' || f.id, 'aviso_previo', jsonb_build_object(
    'modo', s.modo, 'fase', f.tipo, 'ciclo', f.ciclo, 'hora_madrid', public.reloj_hora_madrid(public.reloj_ahora()),
    'siguiente_cambio', p_cambio, 'implica_parar', true, 'mensaje', v_txt));
end $$;

-- Termina una sesión (con su aviso previo si aún no había salido) y emite modo_detenido
create or replace function public.reloj_detener(p_sesion uuid, p_cuando timestamptz, p_motivo text) returns boolean
language plpgsql as $$
declare s record; fa record;
begin
  select * into fa from public.reloj_fases where sesion_id = p_sesion and estado = 'activa' limit 1;
  if found then
    perform public.reloj_aviso_fase(fa.id, jsonb_build_object('fase', null, 'evento', 'modo_detenido',
              'hora_madrid', public.reloj_hora_madrid(p_cuando)), p_cuando);
  end if;
  update public.reloj_sesiones set estado = 'terminada', fin = p_cuando, motivo_fin = p_motivo
  where id = p_sesion and estado = 'activa' returning * into s;
  if not found then return false; end if;
  update public.reloj_fases set estado = 'terminada', terminada_en = p_cuando where sesion_id = p_sesion and estado = 'activa';
  update public.reloj_fases set estado = 'cancelada', motivo = coalesce(motivo, p_motivo) where sesion_id = p_sesion and estado = 'programada';
  perform public.reloj_emitir('modo_detenido:' || s.id, 'modo_detenido', jsonb_build_object(
    'modo', s.modo, 'fase', null, 'ciclo', null, 'hora_madrid', public.reloj_hora_madrid(p_cuando), 'siguiente_cambio', null,
    'motivo', p_motivo, 'mensaje', 'Fin del modo ' || public.reloj_nombre_modo(s.modo) || ' (' || public.reloj_hhmm(p_cuando) || ').'));
  return true;
end $$;

-- Crea una sesión. Si ya hay otra activa, la para antes (con su aviso previo).
create or replace function public.reloj_crear_sesion(p_modo text, p_origen text, p_inicio timestamptz, p_fin timestamptz,
  p_agenda uuid default null, p_fecha date default null) returns uuid
language plpgsql as $$
declare v_id uuid; v_act uuid;
begin
  select id into v_act from public.reloj_sesiones where estado = 'activa';
  if v_act is not null then perform public.reloj_detener(v_act, greatest(p_inicio, public.reloj_ahora()), 'reemplazada por ' || p_modo); end if;
  insert into public.reloj_sesiones (modo, origen, agenda_id, fecha_agenda, inicio, fin_previsto)
  values (p_modo, p_origen, p_agenda, p_fecha, p_inicio, p_fin)
  on conflict (agenda_id, fecha_agenda) do nothing returning id into v_id;
  if v_id is not null then perform public.reloj_planificar(v_id, greatest(p_inicio, public.reloj_ahora()) + interval '3 hours'); end if;
  return v_id;
end $$;

-- ---------- entregas (pg_net) ----------
create or replace function public.reloj_abrir_alerta(p_tipo text, p_clave text, p_detalle text, p_unica boolean) returns uuid
language plpgsql as $$
declare v_id uuid; v_txt text;
begin
  if p_unica and exists (select 1 from public.reloj_alertas where clave = p_clave) then return null; end if;
  insert into public.reloj_alertas (tipo, clave, detalle) values (p_tipo, p_clave, p_detalle)
  on conflict (clave) where abierta do nothing returning id into v_id;
  if v_id is null then return null; end if;
  v_txt := case p_tipo when 'mac_sin_senal' then 'Alerta: el Mac de Diego no da señales de vida. '
                       when 'fase_perdida' then 'Alerta: un cambio de fase no salió a tiempo. '
                       else 'Alerta: un webhook no se pudo entregar. ' end || coalesce(p_detalle, '');
  perform public.reloj_emitir('alerta:' || v_id, 'alerta', public.reloj_contexto() || jsonb_build_object(
    'hora_madrid', public.reloj_hora_madrid(public.reloj_ahora()), 'alerta', jsonb_build_object('tipo', p_tipo, 'detalle', p_detalle), 'mensaje', v_txt));
  perform public.reloj_log('alerta', p_tipo, p_detalle);
  return v_id;
end $$;

-- Un intento fallido: reintento con espera exponencial (30 s, 1, 2, 4, 8 min) hasta 6 intentos.
create or replace function public.reloj_fallo_entrega(p_id uuid, p_estado int, p_error text, p_ahora timestamptz) returns void
language plpgsql as $$
declare e record; d record;
begin
  select * into e from public.reloj_entregas where id = p_id;
  select * into d from public.reloj_destinos where id = e.destino_id;
  if e.intentos >= 6 then
    update public.reloj_entregas set estado = 'fallida', ultimo_estado = p_estado, ultimo_error = left(p_error, 500), actualizado = p_ahora where id = p_id;
    perform public.reloj_log('entrega', 'fallida', coalesce(d.nombre, '?') || ' · ' || coalesce(e.payload ->> 'evento', '') || ' · HTTP ' || coalesce(p_estado::text, '-'));
    -- las alertas que fallan no abren otra alerta (evita bucles)
    if coalesce(e.payload ->> 'evento', '') <> 'alerta' then
      perform public.reloj_abrir_alerta('entrega_fallida', 'entrega_fallida:' || e.id,
        coalesce(d.nombre, 'destino') || ' no aceptó «' || coalesce(e.payload ->> 'evento', '') || '» tras ' || e.intentos ||
        ' intentos (último HTTP ' || coalesce(p_estado::text, 'sin respuesta') || ').', true);
    end if;
  else
    update public.reloj_entregas set estado = 'pendiente', ultimo_estado = p_estado, ultimo_error = left(p_error, 500),
      proximo_intento = p_ahora + make_interval(secs => 30 * power(2, greatest(e.intentos - 1, 0))), actualizado = p_ahora
    where id = p_id;
  end if;
end $$;

create or replace function public.reloj_entregar(p_ahora timestamptz default public.reloj_ahora()) returns jsonb
language plpgsql security definer set search_path = public, extensions, pg_temp as $$
declare e record; r record; v_hdr text; v_pid bigint; v_ok int := 0; v_ko int := 0; v_env int := 0; v_headers jsonb;
begin
  perform pg_advisory_xact_lock(4242);
  -- 1) respuestas de los envíos anteriores
  for e in select * from public.reloj_entregas where estado = 'enviando' order by enviada_en for update skip locked loop
    select * into r from net._http_response where id = e.peticion_id;
    if found then
      if r.status_code between 200 and 299 then
        update public.reloj_entregas set estado = 'entregada', ultimo_estado = r.status_code, ultimo_error = null, actualizado = p_ahora where id = e.id;
        v_ok := v_ok + 1;
      else
        perform public.reloj_fallo_entrega(e.id, r.status_code,
          coalesce(nullif(r.error_msg, ''), case when r.timed_out then 'timeout (10 s)' end, left(r.content, 200), 'error'), p_ahora);
        v_ko := v_ko + 1;
      end if;
    elsif e.enviada_en < p_ahora - interval '3 minutes' then
      perform public.reloj_fallo_entrega(e.id, null, 'sin respuesta de pg_net', p_ahora); v_ko := v_ko + 1;
    end if;
  end loop;
  -- 2) envíos pendientes (mismo id_evento y mismo payload en cada reintento)
  for e in select en.*, d.url from public.reloj_entregas en join public.reloj_destinos d on d.id = en.destino_id
           where en.estado = 'pendiente' and en.proximo_intento <= p_ahora order by en.creado limit 100 for update of en skip locked loop
    v_hdr := public.reloj_header(e.destino_id);
    v_headers := jsonb_build_object('Content-Type', 'application/json', 'Idempotency-Key', e.id_evento::text)
                 || case when v_hdr is not null then jsonb_build_object('Authorization', v_hdr) else '{}'::jsonb end;
    v_pid := net.http_post(url := e.url, body := e.payload, headers := v_headers, timeout_milliseconds := 10000);
    update public.reloj_entregas set estado = 'enviando', intentos = intentos + 1, enviada_en = p_ahora, peticion_id = v_pid, actualizado = p_ahora
    where id = e.id;
    v_env := v_env + 1;
  end loop;
  return jsonb_build_object('entregadas', v_ok, 'fallos', v_ko, 'enviadas', v_env);
end $$;

-- ---------- tick (cada minuto) ----------
create or replace function public.reloj_tick(p_ahora timestamptz default public.reloj_ahora()) returns jsonb
language plpgsql security definer set search_path = public, extensions, pg_temp as $$
declare c record; s record; a record; fa record; fl record; v_fecha date; v_ini timestamptz; v_fin timestamptz;
        v_t timestamptz; v_sig jsonb; v_aviso interval; v_ult record; v_n int := 0; v_ent jsonb; v_txt text; v_evt text;
begin
  perform pg_advisory_xact_lock(4242);
  perform set_config('reloj.ahora', p_ahora::text, true);
  select * into c from public.reloj_config where id = 1;
  v_aviso := public.reloj_minutos(c.aviso_previo_min);

  -- 1) sesiones cuyo fin previsto ya pasó
  for s in select * from public.reloj_sesiones where estado = 'activa' and fin_previsto is not null and fin_previsto <= p_ahora loop
    perform public.reloj_detener(s.id, s.fin_previsto, 'fin previsto');
  end loop;

  -- 2) agenda (ayer y hoy en hora de Madrid, por los bloques que cruzan medianoche)
  for v_fecha in select ((p_ahora at time zone 'Europe/Madrid')::date - k) from generate_series(1, 0, -1) k loop
    for a in select * from public.reloj_agenda where activo and extract(isodow from v_fecha)::smallint = any (dias) loop
      v_ini := (v_fecha + a.hora_inicio) at time zone 'Europe/Madrid';
      v_fin := ((case when a.hora_fin > a.hora_inicio then v_fecha else v_fecha + 1 end) + a.hora_fin) at time zone 'Europe/Madrid';
      continue when exists (select 1 from public.reloj_sesiones where agenda_id = a.id and fecha_agenda = v_fecha);
      -- aviso previo si el bloque va a cortar otro modo que está sonando
      if p_ahora >= v_ini - v_aviso and p_ahora < v_fin then
        select * into fa from public.reloj_fases f where f.estado = 'activa'
          and exists (select 1 from public.reloj_sesiones x where x.id = f.sesion_id and x.estado = 'activa') limit 1;
        if found then
          perform public.reloj_aviso_fase(fa.id, jsonb_build_object('fase', case a.modo when 'concentracion' then 'pomodoro' else a.modo end,
            'evento', 'modo_iniciado', 'modo', a.modo, 'hora_madrid', public.reloj_hora_madrid(v_ini)), v_ini);
        end if;
      end if;
      if p_ahora >= v_ini and p_ahora < v_fin then
        perform public.reloj_crear_sesion(a.modo, 'agenda', v_ini, v_fin, a.id, v_fecha);
      end if;
    end loop;
  end loop;

  for s in select * from public.reloj_sesiones where estado = 'activa' loop
    -- 3) fases de las próximas 3 horas
    perform public.reloj_planificar(s.id, p_ahora + interval '3 hours');

    -- 4) aviso previo del próximo cambio de la fase activa
    select * into fa from public.reloj_fases where sesion_id = s.id and estado = 'activa' limit 1;
    if found then
      select inicio_previsto into v_t from public.reloj_fases where sesion_id = s.id and estado = 'programada' order by orden limit 1;
      v_t := coalesce(v_t, s.fin_previsto);
      if v_t is not null and p_ahora >= v_t - v_aviso then
        perform public.reloj_aviso_fase(fa.id, public.reloj_siguiente(s.id, fa.orden), v_t);
      end if;
    end if;

    -- 5) arrancar la fase que toca (si el tick llegó tarde, las intermedias se marcan como saltadas)
    select max(orden) into v_n from public.reloj_fases where sesion_id = s.id and estado = 'programada' and inicio_previsto <= p_ahora;
    if v_n is not null then
      update public.reloj_fases set estado = 'cancelada', motivo = 'saltada'
      where sesion_id = s.id and estado = 'programada' and orden < v_n;
      update public.reloj_fases set estado = 'activa', iniciada_en = p_ahora
      where sesion_id = s.id and orden = v_n and estado = 'programada' returning * into fl;
      if found then
        -- modo_iniciado en la primera fase que arranca de verdad (aunque la 1.ª se haya saltado)
        v_evt := case when exists (select 1 from public.reloj_fases where sesion_id = s.id and id <> fl.id and iniciada_en is not null)
                      then 'fase_iniciada' else 'modo_iniciado' end;
        update public.reloj_fases set estado = 'terminada', terminada_en = fl.inicio_previsto
        where sesion_id = s.id and estado = 'activa' and id <> fl.id;
        perform public.reloj_planificar(s.id, p_ahora + interval '3 hours');
        v_sig := public.reloj_siguiente(s.id, fl.orden);
        v_txt := case when v_evt = 'modo_iniciado' then 'Empieza el modo ' || public.reloj_nombre_modo(s.modo) || '. ' else '' end ||
                 case fl.tipo when 'pomodoro' then 'Pomodoro ' || fl.ciclo || ': concentración'
                      when 'descanso_corto' then 'Descanso corto tras el pomodoro ' || fl.ciclo
                      when 'descanso_largo' then 'Descanso largo tras el pomodoro ' || fl.ciclo
                      else public.reloj_capital(public.reloj_nombre_fase(fl.tipo)) end ||
                 ' hasta las ' || public.reloj_hhmm(fl.fin_previsto) || '.';
        perform public.reloj_emitir('fase:' || fl.id, v_evt, jsonb_build_object(
          'modo', s.modo, 'fase', fl.tipo, 'ciclo', fl.ciclo, 'hora_madrid', public.reloj_hora_madrid(fl.inicio_previsto),
          'fin_madrid', public.reloj_hora_madrid(fl.fin_previsto), 'origen', s.origen, 'siguiente_cambio', v_sig, 'mensaje', v_txt));
      end if;
    end if;
  end loop;

  -- 6) mandar lo pendiente y recoger respuestas
  v_ent := public.reloj_entregar(p_ahora);
  return jsonb_build_object('ok', true, 'ahora_madrid', public.reloj_hora_madrid(p_ahora)) || v_ent;
end $$;

-- ---------- vigilante (cada minuto) ----------
create or replace function public.reloj_vigilar(p_ahora timestamptz default public.reloj_ahora()) returns jsonb
language plpgsql security definer set search_path = public, extensions, pg_temp as $$
declare d record; al record; f record; v_n int := 0;
begin
  perform pg_advisory_xact_lock(4242);
  perform set_config('reloj.ahora', p_ahora::text, true);
  -- 1) el Mac sin latido 5 minutos → alerta; si vuelve → mac_recuperado
  for d in select x.id, x.nombre, l.ultimo from public.reloj_dispositivos x join public.reloj_latidos l on l.dispositivo_id = x.id where x.activo loop
    if d.ultimo < p_ahora - interval '5 minutes' then
      if public.reloj_abrir_alerta('mac_sin_senal', 'mac_sin_senal:' || d.id,
           d.nombre || ' sin latido desde las ' || public.reloj_hhmm(d.ultimo) || ' (hora de Madrid).', false) is not null then v_n := v_n + 1; end if;
    else
      for al in update public.reloj_alertas set abierta = false, cerrada_en = p_ahora
                where clave = 'mac_sin_senal:' || d.id and abierta returning * loop
        perform public.reloj_emitir('recuperado:' || al.id, 'alerta', public.reloj_contexto() || jsonb_build_object(
          'hora_madrid', public.reloj_hora_madrid(p_ahora),
          'alerta', jsonb_build_object('tipo', 'mac_recuperado', 'detalle', d.nombre || ' vuelve a dar señales (' || public.reloj_hhmm(d.ultimo) || ').'),
          'mensaje', 'El Mac de Diego vuelve a estar en línea.'));
        perform public.reloj_log('alerta', 'mac_recuperado', d.nombre);
        v_n := v_n + 1;
      end loop;
    end if;
  end loop;
  -- 2) fases que no arrancaron, arrancaron tarde o cuyo webhook no salió 2 minutos después de su hora
  for f in select fz.*, s.modo from public.reloj_fases fz join public.reloj_sesiones s on s.id = fz.sesion_id
           where fz.inicio_previsto between p_ahora - interval '6 hours' and p_ahora - interval '2 minutes'
             and not exists (select 1 from public.reloj_alertas a where a.clave = 'fase_perdida:' || fz.id)
             and ( fz.estado = 'programada'
                or (fz.estado = 'cancelada' and fz.motivo = 'saltada')
                or (fz.iniciada_en > fz.inicio_previsto + interval '2 minutes')
                or exists (select 1 from public.reloj_eventos ev join public.reloj_entregas en on en.id_evento = ev.id
                           where ev.clave = 'fase:' || fz.id and en.estado <> 'entregada') ) loop
    if public.reloj_abrir_alerta('fase_perdida', 'fase_perdida:' || f.id,
         public.reloj_capital(public.reloj_nombre_fase(f.tipo)) || coalesce(' ' || f.ciclo, '') || ' (' || public.reloj_nombre_modo(f.modo) ||
         ') de las ' || public.reloj_hhmm(f.inicio_previsto) || ': ' ||
         case when f.estado = 'programada' then 'no arrancó'
              when f.estado = 'cancelada' then 'se saltó (el reloj no corrió a tiempo)'
              when f.iniciada_en > f.inicio_previsto + interval '2 minutes' then 'arrancó tarde (' || public.reloj_hhmm(f.iniciada_en) || ')'
              else 'su webhook no se entregó a tiempo' end || '.', true) is not null then v_n := v_n + 1; end if;
  end loop;
  return jsonb_build_object('ok', true, 'alertas', v_n);
end $$;

-- ---------- latido del Mac (lo llama la edge function «latido») ----------
create or replace function public.reloj_latido(p_token text, p_info jsonb default null) returns jsonb
language plpgsql security definer set search_path = public, extensions, pg_temp as $$
declare d record;
begin
  if p_token is null or length(p_token) < 20 then return jsonb_build_object('ok', false); end if;
  select * into d from public.reloj_dispositivos where token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex') and activo;
  if not found then return jsonb_build_object('ok', false); end if;
  insert into public.reloj_latidos (dispositivo_id, ultimo, info) values (d.id, now(), p_info)
  on conflict (dispositivo_id) do update set ultimo = excluded.ultimo, info = excluded.info, total = public.reloj_latidos.total + 1;
  insert into public.reloj_latidos_hist (dispositivo_id) values (d.id);
  delete from public.reloj_latidos_hist where en < now() - interval '2 days';
  return jsonb_build_object('ok', true, 'dispositivo', d.nombre, 'hora_madrid', public.reloj_hora_madrid(now()));
end $$;

-- ---------- acciones del panel (las llama la edge function «reloj» con la sesión de Diego) ----------
create or replace function public.reloj_comprobar_dueno() returns void
language plpgsql stable as $$
begin
  if not public.reloj_es_dueno() and coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
end $$;

create or replace function public.reloj_iniciar(p_modo text, p_minutos numeric default null) returns jsonb
language plpgsql security definer set search_path = public, extensions, pg_temp as $$
declare v_fin timestamptz; v_id uuid;
begin
  perform public.reloj_comprobar_dueno();
  if p_modo not in ('concentracion','descanso','entreno','manana') then raise exception 'Modo desconocido: %', p_modo; end if;
  perform pg_advisory_xact_lock(4242);
  v_fin := case when p_minutos is not null and p_minutos > 0 then now() + public.reloj_minutos(p_minutos)
                when p_modo <> 'concentracion' then now() + public.reloj_duracion_modo(p_modo) end;
  v_id := public.reloj_crear_sesion(p_modo, 'manual', now(), v_fin);
  perform public.reloj_log('accion', 'iniciar', 'Inicio manual: ' || public.reloj_nombre_modo(p_modo) || coalesce(' (' || p_minutos || ' min)', ''));
  perform public.reloj_tick(now());
  return jsonb_build_object('ok', true, 'sesion', v_id);
end $$;

-- Parar: por defecto con margen (aviso_previo ahora y fin dentro de X min). p_inmediato = aviso y fin a la vez.
create or replace function public.reloj_parar(p_inmediato boolean default false) returns jsonb
language plpgsql security definer set search_path = public, extensions, pg_temp as $$
declare s record; c record; v_t timestamptz;
begin
  perform public.reloj_comprobar_dueno();
  perform pg_advisory_xact_lock(4242);
  select * into s from public.reloj_sesiones where estado = 'activa';
  if not found then return jsonb_build_object('ok', true, 'nada', true); end if;
  select * into c from public.reloj_config where id = 1;
  if p_inmediato or c.aviso_previo_min = 0 then
    perform public.reloj_detener(s.id, now(), 'parada manual');
    perform public.reloj_log('accion', 'parar', 'Parada inmediata: ' || public.reloj_nombre_modo(s.modo));
  else
    v_t := now() + public.reloj_minutos(c.aviso_previo_min);
    update public.reloj_sesiones set fin_previsto = least(coalesce(fin_previsto, v_t), v_t) where id = s.id;
    update public.reloj_fases set fin_previsto = least(fin_previsto, v_t) where sesion_id = s.id and estado = 'activa';
    update public.reloj_fases set estado = 'cancelada', motivo = 'parada manual' where sesion_id = s.id and estado = 'programada';
    perform public.reloj_log('accion', 'parar', 'Parada a las ' || public.reloj_hhmm(v_t) || ': ' || public.reloj_nombre_modo(s.modo));
  end if;
  perform public.reloj_tick(now());
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.reloj_guardar_config(p jsonb) returns jsonb
language plpgsql security definer set search_path = public, extensions, pg_temp as $$
begin
  perform public.reloj_comprobar_dueno();
  update public.reloj_config set
    pomodoro_min = coalesce((p ->> 'pomodoro_min')::numeric, pomodoro_min),
    descanso_corto_min = coalesce((p ->> 'descanso_corto_min')::numeric, descanso_corto_min),
    descanso_largo_min = coalesce((p ->> 'descanso_largo_min')::numeric, descanso_largo_min),
    pomodoros_por_largo = coalesce((p ->> 'pomodoros_por_largo')::int, pomodoros_por_largo),
    descanso_min = coalesce((p ->> 'descanso_min')::numeric, descanso_min),
    entreno_min = coalesce((p ->> 'entreno_min')::numeric, entreno_min),
    manana_min = coalesce((p ->> 'manana_min')::numeric, manana_min),
    aviso_previo_min = coalesce((p ->> 'aviso_previo_min')::numeric, aviso_previo_min),
    fases_con_parada = coalesce((select array_agg(x) from jsonb_array_elements_text(p -> 'fases_con_parada') x), fases_con_parada),
    actualizado = now()
  where id = 1;
  perform public.reloj_log('accion', 'config', p::text);
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.reloj_guardar_agenda(p jsonb) returns uuid
language plpgsql security definer set search_path = public, extensions, pg_temp as $$
declare v_id uuid := nullif(p ->> 'id', '')::uuid;
begin
  perform public.reloj_comprobar_dueno();
  if v_id is null then
    insert into public.reloj_agenda (nombre, modo, hora_inicio, hora_fin, dias, activo)
    values (coalesce(p ->> 'nombre', ''), p ->> 'modo', (p ->> 'hora_inicio')::time, (p ->> 'hora_fin')::time,
            coalesce((select array_agg(x::smallint) from jsonb_array_elements_text(p -> 'dias') x), array[1,2,3,4,5,6,7]::smallint[]),
            coalesce((p ->> 'activo')::boolean, true))
    returning id into v_id;
  else
    update public.reloj_agenda set nombre = coalesce(p ->> 'nombre', nombre), modo = coalesce(p ->> 'modo', modo),
      hora_inicio = coalesce((p ->> 'hora_inicio')::time, hora_inicio), hora_fin = coalesce((p ->> 'hora_fin')::time, hora_fin),
      dias = coalesce((select array_agg(x::smallint) from jsonb_array_elements_text(p -> 'dias') x), dias),
      activo = coalesce((p ->> 'activo')::boolean, activo)
    where id = v_id;
  end if;
  perform public.reloj_log('accion', 'agenda', p::text);
  return v_id;
end $$;

create or replace function public.reloj_borrar_agenda(p_id uuid) returns void
language plpgsql security definer set search_path = public, extensions, pg_temp as $$
begin
  perform public.reloj_comprobar_dueno();
  delete from public.reloj_agenda where id = p_id;
  perform public.reloj_log('accion', 'agenda_borrada', p_id::text);
end $$;

-- Guarda un destino. El header (si viene) va cifrado a Vault; en la tabla solo queda una pista '••••abcd'.
create or replace function public.reloj_guardar_destino(p_id uuid, p_nombre text, p_url text, p_header text, p_activo boolean default true) returns uuid
language plpgsql security definer set search_path = public, extensions, pg_temp as $$
declare d record; v_id uuid := p_id; v_sec uuid;
begin
  perform public.reloj_comprobar_dueno();
  if v_id is null then
    insert into public.reloj_destinos (nombre, url, activo) values (coalesce(nullif(p_nombre, ''), 'Destino'), p_url, coalesce(p_activo, true)) returning id into v_id;
  else
    update public.reloj_destinos set nombre = coalesce(nullif(p_nombre, ''), nombre), url = coalesce(nullif(p_url, ''), url),
      activo = coalesce(p_activo, activo) where id = v_id;
  end if;
  if p_header is not null and length(trim(p_header)) > 0 then
    select * into d from public.reloj_destinos where id = v_id;
    if d.secreto_id is not null and exists (select 1 from vault.secrets where id = d.secreto_id) then
      perform vault.update_secret(d.secreto_id, trim(p_header));
    else
      v_sec := vault.create_secret(trim(p_header), 'reloj_destino_' || v_id, 'Header Authorization de un destino del reloj');
      update public.reloj_destinos set secreto_id = v_sec where id = v_id;
    end if;
    update public.reloj_destinos set pista = '••••' || right(trim(p_header), 4), secreto_env = null where id = v_id;
  end if;
  perform public.reloj_log('accion', 'destino', coalesce(p_nombre, '') || ' ' || coalesce(p_url, ''));
  return v_id;
end $$;

create or replace function public.reloj_borrar_destino(p_id uuid) returns void
language plpgsql security definer set search_path = public, extensions, pg_temp as $$
declare d record;
begin
  perform public.reloj_comprobar_dueno();
  select * into d from public.reloj_destinos where id = p_id;
  if d.secreto_id is not null then delete from vault.secrets where id = d.secreto_id; end if;
  delete from public.reloj_destinos where id = p_id;
  perform public.reloj_log('accion', 'destino_borrado', coalesce(d.nombre, ''));
end $$;

create or replace function public.reloj_probar_destino(p_id uuid) returns uuid
language plpgsql security definer set search_path = public, extensions, pg_temp as $$
declare v_id uuid;
begin
  perform public.reloj_comprobar_dueno();
  perform pg_advisory_xact_lock(4242);
  v_id := public.reloj_emitir('prueba:' || gen_random_uuid(), 'prueba', public.reloj_contexto() || jsonb_build_object(
    'hora_madrid', public.reloj_hora_madrid(now()), 'mensaje', 'Prueba del reloj de Mi semana: si lees esto, el webhook funciona.'), p_id);
  perform public.reloj_log('accion', 'probar', p_id::text);
  perform public.reloj_entregar(now());
  return v_id;
end $$;

-- Crea (o renueva) el token de un dispositivo. Devuelve el token UNA vez; en la base solo queda su hash.
create or replace function public.reloj_crear_dispositivo(p_nombre text) returns text
language plpgsql security definer set search_path = public, extensions, pg_temp as $$
declare v_tok text := encode(extensions.gen_random_bytes(24), 'hex');
begin
  perform public.reloj_comprobar_dueno();
  if exists (select 1 from public.reloj_dispositivos where nombre = p_nombre) then
    update public.reloj_dispositivos set token_hash = encode(extensions.digest(v_tok, 'sha256'), 'hex'), activo = true where nombre = p_nombre;
  else
    insert into public.reloj_dispositivos (nombre, token_hash) values (p_nombre, encode(extensions.digest(v_tok, 'sha256'), 'hex'));
  end if;
  perform public.reloj_log('accion', 'dispositivo', 'Token nuevo para ' || p_nombre);
  return v_tok;
end $$;

create or replace function public.reloj_cerrar_alerta(p_id uuid) returns void
language plpgsql security definer set search_path = public, extensions, pg_temp as $$
begin
  perform public.reloj_comprobar_dueno();
  update public.reloj_alertas set abierta = false, cerrada_en = now() where id = p_id and abierta;
  perform public.reloj_log('accion', 'alerta_cerrada', p_id::text);
end $$;

-- Todo lo que muestra el panel, en una llamada
create or replace function public.reloj_estado() returns jsonb
language plpgsql stable security definer set search_path = public, extensions, pg_temp as $$
declare s public.reloj_sesiones; fa public.reloj_fases; v jsonb;
begin
  perform public.reloj_comprobar_dueno();
  select * into s from public.reloj_sesiones where estado = 'activa';
  if found then select * into fa from public.reloj_fases where sesion_id = s.id and estado = 'activa' limit 1; end if;
  v := jsonb_build_object(
    'ahora', now(),
    'config', (select to_jsonb(c) from public.reloj_config c where id = 1),
    'sesion', case when s.id is null then null else jsonb_build_object('id', s.id, 'modo', s.modo, 'origen', s.origen, 'inicio', s.inicio, 'fin_previsto', s.fin_previsto) end,
    'fase', case when fa.id is null then null else jsonb_build_object('tipo', fa.tipo, 'ciclo', fa.ciclo, 'inicio', fa.inicio_previsto, 'fin', fa.fin_previsto) end,
    'siguiente', case when fa.id is null then null else public.reloj_siguiente(s.id, fa.orden) end,
    'proximas', coalesce((select jsonb_agg(jsonb_build_object('tipo', f.tipo, 'ciclo', f.ciclo, 'inicio', f.inicio_previsto, 'fin', f.fin_previsto) order by f.orden)
                 from (select * from public.reloj_fases where sesion_id = s.id and estado = 'programada' order by orden limit 6) f), '[]'),
    'latidos', coalesce((select jsonb_agg(jsonb_build_object('nombre', d.nombre, 'ultimo', l.ultimo, 'info', l.info) order by d.nombre)
                 from public.reloj_dispositivos d left join public.reloj_latidos l on l.dispositivo_id = d.id where d.activo), '[]'),
    'entregas', coalesce((select jsonb_agg(x order by x.actualizado desc) from (
                 select en.id, en.payload ->> 'evento' as evento, en.payload ->> 'fase' as fase, d.nombre as destino, en.estado, en.intentos,
                        en.ultimo_estado, en.ultimo_error, en.actualizado, en.proximo_intento
                 from public.reloj_entregas en join public.reloj_destinos d on d.id = en.destino_id order by en.actualizado desc limit 15) x), '[]'),
    'alertas', coalesce((select jsonb_agg(to_jsonb(a) order by a.abierta_en desc) from public.reloj_alertas a where a.abierta), '[]'),
    'destinos', coalesce((select jsonb_agg(jsonb_build_object('id', d.id, 'nombre', d.nombre, 'url', d.url, 'pista', d.pista, 'activo', d.activo,
                 'tiene_header', d.secreto_id is not null, 'secreto_env', d.secreto_env) order by d.creado) from public.reloj_destinos d), '[]'),
    'agenda', coalesce((select jsonb_agg(to_jsonb(a) order by a.hora_inicio) from public.reloj_agenda a), '[]'),
    'eventos', coalesce((select jsonb_agg(x order by x.creado desc) from (
                 select tipo, evento, coalesce(payload ->> 'mensaje', detalle) as texto, creado from public.reloj_eventos order by creado desc limit 25) x), '[]')
  );
  return v;
end $$;

-- ---------- permisos ----------
-- Solo las funciones del reloj: nadie las ejecuta salvo lo que se concede abajo
do $$
declare f text;
begin
  for f in select p.oid::regprocedure::text from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and p.proname like 'reloj\_%' loop
    execute 'revoke execute on function ' || f || ' from public, anon, authenticated';
  end loop;
end $$;
grant execute on function public.reloj_es_dueno() to authenticated;
grant execute on function public.reloj_latido(text, jsonb) to anon, authenticated;
grant execute on function public.reloj_iniciar(text, numeric), public.reloj_parar(boolean), public.reloj_guardar_config(jsonb),
  public.reloj_guardar_agenda(jsonb), public.reloj_borrar_agenda(uuid), public.reloj_guardar_destino(uuid, text, text, text, boolean),
  public.reloj_borrar_destino(uuid), public.reloj_probar_destino(uuid), public.reloj_crear_dispositivo(text),
  public.reloj_cerrar_alerta(uuid), public.reloj_estado() to authenticated;
