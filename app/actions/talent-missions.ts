"use server";

import { createClient } from "@/lib/supabase/server";
import {
  buildDemoMissions,
  DEMO_MISSIONS_PREVIEW,
  DEMO_MISSIONS_TOTAL,
} from "@/lib/talent-demo";
import type { TalentPastMission } from "@/types/database";

export interface TalentMissionsPageData {
  user_id: string;
  display_name: string;
  missions: TalentPastMission[];
  missions_total: number;
}

export async function getTalentMissions(
  id: string
): Promise<{ data: TalentMissionsPageData | null; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data: profile, error: profileError } = await supabase
      .from("intermittent_profiles")
      .select("user_id, display_name, city")
      .eq("user_id", id)
      .single();

    if (profileError || !profile) {
      return { data: null, error: profileError?.message ?? "Profil non trouvé" };
    }

    const { data: skillsData } = await supabase
      .from("intermittent_skills")
      .select("level, skills ( name, category )")
      .eq("intermittent_user_id", id);

    const skills: { name: string; category: string | null }[] = [];
    (skillsData ?? []).forEach((s: { skills: unknown }) => {
      const sk = s.skills as { name: string; category: string | null } | null;
      if (sk && typeof sk === "object" && "name" in sk && sk.name) {
        skills.push({
          name: sk.name,
          category: sk.category ?? null,
        });
      }
    });

    const jobTitle =
      skills.find((s) => s.category)?.category ?? "Ingénieur du son";

    const { data: bookingsData } = await supabase
      .from("bookings")
      .select(
        `
        id,
        start_at,
        events ( title, city, venue_name ),
        recruiter_profiles ( company_name )
      `
      )
      .eq("intermittent_user_id", id)
      .eq("status", "COMPLETED")
      .order("start_at", { ascending: false });

    const { count: bookingsTotal } = await supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("intermittent_user_id", id)
      .eq("status", "COMPLETED");

    const defaultSkills = DEMO_MISSIONS_PREVIEW[0].skills;

    const missionsFromDb: TalentPastMission[] = (bookingsData ?? []).map(
      (row) => {
        const b = row as {
          id: string;
          start_at: string;
          events:
            | { title: string; city: string | null; venue_name: string | null }
            | { title: string; city: string | null; venue_name: string | null }[]
            | null;
          recruiter_profiles:
            | { company_name: string }
            | { company_name: string }[]
            | null;
        };
        const event = Array.isArray(b.events) ? b.events[0] : b.events;
        const recruiter = Array.isArray(b.recruiter_profiles)
          ? b.recruiter_profiles[0]
          : b.recruiter_profiles;
        const missionSkills = skills.map((s) => s.name);

        return {
          id: b.id,
          job_title: jobTitle,
          event_title: event?.title ?? "Événement",
          skills: missionSkills.length > 0 ? missionSkills : defaultSkills,
          location:
            event?.venue_name ??
            event?.city ??
            profile.city ??
            "Paris Expo Porte de Versailles",
          client: recruiter?.company_name ?? "S Group",
          date: b.start_at,
        };
      }
    );

    const missions_total =
      bookingsTotal && bookingsTotal > 0 ? bookingsTotal : DEMO_MISSIONS_TOTAL;
    const missions =
      missionsFromDb.length > 0
        ? missionsFromDb
        : buildDemoMissions(missions_total);

    return {
      data: {
        user_id: profile.user_id,
        display_name: profile.display_name,
        missions,
        missions_total,
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
