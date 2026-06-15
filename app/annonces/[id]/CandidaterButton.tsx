"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { applyToJobPost, cancelApplication } from "@/app/actions/job-posts";
import { Button } from "@/components/ui/button";

interface Props {
  jobPostId: string;
  isLoggedIn: boolean;
  isIntermittent: boolean;
  applicationStatus: string | null;
  redirectPath: string;
}

export function CandidaterButton({ jobPostId, isLoggedIn, isIntermittent, applicationStatus, redirectPath }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(applicationStatus);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isLoggedIn) {
    return (
      <Button
        onClick={() => router.push(`/connexion?redirect=${encodeURIComponent(redirectPath)}`)}
        className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        Candidater
      </Button>
    );
  }

  if (!isIntermittent) {
    return (
      <Button disabled variant="outline" title="Seuls les intermittents peuvent postuler">
        Candidater
      </Button>
    );
  }

  function handleApply() {
    setErrorMsg(null);
    startTransition(async () => {
      const { error } = await applyToJobPost(jobPostId);
      if (error) {
        setErrorMsg(error);
      } else {
        setStatus("APPLIED");
        router.refresh();
      }
    });
  }

  function handleCancel() {
    setErrorMsg(null);
    startTransition(async () => {
      const { error } = await cancelApplication(jobPostId);
      if (error) {
        setErrorMsg(error);
      } else {
        setStatus("WITHDRAWN");
        router.refresh();
      }
    });
  }

  // Candidature acceptée
  if (status === "ACCEPTED") {
    return (
      <Button disabled className="bg-[#4b8a7b] text-white border-transparent cursor-default">
        Candidature acceptée ✓
      </Button>
    );
  }

  // Candidature refusée
  if (status === "REJECTED") {
    return (
      <Button disabled variant="outline" className="cursor-default text-muted-foreground">
        Candidature refusée
      </Button>
    );
  }

  // Candidature annulée ou jamais postulé
  if (status === "WITHDRAWN" || !status) {
    return (
      <div className="flex flex-col items-end gap-1">
        <Button onClick={handleApply} disabled={pending} className="bg-primary text-primary-foreground hover:bg-primary/90">
          {pending ? "Envoi…" : "Candidater"}
        </Button>
        {errorMsg && <p className="text-xs text-destructive">{errorMsg}</p>}
      </div>
    );
  }

  // Candidature en attente (APPLIED ou SHORTLISTED)
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <span className="text-sm text-[#4b8a7b] font-medium">Candidature envoyée ✓</span>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs border-gray-200 text-muted-foreground hover:text-destructive hover:border-destructive"
          disabled={pending}
          onClick={handleCancel}
        >
          {pending ? "…" : "Annuler"}
        </Button>
      </div>
      {errorMsg && <p className="text-xs text-destructive">{errorMsg}</p>}
    </div>
  );
}
