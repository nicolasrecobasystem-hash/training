-- Pruebas del reloj (Postgres local con 00_simulacion_supabase.sql + las migraciones).
-- Cada bloque lanza una excepción si algo falla y escribe "OK …" si pasa.
-- Las horas se simulan pasando p_ahora a reloj_tick() / reloj_vigilar().
\set ON_ERROR_STOP 1
set client_min_messages = notice;

-- ---------- ayudas ----------
create or replace function prueba_limpiar() returns void language plpgsql as $$
begin
  truncate public.reloj_entregas, public.reloj_eventos, public.reloj_fases, public.reloj_sesiones, public.reloj_alertas,
           public.reloj_latidos, public.reloj_latidos_hist, public.reloj_dispositivos, public.reloj_agenda cascade;
  truncate net.http_request_queue, net._http_response;
  update public.reloj_config set pomodoro_min = 25, descanso_corto_min = 5, descanso_largo_min = 15, pomodoros_por_largo = 4,
    descanso_min = 15, entreno_min = 60, manana_min = 120, aviso_previo_min = 2 where id = 1;
end $$;
-- pg_net simulado: responde a todas las peticiones aún sin respuesta con el código dado
create or replace function prueba_responder(p_status int) returns int language sql as $$
  with n as (insert into net._http_response (id, status_code, content)
             select q.id, p_status, '{}' from net.http_request_queue q where not exists (select 1 from net._http_response r where r.id = q.id) returning 1)
  select count(*)::int from n
$$;
create or replace function prueba_eventos() returns table (evento text, fase text, ciclo int, hora text, sig text)
language sql as $$
  select payload ->> 'evento', payload ->> 'fase', (payload ->> 'ciclo')::int, payload ->> 'hora_madrid', payload -> 'siguiente_cambio' ->> 'hora_madrid'
  from public.reloj_eventos where tipo = 'evento' order by creado, (payload ->> 'hora_madrid')
$$;

-- Destino de prueba con header en Vault
do $$
declare v uuid;
begin
  delete from public.reloj_destinos;
  delete from vault.secrets where name = 'prueba';
  v := vault.create_secret('Bearer prueba-123456', 'prueba', '');
  insert into public.reloj_destinos (nombre, url, secreto_id, pista) values ('Destino de prueba', 'https://ejemplo.test/webhook', v, '••••3456');
end $$;

-- =====================================================================
-- 1) Concentración con fases de 1 minuto: un ciclo completo sin intervención
-- =====================================================================
do $$
declare t0 timestamptz := '2026-10-05 09:00:00+00'; t timestamptz; n int; r record; v_lista text;
begin
  perform prueba_limpiar();
  update public.reloj_config set pomodoro_min = 1, descanso_corto_min = 1, descanso_largo_min = 1, pomodoros_por_largo = 2, aviso_previo_min = 0.5;
  perform public.reloj_crear_sesion('concentracion', 'manual', t0, null);
  for i in 0..9 loop                       -- un tick cada 30 s durante 5 minutos
    t := t0 + make_interval(secs => i * 30);
    perform public.reloj_tick(t);
    perform prueba_responder(200);
  end loop;
  perform public.reloj_tick(t0 + interval '5 minutes 1 second'); perform prueba_responder(200); perform public.reloj_tick(t0 + interval '5 minutes 2 seconds');
  select string_agg(evento || ':' || coalesce(fase, '-') || coalesce(ciclo::text, ''), ' ' order by hora, evento desc) into v_lista
  from prueba_eventos() where evento in ('modo_iniciado', 'fase_iniciada');
  raise notice 'secuencia: %', v_lista;
  if v_lista <> 'modo_iniciado:pomodoro1 fase_iniciada:descanso_corto1 fase_iniciada:pomodoro2 fase_iniciada:descanso_largo2 fase_iniciada:pomodoro3 fase_iniciada:descanso_corto3'
    then raise exception 'secuencia de fases incorrecta: %', v_lista; end if;
  -- hora de Madrid correcta (05/10 = verano, +02:00) y siguiente_cambio relleno
  select * into r from prueba_eventos() where evento = 'fase_iniciada' and fase = 'descanso_corto' and ciclo = 1;
  if r.hora <> '2026-10-05T11:01:00+02:00' or r.sig <> '2026-10-05T11:02:00+02:00' then raise exception 'hora/siguiente mal: % %', r.hora, r.sig; end if;
  -- un aviso_previo por cada cambio, antes del cambio
  select count(*) into n from public.reloj_eventos where evento = 'aviso_previo';
  if n < 5 then raise exception 'faltan aviso_previo: %', n; end if;
  if exists (select 1 from public.reloj_eventos a join public.reloj_eventos f on f.clave = 'fase:' || substring(a.clave from 14)
             where a.evento = 'aviso_previo' and a.creado > f.creado) then raise exception 'aviso_previo después del cambio'; end if;
  -- todas las entregas hechas, cada una una sola vez
  select count(*) into n from public.reloj_entregas where estado <> 'entregada';
  if n > 0 then raise exception 'entregas sin entregar: %', n; end if;
  select count(*) into n from public.reloj_eventos where tipo = 'evento';
  if n <> (select count(*) from public.reloj_entregas) then raise exception 'entregas duplicadas o de menos'; end if;
  raise notice 'OK 1: ciclo completo de concentración con fases de 1 min, horas de Madrid y siguiente_cambio correctos';
