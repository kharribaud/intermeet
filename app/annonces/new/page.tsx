import Link from "next/link";
import { JobPostForm } from "../JobPostForm";

export const metadata = {
  title: "Nouvelle annonce | Intermeet",
  description: "Créer une annonce d'emploi.",
};

export default function NewJobPostPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/annonces" className="hover:text-foreground">
          Mes annonces
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Nouvelle annonce</span>
      </nav>
      <h1 className="text-2xl font-bold text-foreground">Nouvelle annonce</h1>
      <p className="mt-1 text-muted-foreground">
        Renseignez les champs ci-dessous pour publier une annonce.
      </p>
      <JobPostForm className="mt-8" />
    </div>
  );
}
