-- ============================================================
-- SISTEMA DE CHAMADA EBD — Schema Supabase
-- Execute este arquivo no SQL Editor do seu projeto Supabase
-- ============================================================


-- ============================================================
-- 1. TABELAS
-- ============================================================

-- Igrejas (cada cliente é uma igreja)
create table if not exists igrejas (
  id         uuid default gen_random_uuid() primary key,
  nome       text not null,
  created_at timestamptz default now()
);

-- Perfis de usuário (estende auth.users do Supabase)
create table if not exists profiles (
  id         uuid references auth.users(id) on delete cascade primary key,
  igreja_id  uuid references igrejas(id) on delete cascade,
  role       text not null default 'secretaria' check (role in ('admin', 'secretaria')),
  nome       text,
  created_at timestamptz default now()
);

-- Turmas
create table if not exists turmas (
  id         uuid default gen_random_uuid() primary key,
  igreja_id  uuid references igrejas(id) on delete cascade not null,
  nome       text not null,
  cor        text not null default 'indigo',
  ativo      boolean default true,
  ordem      integer default 0,
  created_at timestamptz default now()
);

-- Alunos
create table if not exists alunos (
  id         uuid default gen_random_uuid() primary key,
  igreja_id  uuid references igrejas(id) on delete cascade not null,
  turma_id   uuid references turmas(id) on delete set null,
  nome       text not null,
  ativo      boolean default true,
  created_at timestamptz default now()
);

-- Categorias de pontuação (configuráveis por igreja)
create table if not exists categorias (
  id         uuid default gen_random_uuid() primary key,
  igreja_id  uuid references igrejas(id) on delete cascade not null,
  cat_id     text not null,
  nome       text not null,
  pontos     integer not null default 0,
  tipo       text not null check (tipo in ('boolean', 'numeric', 'currency', 'ausencia')),
  ativo      boolean default true,
  ordem      integer default 0,
  created_at timestamptz default now(),
  unique(igreja_id, cat_id)
);

-- Chamadas (registro por turma + data)
create table if not exists chamadas (
  id         uuid default gen_random_uuid() primary key,
  igreja_id  uuid references igrejas(id) on delete cascade not null,
  turma_id   uuid references turmas(id) on delete cascade not null,
  data       date not null,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  unique(turma_id, data)
);

-- Registros individuais por aluno em cada chamada
create table if not exists registros_chamada (
  id         uuid default gen_random_uuid() primary key,
  igreja_id  uuid references igrejas(id) on delete cascade not null,
  chamada_id uuid references chamadas(id) on delete cascade not null,
  aluno_id   uuid references alunos(id) on delete cascade not null,
  presente   boolean default false,
  categorias jsonb default '{}',
  created_at timestamptz default now(),
  unique(chamada_id, aluno_id)
);


-- ============================================================
-- 2. ROW LEVEL SECURITY (RLS)
-- Garante que cada igreja só vê seus próprios dados
-- ============================================================

alter table igrejas          enable row level security;
alter table profiles         enable row level security;
alter table turmas           enable row level security;
alter table alunos           enable row level security;
alter table categorias       enable row level security;
alter table chamadas         enable row level security;
alter table registros_chamada enable row level security;

-- Funções auxiliares (chamadas pelas policies)
create or replace function get_user_igreja_id()
returns uuid as $$
  select igreja_id from profiles where id = auth.uid()
$$ language sql security definer stable;

create or replace function get_user_role()
returns text as $$
  select role from profiles where id = auth.uid()
$$ language sql security definer stable;

-- IGREJAS
create policy "ver propria igreja" on igrejas
  for select using (id = get_user_igreja_id());

create policy "admin atualiza igreja" on igrejas
  for update using (id = get_user_igreja_id() and get_user_role() = 'admin');

-- PROFILES
create policy "ver perfis da mesma igreja" on profiles
  for select using (igreja_id = get_user_igreja_id());

create policy "atualizar proprio perfil" on profiles
  for update using (id = auth.uid());

create policy "admin gerencia usuarios" on profiles
  for all using (igreja_id = get_user_igreja_id() and get_user_role() = 'admin');

-- TURMAS (somente admin escreve)
create policy "membros leem turmas" on turmas
  for select using (igreja_id = get_user_igreja_id());

create policy "admin insere turmas" on turmas
  for insert with check (igreja_id = get_user_igreja_id() and get_user_role() = 'admin');

