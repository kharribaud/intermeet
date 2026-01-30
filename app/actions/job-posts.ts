"use server";

import { createClient } from "@/lib/supabase/server";
import type { JobPost } from "@/types/database";

export async function getJobPosts(): Promise<{
  data: JobPost[] | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("job_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) return { data: null, error: error.message };
    return { data: data as JobPost[], error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Erreur inconnue",
    };
  }
}

export async function getJobPostById(
  id: string
): Promise<{ data: JobPost | null; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("job_posts")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return { data: null, error: error.message };
    return { data: data as JobPost, error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Erreur inconnue",
    };
  }
}

export async function createJobPost(formData: FormData): Promise<{
  data: { id: string } | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();

    // Récupérer un recruiter_user_id valide (présent dans public.users)
    // 1) Utilisateur connecté (Supabase Auth) si son id existe dans users
    // 2) Sinon premier utilisateur avec role RECRUITER en base (démo)
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    let recruiter_user_id: string | null = null;

    if (authUser?.id) {
      const { data: userRow } = await supabase
        .from("users")
        .select("id")
        .eq("id", authUser.id)
        .single();
      if (userRow?.id) recruiter_user_id = userRow.id;
    }

    if (!recruiter_user_id) {
      const { data: recruiter } = await supabase
        .from("users")
        .select("id")
        .eq("role", "RECRUITER")
        .limit(1)
        .single();
      recruiter_user_id = recruiter?.id ?? null;
    }

    if (!recruiter_user_id) {
      return {
        data: null,
        error:
          "Aucun recruteur trouvé. Créez au moins un utilisateur avec role RECRUITER dans la table users (ou connectez-vous avec un compte recruteur).",
      };
    }

    const title = formData.get("title") as string;
    const description = (formData.get("description") as string) || null;
    const city = (formData.get("city") as string) || null;
    const start_at = formData.get("start_at") as string;
    const end_at = formData.get("end_at") as string;
    const status = (formData.get("status") as string) || "DRAFT";
    const required_count = parseInt((formData.get("required_count") as string) || "1", 10);
    const pay_amount = formData.get("pay_amount")
      ? parseFloat(formData.get("pay_amount") as string)
      : null;

    if (!title || !start_at || !end_at) {
      return { data: null, error: "Titre, date de début et fin requis." };
    }

    const { data, error } = await supabase
      .from("job_posts")
      .insert({
        recruiter_user_id,
        title,
        description,
        city,
        start_at,
        end_at,
        status,
        required_count,
        pay_amount,
      })
      .select("id")
      .single();

    if (error) return { data: null, error: error.message };
    return { data: { id: data.id }, error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Erreur inconnue",
    };
  }
}

export async function updateJobPost(
  id: string,
  formData: FormData
): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient();
    const title = formData.get("title") as string | null;
    const description = (formData.get("description") as string) || null;
    const city = (formData.get("city") as string) || null;
    const start_at = formData.get("start_at") as string | null;
    const end_at = formData.get("end_at") as string | null;
    const status = formData.get("status") as string | null;
    const required_count = formData.get("required_count")
      ? parseInt(formData.get("required_count") as string, 10)
      : null;
    const pay_amount = formData.get("pay_amount")
      ? parseFloat(formData.get("pay_amount") as string)
      : null;

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (title != null) updates.title = title;
    if (description != null) updates.description = description;
    if (city != null) updates.city = city;
    if (start_at != null) updates.start_at = start_at;
    if (end_at != null) updates.end_at = end_at;
    if (status != null) updates.status = status;
    if (required_count != null) updates.required_count = required_count;
    if (pay_amount != null) updates.pay_amount = pay_amount;

    const { error } = await supabase.from("job_posts").update(updates).eq("id", id);
    return { error: error?.message ?? null };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

export async function deleteJobPost(id: string): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("job_posts").delete().eq("id", id);
    return { error: error?.message ?? null };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}