end $$;

-- Parar inmediato: aviso_previo y modo_detenido, una vez
do $$
declare n int;
begin
  perform set_config('request.jwt.claims', '{"email":"nicolasrecobasystem@gmail.com","role":"authenticated"}', false);
  perform prueba_limpiar();
  perform public.reloj_iniciar('concentracion', null);
  perform public.reloj_parar(true);
  perform public.reloj_parar(true);
  select count(*) into n from public.reloj_eventos where evento = 'modo_detenido';
  if n <> 1 then raise exception 'modo_detenido % veces', n; end if;
  if (select min(creado) from public.reloj_eventos where evento = 'aviso_previo') > (select min(creado) from public.reloj_eventos where evento = 'modo_detenido')
    then raise exception 'el aviso salió después de parar'; end if;
  -- parar con margen: la sesión sigue X minutos y el fin sale después
  perform public.reloj_iniciar('entreno', null);
  perform public.reloj_parar(false);
  if (select count(*) from public.reloj_sesiones where estado = 'activa') <> 1 then raise exception 'parar con margen no debía cortar ya'; end if;
  perform public.reloj_tick(now() + interval '2 minutes 1 second');
  if (select count(*) from public.reloj_sesiones where estado = 'activa') <> 0 then raise exception 'no se paró tras el margen'; end if;
  perform set_config('request.jwt.claims', '', false);
  raise notice 'OK 1b: parar inmediato y con margen (aviso_previo antes de modo_detenido, sin duplicados)';
end $$;

-- Una cuenta que no es la de Diego no puede iniciar
do $$
begin
  perform set_config('request.jwt.claims', '{"email":"otro@ejemplo.com","role":"authenticated"}', false);
  begin
    perform public.reloj_iniciar('concentracion', null);
    raise exception 'debía rechazar a otra cuenta';
  exception when insufficient_privilege then null;
  end;
  perform set_config('request.jwt.claims', '', false);
  raise notice 'OK 1c: solo la cuenta de Diego puede usar las acciones';
end $$;

-- =====================================================================
-- 2) Idempotencia: tick dos veces seguidas no duplica nada
-- =====================================================================
do $$
declare t0 timestamptz := '2026-10-06 08:00:00+00'; a int; b int; a2 int; b2 int;
begin
  perform prueba_limpiar();
  perform public.reloj_crear_sesion('concentracion', 'manual', t0, null);
  perform public.reloj_tick(t0 + interval '10 seconds');
  select count(*) into a from public.reloj_eventos where tipo = 'evento';
  select count(*) into b from public.reloj_entregas;
  perform public.reloj_tick(t0 + interval '10 seconds');
  perform public.reloj_tick(t0 + interval '20 seconds');
  select count(*) into a2 from public.reloj_eventos where tipo = 'evento';
  select count(*) into b2 from public.reloj_entregas;
  if a <> a2 or b <> b2 or a <> 1 then raise exception 'tick repetido duplicó: eventos % → %, entregas % → %', a, a2, b, b2; end if;
  -- el reintento de envío no crea otra petición mientras la primera espera respuesta
  if (select count(*) from net.http_request_queue) <> 1 then raise exception 'peticiones duplicadas'; end if;
  raise notice 'OK 2: tick repetido no duplica eventos, entregas ni peticiones';
