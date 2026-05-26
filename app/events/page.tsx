import Link from "next/link";
import { getMyEvents } from "@/app/actions/events";
import type { EventWithCounts } from "@/app/actions/events";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AddEventModal } from "@/app/events/new/EventForm";
import { CreateMissionModal } from "@/app/events/[id]/CreateMissionModal";
import { MapPin, Calendar, Wrench, Hammer } from "lucide-react";

export const metadata = {
  title: "Mes événements | Intermeet",
};

function getStatusBadge(event: EventWithCounts) {
  if (event.status === "CANCELLED") return { label: "Annulé", className: "bg-red-500 text-white border-transparent hover:bg-red-600" };
  const now = new Date();
  const start = new Date(event.start_at);
  const end = new Date(event.end_at);
  if (now > end) return { label: "Terminé", className: "bg-gray-100 text-gray-700 border-transparent hover:bg-gray-200 font-normal" };
  if (now >= start && now <= end) return { label: "En cours", className: "bg-[#4b8a7b] text-white border-transparent hover:bg-[#3d7064]" };
  return { label: "Complet", className: "bg-[#eb7a41] text-white border-transparent hover:bg-[#d66e3a]" }; // Remplacé "À venir" par "Complet" (basé sur design) sauf si besoin dynamique
}

function formatDateRange(start: string | null, end: string | null) {
  if (!start || !end) return null;
  const fmt = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  return `${fmt(start)} - ${fmt(end)}`;
}

export default async function EventsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const isRecruiter = user.user_metadata?.role === "RECRUITER";
  const { data: events, error } = await getMyEvents(user.id);

  const upcomingCount = events?.filter(e => new Date(e.end_at) >= new Date()).length ?? 0;

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
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Mes événements</h1>
          {!!upcomingCount && (
            <p className="mt-1 text-[13px] text-muted-foreground">{upcomingCount} événement{upcomingCount > 1 ? "s" : ""} à venir</p>
          )}
        </div>
        {isRecruiter && <AddEventModal />}
      </div>

      {!events?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            Aucun événement pour le moment.
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-4" aria-label="Liste des événements">
          {events.map((event) => {
            const status = getStatusBadge(event);
            const exploitationRange = formatDateRange(event.start_at, event.end_at);
            const montageRange = formatDateRange(event.setup_start_at, event.setup_end_at);
            const demontageRange = formatDateRange(event.teardown_start_at, event.teardown_end_at);

            return (
              <li key={event.id}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <Link href={`/events/${event.id}`} className="group">
                          <h2 className="text-base font-semibold text-foreground group-hover:underline">{event.title}</h2>
                        </Link>
                        {event.event_type && (
                          <p className="mt-0.5 text-sm text-muted-foreground">{event.event_type}</p>
                        )}
                        <Badge className={`mt-3 text-[11px] px-2 py-0 h-5 font-medium ${status.className}`}>
                          {status.label}
                        </Badge>

                        <div className="mt-4 space-y-2">
                          {(event.address || event.venue_name || event.city) && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <MapPin className="size-3.5 shrink-0" />
                              <span>{event.address ?? event.venue_name ?? event.city}</span>
                            </div>
                          )}
                          {exploitationRange && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="size-3.5 shrink-0" />
                              <span>{exploitationRange}</span>
                            </div>
                          )}
                          {(montageRange || demontageRange) && (
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                              {montageRange && (
                                <div className="flex items-center gap-2">
                                  <Wrench className="size-3.5 shrink-0" />
                                  <span>Montage : {montageRange}</span>
                                </div>
                              )}
                              {demontageRange && (
                                <div className="flex items-center gap-2">
                                  <Hammer className="size-3.5 shrink-0" />
                                  <span>Démontage : {demontageRange}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="mt-4 border-t border-border pt-3">
                          <p className="text-[11px] text-muted-foreground">
                            {event.job_posts_count} mission{event.job_posts_count !== 1 ? "s" : ""} - {event.bookings_count} talent{event.bookings_count !== 1 ? "s" : ""} booké{event.bookings_count !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>

                      {isRecruiter && (
                        <CreateMissionModal
                          eventId={event.id}
                          eventTitle={event.title}
                          eventStartAt={event.start_at}
                          eventEndAt={event.end_at}
                          variant="outline"
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

