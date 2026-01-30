import { notFound } from "next/navigation";
import Link from "next/link";
import { getJobPostById } from "@/app/actions/job-posts";
import { JobPostForm } from "../../JobPostForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditJobPostPage({ params }: PageProps) {
  const { id } = await params;
  const { data, error } = await getJobPostById(id);

  if (error || !data) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/annonces" className="hover:text-foreground">
          Mes annonces
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/annonces/${id}`} className="hover:text-foreground">
          {data.title}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Modifier</span>
      </nav>
      <h1 className="text-2xl font-bold text-foreground">Modifier l&apos;annonce</h1>
      <JobPostForm className="mt-8" jobPost={data} />
    </div>
  );
}