end $$;

-- =====================================================================
-- 3) Destino que responde 500: reintentos con el mismo id_evento y una sola alerta entrega_fallida
-- =====================================================================
do $$
declare t0 timestamptz := '2026-10-07 10:00:00+00'; t timestamptz; n int; v_ids int; v_claves int;
begin
  perform prueba_limpiar();
  perform public.reloj_crear_sesion('concentracion', 'manual', t0, null);
  for i in 0..40 loop                      -- 20 minutos, tick cada 30 s, el destino siempre da 500
    t := t0 + make_interval(secs => i * 30);
    perform public.reloj_tick(t);
    perform prueba_responder(500);
    perform public.reloj_vigilar(t);
  end loop;
  -- la entrega del modo_iniciado: 6 intentos, mismo payload e Idempotency-Key
  select count(distinct body ->> 'id_evento'), count(distinct headers ->> 'Idempotency-Key') into v_ids, v_claves
  from net.http_request_queue where body ->> 'evento' = 'modo_iniciado';
  select count(*) into n from net.http_request_queue where body ->> 'evento' = 'modo_iniciado';
  if n <> 6 or v_ids <> 1 or v_claves <> 1 then raise exception 'reintentos: % peticiones, % ids, % claves', n, v_ids, v_claves; end if;
  if (select estado from public.reloj_entregas e join public.reloj_eventos ev on ev.id = e.id_evento where ev.evento = 'modo_iniciado') <> 'fallida'
    then raise exception 'la entrega debía quedar fallida'; end if;
  select count(*) into n from public.reloj_alertas where tipo = 'entrega_fallida' and clave like 'entrega_fallida:%' and detalle like '%«modo_iniciado»%';
  if n <> 1 then raise exception 'alertas entrega_fallida del modo_iniciado: %', n; end if;
  -- la propia alerta (que también falla) no abre otra alerta
  if exists (select 1 from public.reloj_alertas where detalle like '%«alerta»%') then raise exception 'bucle de alertas'; end if;
  -- y los envíos llevan el header guardado en Vault
  if exists (select 1 from net.http_request_queue where headers ->> 'Authorization' <> 'Bearer prueba-123456') then raise exception 'header mal'; end if;
  raise notice 'OK 3: 500 → 6 intentos con el mismo id_evento, 1 alerta entrega_fallida, sin bucles';
end $$;

-- =====================================================================
-- 4) Mac sin señal: una alerta a los 5 min, mac_recuperado al volver
-- =====================================================================
do $$
declare t0 timestamptz := '2026-10-08 12:00:00+00'; v_disp uuid; n int;
begin
  perform prueba_limpiar();
  insert into public.reloj_dispositivos (nombre, token_hash) values ('Mac de Diego', encode(extensions.digest('token-de-prueba-0123456789', 'sha256'), 'hex')) returning id into v_disp;
  -- el latido entra por la función (token correcto) y se rechaza con uno falso
  if (public.reloj_latido('token-de-prueba-0123456789', '{"equipo":"Mac"}') ->> 'ok')::boolean is not true then raise exception 'latido válido rechazado'; end if;
  if (public.reloj_latido('token-falso-000000000000000', null) ->> 'ok')::boolean then raise exception 'latido falso aceptado'; end if;
  update public.reloj_latidos set ultimo = t0;
  for i in 1..12 loop perform public.reloj_vigilar(t0 + make_interval(mins => i)); end loop;   -- 12 minutos sin latido
  select count(*) into n from public.reloj_alertas where tipo = 'mac_sin_senal';
  if n <> 1 then raise exception 'alertas mac_sin_senal: %', n; end if;
  if (select min(abierta_en) from public.reloj_alertas) is null then raise exception 'sin fecha'; end if;
  select count(*) into n from public.reloj_eventos where evento = 'alerta' and payload -> 'alerta' ->> 'tipo' = 'mac_sin_senal';
  if n <> 1 then raise exception 'eventos de alerta mac: %', n; end if;
  -- vuelve el latido
  update public.reloj_latidos set ultimo = t0 + interval '13 minutes';
  perform public.reloj_vigilar(t0 + interval '13 minutes 30 seconds');
  perform public.reloj_vigilar(t0 + interval '14 minutes');
  select count(*) into n from public.reloj_eventos where payload -> 'alerta' ->> 'tipo' = 'mac_recuperado';
  if n <> 1 then raise exception 'mac_recuperado: %', n; end if;
  if exists (select 1 from public.reloj_alertas where abierta) then raise exception 'la alerta debía cerrarse'; end if;
  -- y si se vuelve a caer, es un incidente nuevo: otra alerta (una)
  for i in 20..26 loop perform public.reloj_vigilar(t0 + make_interval(mins => i)); end loop;
  select count(*) into n from public.reloj_alertas where tipo = 'mac_sin_senal';
  if n <> 2 then raise exception 'segundo incidente: %', n; end if;
  raise notice 'OK 4: mac_sin_senal una vez por incidente y mac_recuperado al volver';
