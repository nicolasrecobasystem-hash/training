-- Chat con DeepSeek (chat.html): conversaciones y mensajes guardados en la nube.
-- Solo la cuenta de Diego las ve y las toca (RLS). La clave de DeepSeek vive en el secreto
-- DEEPSEEK_API_KEY de las edge functions; nunca en la base, el repo ni el navegador.
-- Idempotente: se puede volver a correr.

create or replace function public.chat_es_dueno() returns boolean
language sql stable as $$
  select coalesce(lower(auth.jwt()->>'email') = 'nicolasrecobasystem@gmail.com', false)
$$;

create table if not exists public.chat_conversaciones (
  id uuid primary key default gen_random_uuid(),
  titulo text not null default 'Conversación nueva' check (char_length(titulo) <= 120),
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now()
);
create index if not exists chat_conversaciones_actualizado on public.chat_conversaciones (actualizado desc);

create table if not exists public.chat_mensajes (
  id bigint generated always as identity primary key,
  conversacion_id uuid not null references public.chat_conversaciones(id) on delete cascade,
  rol text not null check (rol in ('user', 'assistant')),
  contenido text not null default '',
  razonamiento text,
  modelo text,
  uso jsonb,
  creado timestamptz not null default now()
);
create index if not exists chat_mensajes_conv on public.chat_mensajes (conversacion_id, id);

alter table public.chat_conversaciones enable row level security;
alter table public.chat_mensajes enable row level security;

revoke all on public.chat_conversaciones, public.chat_mensajes from anon;
grant select, insert, update, delete on public.chat_conversaciones, public.chat_mensajes to authenticated;

drop policy if exists chat_conv_dueno on public.chat_conversaciones;
create policy chat_conv_dueno on public.chat_conversaciones for all to authenticated
  using (public.chat_es_dueno()) with check (public.chat_es_dueno());

drop policy if exists chat_msj_dueno on public.chat_mensajes;
create policy chat_msj_dueno on public.chat_mensajes for all to authenticated
  using (public.chat_es_dueno()) with check (public.chat_es_dueno());
