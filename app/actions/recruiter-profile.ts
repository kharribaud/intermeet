"use server";

import { createClient } from "@/lib/supabase/server";
import { getMyEvents } from "@/app/actions/events";
import {
  DEFAULT_RECRUITER_PROFILE,
  mapEventToProjectCard,
  type RecruiterProfilePageData,
  type RecruiterProjectCard,
} from "@/lib/recruiter-profile";

const DEMO_PROJECTS: RecruiterProjectCard[] = [
  {
    id: "demo-1",
    title: "Stand Engie Vivatech 2025",
    event_type: "Salon",
    status: "PUBLISHED",
    start_at: "2025-05-20T08:00:00Z",
    end_at: "2025-05-25T20:00:00Z",
    setup_start_at: "2025-05-18T08:00:00Z",
    setup_end_at: "2025-05-19T20:00:00Z",
    teardown_start_at: "2025-05-26T08:00:00Z",
    teardown_end_at: "2025-05-27T18:00:00Z",
    address: "Paris Expo Porte de Versailles - Hall 1",
    venue_name: null,
    city: "Paris",
    job_posts_count: 8,
    bookings_count: 2,
  },
  {
    id: "demo-2",
    title: "Festival de la Plage",
    event_type: "Festival",
    status: "PUBLISHED",
    start_at: "2025-07-10T10:00:00Z",
    end_at: "2025-07-14T23:00:00Z",
    setup_start_at: "2025-07-08T08:00:00Z",
    setup_end_at: "2025-07-09T20:00:00Z",
    teardown_start_at: "2025-07-15T08:00:00Z",
    teardown_end_at: "2025-07-16T18:00:00Z",
    address: "Plage du Prado, Marseille",
    venue_name: null,
    city: "Marseille",
    job_posts_count: 12,
    bookings_count: 5,
  },
  {
    id: "demo-3",
    title: "Concert Olympia Véronique Sanson",
    event_type: "Concert",
    status: "CANCELLED",
    start_at: "2025-03-15T19:00:00Z",
    end_at: "2025-03-15T23:00:00Z",
    setup_start_at: "2025-03-14T08:00:00Z",
    setup_end_at: "2025-03-15T14:00:00Z",
    teardown_start_at: "2025-03-16T08:00:00Z",
    teardown_end_at: "2025-03-16T16:00:00Z",
    address: "28 Boulevard des Capucines, Paris",
    venue_name: "Olympia",
    city: "Paris",
    job_posts_count: 6,
    bookings_count: 0,
  },
];

export async function getRecruiterProfilePage(
  userId: string
): Promise<{ data: RecruiterProfilePageData | null; error: string | null }> {
  try {
    const supabase = await createClient();

    const { data: profile, error: profileError } = await supabase
      .from("recruiter_profiles")
      .select(
        "user_id, company_name, website_url, city, avatar_url, banner_url, tagline, bio, founded_year, created_at"
      )
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      return { data: null, error: profileError?.message ?? "Profil non trouvé" };
    }

    const { data: events } = await getMyEvents(userId);

    const { count: eventsCount } = await supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .eq("recruiter_user_id", userId);

    const { count: missionsCount } = await supabase
      .from("job_posts")
      .select("id", { count: "exact", head: true })
      .eq("recruiter_user_id", userId);

    const recentFromDb = (events ?? []).slice(0, 3).map(mapEventToProjectCard);
    const recent_projects =
      recentFromDb.length > 0 ? recentFromDb : DEMO_PROJECTS;

    const totalEvents = eventsCount ?? 0;
    const totalMissions = missionsCount ?? 0;

    const foundedYearFromCreatedAt = profile.created_at
      ? new Date(profile.created_at).getFullYear()
      : DEFAULT_RECRUITER_PROFILE.founded_year;

    return {
      data: {
        user_id: profile.user_id,
        company_name: profile.company_name || "S Group",
        tagline: profile.tagline ?? DEFAULT_RECRUITER_PROFILE.tagline,
        bio: profile.bio ?? DEFAULT_RECRUITER_PROFILE.bio,
        avatar_url: profile.avatar_url ?? null,
        banner_url: profile.banner_url ?? null,
        website_url: profile.website_url ?? null,
        locations: profile.city ?? DEFAULT_RECRUITER_PROFILE.locations,
        founded_year:
          profile.founded_year ??
          (foundedYearFromCreatedAt < 2000
            ? DEFAULT_RECRUITER_PROFILE.founded_year
            : foundedYearFromCreatedAt),
        stats: {
          events_count:
            totalEvents > 0 ? totalEvents : DEFAULT_RECRUITER_PROFILE.stats.events_count,
          missions_filled:
            totalMissions > 0
              ? totalMissions
              : DEFAULT_RECRUITER_PROFILE.stats.missions_filled,
          satisfaction_rating: DEFAULT_RECRUITER_PROFILE.stats.satisfaction_rating,
        },
        recent_projects,
        projects_total:
          totalEvents > 0 ? totalEvents : DEFAULT_RECRUITER_PROFILE.projects_total,
      },
      error: null,
    };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Erreur inconnue",
    };
  }
}

export type RecruiterProfileError = string | null;

export interface UpdateRecruiterProfileInput {
  company_name: string;
  tagline: string;
  bio: string;
  city: string;
  website_url: string;
  founded_year: number;
}

/** Met à jour les informations textuelles du profil recruteur. */
export async function updateRecruiterProfile(
  input: UpdateRecruiterProfileInput
): Promise<{ error: RecruiterProfileError }> {
  const company_name = input.company_name.trim();
  const tagline = input.tagline.trim();
  const bio = input.bio.trim();
  const city = input.city.trim();
  const website_url = input.website_url.trim();
  const founded_year = input.founded_year;

  if (!company_name) {
    return { error: "Le nom de l'entreprise est requis." };
  }

  const currentYear = new Date().getFullYear();
  if (
    !Number.isInteger(founded_year) ||
    founded_year < 1800 ||
    founded_year > currentYear
  ) {
    return { error: `L'année de création doit être entre 1800 et ${currentYear}.` };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return { error: "Non authentifié." };
  }

  const { error: updateError } = await supabase
    .from("recruiter_profiles")
    .update({
      company_name,
      tagline: tagline || null,
      bio: bio || null,
      city: city || null,
      website_url: website_url || null,
      founded_year,
    })
    .eq("user_id", user.id);

  if (updateError) {
    return { error: updateError.message };
  }

  return { error: null };
}

/** Enregistre l'URL de bannière après upload direct vers Supabase Storage (client). */
export async function saveRecruiterBannerUrl(
  bannerUrl: string
): Promise<{ error: RecruiterProfileError; banner_url?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return { error: "Non authentifié." };
  }

  if (!bannerUrl.startsWith("http")) {
    return { error: "URL de bannière invalide." };
  }

  const { error: updateError } = await supabase
    .from("recruiter_profiles")
    .update({ banner_url: bannerUrl })
    .eq("user_id", user.id);

  if (updateError) {
    return { error: updateError.message };
  }

  return { error: null, banner_url: bannerUrl };
}