end $$;

-- =====================================================================
-- 5) fase_perdida: una fase cuyo webhook no salió, y una que el tick se saltó
-- =====================================================================
do $$
declare t0 timestamptz := '2026-10-09 07:00:00+00'; n int;
begin
  perform prueba_limpiar();
  perform public.reloj_crear_sesion('concentracion', 'manual', t0, null);
  perform public.reloj_tick(t0 + interval '5 seconds');           -- arranca el pomodoro 1; el destino nunca responde
  for i in 1..5 loop perform public.reloj_vigilar(t0 + make_interval(mins => i)); end loop;
  select count(*) into n from public.reloj_alertas where tipo = 'fase_perdida';
  if n <> 1 then raise exception 'fase_perdida (webhook no salió): %', n; end if;
  -- el reloj se para 40 min (nadie llama a tick): el descanso corto 1 se salta; al volver, una alerta para él
  perform public.reloj_tick(t0 + interval '40 minutes');
  for i in 41..46 loop perform public.reloj_vigilar(t0 + make_interval(mins => i)); end loop;
  select count(*) into n from public.reloj_alertas where tipo = 'fase_perdida' and detalle like 'Descanso corto 1%';
  if n <> 1 then raise exception 'fase_perdida (saltada): %', n; end if;
  -- no se duplica en más pasadas
  for i in 47..50 loop perform public.reloj_vigilar(t0 + make_interval(mins => i)); end loop;
  if (select count(*) from public.reloj_alertas where tipo = 'fase_perdida' and detalle like 'Descanso corto 1%') <> 1 then raise exception 'fase_perdida duplicada'; end if;
  raise notice 'OK 5: fase_perdida una sola vez (webhook no entregado y fase saltada)';
end $$;

