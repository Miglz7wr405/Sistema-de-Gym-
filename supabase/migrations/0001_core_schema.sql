-- =============================================================
-- Sistema de Gestão para Mini Ginásio — esquema núcleo
-- Postgres / Supabase
-- =============================================================

create extension if not exists "pgcrypto";

-- ---------- Tipos ----------
do $$ begin
  create type user_role as enum ('admin', 'instructor', 'member');
exception when duplicate_object then null; end $$;

do $$ begin
  create type profile_status as enum ('active', 'suspended', 'inactive');
exception when duplicate_object then null; end $$;

do $$ begin
  create type checkin_result as enum ('granted', 'expired', 'not_found');
exception when duplicate_object then null; end $$;

-- ---------- profiles ----------
-- Uma linha por utilizador autenticado (id = auth.users.id).
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null default '',
  email       text,
  phone       text,
  photo_url   text,
  role        user_role not null default 'member',
  status      profile_status not null default 'active',
  created_at  timestamptz not null default now()
);

-- ---------- plans ----------
create table if not exists public.plans (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  price_mzn     numeric(12, 2) not null default 0,
  duration_days integer not null default 30,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ---------- memberships (uma por membro; valid_until define o estado) ----------
create table if not exists public.memberships (
  id          uuid primary key default gen_random_uuid(),
  member_id   uuid not null references public.profiles (id) on delete cascade,
  plan_id     uuid references public.plans (id) on delete set null,
  valid_until date,
  created_at  timestamptz not null default now(),
  unique (member_id)
);

-- ---------- payments ----------
create sequence if not exists public.receipt_seq start 1000;

create table if not exists public.payments (
  id          uuid primary key default gen_random_uuid(),
  member_id   uuid not null references public.profiles (id) on delete cascade,
  plan_id     uuid references public.plans (id) on delete set null,
  amount_mzn  numeric(12, 2) not null default 0,
  method      text,
  receipt_no  text not null default ('REC-' || nextval('public.receipt_seq')::text),
  paid_at     timestamptz not null default now(),
  valid_until date,
  created_by  uuid references public.profiles (id) on delete set null
);

-- ---------- member_tokens (o conteúdo do QR — APENAS um token opaco) ----------
create table if not exists public.member_tokens (
  member_id   uuid primary key references public.profiles (id) on delete cascade,
  token       uuid not null default gen_random_uuid(),
  expires_at  timestamptz,                 -- reservado para QR rotativo futuro
  created_at  timestamptz not null default now(),
  unique (token)
);
create index if not exists member_tokens_token_idx on public.member_tokens (token);

-- ---------- attendances ----------
create table if not exists public.attendances (
  id            uuid primary key default gen_random_uuid(),
  member_id     uuid not null references public.profiles (id) on delete cascade,
  checked_in_at timestamptz not null default now(),
  validated_by  uuid references public.profiles (id) on delete set null,
  result        checkin_result not null default 'granted'
);
create index if not exists attendances_member_idx on public.attendances (member_id, checked_in_at desc);

-- =============================================================
-- Funções auxiliares
-- =============================================================

-- Papel do utilizador atual (SECURITY DEFINER evita recursão nas policies).
create or replace function public.current_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Ao criar um profile de membro, gera automaticamente o seu token de QR.
create or replace function public.handle_new_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.member_tokens (member_id)
  values (new.id)
  on conflict (member_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_profile_created on public.profiles;
create trigger on_profile_created
  after insert on public.profiles
  for each row execute function public.handle_new_profile();

-- Cria o profile automaticamente quando um utilizador se regista no Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
