create extension if not exists pgcrypto;

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique,
  supabase_auth_user_id uuid unique,
  email text,
  full_name text,
  username text,
  image_url text,
  status text not null default 'active' check (status in ('active', 'deleted')),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.app_users is 'Durable identity map between Clerk and Supabase users.';

create or replace function public.set_app_users_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_app_users_updated_at on public.app_users;

create trigger set_app_users_updated_at
before update on public.app_users
for each row
execute function public.set_app_users_updated_at();

alter table public.app_users enable row level security;