"use server";

import { createClient } from "@/lib/supabase/server";
import type { TalentCardData } from "@/types/database";

/**
 * Récupère les profils intermittents recommandés (pour la page d'accueil).
 * En production : filtrer par annonces actives et événements du recruteur.
 */
export async function getRecommendedTalents(
  search?: string
): Promise<{ data: TalentCardData[]; error: string | null }> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("intermittent_profiles")
      .select(
        `
        user_id,
        display_name,
        bio,
        city,
        seniority_years,
        avatar_url
      `
      )
      .limit(20);

    if (search?.trim()) {
      query = query.or(
        `display_name.ilike.%${search}%,bio.ilike.%${search}%`
      );
    }

    const { data: profiles, error: profilesError } = await query.order(
      "updated_at",
      { ascending: false }
    );

    if (profilesError) {
      return { data: [], error: profilesError.message };
    }
    if (!profiles?.length) {
      return { data: [], error: null };
    }

    const userIds = profiles.map((p) => p.user_id);

    // Compétences par intermittent
    const { data: skillsData } = await supabase
      .from("intermittent_skills")
      .select(
        `
        intermittent_user_id,
        level,
        skills ( name, category )
      `
      )
      .in("intermittent_user_id", userIds);

    // Nombre de bookings complétés par intermittent
    const { data: bookingsData } = await supabase
      .from("bookings")
      .select("intermittent_user_id")
      .eq("status", "COMPLETED")
      .in("intermittent_user_id", userIds);

    const bookingsCountByUser: Record<string, number> = {};
    bookingsData?.forEach((b) => {
      bookingsCountByUser[b.intermittent_user_id] =
        (bookingsCountByUser[b.intermittent_user_id] ?? 0) + 1;
    });

    const skillsByUser: Record<
      string,
      { name: string; level: string; category: string | null }[]
    > = {};
    (skillsData ?? []).forEach((s: { intermittent_user_id: string; level: string; skills: unknown }) => {
      if (!skillsByUser[s.intermittent_user_id]) {
        skillsByUser[s.intermittent_user_id] = [];
      }
      const sk = s.skills as { name: string; category: string | null } | null;
      if (sk && typeof sk === "object" && "name" in sk && sk.name) {
        skillsByUser[s.intermittent_user_id].push({
          name: sk.name,
          level: s.level,
          category: sk.category ?? null,
        });
      }
    });

    const result: TalentCardData[] = profiles.map((p, idx) => ({
      user_id: p.user_id,
      display_name: p.display_name,
      bio: p.bio ?? null,
      city: p.city ?? null,
      seniority_years: p.seniority_years ?? null,
      avatar_url: (p as { avatar_url?: string | null }).avatar_url ?? null,
      skills: skillsByUser[p.user_id] ?? [],
      bookings_count: bookingsCountByUser[p.user_id] ?? 0,
      rating: 4.8,
      daily_rate: `${400 + idx * 50}/5 - ${420 + idx * 50} avis`,
      suggested_event: {
        title: "Concert Olympia",
        start_at: "2025-03-15",
      },
    }));

    return { data: result, error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur inconnue";
    return { data: [], error: message };
  }
}
