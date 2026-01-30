"use client";

import { useCallback, useState } from "react";
import { getRecommendedTalents } from "@/app/actions/talents";
import { TalentCard } from "@/components/TalentCard";
import type { TalentCardData } from "@/types/database";

/**
 * Version client pour la recherche en temps réel (optionnel).
 * La page utilise par défaut le rendu serveur ; ce composant peut être branché
 * pour une recherche sans rechargement.
 */
export function TalentsContent() {
  const [talents, setTalents] = useState<TalentCardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await getRecommendedTalents(query);
    setLoading(false);
    if (err) setError(err);
    else setTalents(data);
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 animate-pulse rounded-xl border border-border bg-muted/30" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-destructive">
        {error}
      </div>
    );
  }

  if (!talents.length) {
    return (
      <p className="text-muted-foreground">Aucun résultat.</p>
    );
  }

  return (
    <section className="space-y-4">
      {talents.map((t) => (
        <TalentCard key={t.user_id} talent={t} />
      ))}
    </section>
  );
}
