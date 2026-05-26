/**
 * Types Supabase - Correspondance avec le schéma SQL fourni
 */

export type UserRole = "INTERMITTENT" | "RECRUITER" | "ADMIN";
export type UserStatus = "ACTIVE" | "SUSPENDED";
export type CalendarBlockType = "BOOKED" | "UNAVAILABLE" | "HOLD" | "TRAVEL";
export type JobStatus = "DRAFT" | "PUBLISHED" | "PAUSED" | "CLOSED";
export type ApplicationStatus = "APPLIED" | "SHORTLISTED" | "REJECTED" | "WITHDRAWN" | "ACCEPTED";
export type BookingStatus = "CONFIRMED" | "COMPLETED" | "CANCELED";
export type SkillLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface IntermittentProfile {
  user_id: string;
  display_name: string;
  bio: string | null;
  city: string | null;
  location_point: unknown | null;
  travel_radius_km: number | null;
  seniority_years: number | null;
  visibility: string | null;
  created_at: string;
  updated_at: string;
}

export interface RecruiterProfile {
  user_id: string;
  company_name: string;
  website_url: string | null;
  city: string | null;
  location_point: unknown | null;
  verified: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string | null;
}

export interface IntermittentSkill {
  intermittent_user_id: string;
  skill_id: string;
  level: SkillLevel;
  years_experience: number | null;
}

export interface CalendarBlock {
  id: string;
  intermittent_user_id: string;
  start_at: string;
  end_at: string;
  type: CalendarBlockType;
  title: string | null;
  notes: string | null;
}

export interface Event {
  id: string;
  recruiter_user_id: string;
  title: string;
  event_type: string | null;
  venue_name: string | null;
  city: string | null;
  address: string | null;
  location_point: unknown | null;
  start_at: string;
  end_at: string;
  setup_start_at: string | null;
  setup_end_at: string | null;
  teardown_start_at: string | null;
  teardown_end_at: string | null;
  description: string | null;
  status: string | null;
}

export interface JobPostWithCounts extends JobPost {
  applications_count: number;
}

export interface JobPost {
  id: string;
  recruiter_user_id: string;
  event_id: string | null;
  title: string;
  description: string | null;
  city: string | null;
  location_point: unknown | null;
  start_at: string;
  end_at: string;
  required_skill_id: string | null;
  required_count: number | null;
  pay_amount: number | null;
  status: JobStatus;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  job_post_id: string;
  intermittent_user_id: string;
  cover_note: string | null;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  job_post_id: string | null;
  event_id: string | null;
  recruiter_user_id: string;
  intermittent_user_id: string;
  start_at: string;
  end_at: string;
  agreed_pay_amount: number | null;
  status: BookingStatus;
  created_at: string;
}

/** Types étendus pour l'affichage (avec relations) */
export interface IntermittentProfileWithSkills extends IntermittentProfile {
  skills?: { name: string; level: SkillLevel; category: string | null }[];
  bookings_count?: number;
  rating?: number;
}

export interface TalentCardData {
  user_id: string;
  display_name: string;
  bio: string | null;
  city: string | null;
  seniority_years: number | null;
  avatar_url: string | null;
  skills: { name: string; level: string; category: string | null }[];
  bookings_count: number;
  rating: number;
  daily_rate: string;
  suggested_event?: { title: string; start_at: string };
}

export interface SkillTag {
  id: string;
  name: string;
  category: string | null;
}

export interface ApplicationWithProfile extends Application {
  intermittent_profiles: {
    user_id: string;
    display_name: string;
    avatar_url: string | null;
    city: string | null;
    seniority_years: number | null;
    intermittent_skills: {
      level: string;
      skills: { name: string; category: string | null } | null;
    }[];
  } | null;
}

export interface JobPostWithDetails extends JobPost {
  events: { id: string; title: string; address: string | null; city: string | null } | null;
  job_skills: SkillTag[];
  applications: ApplicationWithProfile[];
}
