-- Un solo canal de avisos y payload distinguible. Idempotente.
--  · Todos los eventos del reloj llevan "canal": "reloj" (los avisos de entreno de la app llevan "canal": "entreno").
--  · Al pausar un destino, su cola pendiente se descarta: no se reintenta ni abre alertas.

create or replace function public.reloj_emitir(p_clave text, p_evento text, p_datos jsonb, p_destino uuid default null)
returns uuid language plpgsql as $$
declare v_id uuid := gen_random_uuid(); v_ins uuid; v_payload jsonb;
begin
  insert into public.reloj_eventos (id, clave, tipo, evento) values (v_id, p_clave, 'evento', p_evento)
  on conflict (clave) do nothing returning id into v_ins;
  if v_ins is null then return null; end if;
  v_payload := jsonb_build_object('fuente', 'mi-semana', 'canal', 'reloj', 'version', 1, 'id_evento', v_id, 'evento', p_evento,
                 'modo', null, 'fase', null, 'ciclo', null, 'hora_madrid', null, 'siguiente_cambio', null, 'mensaje', null)
               || coalesce(p_datos, '{}'::jsonb);
  update public.reloj_eventos set payload = v_payload where id = v_id;
  insert into public.reloj_entregas (id_evento, destino_id, payload)
  select v_id, d.id, v_payload from public.reloj_destinos d
  where d.activo and (p_destino is null or d.id = p_destino)
  on conflict (id_evento, destino_id) do nothing;
  return v_id;
end $$;

create or replace function public.reloj_entregar(p_ahora timestamptz default public.reloj_ahora()) returns jsonb
language plpgsql security definer set search_path = public, extensions, pg_temp as $$
declare e record; r record; v_hdr text; v_pid bigint; v_ok int := 0; v_ko int := 0; v_env int := 0; v_headers jsonb;
begin
  perform pg_advisory_xact_lock(4242);
  -- 0) lo pendiente para destinos pausados se descarta (no se reintenta ni cuenta como fase perdida)
  delete from public.reloj_entregas x using public.reloj_destinos d
  where x.destino_id = d.id and not d.activo and x.estado = 'pendiente';
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
           where en.estado = 'pendiente' and d.activo and en.proximo_intento <= p_ahora order by en.creado limit 100 for update of en skip locked loop
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
