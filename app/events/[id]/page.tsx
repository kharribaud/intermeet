import { notFound } from "next/navigation";
import Link from "next/link";
import { getEventById } from "@/app/actions/events";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const { data } = await getEventById(id);
  return {
    title: data ? `${data.title} | Intermeet` : "Événement | Intermeet",
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { data, error } = await getEventById(id);

  if (error || !data) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/events" className="hover:text-foreground">
          Événements
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{data.title}</span>
      </nav>

      <Card>
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold text-foreground">{data.title}</h1>
          <p className="mt-2 text-muted-foreground">
            {data.venue_name ?? "—"} · {data.city ?? "—"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {new Date(data.start_at).toLocaleString("fr-FR")} →{" "}
            {new Date(data.end_at).toLocaleString("fr-FR")}
          </p>
          {data.description && (
            <div className="mt-6 border-t border-border pt-6">
              <p className="whitespace-pre-wrap text-muted-foreground">
                {data.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6">
        <Button variant="link" className="p-0" asChild>
          <Link href="/events">← Retour aux événements</Link>
        </Button>
      </div>
    </div>
  );
}
