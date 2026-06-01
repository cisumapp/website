create extension if not exists pgcrypto;

create table if not exists public.lastfm_connection_flows (
  id uuid primary key default gen_random_uuid(),
  app_user_id uuid not null references public.app_users(id) on delete cascade,
  request_token text not null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'expired', 'cancelled')),
  expires_at timestamptz not null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.lastfm_connection_flows is 'Short-lived Last.fm auth handshake state for the currently signed-in cisum user.';

create table if not exists public.lastfm_connections (
  id uuid primary key default gen_random_uuid(),
  app_user_id uuid not null unique references public.app_users(id) on delete cascade,
  lastfm_username text not null,
  lastfm_session_key text not null,
  connected_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.lastfm_connections is 'Server-side Last.fm session key binding for a cisum app user.';

drop trigger if exists set_lastfm_connection_flows_updated_at on public.lastfm_connection_flows;

create trigger set_lastfm_connection_flows_updated_at
before update on public.lastfm_connection_flows
for each row
execute function public.set_app_users_updated_at();

drop trigger if exists set_lastfm_connections_updated_at on public.lastfm_connections;

create trigger set_lastfm_connections_updated_at
before update on public.lastfm_connections
for each row
execute function public.set_app_users_updated_at();

alter table public.lastfm_connection_flows enable row level security;
alter table public.lastfm_connections enable row level security;
