import type { TalentPastMission } from "@/types/database";
import { formatProfileDate } from "@/lib/format-date";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Calendar, MapPin, User } from "lucide-react";

interface MissionCardProps {
  mission: TalentPastMission;
  className?: string;
}

function SkillPill({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
      {label}
    </span>
  );
}

export function MissionCard({ mission, className }: MissionCardProps) {
  return (
    <Card className={cn("gap-0 py-0 shadow-sm", className)}>
      <div className="space-y-3 p-5 sm:p-6">
        <div>
          <p className="font-semibold text-foreground">{mission.job_title}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {mission.event_title}
          </p>
        </div>

        {mission.skills.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5">
            {mission.skills.map((skill) => (
              <li key={`${mission.id}-${skill}`}>
                <SkillPill label={skill} />
              </li>
            ))}
          </ul>
        ) : null}

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4 shrink-0" />
            {mission.location}
          </span>
          <span className="flex items-center gap-1.5">
            <User className="size-4 shrink-0" />
            {mission.client}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="size-4 shrink-0" />
            {formatProfileDate(mission.date)}
          </span>
        </div>
      </div>
    </Card>
  );
}
