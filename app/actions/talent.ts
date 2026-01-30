"use server";

import { createClient } from "@/lib/supabase/server";
import type { TalentCardData } from "@/types/database";

export async function getTalentById(
  id: string
): Promise<{ data: TalentCardData | null; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data: profile, error: profileError } = await supabase
      .from("intermittent_profiles")
      .select("user_id, display_name, bio, city, seniority_years")
      .eq("user_id", id)
      .single();

    if (profileError || !profile) {
      return { data: null, error: profileError?.message ?? "Profil non trouvé" };
    }

    const { data: skillsData } = await supabase
      .from("intermittent_skills")
      .select("level, skills ( name, category )")
      .eq("intermittent_user_id", id);

    const skills: { name: string; level: string; category: string | null }[] = [];
    (skillsData ?? []).forEach((s: { level: string; skills: unknown }) => {
      const sk = s.skills as { name: string; category: string | null } | null;
      if (sk && typeof sk === "object" && "name" in sk && sk.name) {
        skills.push({
          name: sk.name,
          level: s.level,
          category: sk.category ?? null,
        });
      }
    });

    const { data: bookingsData } = await supabase
      .from("bookings")
      .select("id")
      .eq("intermittent_user_id", id)
      .eq("status", "COMPLETED");

    const result: TalentCardData = {
      user_id: profile.user_id,
      display_name: profile.display_name,
      bio: profile.bio ?? null,
      city: profile.city ?? null,
      seniority_years: profile.seniority_years ?? null,
      skills,
      bookings_count: bookingsData?.length ?? 0,
      rating: 4.8,
    };

    return { data: result, error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Erreur inconnue",
    };
  }
}
