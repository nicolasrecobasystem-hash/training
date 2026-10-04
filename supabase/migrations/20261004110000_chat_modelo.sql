-- Chat: cada conversación recuerda con qué modelo va (DeepSeek directo u OpenRouter). Idempotente.
alter table public.chat_conversaciones add column if not exists proveedor text not null default 'deepseek';
alter table public.chat_conversaciones add column if not exists modelo text;
do $$ begin
  alter table public.chat_conversaciones add constraint chat_conv_proveedor check (proveedor in ('deepseek', 'openrouter'));
exception when duplicate_object then null; end $$;
