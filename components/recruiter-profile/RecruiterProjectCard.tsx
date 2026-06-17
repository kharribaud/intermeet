import Link from "next/link";
import Image from "next/image";
import { CreateMissionModal } from "@/app/events/[id]/CreateMissionModal";
import type { RecruiterProjectCard } from "@/lib/recruiter-profile";
import { formatDateRange } from "@/lib/format-date";
import { getEventStatusBadge } from "@/lib/event-display";
import { getProjectCoverImage } from "@/lib/project-cover-images";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Hammer, MapPin, Wrench } from "lucide-react";

interface RecruiterProjectCardProps {
  project: RecruiterProjectCard;
  showCreateMission?: boolean;
}

const PROJECT_GRADIENTS = [
  "from-primary/40 via-primary/20 to-secondary/30",
  "from-secondary/50 via-muted to-primary/25",
  "from-muted via-secondary/30 to-primary/20",
];

function getProjectGradient(id: string): string {
  const index = id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return PROJECT_GRADIENTS[index % PROJECT_GRADIENTS.length];
}

export function RecruiterProjectCard({
  project,
  showCreateMission = true,
}: RecruiterProjectCardProps) {
  const status = getEventStatusBadge(project);
  const exploitationRange = formatDateRange(project.start_at, project.end_at);
  const montageRange = formatDateRange(
    project.setup_start_at,
    project.setup_end_at
  );
  const demontageRange = formatDateRange(
    project.teardown_start_at,
    project.teardown_end_at
  );
  const location =
    project.address ?? project.venue_name ?? project.city ?? null;
  const canCreateMission =
    showCreateMission && project.status !== "CANCELLED" && !project.id.startsWith("demo-");
  const isDemoProject = project.id.startsWith("demo-");
  const coverImage = getProjectCoverImage(project);

  return (
    <Card className="gap-0 overflow-hidden py-0 shadow-sm">
      <div className="relative h-24 overflow-hidden" aria-hidden>
        <Image
          src={coverImage}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 640px"
        />
        <div
          className={`absolute inset-0 bg-gradient-to-r ${getProjectGradient(project.id)} opacity-30`}
        />
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {isDemoProject ? (
              <p className="text-base font-semibold text-foreground">
                {project.title}
              </p>
            ) : (
              <Link
                href={`/events/${project.id}`}
                className="text-base font-semibold text-foreground hover:underline"
              >
                {project.title}
              </Link>
            )}
            {project.event_type ? (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {project.event_type}
              </p>
            ) : null}
            <Badge className={`mt-3 text-xs ${status.className}`}>
              {status.label}
            </Badge>
          </div>

          {canCreateMission ? (
            <CreateMissionModal
              eventId={project.id}
              eventTitle={project.title}
              eventStartAt={project.start_at}
              eventEndAt={project.end_at}
              variant="outline"
            />
          ) : null}
        </div>

        <ul className="space-y-2 text-sm text-muted-foreground">
          {location ? (
            <li className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0" />
              <span>{location}</span>
            </li>
          ) : null}
          {exploitationRange ? (
            <li className="flex items-center gap-2">
              <Calendar className="size-4 shrink-0" />
              <span>{exploitationRange}</span>
            </li>
          ) : null}
          {montageRange ? (
            <li className="flex items-center gap-2">
              <Wrench className="size-4 shrink-0" />
              <span>Montage : {montageRange}</span>
            </li>
          ) : null}
          {demontageRange ? (
            <li className="flex items-center gap-2">
              <Hammer className="size-4 shrink-0" />
              <span>Démontage : {demontageRange}</span>
            </li>
          ) : null}
        </ul>

        <div className="border-t border-border pt-3">
          <p className="text-sm text-muted-foreground">
            {project.job_posts_count} mission
            {project.job_posts_count !== 1 ? "s" : ""} - {project.bookings_count}{" "}
            talent{project.bookings_count !== 1 ? "s" : ""} booké
            {project.bookings_count !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </Card>
  );
}
