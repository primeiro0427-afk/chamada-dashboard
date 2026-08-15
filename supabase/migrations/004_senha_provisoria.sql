-- ============================================================
-- MIGRATION 004 — Senha provisória
-- Execute no SQL Editor do Supabase
-- ============================================================

-- Quem é criado pelo painel recebe uma senha provisória e precisa trocá-la
-- no primeiro acesso. O default é false para não travar quem já usa o sistema.

alter table profiles
  add column if not exists senha_provisoria boolean not null default false;

-- O trigger passa a ler a marcação vinda do metadata (a Edge Function
-- criar-usuario envia senha_provisoria = true).

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, igreja_id, role, nome, senha_provisoria)
  values (
    new.id,
    (new.raw_user_meta_data->>'igreja_id')::uuid,
    coalesce(new.raw_user_meta_data->>'role', 'secretaria'),
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'senha_provisoria')::boolean, false)
  );
  return new;
end;
$$ language plpgsql security definer;
