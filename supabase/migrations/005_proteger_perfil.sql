-- ============================================================
-- MIGRATION 005 — Impedir auto-promoção no profiles
-- Execute no SQL Editor do Supabase
-- ============================================================

-- A policy "atualizar proprio perfil" libera o update da própria linha, mas o
-- RLS não restringe COLUNAS: dava para uma secretária chamar a API com a anon
-- key (que é pública) e rodar
--     update profiles set role = 'admin' where id = auth.uid()
-- virando admin da igreja, ou trocar o próprio igreja_id para o de outra.
--
-- Grant por coluna não resolve: valeria para o role `authenticated`, e o
-- superadmin também é `authenticated` — o painel deixaria de funcionar.
-- Então a trava é um trigger, que enxerga quem está chamando.

-- ─── 1. Onboarding precisa continuar funcionando ────────────────────────────
-- setup_igreja faz justamente o update proibido (vira admin da igreja nova).
-- Ele marca uma flag de transação que só o próprio banco consegue ligar:
-- set_config vive no pg_catalog e não é exposta como RPC pelo PostgREST.

create or replace function setup_igreja(p_nome text)
returns uuid as $$
declare
  v_igreja_id uuid;
begin
  -- Quem já tem igreja não passa por aqui de novo.
  if (select igreja_id from profiles where id = auth.uid()) is not null then
    raise exception 'Você já pertence a uma igreja.';
  end if;

  insert into igrejas (nome) values (p_nome) returning id into v_igreja_id;

  perform set_config('app.onboarding', 'on', true); -- true = só nesta transação

  update profiles
    set igreja_id = v_igreja_id, role = 'admin'
    where id = auth.uid();

  perform criar_categorias_padrao(v_igreja_id);

  return v_igreja_id;
end;
$$ language plpgsql security definer;

-- ─── 2. O trigger ────────────────────────────────────────────────────────────

create or replace function proteger_campos_do_perfil()
returns trigger as $$
begin
  -- Superadmin gerencia funções e igrejas pelo painel.
  if is_superadmin() then
    return new;
  end if;

  -- Onboarding legítimo (ver setup_igreja acima).
  if coalesce(current_setting('app.onboarding', true), '') = 'on' then
    return new;
  end if;

  if new.role is distinct from old.role then
    raise exception 'Somente o superadmin pode alterar a função de um usuário.';
  end if;

  if new.igreja_id is distinct from old.igreja_id then
    raise exception 'Somente o superadmin pode alterar a igreja de um usuário.';
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_profile_update on profiles;
create trigger on_profile_update
  before update on profiles
  for each row execute procedure proteger_campos_do_perfil();
