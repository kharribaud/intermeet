import Link from "next/link";
import type { RecruiterProfilePageData } from "@/lib/recruiter-profile";
import { RecruiterAvatarUpload } from "@/components/recruiter-profile/RecruiterAvatarUpload";
import { RecruiterBannerUpload } from "@/components/recruiter-profile/RecruiterBannerUpload";
import { EditRecruiterProfileModal } from "@/components/recruiter-profile/EditRecruiterProfileModal";
import { RecruiterProjectCard } from "@/components/recruiter-profile/RecruiterProjectCard";
import { DeconnexionButton } from "@/app/parametres/DeconnexionButton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, MapPin } from "lucide-react";

interface RecruiterSettingsViewProps {
  profile: RecruiterProfilePageData;
}

export function RecruiterSettingsView({ profile }: RecruiterSettingsViewProps) {
  return (
    <div className="space-y-10 pb-10">
      <section>
        <RecruiterBannerUpload
          companyName={profile.company_name}
          initialBannerUrl={profile.banner_url}
        />

        <div className="relative -mt-12 flex flex-col gap-4 px-1 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4 sm:gap-5">
            <RecruiterAvatarUpload
              companyName={profile.company_name}
              initialAvatarUrl={profile.avatar_url}
            />

            <div className="min-w-0 pb-1">
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                {profile.company_name}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                {profile.tagline}
              </p>
            </div>
          </div>

          <EditRecruiterProfileModal profile={profile} />
        </div>

        <div className="mt-6 space-y-4">
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {profile.bio}
          </p>

          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0" />
              <span>{profile.locations}</span>
            </li>
            <li className="flex items-center gap-2">
              <Calendar className="size-4 shrink-0" />
              <span>Depuis {profile.founded_year}</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          Projets en cours
        </h2>
        <ul className="grid gap-4 sm:grid-cols-3">
          <li>
            <Card className="gap-0 py-0 shadow-sm">
              <div className="p-5 sm:p-6">
                <p className="text-3xl font-bold text-foreground">
                  {profile.stats.events_count.toLocaleString("fr-FR")}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  événements réalisés
                </p>
              </div>
            </Card>
          </li>
          <li>
            <Card className="gap-0 py-0 shadow-sm">
              <div className="p-5 sm:p-6">
                <p className="text-3xl font-bold text-foreground">
                  {profile.stats.missions_filled.toLocaleString("fr-FR")}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  missions pourvues
                </p>
              </div>
            </Card>
          </li>
          <li>
            <Card className="gap-0 py-0 shadow-sm">
              <div className="p-5 sm:p-6">
                <p className="text-3xl font-bold text-foreground">
                  {profile.stats.satisfaction_rating.toFixed(1).replace(".", ",")}
                  /5
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  de satisfaction moyenne
                </p>
              </div>
            </Card>
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          Projets récents
        </h2>
        <ul className="space-y-4">
          {profile.recent_projects.map((project) => (
            <li key={project.id}>
              <RecruiterProjectCard project={project} />
            </li>
          ))}
        </ul>

        <div className="flex justify-center pt-2">
          <Button variant="outline" asChild>
            <Link href="/events">
              Voir tous les projets ({profile.projects_total})
            </Link>
          </Button>
        </div>
      </section>

      <div className="flex justify-center border-t border-border pt-8">
        <DeconnexionButton />
      </div>
    </div>
  );
}