create policy "admin atualiza turmas" on turmas
  for update using (igreja_id = get_user_igreja_id() and get_user_role() = 'admin');

create policy "admin deleta turmas" on turmas
  for delete using (igreja_id = get_user_igreja_id() and get_user_role() = 'admin');

-- ALUNOS (admin e secretária escrevem)
create policy "membros leem alunos" on alunos
  for select using (igreja_id = get_user_igreja_id());

create policy "admin secretaria inserem alunos" on alunos
  for insert with check (igreja_id = get_user_igreja_id() and get_user_role() in ('admin', 'secretaria'));

create policy "admin secretaria atualizam alunos" on alunos
  for update using (igreja_id = get_user_igreja_id() and get_user_role() in ('admin', 'secretaria'));

create policy "admin deleta alunos" on alunos
  for delete using (igreja_id = get_user_igreja_id() and get_user_role() = 'admin');

-- CATEGORIAS (somente admin escreve)
create policy "membros leem categorias" on categorias
  for select using (igreja_id = get_user_igreja_id());

create policy "admin insere categorias" on categorias
  for insert with check (igreja_id = get_user_igreja_id() and get_user_role() = 'admin');

create policy "admin atualiza categorias" on categorias
  for update using (igreja_id = get_user_igreja_id() and get_user_role() = 'admin');

create policy "admin deleta categorias" on categorias
  for delete using (igreja_id = get_user_igreja_id() and get_user_role() = 'admin');

-- CHAMADAS (admin e secretária escrevem)
create policy "membros leem chamadas" on chamadas
  for select using (igreja_id = get_user_igreja_id());

create policy "admin secretaria inserem chamadas" on chamadas
  for insert with check (igreja_id = get_user_igreja_id() and get_user_role() in ('admin', 'secretaria'));

create policy "admin secretaria atualizam chamadas" on chamadas
  for update using (igreja_id = get_user_igreja_id() and get_user_role() in ('admin', 'secretaria'));

create policy "admin deleta chamadas" on chamadas
  for delete using (igreja_id = get_user_igreja_id() and get_user_role() = 'admin');

-- REGISTROS CHAMADA (admin e secretária escrevem)
create policy "membros leem registros" on registros_chamada
  for select using (igreja_id = get_user_igreja_id());

create policy "admin secretaria inserem registros" on registros_chamada
  for insert with check (igreja_id = get_user_igreja_id() and get_user_role() in ('admin', 'secretaria'));

create policy "admin secretaria atualizam registros" on registros_chamada
  for update using (igreja_id = get_user_igreja_id() and get_user_role() in ('admin', 'secretaria'));

create policy "admin deleta registros" on registros_chamada
  for delete using (igreja_id = get_user_igreja_id() and get_user_role() = 'admin');


-- ============================================================
-- 3. TRIGGER: criar profile automaticamente no cadastro
-- ============================================================

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, igreja_id, role, nome)
  values (
    new.id,
    (new.raw_user_meta_data->>'igreja_id')::uuid,
    coalesce(new.raw_user_meta_data->>'role', 'secretaria'),
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();


-- ============================================================
-- 4. FUNÇÃO: inserir categorias padrão para nova igreja
-- Chamada no app após criar a igreja
-- ============================================================

create or replace function criar_categorias_padrao(p_igreja_id uuid)
returns void as $$
begin
  insert into categorias (igreja_id, cat_id, nome, pontos, tipo, ativo, ordem) values
    (p_igreja_id, 'presenca',        'Presença',        10, 'boolean',  true, 0),
    (p_igreja_id, 'ausencia',        'Ausência',         5, 'ausencia', true, 1),
    (p_igreja_id, 'biblia',          'Bíblia',           5, 'boolean',  true, 2),
    (p_igreja_id, 'revista',         'Revista',          5, 'boolean',  true, 3),
    (p_igreja_id, 'licao_lida',      'Lição Lida',       5, 'boolean',  true, 4),
    (p_igreja_id, 'visitante',       'Visitante',       10, 'numeric',  true, 5),
    (p_igreja_id, 'jejum',           'Jejum',            5, 'boolean',  true, 6),
    (p_igreja_id, 'culto_domestico', 'Culto Doméstico',  5, 'boolean',  true, 7),
    (p_igreja_id, 'oferta',          'Oferta',          10, 'currency', true, 8)
  on conflict (igreja_id, cat_id) do nothing;
end;
$$ language plpgsql security definer;
