-- ============================================================
-- Champs éditables du profil recruteur
-- Exécuter dans l'éditeur SQL Supabase (SQL Editor) si besoin.
-- ============================================================

alter table public.recruiter_profiles
  add column if not exists tagline text,
  add column if not exists bio text,
  add column if not exists founded_year integer;
