-- ============================================================
-- Migration : champs supplémentaires pour les événements
-- À exécuter dans l'éditeur SQL Supabase après schema.sql
-- ============================================================

alter table public.events
  add column if not exists event_type text,
  add column if not exists address text,
  add column if not exists setup_start_at timestamptz,
  add column if not exists setup_end_at timestamptz,
  add column if not exists teardown_start_at timestamptz,
  add column if not exists teardown_end_at timestamptz;
