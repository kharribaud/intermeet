import { notFound } from "next/navigation";
import Link from "next/link";
import { getJobPostById } from "@/app/actions/job-posts";
import { DeleteJobPostButton } from "./DeleteJobPostButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const { data } = await getJobPostById(id);
  return {
    title: data ? `${data.title} | Intermeet` : "Annonce | Intermeet",
  };
}

export default async function JobPostDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { data, error } = await getJobPostById(id);

  if (error || !data) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/annonces" className="hover:text-foreground">
          Mes annonces
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{data.title}</span>
      </nav>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{data.title}</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {data.city ?? "—"} ·{" "}
                {new Date(data.start_at).toLocaleDateString("fr-FR")} →{" "}
                {new Date(data.end_at).toLocaleDateString("fr-FR")}
              </p>
              <Badge className="mt-2" variant={data.status === "PUBLISHED" ? "default" : "secondary"}>
                {data.status}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href={`/annonces/${id}/edit`}>Modifier</Link>
              </Button>
              <DeleteJobPostButton id={id} />
            </div>
          </div>
          {data.description && (
            <div className="mt-6 border-t border-border pt-6">
              <h2 className="text-sm font-semibold text-foreground">Description</h2>
              <p className="mt-2 whitespace-pre-wrap text-muted-foreground">
                {data.description}
              </p>
            </div>
          )}
          <div className="mt-6 flex flex-wrap gap-4 border-t border-border pt-6 text-sm text-muted-foreground">
            {data.required_count != null && (
              <span>Postes : {data.required_count}</span>
            )}
            {data.pay_amount != null && (
              <span>Rémunération : {data.pay_amount} €</span>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <Button variant="link" className="p-0" asChild>
          <Link href="/annonces">← Retour aux annonces</Link>
        </Button>
      </div>
    </div>
  );
}
