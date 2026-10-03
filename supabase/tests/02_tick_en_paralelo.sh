#!/bin/sh
# Lanza 8 reloj_tick() a la vez sobre la misma hora y comprueba que no hay eventos ni entregas duplicados.
# Uso: PSQL="psql -h /tmp/pg -p 5433 -U postgres -d reloj" sh 02_tick_en_paralelo.sh
P=${PSQL:-"psql -d reloj"}
$P -q -c "select prueba_limpiar(); select public.reloj_crear_sesion('concentracion','manual','2026-10-12 09:00:00+00',null); select public.reloj_tick('2026-10-12 09:00:10+00'); select prueba_responder(200);" >/dev/null
for i in 1 2 3 4 5 6 7 8; do
  $P -q -c "select public.reloj_tick('2026-10-12 09:25:30+00')" >/dev/null &
done
wait
for i in 1 2 3 4 5 6 7 8; do
  $P -q -c "select public.reloj_tick('2026-10-12 09:25:40+00'); select public.reloj_vigilar('2026-10-12 09:25:40+00')" >/dev/null &
done
wait
$P -At -c "select case when (select count(*) from public.reloj_eventos where tipo='evento') = 3
                         and (select count(*) from public.reloj_entregas) = 3 * (select count(*) from public.reloj_destinos where activo)
                         and (select count(*) from net.http_request_queue) = 3 * (select count(*) from public.reloj_destinos where activo)
                         and not exists (select 1 from public.reloj_eventos where tipo='evento' group by payload->>'evento', payload->>'fase', payload->>'ciclo' having count(*)>1)
                    then 'OK 12: 16 ticks en paralelo → 3 eventos (modo_iniciado, aviso_previo, descanso corto) y una entrega por destino, sin duplicados'
                    else 'FALLO: ' || (select string_agg(payload->>'evento' || '/' || coalesce(payload->>'fase','-'), ', ') from public.reloj_eventos where tipo='evento') end"
