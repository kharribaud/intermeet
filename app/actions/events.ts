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

    const { data: userRow } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    const isRecruiter = userRow?.role === "RECRUITER";

    if (isRecruiter) {
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
    } else {
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("event_id")
        .eq("intermittent_user_id", userId)
        .eq("status", "CONFIRMED")
        .not("event_id", "is", null);
      if (bookingsError) return { data: null, error: bookingsError.message };

      const eventIds = [...new Set((bookings ?? []).map((b) => b.event_id as string))];
      if (eventIds.length === 0) return { data: [], error: null };

      const { data, error } = await supabase
        .from("events")
        .select("*, job_posts(count), bookings(count)")
        .in("id", eventIds)
        .order("start_at", { ascending: false });
      if (error) return { data: null, error: error.message };
      const events = (data ?? []).map((e: Record<string, unknown>) => ({
        ...(e as EventWithCounts),
        job_posts_count: (e.job_posts as { count: number }[])?.[0]?.count ?? 0,
        bookings_count: (e.bookings as { count: number }[])?.[0]?.count ?? 0,
      }));
      return { data: events, error: null };
    }
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

export type PlanningBooking = {
  id: string;
  start_at: string;
  end_at: string;
  job_post_title: string | null;
  event_id: string | null;
  event_title: string | null;
  city: string | null;
  agreed_pay_amount: number | null;
};

export async function getIntermittentPlanning(): Promise<{
  data: PlanningBooking[] | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: "Non authentifié." };

    const { data, error } = await supabase
      .from("bookings")
      .select(`
        id, start_at, end_at, agreed_pay_amount, event_id,
        job_posts ( title, city ),
        events ( title, city )
      `)
      .eq("intermittent_user_id", user.id)
      .eq("status", "CONFIRMED")
      .order("start_at", { ascending: true });

    if (error) return { data: null, error: error.message };

    const bookings: PlanningBooking[] = (data ?? []).map((b: Record<string, unknown>) => {
      const jp = b.job_posts as { title: string; city: string | null } | null;
      const ev = b.events as { title: string; city: string | null } | null;
      return {
        id: b.id as string,
        start_at: b.start_at as string,
        end_at: b.end_at as string,
        agreed_pay_amount: (b.agreed_pay_amount as number | null) ?? null,
        event_id: (b.event_id as string | null) ?? null,
        job_post_title: jp?.title ?? null,
        event_title: ev?.title ?? null,
        city: jp?.city ?? ev?.city ?? null,
      };
    });

    return { data: bookings, error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

export type IntermittentMission = {
  booking_id: string;
  job_post_id: string | null;
  job_post_title: string;
  event_id: string | null;
  event_title: string | null;
  city: string | null;
  start_at: string;
  end_at: string;
  agreed_pay_amount: number | null;
};

export async function getIntermittentMissions(): Promise<{
  data: IntermittentMission[] | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: "Non authentifié." };

    const { data, error } = await supabase
      .from("bookings")
      .select(`
        id, start_at, end_at, agreed_pay_amount,
        job_post_id, event_id,
        job_posts ( id, title, city ),
        events ( id, title, city )
      `)
      .eq("intermittent_user_id", user.id)
      .eq("status", "CONFIRMED")
      .order("start_at", { ascending: false });

    if (error) return { data: null, error: error.message };

    const missions: IntermittentMission[] = (data ?? []).map((b: Record<string, unknown>) => {
      const jp = b.job_posts as { id: string; title: string; city: string | null } | null;
      const ev = b.events as { id: string; title: string; city: string | null } | null;
      return {
        booking_id: b.id as string,
        job_post_id: jp?.id ?? (b.job_post_id as string | null) ?? null,
        job_post_title: jp?.title ?? "Mission",
        event_id: ev?.id ?? (b.event_id as string | null) ?? null,
        event_title: ev?.title ?? null,
        city: jp?.city ?? ev?.city ?? null,
        start_at: b.start_at as string,
        end_at: b.end_at as string,
        agreed_pay_amount: (b.agreed_pay_amount as number | null) ?? null,
      };
    });

    return { data: missions, error: null };
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
