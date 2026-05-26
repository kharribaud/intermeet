"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { JobPost } from "@/types/database";

async function getRecruiterUserId(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<string | null> {
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (authUser?.id) {
    const { data: userRow } = await supabase
      .from("users")
      .select("id")
      .eq("id", authUser.id)
      .single();
    if (userRow?.id) return userRow.id;
  }

  const { data: recruiter } = await supabase
    .from("users")
    .select("id")
    .eq("role", "RECRUITER")
    .limit(1)
    .single();

  return recruiter?.id ?? null;
}

export async function getRecruiterMissions(): Promise<{
  data: JobPost[] | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const recruiterUserId = await getRecruiterUserId(supabase);

    if (!recruiterUserId) {
      return { data: null, error: "Aucun recruteur connecté." };
    }

    const { data, error } = await supabase
      .from("job_posts")
      .select("*")
      .eq("recruiter_user_id", recruiterUserId)
      .in("status", ["PUBLISHED", "PAUSED"])
      .order("start_at", { ascending: false });

    if (error) return { data: null, error: error.message };
    return { data: data as JobPost[], error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Erreur inconnue",
    };
  }
}

export async function proposeMission(
  intermittentUserId: string,
  jobPostId: string,
  message: string
): Promise<{ error: string | null }> {
  try {
    if (!jobPostId) {
      return { error: "Veuillez sélectionner une mission." };
    }

    const supabase = await createClient();
    const coverNote = message.trim() || null;

    const { error } = await supabase.from("applications").insert({
      job_post_id: jobPostId,
      intermittent_user_id: intermittentUserId,
      cover_note: coverNote,
      status: "APPLIED",
    });

    if (error) {
      if (error.code === "23505") {
        return { error: "Une demande existe déjà pour cette mission." };
      }
      return { error: error.message };
    }

    revalidatePath("/notifications");
    return { error: null };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Erreur inconnue",
    };
  }
}
