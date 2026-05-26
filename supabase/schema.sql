-- ============================================================
-- Schéma principal Intermeet
-- À exécuter EN PREMIER dans l'éditeur SQL Supabase.
-- Ordre d'exécution : schema.sql > trigger-auth-user.sql > auth-rls.sql > migration-avatar.sql
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "postgis" schema extensions;

-- Enums
create type user_role as enum ('INTERMITTENT', 'RECRUITER', 'ADMIN');
create type user_status as enum ('ACTIVE', 'SUSPENDED');
create type calendar_block_type as enum ('BOOKED', 'UNAVAILABLE', 'HOLD', 'TRAVEL');
create type job_status as enum ('DRAFT', 'PUBLISHED', 'PAUSED', 'CLOSED');
create type application_status as enum ('APPLIED', 'SHORTLISTED', 'REJECTED', 'WITHDRAWN', 'ACCEPTED');
create type booking_status as enum ('CONFIRMED', 'COMPLETED', 'CANCELED');
create type skill_level as enum ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- Table users (miroir de auth.users)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role user_role not null default 'INTERMITTENT',
  status user_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Table profils intermittents
create table if not exists public.intermittent_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  display_name text not null default '',
  bio text,
  city text,
  location_point extensions.geography(Point, 4326),
  travel_radius_km integer,
  seniority_years integer,
  visibility text default 'PUBLIC',
  avatar_url text,
  daily_rate numeric(10,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Table profils recruteurs
create table if not exists public.recruiter_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  company_name text not null default '',
  website_url text,
  city text,
  location_point extensions.geography(Point, 4326),
  verified boolean default false,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Table compétences
create table if not exists public.skills (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  category text
);

-- Table liaison intermittent <-> compétences
create table if not exists public.intermittent_skills (
  intermittent_user_id uuid references public.intermittent_profiles(user_id) on delete cascade,
  skill_id uuid references public.skills(id) on delete cascade,
  level skill_level not null default 'INTERMEDIATE',
  years_experience integer,
  primary key (intermittent_user_id, skill_id)
);

-- Table blocs calendrier
create table if not exists public.calendar_blocks (
  id uuid primary key default uuid_generate_v4(),
  intermittent_user_id uuid not null references public.intermittent_profiles(user_id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz not null,
  type calendar_block_type not null default 'UNAVAILABLE',
  title text,
  notes text
);

-- Table événements
create table if not exists public.events (
  id uuid primary key default uuid_generate_v4(),
  recruiter_user_id uuid not null references public.recruiter_profiles(user_id) on delete cascade,
  title text not null,
  venue_name text,
  city text,
  location_point extensions.geography(Point, 4326),
  start_at timestamptz not null,
  end_at timestamptz not null,
  description text,
  status text default 'PUBLISHED',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Table annonces (job posts)
create table if not exists public.job_posts (
  id uuid primary key default uuid_generate_v4(),
  recruiter_user_id uuid not null references public.recruiter_profiles(user_id) on delete cascade,
  event_id uuid references public.events(id) on delete set null,
  title text not null,
  description text,
  city text,
  location_point extensions.geography(Point, 4326),
  start_at timestamptz not null,
  end_at timestamptz not null,
  required_skill_id uuid references public.skills(id) on delete set null,
  required_count integer default 1,
  pay_amount numeric(10,2),
  status job_status not null default 'DRAFT',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Table candidatures
create table if not exists public.applications (
  id uuid primary key default uuid_generate_v4(),
  job_post_id uuid not null references public.job_posts(id) on delete cascade,
  intermittent_user_id uuid not null references public.intermittent_profiles(user_id) on delete cascade,
  cover_note text,
  status application_status not null default 'APPLIED',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_post_id, intermittent_user_id)
);

-- Table réservations
create table if not exists public.bookings (
  id uuid primary key default uuid_generate_v4(),
  job_post_id uuid references public.job_posts(id) on delete set null,
  event_id uuid references public.events(id) on delete set null,
  recruiter_user_id uuid not null references public.recruiter_profiles(user_id) on delete cascade,
  intermittent_user_id uuid not null references public.intermittent_profiles(user_id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz not null,
  agreed_pay_amount numeric(10,2),
  status booking_status not null default 'CONFIRMED',
  created_at timestamptz not null default now()
);

-- Trigger updated_at automatique
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.users
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.intermittent_profiles
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.recruiter_profiles
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.job_posts
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.applications
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.events
  for each row execute function public.set_updated_at();
