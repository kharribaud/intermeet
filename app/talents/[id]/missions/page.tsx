import { notFound } from "next/navigation";
import Link from "next/link";
import { getTalentMissions } from "@/app/actions/talent-missions";
import { MissionCard } from "@/components/talent-profile/MissionCard";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const { data } = await getTalentMissions(id);
  return {
    title: data
      ? `Missions précédentes - ${data.display_name} | Intermeet`
      : "Missions | Intermeet",
  };
}

export default async function TalentMissionsPage({ params }: PageProps) {
  const { id } = await params;
  const { data, error } = await getTalentMissions(id);

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
        <span className="text-foreground">Missions précédentes</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Missions précédentes de {data.display_name}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {data.missions_total} missions
        </p>
      </header>

      <ul className="space-y-4" aria-label="Liste des missions">
        {data.missions.map((mission) => (
          <li key={mission.id}>
            <MissionCard mission={mission} />
          </li>
        ))}
      </ul>
    </div>
  );
}
