-- Migration : compétences requises par annonce (job_post_skills)
-- À exécuter dans l'éditeur SQL Supabase

create table if not exists public.job_post_skills (
  job_post_id uuid not null references public.job_posts(id) on delete cascade,
  skill_id    uuid not null references public.skills(id) on delete cascade,
  primary key (job_post_id, skill_id)
);

-- Quelques compétences de démonstration (catégories utilisées dans l'UI)
insert into public.skills (name, category) values
  ('Régie FOH',            'Compétences techniques'),
  ('Sound design',         'Compétences techniques'),
  ('Mixage',               'Compétences techniques'),
  ('Grand MA2',            'Logiciels & outils'),
  ('WYS/WIG',              'Logiciels & outils'),
  ('Vectorworks',          'Logiciels & outils'),
  ('CACES nacelle',        'Habilitations & certifications'),
  ('Permis PL',            'Habilitations & certifications')
on conflict (name) do nothing;
