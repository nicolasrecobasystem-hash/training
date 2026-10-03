-- Reloj del día · 4/4 · Tareas programadas (pg_cron, cada minuto)
-- cron.schedule con el mismo nombre sustituye la tarea: se puede pegar dos veces.
select cron.schedule('reloj-tick', '* * * * *', $$select public.reloj_tick()$$);
select cron.schedule('reloj-vigilante', '* * * * *', $$select public.reloj_vigilar()$$);
-- Limpieza diaria (03:17 UTC): registro y entregas de más de 30 días
select cron.schedule('reloj-limpieza', '17 3 * * *', $$
  delete from public.reloj_entregas where creado < now() - interval '30 days' and estado in ('entregada','fallida');
  delete from public.reloj_eventos e where e.creado < now() - interval '30 days'
    and not exists (select 1 from public.reloj_entregas x where x.id_evento = e.id);
$$);
