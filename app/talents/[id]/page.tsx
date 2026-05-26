import { notFound } from "next/navigation";
import Link from "next/link";
import { getTalentById } from "@/app/actions/talent";
import { TalentProfileView } from "@/components/talent-profile/TalentProfileView";

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
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-8 text-sm text-muted-foreground" aria-label="Fil d'Ariane">
        <Link href="/" className="hover:text-foreground">
          Talents
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{data.display_name}</span>
      </nav>

      <TalentProfileView profile={data} />
    </div>
  );
}
