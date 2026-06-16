-- ============================================================
-- MIGRATION 002 — Função de onboarding (setup_igreja)
-- Execute no SQL Editor do Supabase
-- ============================================================

-- Cria uma nova igreja, atualiza o perfil do admin e insere categorias padrão.
-- Roda com security definer para contornar o RLS durante o onboarding inicial.

create or replace function setup_igreja(p_nome text)
returns uuid as $$
declare
  v_igreja_id uuid;
begin
  insert into igrejas (nome) values (p_nome) returning id into v_igreja_id;

  update profiles
    set igreja_id = v_igreja_id, role = 'admin'
    where id = auth.uid();

  perform criar_categorias_padrao(v_igreja_id);

  return v_igreja_id;
end;
$$ language plpgsql security definer;
