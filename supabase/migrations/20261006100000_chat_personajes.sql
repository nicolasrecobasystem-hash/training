-- Chat: personajes con un prompt de configuración persistente (y, si quieres, su voz y su modelo). Idempotente.
-- Cada conversación recuerda con qué personaje va; sin personaje, el modelo va «puro» (sin instrucción de sistema).

create table if not exists public.chat_personajes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(nombre) between 1 and 60),
  prompt text not null default '' check (char_length(prompt) <= 20000),
  voz text check (voz ~ '^[A-Za-z0-9]{10,40}$'),
  proveedor text check (proveedor in ('deepseek', 'openrouter')),
  modelo text check (char_length(modelo) <= 120),
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now()
);

alter table public.chat_personajes enable row level security;
revoke all on public.chat_personajes from anon;
grant select, insert, update, delete on public.chat_personajes to authenticated;
drop policy if exists chat_pers_dueno on public.chat_personajes;
create policy chat_pers_dueno on public.chat_personajes for all to authenticated
  using (public.chat_es_dueno()) with check (public.chat_es_dueno());

alter table public.chat_conversaciones add column if not exists personaje_id uuid references public.chat_personajes(id) on delete set null;
