-- =========================================================
-- ESQUEMA: Gestión de entrevistas semanales de estaca
-- Ejecutar en el SQL Editor de Supabase
-- =========================================================

-- ---------------------------------------------------------
-- EXTENSIONES
-- ---------------------------------------------------------
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------
-- TABLA: profiles (extiende auth.users)
-- ---------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  email text not null,
  role text not null default 'secretario' check (role in ('admin', 'secretario')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- TABLA: presidentes
-- ---------------------------------------------------------
create table if not exists public.presidentes (
  id uuid primary key default uuid_generate_v4(),
  nombre text not null,
  modalidad_default text check (modalidad_default in ('presencial', 'virtual')),
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- TABLA: citas
-- ---------------------------------------------------------
create table if not exists public.citas (
  id uuid primary key default uuid_generate_v4(),
  fecha date not null,
  hora time not null,
  nombre_persona text not null,
  barrio text,
  motivo text,
  modalidad text not null default 'presencial' check (modalidad in ('presencial', 'virtual')),
  celular text,
  presidente_id uuid not null references public.presidentes(id) on delete cascade,
  creado_por uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  -- Un mismo presidente no puede tener 2 citas a la misma fecha/hora
  unique (presidente_id, fecha, hora)
);

create index if not exists idx_citas_fecha on public.citas (fecha);
create index if not exists idx_citas_presidente on public.citas (presidente_id);

-- ---------------------------------------------------------
-- MIGRACIÓN: si la tabla citas ya existía antes de agregar
-- la columna celular, ejecuta esta línea en el SQL Editor.
-- ---------------------------------------------------------
alter table public.citas add column if not exists celular text;

-- ---------------------------------------------------------
-- FUNCION: crear profile automáticamente al registrar usuario
-- ---------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nombre, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'secretario')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.presidentes enable row level security;
alter table public.citas enable row level security;

-- Helper: saber si el usuario actual es admin
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- PROFILES: cualquier usuario autenticado puede leer, solo admin escribe
create policy "profiles_select_authenticated" on public.profiles
  for select using (auth.role() = 'authenticated');

create policy "profiles_insert_admin" on public.profiles
  for insert with check (public.is_admin());

create policy "profiles_update_admin" on public.profiles
  for update using (public.is_admin());

-- Cada usuario puede actualizar su propio perfil (nombre, email).
-- El trigger protect_profile_role (abajo) impide que se cambie su propio rol.
drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "profiles_delete_admin" on public.profiles
  for delete using (public.is_admin());

create or replace function public.protect_profile_role()
returns trigger as $$
begin
  if not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists protect_profile_role on public.profiles;
create trigger protect_profile_role
  before update on public.profiles
  for each row execute procedure public.protect_profile_role();

-- PRESIDENTES: lectura para autenticados, escritura solo admin
create policy "presidentes_select_authenticated" on public.presidentes
  for select using (auth.role() = 'authenticated');

create policy "presidentes_insert_admin" on public.presidentes
  for insert with check (public.is_admin());

create policy "presidentes_update_admin" on public.presidentes
  for update using (public.is_admin());

create policy "presidentes_delete_admin" on public.presidentes
  for delete using (public.is_admin());

-- CITAS: lectura para autenticados, escritura admin + secretario
create policy "citas_select_authenticated" on public.citas
  for select using (auth.role() = 'authenticated');

create policy "citas_insert_staff" on public.citas
  for insert with check (auth.role() = 'authenticated');

create policy "citas_update_staff" on public.citas
  for update using (auth.role() = 'authenticated');

create policy "citas_delete_staff" on public.citas
  for delete using (auth.role() = 'authenticated');

-- ---------------------------------------------------------
-- REALTIME: habilitar en las tablas necesarias
-- ---------------------------------------------------------
alter publication supabase_realtime add table public.citas;
alter publication supabase_realtime add table public.presidentes;
alter publication supabase_realtime add table public.profiles;

-- ---------------------------------------------------------
-- SEED (opcional): presidentes de ejemplo
-- ---------------------------------------------------------
insert into public.presidentes (nombre, modalidad_default, activo) values
  ('Presidente Ramírez', 'presencial', true),
  ('Presidente Gómez', 'presencial', true),
  ('Presidente Torres', 'virtual', true)
on conflict do nothing;

-- ---------------------------------------------------------
-- NOTA: para crear el primer admin, registra un usuario desde
-- la app y luego ejecuta:
-- update public.profiles set role = 'admin' where email = 'tu-correo@ejemplo.com';
-- ---------------------------------------------------------
