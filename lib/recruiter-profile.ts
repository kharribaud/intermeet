import type { EventWithCounts } from "@/app/actions/events";
import { getProjectCoverImage } from "@/lib/project-cover-images";

export interface RecruiterProfilePageData {
  user_id: string;
  company_name: string;
  tagline: string;
  bio: string;
  avatar_url: string | null;
  banner_url: string | null;
  website_url: string | null;
  locations: string;
  founded_year: number;
  stats: {
    events_count: number;
    missions_filled: number;
    satisfaction_rating: number;
  };
  recent_projects: RecruiterProjectCard[];
  projects_total: number;
}

export interface RecruiterProjectCard {
  id: string;
  title: string;
  event_type: string | null;
  status: string | null;
  start_at: string;
  end_at: string;
  setup_start_at: string | null;
  setup_end_at: string | null;
  teardown_start_at: string | null;
  teardown_end_at: string | null;
  address: string | null;
  venue_name: string | null;
  city: string | null;
  job_posts_count: number;
  bookings_count: number;
  cover_image_url?: string | null;
}

export const DEFAULT_RECRUITER_PROFILE = {
  tagline: "Prestataire technique en événementiel",
  bio: "S Group est un prestataire technique spécialisé dans l'événementiel corporate, les salons professionnels et les concerts. Nous accompagnons nos clients de la conception à la réalisation, avec une équipe expérimentée et un parc matériel complet.",
  locations: "Alès, Gard / Paris, Île-de-France",
  founded_year: 1985,
  stats: {
    events_count: 2470,
    missions_filled: 4682,
    satisfaction_rating: 4.8,
  },
  projects_total: 82,
};

export function mapEventToProjectCard(event: EventWithCounts): RecruiterProjectCard {
  return {
    id: event.id,
    title: event.title,
    event_type: event.event_type,
    status: event.status,
    start_at: event.start_at,
    end_at: event.end_at,
    setup_start_at: event.setup_start_at,
    setup_end_at: event.setup_end_at,
    teardown_start_at: event.teardown_start_at,
    teardown_end_at: event.teardown_end_at,
    address: event.address,
    venue_name: event.venue_name,
    city: event.city,
    job_posts_count: event.job_posts_count,
    bookings_count: event.bookings_count,
    cover_image_url: getProjectCoverImage({
      id: event.id,
      event_type: event.event_type,
    }),
  };
}
