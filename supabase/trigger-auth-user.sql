-- ============================================================
-- Trigger : créer public.users et profil après inscription Auth
-- À exécuter dans l'éditeur SQL Supabase (Dashboard > SQL Editor).
-- Résout l'erreur RLS "new row violates row-level security policy"
-- car auth.uid() n'est pas encore disponible dans la même requête.
-- ============================================================

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_role text;
  user_email text;
  user_id uuid;
begin
  user_id := new.id;
  user_email := new.email;
  user_role := coalesce(new.raw_user_meta_data->>'role', 'INTERMITTENT');

  -- Toujours créer la ligne dans public.users
  insert into public.users (id, email, role, status)
  values (user_id, user_email, user_role::user_role, 'ACTIVE');

  if user_role = 'RECRUITER' then
    insert into public.recruiter_profiles (
      user_id,
      company_name,
      website_url,
      city,
      verified
    ) values (
      user_id,
      coalesce(new.raw_user_meta_data->>'company_name', ''),
      nullif(trim(new.raw_user_meta_data->>'website_url'), ''),
      nullif(trim(new.raw_user_meta_data->>'city'), ''),
      false
    );
  elsif user_role = 'INTERMITTENT' then
    insert into public.intermittent_profiles (
      user_id,
      display_name,
      bio,
      city,
      visibility
    ) values (
      user_id,
      coalesce(new.raw_user_meta_data->>'display_name', ''),
      nullif(trim(new.raw_user_meta_data->>'bio'), ''),
      nullif(trim(new.raw_user_meta_data->>'city'), ''),
      'PUBLIC'
    );
  end if;

  return new;
end;
$$;

-- Déclencher après chaque nouvel utilisateur auth
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();
