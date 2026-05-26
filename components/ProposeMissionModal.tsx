"use client";

import { useEffect, useState, useTransition } from "react";
import { X } from "lucide-react";
import { getRecruiterMissions, proposeMission } from "@/app/actions/missions";
import type { JobPost } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProposeMissionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  talentUserId: string;
  talentName: string;
}

export function ProposeMissionModal({
  open,
  onOpenChange,
  talentUserId,
  talentName,
}: ProposeMissionModalProps) {
  const [missions, setMissions] = useState<JobPost[]>([]);
  const [jobPostId, setJobPostId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loadingMissions, setLoadingMissions] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;

    setError(null);
    setJobPostId("");
    setMessage("");
    setLoadingMissions(true);

    getRecruiterMissions()
      .then(({ data, error: fetchError }) => {
        if (fetchError) setError(fetchError);
        else setMissions(data ?? []);
      })
      .finally(() => setLoadingMissions(false));
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await proposeMission(talentUserId, jobPostId, message);
      if (result.error) {
        setError(result.error);
        return;
      }
      onOpenChange(false);
    });
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50"
        aria-hidden
        onClick={() => onOpenChange(false)}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="propose-mission-title"
          className="pointer-events-auto w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <h2
              id="propose-mission-title"
              className="text-lg font-semibold text-foreground"
            >
              Proposer une mission à {talentName}
            </h2>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Fermer"
            >
              <X className="size-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="mission-select">Mission</Label>
              <Select
                value={jobPostId}
                onValueChange={setJobPostId}
                disabled={loadingMissions || isPending}
              >
                <SelectTrigger id="mission-select" className="w-full">
                  <SelectValue
                    placeholder={
                      loadingMissions
                        ? "Chargement…"
                        : "Sélectionner une mission"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {missions.map((mission) => (
                    <SelectItem key={mission.id} value={mission.id}>
                      {mission.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mission-message">Message</Label>
              <Textarea
                id="mission-message"
                placeholder="Écrivez votre message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isPending}
                rows={5}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" disabled={isPending || loadingMissions}>
              {isPending ? "Envoi…" : "Envoyer la demande"}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
