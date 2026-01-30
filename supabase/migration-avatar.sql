-- ============================================================
-- Photo de profil (avatar)
-- Exécuter dans l'éditeur SQL Supabase après le schéma principal.
-- ============================================================

-- Colonne avatar_url sur les deux tables de profils
alter table public.recruiter_profiles
  add column if not exists avatar_url text;

alter table public.intermittent_profiles
  add column if not exists avatar_url text;

-- Créer le bucket "avatars" dans le Dashboard : Storage > New bucket > id = avatars, Public = on.
-- Ou via l’API : supabase.storage.createBucket('avatars', { public: true }).

-- Policy : tout le monde peut lire (bucket public)
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Policy : un utilisateur peut uploader dans son dossier (auth.uid()/...)
create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy : un utilisateur peut mettre à jour / supprimer son fichier
create policy "Users can update their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
