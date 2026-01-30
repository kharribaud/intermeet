import { notFound } from "next/navigation";
import Link from "next/link";
import { getTalentById } from "@/app/actions/talent";
import { TalentCard } from "@/components/TalentCard";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const { data } = await getTalentById(id);
  return {
    title: data ? `${data.display_name} | Intermeet` : "Profil | Intermeet",
  };
}

export default async function TalentProfilePage({ params }: PageProps) {
  const { id } = await params;
  const { data, error } = await getTalentById(id);

  if (error || !data) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Talents recommandés
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{data.display_name}</span>
      </nav>
      <TalentCard talent={data} />
      <div className="mt-6">
        <Button variant="link" className="p-0" asChild>
          <Link href="/">← Retour aux talents</Link>
        </Button>
      </div>
    </div>
  );
}
