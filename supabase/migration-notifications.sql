-- ============================================================
-- Migration : Notifications
-- À exécuter dans l'éditeur SQL Supabase après le schéma principal.
-- ============================================================

-- Enum type de notification
create type notification_type as enum (
  'NEW_APPLICATION',
  'APPLICATION_ACCEPTED',
  'APPLICATION_REJECTED'
);

-- Table notifications
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  type notification_type not null,
  payload jsonb not null default '{}',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Index pour récupérer rapidement les notifs d'un utilisateur
create index if not exists notifications_user_id_idx on public.notifications(user_id);
create index if not exists notifications_user_read_idx on public.notifications(user_id, read);

-- RLS : chaque utilisateur ne voit que ses propres notifications
alter table public.notifications enable row level security;

create policy "Lire ses propres notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Mettre à jour ses propres notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

-- Les services (server actions) peuvent insérer des notifications
create policy "Service peut insérer des notifications"
  on public.notifications for insert
  with check (true);
