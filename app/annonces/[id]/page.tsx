import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublicJobPostById } from "@/app/actions/job-posts";
import { createClient } from "@/lib/supabase/server";
import { CandidaterButton } from "./CandidaterButton";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Heart } from "lucide-react";
import type { SkillTag } from "@/types/database";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const { data } = await getPublicJobPostById(id);
  return {
    title: data ? `${data.title} | Intermeet` : "Mission | Intermeet",
  };
}

function JobStatusBadge({ status }: { status: string }) {
  if (status === "CLOSED")
    return <Badge className="bg-[#eb7a41] text-white border-transparent">Pourvu</Badge>;
  if (status === "PAUSED")
    return <Badge className="bg-gray-100 text-gray-600 border-transparent font-normal">En pause</Badge>;
  return (
    <Badge className="bg-[#4b8a7b] text-white border-transparent font-normal">À pourvoir</Badge>
  );
}

function SkillsSection({ skills }: { skills: SkillTag[] }) {
  if (skills.length === 0) return null;
  const categories = Array.from(new Set(skills.map((s) => s.category ?? "Autres")));
  return (
    <section className="mt-6">
      <h2 className="text-base font-bold text-foreground mb-3">Compétences attendues</h2>
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

export default async function JobPostPublicPage({ params }: PageProps) {
  const { id } = await params;
  const { data, error } = await getPublicJobPostById(id);

  if (error || !data) {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;
  const isIntermittent = user?.user_metadata?.role === "INTERMITTENT";

  const location = data.event?.address ?? data.city ?? data.event?.city ?? null;
  const dateLabel = new Date(data.start_at).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-5 text-sm text-muted-foreground flex items-center gap-1 flex-wrap">
        <Link href="/annonces" className="hover:text-foreground">
          Missions
        </Link>
        {data.event && (
          <>
            <span className="mx-1">›</span>
            <span className="text-muted-foreground">{data.event.title}</span>
          </>
        )}
        <span className="mx-1">›</span>
        <span className="text-foreground">{data.title}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-foreground leading-tight">{data.title}</h1>
          {data.event && (
            <p className="text-sm text-muted-foreground mt-0.5">{data.event.title}</p>
          )}
          <div className="mt-2">
            <JobStatusBadge status={data.status} />
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            aria-label="Sauvegarder"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-muted-foreground hover:text-primary transition-colors"
          >
            <Heart className="size-4" />
          </button>
          <CandidaterButton
            jobPostId={data.id}
            isLoggedIn={isLoggedIn}
            isIntermittent={isIntermittent}
            applicationStatus={data.user_application_status}
            redirectPath={`/annonces/${id}`}
          />
        </div>
      </div>

      {/* Description */}
      {data.description && (
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          {data.description}
        </p>
      )}

      {/* Meta */}
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
        {location && (
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 shrink-0" />
            {location}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4 shrink-0" />
          {dateLabel}
        </span>
      </div>

      {/* Skills */}
      <SkillsSection skills={data.job_skills} />

      {/* Prestataire */}
      {data.recruiter && (
        <section className="mt-6">
          <h2 className="text-base font-bold text-foreground mb-3">Prestataire</h2>
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
              {data.recruiter.avatar_url ? (
                <img
                  src={data.recruiter.avatar_url}
                  alt={data.recruiter.company_name}
                  className="h-14 w-14 rounded-xl object-cover border border-gray-100 shrink-0"
                />
              ) : (
                <div className="h-14 w-14 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-xl font-bold shrink-0">
                  {data.recruiter.company_name.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">{data.recruiter.company_name}</p>
                {data.recruiter.city && (
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3 shrink-0" />
                    {data.recruiter.city}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <div className="mt-8 flex justify-center">
        <CandidaterButton
          jobPostId={data.id}
          isLoggedIn={isLoggedIn}
          isIntermittent={isIntermittent}
          applicationStatus={data.user_application_status}
          redirectPath={`/annonces/${id}`}
        />
      </div>
    </div>
  );
}

