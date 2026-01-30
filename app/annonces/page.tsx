import Link from "next/link";
import { getJobPosts } from "@/app/actions/job-posts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const metadata = {
  title: "Mes annonces | Intermeet",
  description: "Liste de vos annonces d'emploi.",
};

export default async function AnnoncesPage() {
  const { data: jobPosts, error } = await getJobPosts();

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Alert variant="destructive">
          <AlertDescription>Erreur : {error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Mes annonces
        </h1>
        <Button asChild>
          <Link href="/annonces/new">Nouvelle annonce</Link>
        </Button>
      </div>

      {!jobPosts?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            Aucune annonce pour le moment. Créez votre première annonce.
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-4" aria-label="Liste des annonces">
          {jobPosts.map((post) => (
            <li key={post.id}>
              <Card className="transition-shadow hover:shadow-md">
                <Button variant="ghost" className="h-auto w-full justify-start p-0" asChild>
                  <Link href={`/annonces/${post.id}`}>
                    <CardContent className="flex flex-col gap-2 p-4 text-left sm:flex-row sm:items-center sm:justify-between sm:p-5">
                      <div>
                        <h2 className="font-semibold text-foreground">{post.title}</h2>
                        <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                          {post.description ?? "—"}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span>{post.city ?? "—"}</span>
                          <span>
                            {new Date(post.start_at).toLocaleDateString("fr-FR")} →{" "}
                            {new Date(post.end_at).toLocaleDateString("fr-FR")}
                          </span>
                          <Badge variant={post.status === "PUBLISHED" ? "default" : "secondary"}>
                            {post.status}
                          </Badge>
                        </div>
                      </div>
                      <span className="text-primary sm:shrink-0">Voir →</span>
                    </CardContent>
                  </Link>
                </Button>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