-- =====================================================================
-- 6) Cambio de hora del 25-oct-2026: agenda diaria y concentración larga
-- =====================================================================
do $$
declare t timestamptz := '2026-10-24 00:00:00+02'; n int; r record; v_err text;
begin
  perform prueba_limpiar();
  insert into public.reloj_agenda (nombre, modo, hora_inicio, hora_fin) values
    ('Mañana', 'manana', '07:00', '09:00'),
    ('Noche', 'descanso', '01:30', '03:30');                       -- cruza el cambio de hora la noche del 25
  update public.reloj_config set aviso_previo_min = 2;
  while t < '2026-10-26 10:00:00+01' loop
    perform public.reloj_tick(t); perform prueba_responder(200);
    t := t + interval '1 minute';
  end loop;
  -- un bloque por día, ni más ni menos
  select count(*) into n from public.reloj_sesiones where origen = 'agenda';
  if n <> 6 then raise exception 'sesiones de agenda: % (esperadas 6)', n; end if;
  -- la mañana empieza siempre a las 07:00 de Madrid (05:00Z en verano, 06:00Z en invierno)
  select string_agg(to_char(inicio at time zone 'UTC', 'DD HH24:MI'), ', ' order by inicio) into v_err from public.reloj_sesiones where modo = 'manana';
  if v_err <> '24 05:00, 25 06:00, 26 06:00' then raise exception 'mañanas mal: %', v_err; end if;
  -- el bloque nocturno del 25 (01:30 CEST → 03:30 CET) dura 3 horas reales; los otros 2
  select string_agg(to_char(fecha_agenda, 'DD') || '=' || (extract(epoch from fin_previsto - inicio) / 3600)::int, ', ' order by fecha_agenda) into v_err
  from public.reloj_sesiones where modo = 'descanso';
  if v_err <> '24=2, 25=3, 26=2' then raise exception 'bloques nocturnos: %', v_err; end if;
  -- ningún evento duplicado y horas de Madrid con el desfase correcto
  if exists (select 1 from public.reloj_eventos where tipo = 'evento' group by payload ->> 'evento', payload ->> 'hora_madrid', payload ->> 'fase' having count(*) > 1)
    then raise exception 'eventos duplicados'; end if;
  if not exists (select 1 from prueba_eventos() where evento = 'modo_iniciado' and hora = '2026-10-24T07:00:00+02:00')
     or not exists (select 1 from prueba_eventos() where evento = 'modo_iniciado' and hora = '2026-10-25T07:00:00+01:00')
    then raise exception 'hora_madrid mal en los modo_iniciado'; end if;
  raise notice 'OK 6a: agenda alrededor del 25-oct: un bloque por día a las 07:00 de Madrid, bloque nocturno de 3 h reales';

  -- concentración manual que atraviesa el cambio de hora: fases contiguas de 25/5 min, sin huecos ni duplicados
  perform prueba_limpiar();
  perform public.reloj_crear_sesion('concentracion', 'manual', '2026-10-25 01:00:00+02', null);
  t := '2026-10-25 01:00:00+02';
  while t < '2026-10-25 05:00:00+01' loop perform public.reloj_tick(t); perform prueba_responder(200); t := t + interval '1 minute'; end loop;
  select count(*) into n from public.reloj_fases a join public.reloj_fases b on b.sesion_id = a.sesion_id and b.orden = a.orden + 1
  where b.inicio_previsto <> a.fin_previsto;
  if n > 0 then raise exception 'huecos entre fases: %', n; end if;
  select count(*) into n from public.reloj_fases
  where extract(epoch from fin_previsto - inicio_previsto) / 60 <> case tipo when 'pomodoro' then 25 when 'descanso_corto' then 5 else 15 end;
  if n > 0 then raise exception 'duraciones alteradas: %', n; end if;
  select count(*) into n from public.reloj_fases where estado in ('activa', 'terminada') and inicio_previsto < '2026-10-25 05:00:00+01';
  -- 01:00 CEST → 05:00 CET son 5 h reales = 300 min; ciclo 25+5 (×3) + 25+15 = 130 min
  if n <> (select count(*) from public.reloj_eventos where evento in ('modo_iniciado','fase_iniciada')) then raise exception 'fases y eventos no cuadran'; end if;
  if exists (select 1 from public.reloj_eventos where tipo = 'evento' group by payload ->> 'id_evento' having count(*) > 1) then raise exception 'id_evento repetido'; end if;
  raise notice 'OK 6b: concentración a través del cambio de hora: % fases contiguas, duraciones exactas, sin duplicados', n;
end $$;

-- =====================================================================
-- 7) aviso_previo X minutos antes de cada cambio que para música o luces
-- =====================================================================
do $$
declare t0 timestamptz := '2026-10-10 16:00:00+00'; t timestamptz; n int; r record;
begin
  perform prueba_limpiar();
  update public.reloj_config set aviso_previo_min = 2;
  perform public.reloj_crear_sesion('concentracion', 'manual', t0, null);
  t := t0;
  while t < t0 + interval '61 minutes' loop perform public.reloj_tick(t); perform prueba_responder(200); t := t + interval '1 minute'; end loop;
  -- cada aviso sale 2 min antes del cambio que anuncia
  for r in select (payload ->> 'hora_madrid')::timestamptz as h, (payload -> 'siguiente_cambio' ->> 'hora_madrid')::timestamptz as c
           from public.reloj_eventos where evento = 'aviso_previo' loop
    if r.c - r.h <> interval '2 minutes' then raise exception 'aviso a % del cambio', r.c - r.h; end if;
  end loop;
  select count(*) into n from public.reloj_eventos where evento = 'aviso_previo';
  -- en 61 min hay cambios a los 25, 30, 55 y 60 → 4 avisos (el de los 60 sale a los 58)
  if n <> 4 then raise exception 'avisos: %', n; end if;
  -- fases sin parada configurada no avisan
  perform prueba_limpiar();
  update public.reloj_config set fases_con_parada = array['pomodoro'];
  perform public.reloj_crear_sesion('concentracion', 'manual', t0, null);
  t := t0;
  while t < t0 + interval '61 minutes' loop perform public.reloj_tick(t); perform prueba_responder(200); t := t + interval '1 minute'; end loop;
  select count(*) into n from public.reloj_eventos where evento = 'aviso_previo';
  if n <> 2 then raise exception 'avisos solo de pomodoros: %', n; end if;
  update public.reloj_config set fases_con_parada = array['pomodoro','descanso_corto','descanso_largo','descanso','entreno','manana'];
  raise notice 'OK 7: aviso_previo 2 min antes de cada cambio configurado';
