"use server";

import { createClient } from "@/lib/supabase/server";
import type { JobPost, JobPostWithDetails, ApplicationWithProfile, SkillTag } from "@/types/database";

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

export async function createMissionForEvent(formData: FormData): Promise<{  data: { id: string } | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: "Non authentifié." };

    const event_id = formData.get("event_id") as string;
    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() || null;
    const start_at = formData.get("start_at") as string;
    const end_at = formData.get("end_at") as string;

    if (!event_id || !title || !start_at || !end_at) {
      return { data: null, error: "Tous les champs requis sont manquants." };
    }

    const { data, error } = await supabase
      .from("job_posts")
      .insert({
        recruiter_user_id: user.id,
        event_id,
        title,
        description,
        start_at,
        end_at,
        status: "PUBLISHED",
      })
      .select("id")
      .single();

    if (error) return { data: null, error: error.message };
    return { data: { id: data.id }, error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

export async function getJobPostWithApplications(id: string): Promise<{
  data: JobPostWithDetails | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();

    // Fetch job post with linked event
    const { data: jobPost, error: jobError } = await supabase
      .from("job_posts")
      .select("*, events(id, title, address, city)")
      .eq("id", id)
      .single();
    if (jobError) return { data: null, error: jobError.message };

    // Fetch required skills (graceful fallback if table doesn't exist yet)
    let jobSkills: SkillTag[] = [];
    try {
      const { data: skillRows } = await supabase
        .from("job_post_skills")
        .select("skills(id, name, category)")
        .eq("job_post_id", id);
      if (skillRows) {
        jobSkills = (skillRows as unknown as { skills: SkillTag | null }[])
          .map((r) => r.skills)
          .filter((s): s is SkillTag => s !== null);
      }
    } catch { /* table may not exist yet */ }

    // Fetch applications with applicant profiles and their skills
    const { data: apps, error: appsError } = await supabase
      .from("applications")
      .select(`
        id, status, cover_note, created_at, updated_at, job_post_id, intermittent_user_id,
        intermittent_profiles (
          user_id, display_name, avatar_url, city, seniority_years,
          intermittent_skills ( level, skills ( name, category ) )
        )
      `)
      .eq("job_post_id", id)
      .order("created_at", { ascending: false });
    if (appsError) return { data: null, error: appsError.message };

    return {
      data: {
        ...(jobPost as JobPost),
        events: (jobPost as Record<string, unknown>).events as JobPostWithDetails["events"],
        job_skills: jobSkills,
        applications: (apps ?? []) as unknown as ApplicationWithProfile[],
      },
      error: null,
    };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

export async function updateApplicationStatus(
  applicationId: string,
  status: "ACCEPTED" | "REJECTED" | "SHORTLISTED"
): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("applications")
      .update({ status })
      .eq("id", applicationId);
    return { error: error?.message ?? null };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

export interface PublicJobPost {
  id: string;
  title: string;
  city: string | null;
  start_at: string;
  end_at: string;
  status: string;
  required_count: number | null;
  applications_count: number;
  event: { id: string; title: string; city: string | null; address: string | null } | null;
  recruiter: { company_name: string; city: string | null; avatar_url: string | null } | null;
}

export interface PublicJobPostDetail extends PublicJobPost {
  description: string | null;
  job_skills: SkillTag[];
  user_application_status: string | null;
}

export async function getPublicJobPosts(query?: string): Promise<{
  data: PublicJobPost[] | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();

    let q = supabase
      .from("job_posts")
      .select("id, title, city, start_at, end_at, status, required_count, recruiter_user_id, event_id, events(id, title, city, address), applications(id)")
      .eq("status", "PUBLISHED")
      .order("created_at", { ascending: false })
      .limit(50);

    if (query) {
      q = q.ilike("title", `%${query}%`);
    }

    const { data, error } = await q;
    if (error) return { data: null, error: error.message };

    const recruiterIds = [...new Set((data ?? []).map((p) => p.recruiter_user_id as string))];
    let recruiterMap: Record<string, { company_name: string; city: string | null; avatar_url: string | null }> = {};

    if (recruiterIds.length > 0) {
      const { data: recruiters } = await supabase
        .from("recruiter_profiles")
        .select("user_id, company_name, city, avatar_url")
        .in("user_id", recruiterIds);
      if (recruiters) {
        recruiterMap = Object.fromEntries(recruiters.map((r) => [r.user_id, r]));
      }
    }

    const posts: PublicJobPost[] = (data ?? []).map((p) => {
      const ev = (p.events as { id: string; title: string; city: string | null; address: string | null } | null) ?? null;
      return {
        id: p.id as string,
        title: p.title as string,
        city: (p.city as string | null) ?? ev?.city ?? null,
        start_at: p.start_at as string,
        end_at: p.end_at as string,
        status: p.status as string,
        required_count: p.required_count as number | null,
        applications_count: Array.isArray(p.applications) ? p.applications.length : 0,
        event: ev,
        recruiter: recruiterMap[p.recruiter_user_id as string] ?? null,
      };
    });

    return { data: posts, error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

export async function getPublicJobPostById(id: string): Promise<{
  data: PublicJobPostDetail | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();

    const { data: jobPost, error: jobError } = await supabase
      .from("job_posts")
      .select("id, title, description, city, start_at, end_at, status, required_count, recruiter_user_id, event_id, events(id, title, city, address), applications(id)")
      .eq("id", id)
      .eq("status", "PUBLISHED")
      .single();
    if (jobError) return { data: null, error: jobError.message };

    let jobSkills: SkillTag[] = [];
    try {
      const { data: skillRows } = await supabase
        .from("job_post_skills")
        .select("skills(id, name, category)")
        .eq("job_post_id", id);
      if (skillRows) {
        jobSkills = (skillRows as unknown as { skills: SkillTag | null }[])
          .map((r) => r.skills)
          .filter((s): s is SkillTag => s !== null);
      }
    } catch { /* table may not exist yet */ }

    const { data: recruiter } = await supabase
      .from("recruiter_profiles")
      .select("company_name, city, avatar_url, website_url")
      .eq("user_id", jobPost.recruiter_user_id as string)
      .single();

    const { data: { user } } = await supabase.auth.getUser();
    let userApplicationStatus: string | null = null;
    if (user) {
      const { data: app } = await supabase
        .from("applications")
        .select("status")
        .eq("job_post_id", id)
        .eq("intermittent_user_id", user.id)
        .single();
      userApplicationStatus = app?.status ?? null;
    }

    const ev = (jobPost.events as { id: string; title: string; city: string | null; address: string | null } | null) ?? null;

    return {
      data: {
        id: jobPost.id as string,
        title: jobPost.title as string,
        description: (jobPost.description as string | null) ?? null,
        city: (jobPost.city as string | null) ?? ev?.city ?? null,
        start_at: jobPost.start_at as string,
        end_at: jobPost.end_at as string,
        status: jobPost.status as string,
        required_count: jobPost.required_count as number | null,
        applications_count: Array.isArray(jobPost.applications) ? jobPost.applications.length : 0,
        event: ev,
        recruiter: recruiter ? { company_name: recruiter.company_name, city: recruiter.city, avatar_url: recruiter.avatar_url } : null,
        job_skills: jobSkills,
        user_application_status: userApplicationStatus,
      },
      error: null,
    };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

export async function applyToJobPost(jobPostId: string, coverNote?: string): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Vous devez être connecté pour postuler." };
    if (user.user_metadata?.role !== "INTERMITTENT") {
      return { error: "Seuls les intermittents peuvent postuler." };
    }

    const { error } = await supabase.from("applications").insert({
      job_post_id: jobPostId,
      intermittent_user_id: user.id,
      cover_note: coverNote ?? null,
      status: "APPLIED",
    });

    if (error) {
      if (error.code === "23505") return { error: "Vous avez déjà postulé à cette mission." };
      return { error: error.message };
    }
    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}
