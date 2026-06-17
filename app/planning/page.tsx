import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getIntermittentPlanning } from "@/app/actions/events";
import { PlanningCalendar } from "./PlanningCalendar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Planning | Intermeet",
  description: "Votre planning et disponibilités.",
};

export default async function PlanningPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: bookings, error } = await getIntermittentPlanning();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Planning</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {bookings?.length
            ? `${bookings.length} intervention${bookings.length > 1 ? "s" : ""} confirmée${bookings.length > 1 ? "s" : ""}`
            : "Aucune intervention confirmée"}
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>Erreur : {error}</AlertDescription>
        </Alert>
      )}

      {!bookings?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            Vous n&apos;avez aucune intervention confirmée pour le moment.
            <br />
            <span className="text-sm mt-1">Postulez à une mission pour apparaître dans votre planning.</span>
          </CardContent>
        </Card>
      ) : (
        <PlanningCalendar bookings={bookings} />
      )}
    </div>
  );
}