end $$;

-- =====================================================================
-- 8) Prueba de destino y RLS
-- =====================================================================
do $$
declare v uuid; n int;
begin
  perform prueba_limpiar();
  perform set_config('request.jwt.claims', '{"email":"nicolasrecobasystem@gmail.com","role":"authenticated"}', false);
  v := public.reloj_guardar_destino(null, 'Segundo', 'https://otro.test/hook', 'Bearer secreto-que-no-se-ve-9876', true);
  if (select pista from public.reloj_destinos where id = v) <> '••••9876' then raise exception 'pista mal'; end if;
  if exists (select 1 from public.reloj_destinos d where d.pista like '%secreto%') then raise exception 'header en claro'; end if;
  perform public.reloj_probar_destino(v);
  select count(*) into n from net.http_request_queue where url = 'https://otro.test/hook' and body ->> 'evento' = 'prueba' and headers ->> 'Authorization' = 'Bearer secreto-que-no-se-ve-9876';
  if n <> 1 then raise exception 'prueba de destino: %', n; end if;
  if (public.reloj_estado() -> 'destinos')::text like '%secreto-que-no%' then raise exception 'el panel ve el header'; end if;
  perform set_config('request.jwt.claims', '', false);
  raise notice 'OK 8: probar webhook, header solo en Vault y enmascarado en el panel';
end $$;

-- RLS: un usuario autenticado que no es Diego no ve nada
set role authenticated;
select set_config('request.jwt.claims', '{"email":"otro@ejemplo.com","role":"authenticated"}', false);
do $$ begin
  if (select count(*) from public.reloj_destinos) > 0 then raise exception 'RLS: otro usuario ve destinos'; end if;
  begin perform public.reloj_tick(); raise exception 'otro usuario pudo llamar a reloj_tick';
  exception when insufficient_privilege then null; end;
  begin insert into public.reloj_agenda (modo, hora_inicio, hora_fin) values ('manana', '07:00', '09:00'); raise exception 'otro usuario pudo escribir';
  exception when insufficient_privilege then null; end;
  begin perform public.reloj_estado(); raise exception 'otro usuario vio el estado';
  exception when insufficient_privilege then null; end;
  raise notice 'OK 9: RLS y permisos cierran tablas y funciones a otras cuentas';
end $$;
reset role;

set role authenticated;
select set_config('request.jwt.claims', '{"email":"nicolasrecobasystem@gmail.com","role":"authenticated"}', false);
do $$ begin
  if (select count(*) from public.reloj_destinos) = 0 then raise exception 'Diego no ve sus destinos'; end if;
  begin perform 1 from public.reloj_dispositivos where token_hash is not null; raise exception 'el hash del token se puede leer';
  exception when insufficient_privilege then null; end;
  raise notice 'OK 10: Diego lee sus tablas, pero nunca el hash del token del Mac';
end $$;
reset role;
set role anon;
do $$ begin
  perform public.reloj_latido('token-que-no-existe-000000000', null);
  begin perform public.reloj_iniciar('concentracion', null); raise exception 'anon pudo iniciar';
  exception when insufficient_privilege then null; end;
  raise notice 'OK 11: sin sesión solo se puede mandar el latido (con token)';
end $$;
reset role;
