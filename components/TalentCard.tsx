"use client";

import Link from "next/link";
import type { TalentCardData } from "@/types/database";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, CalendarCheck, Heart } from "lucide-react";

interface TalentCardProps {
  talent: TalentCardData;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/** Tag compétence : primary pour niveau avancé/expert, secondary sinon */
function isPrimaryLevel(level: string): boolean {
  return level === "ADVANCED" || level === "EXPERT";
}

export function TalentCard({ talent }: TalentCardProps) {
  const initials = getInitials(talent.display_name);
  const location = talent.city ? `${talent.city}` : "Non renseigné";

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
            <Avatar className="size-14 shrink-0 text-lg">
              {talent.avatar_url && <AvatarImage src={talent.avatar_url} alt={talent.display_name} />}
              <AvatarFallback className="bg-muted text-foreground">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold text-foreground">{talent.display_name}</h2>
              {talent.skills?.[0] && (
                <p className="mt-0.5 text-sm text-muted-foreground">{talent.skills[0].name}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {talent.skills?.slice(0, 4).map((s, idx) => (
                  <Badge
                    key={`${s.name}-${idx}`}
                    variant={isPrimaryLevel(s.level) ? "default" : "secondary"}
                  >
                    {s.name}
                  </Badge>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="size-4 shrink-0" />
                  {location}
                </span>
                <span className="flex items-center gap-1">
                  {talent.daily_rate}
                </span>
                <span className="flex items-center gap-1">
                  <CalendarCheck className="size-4 shrink-0" />
                  {talent.bookings_count} événements réalisés
                </span>
              </div>
              {talent.suggested_event && (
                <p className="mt-2 text-sm text-primary/90">
                  Suggéré pour : {talent.suggested_event.title} -{" "}
                  {new Date(talent.suggested_event.start_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-start gap-2">
            <Button variant="outline" size="icon" aria-label="Ajouter aux favoris">
              <Heart className="size-5" />
            </Button>
            <Button asChild>
              <Link href={`/talents/${talent.user_id}`}>
                Proposer une mission
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
