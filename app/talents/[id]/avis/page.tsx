import { notFound } from "next/navigation";
import Link from "next/link";
import { getTalentReviews } from "@/app/actions/talent-reviews";
import { ReviewCard } from "@/components/talent-profile/ReviewCard";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const { data } = await getTalentReviews(id);
  return {
    title: data
      ? `Avis des recruteurs - ${data.display_name} | Intermeet`
      : "Avis | Intermeet",
  };
}

export default async function TalentReviewsPage({ params }: PageProps) {
  const { id } = await params;
  const { data, error } = await getTalentReviews(id);

  if (error || !data) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <nav
        className="mb-8 text-sm text-muted-foreground"
        aria-label="Fil d'Ariane"
      >
        <Link href="/" className="hover:text-foreground">
          Talents
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/talents/${data.user_id}`}
          className="hover:text-foreground"
        >
          {data.display_name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Avis des recruteurs</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Avis des recruteurs
        </h1>
        <p className="mt-1 text-muted-foreground">
          {data.reviews_total} avis
        </p>
      </header>

      <ul className="space-y-4" aria-label="Liste des avis">
        {data.reviews.map((review) => (
          <li key={review.id}>
            <ReviewCard review={review} />
          </li>
        ))}
      </ul>
    </div>
  );
}
