"use client";

import { useState } from "react";
import Link from "next/link";
import type { TalentCardData } from "@/types/database";
import { ProposeMissionModal } from "@/components/ProposeMissionModal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Briefcase, Heart, Star } from "lucide-react";

interface TalentCardProps {
  talent: TalentCardData;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatSuggestedDate(isoDate: string): string {
  const formatted = new Date(isoDate).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function TalentCard({ talent }: TalentCardProps) {
  const [missionModalOpen, setMissionModalOpen] = useState(false);

  const initials = getInitials(talent.display_name);
  const jobTitle =
    talent.job_title ?? talent.skills.find((s) => s.category)?.category ?? null;
  const skills = talent.skills.slice(0, 4);
  const profileHref = `/talents/${talent.user_id}`;

  return (
    <>
      <Card className="relative cursor-pointer gap-0 overflow-hidden py-0 shadow-sm transition-shadow hover:shadow-md">
        <Link
          href={profileHref}
          className="absolute inset-0 z-0 rounded-xl"
          aria-label={`Voir le profil de ${talent.display_name}`}
        />

        <div className="pointer-events-none relative z-10 p-5 pr-36 sm:p-6 sm:pr-44">
          <div className="flex items-start gap-4 sm:gap-5">
            <Avatar className="size-14 shrink-0">
              {talent.avatar_url ? (
                <AvatarImage
                  src={talent.avatar_url}
                  alt={talent.display_name}
                />
              ) : null}
              <AvatarFallback className="bg-muted text-base font-medium text-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1 space-y-3">
              <div>
                <h2 className="text-lg font-semibold leading-tight text-foreground">
                  {talent.display_name}
                </h2>
                {jobTitle ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {jobTitle}
                  </p>
                ) : null}
              </div>

              {skills.length > 0 ? (
                <ul className="flex flex-wrap gap-1.5" aria-label="Compétences">
                  {skills.map((skill) => (
                    <li key={skill.name}>
                      <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                        {skill.name}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}

              <ul className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-1.5">
                  <Star
                    className="size-4 shrink-0 fill-secondary text-secondary"
                    aria-hidden
                  />
                  <span>
                    {talent.rating.toFixed(1)}/5
                    {talent.reviews_count > 0
                      ? ` - ${talent.reviews_count} avis`
                      : ""}
                  </span>
                </li>
                <li className="flex items-center gap-1.5">
                  <MapPin className="size-4 shrink-0" aria-hidden />
                  <span>{talent.city ?? "Non renseigné"}</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Briefcase className="size-4 shrink-0" aria-hidden />
                  <span>{talent.bookings_count} événements réalisés</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pointer-events-auto absolute right-5 top-5 z-20 flex items-center gap-2 sm:right-6 sm:top-6">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-9 shrink-0"
            aria-label="Ajouter aux favoris"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <Heart className="size-5" strokeWidth={1.75} />
          </Button>
          <Button
            type="button"
            className="shrink-0"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMissionModalOpen(true);
            }}
          >
            Proposer une mission
          </Button>
        </div>

        {talent.suggested_event ? (
          <div className="pointer-events-none relative z-10 border-t border-border px-5 py-4 sm:px-6">
            <p className="text-sm font-medium text-primary">
              Suggéré pour : {talent.suggested_event.title} -{" "}
              {formatSuggestedDate(talent.suggested_event.start_at)}
            </p>
          </div>
        ) : null}
      </Card>

      <ProposeMissionModal
        open={missionModalOpen}
        onOpenChange={setMissionModalOpen}
        talentUserId={talent.user_id}
        talentName={talent.display_name}
      />
    </>
  );
}
