# Intermeet

Application web de mise en relation entre **talents intermittents** et **recruteurs** pour l’événementiel. Projet Next.js (App Router), Tailwind CSS et Supabase.

## Stack technique

- **Next.js** (dernière version, App Router)
- **Tailwind CSS** (v4) avec variables CSS fournies dans `styles/global.css`
- **Supabase** (base de données + auth si nécessaire)
- **TypeScript**

## Architecture du projet

```
├── app/
│   ├── actions/          # Server Actions (talents, job-posts, events, talent)
│   ├── admin/            # Interface admin basique
│   ├── annonces/         # CRUD annonces (job_posts)
│   ├── events/           # Listing + détail événements
│   ├── talents/          # Profil talent dynamique
│   ├── planning/         # Page planning
│   ├── entreprise/       # Page entreprise
│   ├── parametres/       # Page paramètres
│   ├── globals.css       # Importe Tailwind + styles/global.css
│   ├── layout.tsx        # Layout racine (Header, Footer)
│   └── page.tsx          # Accueil = Talents recommandés
├── components/
│   ├── Header.tsx        # Navigation + logo Intermeet
│   ├── Footer.tsx
│   ├── TalentCard.tsx    # Carte profil talent
│   ├── SearchFilter.tsx   # Barre recherche + bouton Filtres
│   └── SmartSuggestionsBanner.tsx
├── lib/
│   ├── supabase/
│   │   ├── server.ts     # Client Supabase côté serveur (cookies)
│   │   └── client.ts     # Client Supabase navigateur
│   └── supabase.ts       # Réexport
├── styles/
│   └── global.css        # Variables CSS (couleurs, radius, ombres)
└── types/
    └── database.ts       # Types TS alignés sur le schéma Supabase
```

## Liaison Supabase

- **Variables d’environnement** : `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` (voir `.env.example`).
- **Tables utilisées** : `users`, `intermittent_profiles`, `recruiter_profiles`, `skills`, `intermittent_skills`, `calendar_blocks`, `events`, `job_posts`, `applications`, `bookings`.
- **Correspondance logique** :
  - Page d’accueil → `intermittent_profiles` + `intermittent_skills` + `bookings` (comptage).
  - `/talents/[id]` → détail d’un profil intermittent.
  - `/annonces` → `job_posts` (listing, détail, création, modification, suppression).
  - `/events` → `events` (listing + détail).
  - Admin → comptages sur les tables principales.

Les requêtes sont faites côté serveur via les Server Actions dans `app/actions/`. Gestion d’erreur et états de chargement (Suspense, messages d’erreur) sont gérés dans les pages et composants.

## Installation et lancement

```bash
# Cloner / se placer dans le projet
cd intermeet

# Installer les dépendances
npm install

# Copier les variables d'environnement
cp .env.example .env
# Éditer .env avec vos clés Supabase

# Lancer en développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

- **Build** : `npm run build`
- **Démarrer en production** : `npm run start`

## Design

- Logo Intermeet dans le header (`public/logo_intermeet.png`).
- Page « Talents recommandés » : titre, sous-titre (nombre de profils), barre de recherche, bannière « Suggestions intelligentes », cartes talents (nom, rôle, compétences, bio, lieu, note, événements réalisés, boutons Favori / Contacter).
- Couleurs et typo via `styles/global.css` (primary, secondary, muted, etc.) et Tailwind.
- Mise en page responsive (mobile, tablette, desktop).

## SEO

- `metadata` et `openGraph` dans `app/layout.tsx` et sur les pages principales.
- `generateMetadata` sur les pages dynamiques (talents, annonces, événements).

## Fichiers prêts à l’emploi

- Tous les fichiers listés ci-dessus sont générés et prêts à copier-coller / à versionner.
- Après configuration de `.env`, le site se connecte à votre projet Supabase ; exécutez le script SQL fourni (tables, enums, index) sur ce projet pour que les données correspondent aux types dans `types/database.ts`.
