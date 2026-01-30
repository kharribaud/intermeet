import { Suspense } from "react";
import { getRecommendedTalents } from "@/app/actions/talents";
import { TalentCard } from "@/components/TalentCard";
import { SmartSuggestionsBanner } from "@/components/SmartSuggestionsBanner";
import { SearchFilter } from "@/components/SearchFilter";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const metadata = {
  title: "Talents recommandés | Intermeet",
  description: "Profils recommandés en fonction de vos annonces et événements.",
};

export default function HomePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Talents recommandés
        </h1>
        <p className="mt-1 text-muted-foreground">
          <Suspense fallback={<span>…</span>}>
            <TalentsCount />
          </Suspense>
        </p>
      </div>

      <div className="mb-6">
        <SearchFilter />
      </div>

      <div className="mb-6">
        <SmartSuggestionsBanner />
      </div>

      <Suspense fallback={<TalentsLoading />}>
        <TalentsList />
      </Suspense>
    </div>
  );
}

async function TalentsCount() {
  const { data } = await getRecommendedTalents();
  const count = data.length;
  return (
    <>{count} profils correspondent à vos besoins actuels</>
  );
}

function TalentsLoading() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-48 rounded-xl" />
      ))}
    </div>
  );
}

async function TalentsList() {
  const { data, error } = await getRecommendedTalents();

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Erreur : {error}</AlertDescription>
      </Alert>
    );
  }

  if (!data.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
        Aucun talent ne correspond pour le moment. Modifiez vos critères ou revenez plus tard.
      </div>
    );
  }

  return (
    <section className="space-y-4" aria-label="Liste des talents recommandés">
      {data.map((talent) => (
        <TalentCard key={talent.user_id} talent={talent} />
      ))}
    </section>
  );
}
