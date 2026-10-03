-- Reloj del día · 1/4 · Extensiones
-- pg_cron: ejecuta el tick y el vigilante cada minuto dentro de la base.
-- pg_net: manda los webhooks desde la base (con timeout y respuesta guardada en net._http_response).
-- supabase_vault: guarda los headers de los destinos cifrados (nunca en texto plano en una tabla).
-- pgcrypto: hash del token del Mac y tokens aleatorios.
-- Todo con "if not exists": se puede pegar dos veces sin romper nada.
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;
create extension if not exists supabase_vault with schema vault;
create extension if not exists pgcrypto with schema extensions;
