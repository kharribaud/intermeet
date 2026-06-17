import Link from "next/link";
import { getPublicJobPosts } from "@/app/actions/job-posts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MapPin, Calendar, Building2, Heart, Lightbulb, Search, SlidersHorizontal, Headphones } from "lucide-react";

export const metadata = {
  title: "Missions disponibles | Intermeet",
  description: "Parcourez les missions disponibles pour les intermittents du spectacle.",
};

function JobStatusBadge({ status }: { status: string }) {
  if (status === "CLOSED")
    return <Badge className="bg-[#eb7a41] text-white border-transparent text-[11px] px-2 py-0 h-5 font-medium">Pourvu</Badge>;
  if (status === "PAUSED")
    return <Badge className="bg-gray-100 text-gray-600 border-transparent text-[11px] px-2 py-0 h-5 font-normal">En pause</Badge>;
  return (
    <Badge className="bg-[#4b8a7b] text-white border-transparent text-[11px] px-2 py-0 h-5 font-medium">
      À pourvoir
    </Badge>
  );
}

export default async function AnnoncesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const { data: jobPosts, error } = await getPublicJobPosts(q);

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Alert variant="destructive">
          <AlertDescription>Erreur : {error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const count = jobPosts?.length ?? 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Missions recommandées</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {count} opportunité{count !== 1 ? "s" : ""} correspondent à votre profil
        </p>
      </div>

      {/* Search + Filters */}
      <form method="GET" className="mt-5 mb-5 flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Rechercher par nom, spécialité..."
            className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <Button type="submit" variant="outline" size="sm" className="gap-1.5 shrink-0">
          <SlidersHorizontal className="size-4" />
          Filtres
        </Button>
      </form>

      {/* Smart suggestions banner */}
      <Alert className="mb-5 rounded-xl bg-muted border-0">
        <Lightbulb className="size-4 text-primary" />
        <AlertTitle className="text-sm font-medium">Suggestions intelligentes</AlertTitle>
        <AlertDescription className="text-xs text-muted-foreground">
          Ces missions sont recommandées en fonction de vos compétences et de vos missions réalisées.
          Les missions affichées se déroulent aux dates où vous êtes disponible.
        </AlertDescription>
      </Alert>

      {/* Mission list */}
      {count === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground text-sm">
          Aucune mission disponible pour le moment.
        </div>
      ) : (
        <ul className="space-y-3">
          {jobPosts!.map((post) => {
            const dateLabel = new Date(post.start_at).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            const location = post.event?.address ?? post.city ?? post.event?.city ?? null;
            const companyName = post.recruiter?.company_name ?? null;
            const eventTitle = post.event?.title ?? null;

            return (
              <li key={post.id}>
                <Link
                  href={`/annonces/${post.id}`}
                  className="block rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow p-4"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="shrink-0 mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                      <Headphones className="size-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-foreground leading-tight">{post.title}</p>
                          {eventTitle && (
                            <p className="text-xs text-muted-foreground mt-0.5">{eventTitle}</p>
                          )}
                          <div className="mt-2">
                            <JobStatusBadge status={post.status} />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            aria-label="Sauvegarder"
                            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Heart className="size-4" />
                          </button>
                          <span className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
                            Candidater
                          </span>
                        </div>
                      </div>

                      {/* Meta */}
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="size-3 shrink-0" />
                            {location}
                          </span>
                        )}
                        {companyName && (
                          <span className="flex items-center gap-1">
                            <Building2 className="size-3 shrink-0" />
                            {companyName}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3 shrink-0" />
                          {dateLabel}
                        </span>
                      </div>

                      {/* Candidatures */}
                      {post.applications_count > 0 && (
                        <p className="mt-2 text-xs text-primary font-medium">
                          {post.applications_count} candidature{post.applications_count > 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
