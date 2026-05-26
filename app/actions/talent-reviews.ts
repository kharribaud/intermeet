"use server";

import { createClient } from "@/lib/supabase/server";
import { buildDemoReviews, DEMO_REVIEWS_TOTAL } from "@/lib/talent-demo";
import type { TalentReview } from "@/types/database";

export interface TalentReviewsPageData {
  user_id: string;
  display_name: string;
  reviews: TalentReview[];
  reviews_total: number;
}

export async function getTalentReviews(
  id: string
): Promise<{ data: TalentReviewsPageData | null; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data: profile, error: profileError } = await supabase
      .from("intermittent_profiles")
      .select("user_id, display_name")
      .eq("user_id", id)
      .single();

    if (profileError || !profile) {
      return { data: null, error: profileError?.message ?? "Profil non trouvé" };
    }

    const reviews = buildDemoReviews(DEMO_REVIEWS_TOTAL);

    return {
      data: {
        user_id: profile.user_id,
        display_name: profile.display_name,
        reviews,
        reviews_total: DEMO_REVIEWS_TOTAL,
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
