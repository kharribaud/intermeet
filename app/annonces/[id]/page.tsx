import { notFound } from "next/navigation";
import Link from "next/link";
import { getJobPostWithApplications } from "@/app/actions/job-posts";
import { DeleteJobPostButton } from "./DeleteJobPostButton";
import { ApplicationCard } from "./ApplicationCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Pencil } from "lucide-react";
import type { SkillTag } from "@/types/database";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const { data } = await getJobPostWithApplications(id);
  return {
    title: data ? `${data.title} | Intermeet` : "Mission | Intermeet",
  };
}

function JobStatusBadge({ status }: { status: string }) {
  if (status === "CLOSED") return <Badge className="bg-[#eb7a41] text-white border-transparent">Pourvu</Badge>;
  if (status === "PAUSED") return <Badge className="bg-gray-100 text-gray-600 border-transparent font-normal">En pause</Badge>;
  if (status === "DRAFT") return <Badge className="bg-gray-100 text-gray-600 border-transparent font-normal">Brouillon</Badge>;
  return <Badge className="bg-[#4b8a7b] text-white border-transparent font-normal">À pourvoir</Badge>;
}

function SkillsSection({ skills }: { skills: SkillTag[] }) {
  if (skills.length === 0) return null;

  const categories = Array.from(new Set(skills.map((s) => s.category ?? "Autres")));

  return (
    <section className="mt-6">
      <h2 className="text-lg font-bold text-foreground mb-3">Compétences attendues</h2>
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm divide-y divide-gray-100">
        {categories.map((cat) => (
          <div key={cat} className="py-3 first:pt-0 last:pb-0">
            <p className="text-sm font-medium text-foreground mb-2">{cat}</p>
            <div className="flex flex-wrap gap-2">
              {skills
                .filter((s) => (s.category ?? "Autres") === cat)
                .map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                  >
                    {s.name}
                  </span>
                ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function JobPostDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { data, error } = await getJobPostWithApplications(id);

  if (error || !data) {
    notFound();
  }

  const event = data.events;
  const address = event?.address ?? event?.city ?? data.city;
  const dateLabel = new Date(data.start_at).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground flex items-center gap-1 flex-wrap">
        <Link href="/events" className="hover:text-foreground">Mes événements</Link>
        {event && (
          <>
            <span className="mx-1">›</span>
            <Link href={`/events/${event.id}`} className="hover:text-foreground">{event.title}</Link>
          </>
        )}
        <span className="mx-1">›</span>
        <span className="text-foreground">{data.title}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{data.title}</h1>
          {event && <p className="text-sm text-muted-foreground mt-0.5">{event.title}</p>}
          <div className="mt-2">
            <JobStatusBadge status={data.status} />
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 mt-1">
          <Link href={`/annonces/${id}/edit`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
          <DeleteJobPostButton id={id} />
        </div>
      </div>

      {/* Description */}
      {data.description && (
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {data.description}
        </p>
      )}

      {/* Meta */}
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground mb-2">
        {address && (
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 shrink-0" />
            {address}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4 shrink-0" />
          {dateLabel}
        </span>
      </div>

      {/* Skills */}
      <SkillsSection skills={data.job_skills} />

      {/* Applications */}
      <section className="mt-8">
        <h2 className="text-lg font-bold text-foreground mb-4">
          Candidatures ({data.applications.length})
        </h2>
        {data.applications.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Aucune candidature pour cette mission.
          </p>
        ) : (
          <div className="space-y-3">
            {data.applications.map((app) => (
              <ApplicationCard key={app.id} application={app} jobTitle={data.title} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

