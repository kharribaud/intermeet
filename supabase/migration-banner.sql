-- ============================================================
-- Bannière profil recruteur
-- Exécuter dans l'éditeur SQL Supabase (SQL Editor) si besoin.
-- ============================================================

alter table public.recruiter_profiles
  add column if not exists banner_url text;

-- Augmente la limite du bucket avatars pour les bannières (5 Mo)
update storage.buckets
set file_size_limit = 5242880
where id = 'avatars';
