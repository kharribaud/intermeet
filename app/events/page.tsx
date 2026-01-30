import Link from "next/link";
import { getEvents } from "@/app/actions/events";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const metadata = {
  title: "Événements | Intermeet",
  description: "Liste des événements.",
};

export default async function EventsPage() {
  const { data: events, error } = await getEvents();

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
      <h1 className="mb-8 text-2xl font-bold text-foreground sm:text-3xl">
        Événements
      </h1>

      {!events?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            Aucun événement pour le moment.
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-4" aria-label="Liste des événements">
          {events.map((event) => (
            <li key={event.id}>
              <Card className="transition-shadow hover:shadow-md">
                <Button variant="ghost" className="h-auto w-full justify-start p-0" asChild>
                  <Link href={`/events/${event.id}`}>
                    <CardContent className="p-4 text-left sm:p-5">
                      <h2 className="font-semibold text-foreground">{event.title}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {event.venue_name ?? event.city ?? "—"}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {new Date(event.start_at).toLocaleDateString("fr-FR")} →{" "}
                        {new Date(event.end_at).toLocaleDateString("fr-FR")}
                      </p>
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
