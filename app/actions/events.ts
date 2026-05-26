"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Event, JobPostWithCounts } from "@/types/database";

export async function createEvent(formData: FormData): Promise<{ error: string | null }> {
  const title = (formData.get("title") as string)?.trim();
  const event_type = (formData.get("event_type") as string)?.trim() || null;
  const description = (formData.get("description") as string)?.trim() || null;
  const address = (formData.get("address") as string)?.trim() || null;
  const setup_start_at = (formData.get("setup_start_at") as string) || null;
  const setup_end_at = (formData.get("setup_end_at") as string) || null;
  const teardown_start_at = (formData.get("teardown_start_at") as string) || null;
  const teardown_end_at = (formData.get("teardown_end_at") as string) || null;
  const start_at = formData.get("start_at") as string;
  const end_at = formData.get("end_at") as string;

  if (!title || !start_at || !end_at) {
    return { error: "Le titre et les dates d'exploitation sont requis." };
  }
  if (new Date(end_at) <= new Date(start_at)) {
    return { error: "La date de fin doit être après la date de début." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const { data, error } = await supabase
    .from("events")
    .insert({
      recruiter_user_id: user.id,
      title,
      event_type,
      description,
      address,
      setup_start_at,
      setup_end_at,
      teardown_start_at,
      teardown_end_at,
      start_at,
      end_at,
      status: "PUBLISHED",
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  redirect(`/events/${data.id}`);
}

export type EventWithCounts = {
  id: string;
  title: string;
  event_type: string | null;
  address: string | null;
  venue_name: string | null;
  city: string | null;
  start_at: string;
  end_at: string;
  setup_start_at: string | null;
  setup_end_at: string | null;
  teardown_start_at: string | null;
  teardown_end_at: string | null;
  description: string | null;
  status: string | null;
  job_posts_count: number;
  bookings_count: number;
};

export async function getMyEvents(userId: string): Promise<{
  data: EventWithCounts[] | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("events")
      .select("*, job_posts(count), bookings(count)")
      .eq("recruiter_user_id", userId)
      .order("start_at", { ascending: false })
      .limit(50);
    if (error) return { data: null, error: error.message };
    const events = (data ?? []).map((e: Record<string, unknown>) => ({
      ...(e as EventWithCounts),
      job_posts_count: (e.job_posts as { count: number }[])?.[0]?.count ?? 0,
      bookings_count: (e.bookings as { count: number }[])?.[0]?.count ?? 0,
    }));
    return { data: events, error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

export async function getEvents(): Promise<{
  data: Event[] | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("start_at", { ascending: false })
      .limit(50);
    if (error) return { data: null, error: error.message };
    return { data: data as Event[], error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Erreur inconnue",
    };
  }
}

export async function getEventById(
  id: string
): Promise<{ data: Event | null; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return { data: null, error: error.message };
    return { data: data as Event, error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Erreur inconnue",
    };
  }
}

export type EventWithJobPosts = Event & { job_posts: JobPostWithCounts[] };

export async function getEventWithJobPosts(id: string): Promise<{
  data: EventWithJobPosts | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("events")
      .select("*, job_posts(*, applications(count))")
      .eq("id", id)
      .single();
    if (error) return { data: null, error: error.message };
    const jobPosts = ((data as Record<string, unknown>).job_posts as Record<string, unknown>[] ?? []).map((jp) => ({
      ...(jp as unknown as JobPostWithCounts),
      applications_count: (jp.applications as { count: number }[])?.[0]?.count ?? 0,
    }));
    return { data: { ...(data as Event), job_posts: jobPosts }, error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

export async function deleteEvent(id: string): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Non authentifié." };
    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", id)
      .eq("recruiter_user_id", user.id);
    if (error) return { error: error.message };
    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

export async function updateEvent(id: string, formData: FormData): Promise<{ error: string | null }> {
  const title = (formData.get("title") as string)?.trim();
  const event_type = (formData.get("event_type") as string)?.trim() || null;
  const description = (formData.get("description") as string)?.trim() || null;
  const address = (formData.get("address") as string)?.trim() || null;
  const setup_start_at = (formData.get("setup_start_at") as string) || null;
  const setup_end_at = (formData.get("setup_end_at") as string) || null;
  const teardown_start_at = (formData.get("teardown_start_at") as string) || null;
  const teardown_end_at = (formData.get("teardown_end_at") as string) || null;
  const start_at = formData.get("start_at") as string;
  const end_at = formData.get("end_at") as string;

  if (!title || !start_at || !end_at) {
    return { error: "Le titre et les dates d'exploitation sont requis." };
  }
  if (new Date(end_at) <= new Date(start_at)) {
    return { error: "La date de fin doit être après la date de début." };
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Non authentifié." };

    const { error } = await supabase
      .from("events")
      .update({
        title,
        event_type,
        description,
        address,
        setup_start_at,
        setup_end_at,
        teardown_start_at,
        teardown_end_at,
        start_at,
        end_at,
      })
      .eq("id", id)
      .eq("recruiter_user_id", user.id);

    if (error) return { error: error.message };
    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}
