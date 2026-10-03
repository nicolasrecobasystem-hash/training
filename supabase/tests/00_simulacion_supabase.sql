-- SOLO PARA PROBAR EN UN POSTGRES LOCAL (no se pega en Supabase).
-- Imita lo mínimo de Supabase que usa el reloj: roles, auth.jwt(), Vault, pg_net y pg_cron.
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin bypassrls; end if;
end $$;
create schema extensions; create extension pgcrypto with schema extensions;
create schema auth;
create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
create function auth.role() returns text language sql stable as $$ select auth.jwt() ->> 'role' $$;
grant usage on schema auth, extensions to anon, authenticated, service_role;
grant execute on all functions in schema auth to anon, authenticated, service_role;
-- Vault (sin cifrado real)
create schema vault;
create table vault.secrets (id uuid primary key default gen_random_uuid(), name text unique, description text, secret text);
create view vault.decrypted_secrets as select id, name, description, secret as decrypted_secret from vault.secrets;
create function vault.create_secret(new_secret text, new_name text default null, new_description text default '') returns uuid
language sql as $$ insert into vault.secrets (secret, name, description) values (new_secret, new_name, new_description) returning id $$;
create function vault.update_secret(secret_id uuid, new_secret text) returns void
language sql as $$ update vault.secrets set secret = new_secret where id = secret_id $$;
-- pg_net: guarda las peticiones; las respuestas las escribe la prueba en net._http_response
create schema net;
create table net.http_request_queue (id bigserial primary key, url text, body jsonb, headers jsonb, timeout_milliseconds int);
create table net._http_response (id bigint primary key, status_code int, content text, timed_out boolean default false, error_msg text, created timestamptz default now());
create function net.http_post(url text, body jsonb default '{}', params jsonb default '{}', headers jsonb default '{}', timeout_milliseconds int default 5000)
returns bigint language sql as $$ insert into net.http_request_queue (url, body, headers, timeout_milliseconds) values (url, body, headers, timeout_milliseconds) returning id $$;
-- pg_cron: no hace nada aquí (la prueba llama a tick y vigilar a mano con la hora que quiere)
create schema cron;
create function cron.schedule(job text, sched text, cmd text) returns bigint language sql as $$ select 1::bigint $$;
-- Igual que Supabase: los roles de la API reciben permisos sobre lo nuevo de public (las tablas los acotan con RLS)
grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant select, insert, update, delete on tables to anon, authenticated, service_role;
alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;
