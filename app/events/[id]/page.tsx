import { notFound } from "next/navigation";
import Link from "next/link";
import { getEventWithJobPosts } from "@/app/actions/events";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteEventButton } from "./DeleteEventButton";
import { CreateMissionModal } from "./CreateMissionModal";
import { EditEventModal } from "./EditEventModal";
import { MapPin, Calendar, Wrench, Hammer, Users } from "lucide-react";
import type { JobPostWithCounts } from "@/types/database";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const { data } = await getEventWithJobPosts(id);
  return {
    title: data ? `${data.title} | Intermeet` : "Événement | Intermeet",
  };
}

function getStatusBadge(status: string | null, start_at: string, end_at: string) {
  if (status === "CANCELLED") return { label: "Annulé", className: "bg-red-500 text-white border-transparent" };
  const now = new Date();
  const start = new Date(start_at);
  const end = new Date(end_at);
  if (now > end) return { label: "Terminé", className: "bg-gray-100 text-gray-700 border-transparent font-normal" };
  if (now >= start && now <= end) return { label: "En cours", className: "bg-[#1a2e2a] text-white border-transparent" };
  return { label: "À venir", className: "bg-[#eb7a41] text-white border-transparent" };
}

function formatDateRange(start: string | null, end: string | null) {
  if (!start || !end) return null;
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  return `${fmt(start)} – ${fmt(end)}`;
}

function getJobStatusBadge(status: string) {
  if (status === "CLOSED") return { label: "Pourvu", className: "bg-[#eb7a41] text-white border-transparent text-xs font-medium" };
  if (status === "PAUSED") return { label: "En pause", className: "bg-gray-100 text-gray-600 border-transparent text-xs font-normal" };
  if (status === "DRAFT") return { label: "Brouillon", className: "bg-gray-100 text-gray-600 border-transparent text-xs font-normal" };
  return { label: "À pourvoir", className: "bg-gray-100 text-gray-600 border-transparent text-xs font-normal" };
}

function MissionCard({ post, eventTitle }: { post: JobPostWithCounts; eventTitle: string }) {
  const badge = getJobStatusBadge(post.status);
  const avatarCount = Math.min(post.applications_count, 5);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      <p className="font-semibold text-foreground text-sm">{post.title}</p>
      <p className="text-sm text-muted-foreground mt-0.5">{eventTitle}</p>
      <div className="mt-2">
        <Badge className={badge.className}>{badge.label}</Badge>
      </div>

      <div className="flex items-center gap-5 mt-3 text-sm text-muted-foreground">
        {post.city && (
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {post.city}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          {new Date(post.start_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
        </span>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
        <span className="text-sm text-[#eb7a41] font-medium">
          {post.applications_count} candidature{post.applications_count !== 1 ? "s" : ""}
        </span>
        <div className="flex items-center -space-x-2">
          {Array.from({ length: avatarCount }).map((_, i) => (
            <div
              key={i}
              className="h-7 w-7 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center overflow-hidden"
            >
              <Users className="h-3.5 w-3.5 text-gray-400" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { data, error } = await getEventWithJobPosts(id);

  if (error || !data) {
    notFound();
  }

  const badge = getStatusBadge(data.status, data.start_at, data.end_at);
  const exploitationRange = formatDateRange(data.start_at, data.end_at);
  const montageRange = formatDateRange(data.setup_start_at, data.setup_end_at);
  const demontageRange = formatDateRange(data.teardown_start_at, data.teardown_end_at);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground flex items-center gap-1">
        <Link href="/events" className="hover:text-foreground">
          Mes événements
        </Link>
        <span className="mx-1">›</span>
        <span className="text-foreground">{data.title}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{data.title}</h1>
          {data.event_type && (
            <p className="text-sm text-muted-foreground mt-0.5">{data.event_type}</p>
          )}
          <div className="mt-2">
            <Badge className={badge.className}>{badge.label}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 mt-1">
          <EditEventModal event={data} />
          <DeleteEventButton id={id} />
        </div>
      </div>

      {/* Description */}
      {data.description && (
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {data.description}
        </p>
      )}

      {/* Meta info */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground mb-2">
        {data.address && (
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 shrink-0" />
            {data.address}
          </span>
        )}
        {exploitationRange && (
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 shrink-0" />
            {exploitationRange}
          </span>
        )}
      </div>
      {(montageRange || demontageRange) && (
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground mb-6">
          {montageRange && (
            <span className="flex items-center gap-1.5">
              <Wrench className="h-4 w-4 shrink-0" />
              <span><span className="font-medium text-foreground">Montage :</span> {montageRange}</span>
            </span>
          )}
          {demontageRange && (
            <span className="flex items-center gap-1.5">
              <Hammer className="h-4 w-4 shrink-0" />
              <span><span className="font-medium text-foreground">Démontage :</span> {demontageRange}</span>
            </span>
          )}
        </div>
      )}

      {/* Missions section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">
          Mes missions ({data.job_posts.length})
        </h2>
        <CreateMissionModal
          eventId={id}
          eventTitle={data.title}
          eventStartAt={data.start_at}
          eventEndAt={data.end_at}
        />
      </div>

      <div className="space-y-3">
        {data.job_posts.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Aucune mission pour cet événement.
          </p>
        ) : (
          data.job_posts.map((post) => (
            <Link key={post.id} href={`/annonces/${post.id}`} className="block hover:opacity-90 transition-opacity">
              <MissionCard post={post} eventTitle={data.title} />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

