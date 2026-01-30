-- ============================================================
-- RLS pour l'authentification Intermeet
-- À exécuter dans l'éditeur SQL Supabase après le schéma principal.
--
-- IMPORTANT : exécuter aussi trigger-auth-user.sql pour que l'inscription
-- crée automatiquement la ligne dans public.users et le profil (recruiter
-- ou intermittent). Sans ce trigger, l'insert depuis l'app échoue (RLS).
-- ============================================================

-- Activer RLS sur les tables concernées
alter table users enable row level security;
alter table intermittent_profiles enable row level security;
alter table recruiter_profiles enable row level security;

-- Policy : un utilisateur peut s'insérer lui-même dans users (id = auth.uid())
create policy "Users can insert own row"
  on users for insert
  with check (auth.uid() = id);

-- Policy : un utilisateur peut lire sa propre ligne
create policy "Users can read own row"
  on users for select
  using (auth.uid() = id);

-- Policy : un intermittent peut s'insérer son propre profil
create policy "Intermittents can insert own profile"
  on intermittent_profiles for insert
  with check (auth.uid() = user_id);

-- Policy : un intermittent peut lire (propriétaire) ou si profil public
create policy "Intermittents can read own or public profile"
  on intermittent_profiles for select
  using (
    auth.uid() = user_id
    or visibility = 'PUBLIC'
    or visibility is null
  );

create policy "Intermittents can update own profile"
  on intermittent_profiles for update
  using (auth.uid() = user_id);

-- Policy : un recruteur peut s'insérer son propre profil
create policy "Recruiters can insert own profile"
  on recruiter_profiles for insert
  with check (auth.uid() = user_id);

-- Policy : un recruteur peut lire et mettre à jour son profil
create policy "Recruiters can read own profile"
  on recruiter_profiles for select
  using (auth.uid() = user_id);

create policy "Recruiters can update own profile"
  on recruiter_profiles for update
  using (auth.uid() = user_id);

-- Lecture publique des compétences et des liens intermittent_skills si besoin
-- (ajuster selon vos règles métier)
