"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { applyToJobPost } from "@/app/actions/job-posts";
import { Button } from "@/components/ui/button";

interface Props {
  jobPostId: string;
  isLoggedIn: boolean;
  isIntermittent: boolean;
  alreadyApplied: boolean;
  redirectPath: string;
}

export function CandidaterButton({ jobPostId, isLoggedIn, isIntermittent, alreadyApplied, redirectPath }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(alreadyApplied);
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

  if (done) {
    return (
      <Button disabled className="bg-[#4b8a7b] text-white border-transparent cursor-default">
        Candidature envoyée ✓
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
        setDone(true);
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button onClick={handleApply} disabled={pending} className="bg-primary text-primary-foreground hover:bg-primary/90">
        {pending ? "Envoi…" : "Candidater"}
      </Button>
      {errorMsg && <p className="text-xs text-destructive">{errorMsg}</p>}
    </div>
  );
}
