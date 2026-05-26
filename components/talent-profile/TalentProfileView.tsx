"use client";

import { useState } from "react";
import Link from "next/link";
import type { TalentProfileData } from "@/types/database";
import { getInitials } from "@/lib/talent-display";
import { MissionCard } from "@/components/talent-profile/MissionCard";
import { ReviewCard } from "@/components/talent-profile/ReviewCard";
import { ProposeMissionModal } from "@/components/ProposeMissionModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  Star,
} from "lucide-react";

interface TalentProfileViewProps {
  profile: TalentProfileData;
}

function SkillPill({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
      {label}
    </span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold text-foreground">{children}</h2>;
}

export function TalentProfileView({ profile }: TalentProfileViewProps) {
  const [missionModalOpen, setMissionModalOpen] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);

  const initials = getInitials(profile.display_name);
  const headlineSkills = profile.skills.slice(0, 3).map((s) => s.name);
  const displayTags =
    headlineSkills.length > 0
      ? headlineSkills
      : profile.skill_groups.technical.slice(0, 3);

  const maxReviewIndex = Math.max(0, profile.reviews.length - 3);

  return (
    <div className="space-y-10 pb-10">
      {/* En-tête profil */}
      <section className="relative">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="absolute right-0 top-0 size-9"
          aria-label="Ajouter aux favoris"
        >
          <Heart className="size-5" strokeWidth={1.75} />
        </Button>

        <div className="flex flex-col gap-6 pr-12 sm:flex-row sm:items-start">
          <Avatar className="size-24 shrink-0 sm:size-28">
            {profile.avatar_url ? (
              <AvatarImage src={profile.avatar_url} alt={profile.display_name} />
            ) : null}
            <AvatarFallback className="bg-muted text-2xl font-medium text-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                {profile.display_name}
              </h1>
              <p className="mt-1 text-muted-foreground">
                {profile.job_title ?? "Ingénieur du son"}
              </p>
            </div>

            {displayTags.length > 0 ? (
              <ul className="flex flex-wrap gap-1.5">
                {displayTags.map((tag) => (
                  <li key={tag}>
                    <SkillPill label={tag} />
                  </li>
                ))}
              </ul>
            ) : null}

            {profile.bio ? (
              <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                {profile.bio}
              </p>
            ) : null}

            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <Star className="size-4 shrink-0 fill-secondary text-secondary" />
                <span>
                  {profile.rating.toFixed(1).replace(".", ",")}/5 -{" "}
                  {profile.reviews_count} avis
                </span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="size-4 shrink-0" />
                <span>{profile.city}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Briefcase className="size-4 shrink-0" />
                <span>{profile.bookings_count} événements réalisés</span>
              </li>
            </ul>

            <Button type="button" onClick={() => setMissionModalOpen(true)}>
              Proposer une mission
            </Button>
          </div>
        </div>
      </section>

      {/* Événements suggérés */}
      <section className="space-y-4">
        <SectionTitle>Suggéré pour les événements suivants</SectionTitle>
        <ul className="grid gap-3 sm:grid-cols-3">
          {profile.suggested_events.map((event) => (
            <li key={event.id}>
              <Card className="gap-0 py-0 shadow-sm">
                <div className="flex items-center gap-3 p-4">
                  <Briefcase className="size-5 shrink-0 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    {event.title}
                  </span>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      {/* Compétences */}
      <section className="space-y-4">
        <SectionTitle>Compétences</SectionTitle>
        <Card className="gap-0 overflow-hidden py-0 shadow-sm">
          <SkillGroupRow
            label="Compétences techniques"
            skills={profile.skill_groups.technical}
          />
          <div className="border-t border-border" />
          <SkillGroupRow
            label="Logiciels & outils"
            skills={profile.skill_groups.software}
          />
          <div className="border-t border-border" />
          <SkillGroupRow
            label="Habilitations & certifications"
            skills={profile.skill_groups.certifications}
          />
        </Card>
      </section>

      {/* Missions précédentes */}
      <section className="space-y-4">
        <SectionTitle>Missions précédentes</SectionTitle>
        <ul className="grid gap-4 sm:grid-cols-2">
          {profile.past_missions.map((mission) => (
            <li key={mission.id}>
              <MissionCard mission={mission} />
            </li>
          ))}
        </ul>
        <div className="flex justify-center pt-2">
          <Button variant="outline" asChild>
            <Link href={`/talents/${profile.user_id}/missions`}>
              Voir toutes les missions ({profile.missions_total})
            </Link>
          </Button>
        </div>
      </section>

      {/* Avis */}
      <section className="space-y-4">
        <SectionTitle>Avis des recruteurs</SectionTitle>
        <div className="relative">
          {profile.reviews.length > 3 ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="absolute -left-3 top-1/2 z-10 hidden size-9 -translate-y-1/2 sm:flex"
                onClick={() => setReviewIndex((i) => Math.max(0, i - 1))}
                disabled={reviewIndex === 0}
                aria-label="Avis précédents"
              >
                <ChevronLeft className="size-5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="absolute -right-3 top-1/2 z-10 hidden size-9 -translate-y-1/2 sm:flex"
                onClick={() =>
                  setReviewIndex((i) => Math.min(maxReviewIndex, i + 1))
                }
                disabled={reviewIndex >= maxReviewIndex}
                aria-label="Avis suivants"
              >
                <ChevronRight className="size-5" />
              </Button>
            </>
          ) : null}

          <ul className="grid gap-4 sm:grid-cols-3">
            {profile.reviews
              .slice(reviewIndex, reviewIndex + 3)
              .map((review) => (
                <li key={review.id} className="h-full">
                  <ReviewCard review={review} />
                </li>
              ))}
          </ul>
        </div>
        <div className="flex justify-center pt-2">
          <Button variant="outline" asChild>
            <Link href={`/talents/${profile.user_id}/avis`}>
              Voir tous les avis ({profile.reviews_total})
            </Link>
          </Button>
        </div>
      </section>

      <div className="flex justify-center pt-2">
        <Button
          type="button"
          size="lg"
          className="min-w-56"
          onClick={() => setMissionModalOpen(true)}
        >
          Proposer une mission
        </Button>
      </div>

      <ProposeMissionModal
        open={missionModalOpen}
        onOpenChange={setMissionModalOpen}
        talentUserId={profile.user_id}
        talentName={profile.display_name}
      />
    </div>
  );
}

function SkillGroupRow({ label, skills }: { label: string; skills: string[] }) {
  return (
    <div className="space-y-3 p-5 sm:p-6">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <ul className="flex flex-wrap gap-1.5">
        {skills.map((skill) => (
          <li key={`${label}-${skill}`}>
            <SkillPill label={skill} />
          </li>
        ))}
      </ul>
    </div>
  );
}
