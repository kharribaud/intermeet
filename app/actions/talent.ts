"use server";

import { createClient } from "@/lib/supabase/server";
import { DEMO_MISSIONS_PREVIEW, DEMO_REVIEWS_PREVIEW } from "@/lib/talent-demo";
import type {
  TalentProfileData,
  TalentPastMission,
  TalentSkillGroups,
} from "@/types/database";

const DEMO_SUGGESTED_EVENTS = [
  { id: "1", title: "Concert Olympia Véronique Sanson" },
  { id: "2", title: "Festival de la Plage" },
  { id: "3", title: "Stand Engie Vivatech 2025" },
];

const DEMO_SKILL_GROUPS: TalentSkillGroups = {
  technical: ["Régie FOH", "Sound design", "Mixage"],
  software: ["Grand MA2", "WYSIWIG", "Vectorworks"],
  certifications: ["CACES nacelle", "Permis PL", "Grand MA2"],
};

function buildSkillGroups(
  skills: { name: string; category: string | null }[]
): TalentSkillGroups {
  const groups: TalentSkillGroups = {
    technical: [],
    software: [],
    certifications: [],
  };

  for (const skill of skills) {
    const cat = skill.category?.toLowerCase() ?? "";
    if (cat.includes("logiciel") || cat.includes("outil") || cat.includes("software")) {
      groups.software.push(skill.name);
    } else if (
      cat.includes("habilitation") ||
      cat.includes("certif") ||
      cat.includes("permis")
    ) {
      groups.certifications.push(skill.name);
    } else {
      groups.technical.push(skill.name);
    }
  }

  if (!groups.technical.length && !groups.software.length && !groups.certifications.length) {
    return DEMO_SKILL_GROUPS;
  }

  if (!groups.technical.length) groups.technical = [...DEMO_SKILL_GROUPS.technical];
  if (!groups.software.length) groups.software = [...DEMO_SKILL_GROUPS.software];
  if (!groups.certifications.length) {
    groups.certifications = [...DEMO_SKILL_GROUPS.certifications];
  }

  return groups;
}

export async function getTalentById(
  id: string
): Promise<{ data: TalentProfileData | null; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data: profile, error: profileError } = await supabase
      .from("intermittent_profiles")
      .select("user_id, display_name, bio, city, seniority_years, avatar_url")
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
      .order("start_at", { ascending: false })
      .limit(4);

    const { count: bookingsTotal } = await supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("intermittent_user_id", id)
      .eq("status", "COMPLETED");

    const jobTitle = skills.find((s) => s.category)?.category ?? "Ingénieur du son";
    const bookingsCount = bookingsTotal ?? 0;
    const rating = 4.8;
    const reviewsCount = 42;

    const pastMissionsFromDb: TalentPastMission[] = (bookingsData ?? []).map(
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

        const missionSkills = skills.slice(0, 3).map((s) => s.name);
        return {
          id: b.id,
          job_title: jobTitle,
          event_title: event?.title ?? "Événement",
          skills:
            missionSkills.length > 0
              ? missionSkills
              : DEMO_MISSIONS_PREVIEW[0].skills,
          location:
            event?.venue_name ??
            event?.city ??
            profile.city ??
            "Paris Expo Porte de Versailles",
          client: recruiter?.company_name ?? "—",
          date: b.start_at,
        };
      }
    );

    const past_missions =
      pastMissionsFromDb.length > 0 ? pastMissionsFromDb : DEMO_MISSIONS_PREVIEW;
    const missions_total = bookingsCount > 0 ? bookingsCount : 42;

    const bio =
      profile.bio ??
      "Ingénieur du son avec 15 ans d'expérience en sonorisation live, festivals et événements corporate. Habitué aux environnements exigeants et aux délais serrés.";

    const result: TalentProfileData = {
      user_id: profile.user_id,
      display_name: profile.display_name,
      job_title: jobTitle,
      bio,
      city: profile.city ?? "Paris, Île-de-France",
      seniority_years: profile.seniority_years ?? 15,
      avatar_url: (profile as { avatar_url?: string | null }).avatar_url ?? null,
      skills,
      bookings_count: bookingsCount > 0 ? bookingsCount : 127,
      rating,
      reviews_count: reviewsCount,
      suggested_event: {
        title: "Concert Olympia",
        start_at: "2025-03-15",
      },
      suggested_events: DEMO_SUGGESTED_EVENTS,
      skill_groups: buildSkillGroups(skills),
      past_missions,
      missions_total,
      reviews: DEMO_REVIEWS_PREVIEW,
      reviews_total: 27,
    };

    return { data: result, error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Erreur inconnue",
    };
  }
}
