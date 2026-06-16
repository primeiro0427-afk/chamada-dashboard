-- ============================================================
-- MIGRATION 003 — Papel superadmin
-- Execute no SQL Editor do Supabase
-- ============================================================

-- 1. Adicionar superadmin ao constraint de roles
alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check
  check (role in ('superadmin', 'admin', 'secretaria'));

-- 2. Função auxiliar
create or replace function is_superadmin()
returns boolean as $$
  select coalesce(
    (select role = 'superadmin' from profiles where id = auth.uid()),
    false
  )
$$ language sql security definer stable;

-- 3. Recriar policies com bypass para superadmin

-- IGREJAS
drop policy if exists "ver propria igreja" on igrejas;
drop policy if exists "admin atualiza igreja" on igrejas;
create policy "ver igrejas" on igrejas
  for select using (is_superadmin() or id = get_user_igreja_id());
create policy "gerenciar igrejas" on igrejas
  for all using (is_superadmin() or (id = get_user_igreja_id() and get_user_role() = 'admin'));

-- PROFILES
drop policy if exists "ver perfis da mesma igreja" on profiles;
drop policy if exists "atualizar proprio perfil" on profiles;
drop policy if exists "admin gerencia usuarios" on profiles;
create policy "ver perfis" on profiles
  for select using (is_superadmin() or igreja_id = get_user_igreja_id());
create policy "atualizar proprio perfil" on profiles
  for update using (id = auth.uid());
create policy "superadmin gerencia profiles" on profiles
  for all using (is_superadmin());

-- TURMAS
drop policy if exists "membros leem turmas" on turmas;
drop policy if exists "admin insere turmas" on turmas;
drop policy if exists "admin atualiza turmas" on turmas;
drop policy if exists "admin deleta turmas" on turmas;
create policy "ver turmas" on turmas
  for select using (is_superadmin() or igreja_id = get_user_igreja_id());
create policy "gerenciar turmas" on turmas
  for all using (is_superadmin() or (igreja_id = get_user_igreja_id() and get_user_role() = 'admin'));

-- ALUNOS
drop policy if exists "membros leem alunos" on alunos;
drop policy if exists "admin secretaria inserem alunos" on alunos;
drop policy if exists "admin secretaria atualizam alunos" on alunos;
drop policy if exists "admin deleta alunos" on alunos;
create policy "ver alunos" on alunos
  for select using (is_superadmin() or igreja_id = get_user_igreja_id());
create policy "gerenciar alunos" on alunos
  for all using (is_superadmin() or (igreja_id = get_user_igreja_id() and get_user_role() in ('admin', 'secretaria')));

-- CATEGORIAS
drop policy if exists "membros leem categorias" on categorias;
drop policy if exists "admin insere categorias" on categorias;
drop policy if exists "admin atualiza categorias" on categorias;
drop policy if exists "admin deleta categorias" on categorias;
create policy "ver categorias" on categorias
  for select using (is_superadmin() or igreja_id = get_user_igreja_id());
create policy "gerenciar categorias" on categorias
  for all using (is_superadmin() or (igreja_id = get_user_igreja_id() and get_user_role() = 'admin'));

-- CHAMADAS
drop policy if exists "membros leem chamadas" on chamadas;
drop policy if exists "admin secretaria inserem chamadas" on chamadas;
drop policy if exists "admin secretaria atualizam chamadas" on chamadas;
drop policy if exists "admin deleta chamadas" on chamadas;
create policy "ver chamadas" on chamadas
  for select using (is_superadmin() or igreja_id = get_user_igreja_id());
create policy "gerenciar chamadas" on chamadas
  for all using (is_superadmin() or (igreja_id = get_user_igreja_id() and get_user_role() in ('admin', 'secretaria')));

-- REGISTROS CHAMADA
drop policy if exists "membros leem registros" on registros_chamada;
drop policy if exists "admin secretaria inserem registros" on registros_chamada;
drop policy if exists "admin secretaria atualizam registros" on registros_chamada;
drop policy if exists "admin deleta registros" on registros_chamada;
create policy "ver registros" on registros_chamada
  for select using (is_superadmin() or igreja_id = get_user_igreja_id());
create policy "gerenciar registros" on registros_chamada
  for all using (is_superadmin() or (igreja_id = get_user_igreja_id() and get_user_role() in ('admin', 'secretaria')));
