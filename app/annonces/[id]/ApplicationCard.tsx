"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateApplicationStatus } from "@/app/actions/job-posts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/talent-display";
import type { ApplicationWithProfile } from "@/types/database";

interface Props {
  application: ApplicationWithProfile;
  jobTitle: string;
}

export function ApplicationCard({ application, jobTitle }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(application.status);
  const [pending, startTransition] = useTransition();

  const profile = application.intermittent_profiles;
  if (!profile) return null;

  const skills = profile.intermittent_skills
    .map((is) => is.skills)
    .filter((s): s is { name: string; category: string | null } => s !== null)
    .slice(0, 4);

  async function handleAction(newStatus: "ACCEPTED" | "REJECTED") {
    startTransition(async () => {
      const { error } = await updateApplicationStatus(application.id, newStatus);
      if (!error) {
        setStatus(newStatus);
        router.refresh();
      }
    });
  }

  const isAccepted = status === "ACCEPTED";
  const isRejected = status === "REJECTED";
  const isDone = isAccepted || isRejected;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        {/* Avatar + info */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.display_name}
              className="h-10 w-10 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-[#4b8a7b] text-white flex items-center justify-center text-sm font-semibold shrink-0">
              {getInitials(profile.display_name)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground text-sm">{profile.display_name}</p>
            <p className="text-sm text-muted-foreground">{jobTitle}</p>
            {/* Skills */}
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {skills.map((s) => (
                  <span
                    key={s.name}
                    className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-700"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {isDone ? (
            <Badge
              className={
                isAccepted
                  ? "bg-[#4b8a7b] text-white border-transparent"
                  : "bg-gray-200 text-gray-600 border-transparent"
              }
            >
              {isAccepted ? "Accepté" : "Refusé"}
            </Badge>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-gray-200 text-foreground hover:bg-gray-50"
                disabled={pending}
                onClick={() => handleAction("REJECTED")}
              >
                Refuser
              </Button>
              <Button
                size="sm"
                className="h-8 bg-[#eb7a41] hover:bg-[#d66e3a] text-white"
                disabled={pending}
                onClick={() => handleAction("ACCEPTED")}
              >
                Accepter
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-5 mt-3 text-xs text-muted-foreground">
        {profile.seniority_years != null && (
          <span className="flex items-center gap-1">
            ⭐ {profile.seniority_years} ans d&apos;expérience
          </span>
        )}
        {profile.city && (
          <span className="flex items-center gap-1">
            📍 {profile.city}
          </span>
        )}
      </div>
    </div>
  );
}
