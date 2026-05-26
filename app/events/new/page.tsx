import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EventForm } from "./EventForm";

export const metadata = {
  title: "Nouvel événement | Intermeet",
};

export default async function NewEventPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== "RECRUITER") {
    redirect("/events");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-muted-foreground">
        <a href="/events" className="hover:text-foreground">Mes événements</a>
        <span className="mx-2">/</span>
        <span className="text-foreground">Nouvel événement</span>
      </nav>

      <Card>
        <CardHeader>
          <CardTitle>Créer un événement</CardTitle>
          <CardDescription>Renseignez les informations de votre événement.</CardDescription>
        </CardHeader>
        <CardContent>
          <EventForm />
        </CardContent>
      </Card>
    </div>
  );
}
