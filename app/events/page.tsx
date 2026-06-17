import Link from "next/link";
import { getMyEvents, getIntermittentMissions } from "@/app/actions/events";
import type { EventWithCounts, IntermittentMission } from "@/app/actions/events";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AddEventModal } from "@/app/events/new/EventForm";
import { CreateMissionModal } from "@/app/events/[id]/CreateMissionModal";
import { formatDateRange } from "@/lib/format-date";
import { getEventStatusBadge } from "@/lib/event-display";
import { MapPin, Calendar, Wrench, Hammer, Briefcase } from "lucide-react";

export const metadata = {
  title: "Mes missions | Intermeet",
};

export default async function EventsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const isRecruiter = user.user_metadata?.role === "RECRUITER";

  // ── VUE INTERMITTENT : ses missions confirmées ──────────────────────────
  if (!isRecruiter) {
    const { data: missions, error } = await getIntermittentMissions();

    if (error) return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Alert variant="destructive"><AlertDescription>Erreur : {error}</AlertDescription></Alert>
      </div>
    );

    const upcomingCount = missions?.filter(m => new Date(m.end_at) >= new Date()).length ?? 0;

    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Mes missions</h1>
          {!!upcomingCount && (
            <p className="mt-1 text-[13px] text-muted-foreground">
              {upcomingCount} mission{upcomingCount > 1 ? "s" : ""} à venir
            </p>
          )}
        </div>

        {!missions?.length ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              Vous n&apos;avez aucune mission confirmée pour le moment.
              <br />
              <span className="text-sm mt-1">
                Postulez à une <Link href="/annonces" className="text-[#4b8a7b] hover:underline">offre de mission</Link> pour commencer.
              </span>
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-4" aria-label="Liste des missions">
            {missions.map((mission) => {
              const now = new Date();
              const start = new Date(mission.start_at);
              const end = new Date(mission.end_at);
              const isUpcoming = now < start;
              const isOngoing = now >= start && now <= end;
              const isDone = now > end;

              const badgeClass = isDone
                ? "bg-gray-100 text-gray-700 border-transparent font-normal"
                : isOngoing
                  ? "bg-[#4b8a7b] text-white border-transparent"
                  : "bg-[#eb7a41] text-white border-transparent";
              const badgeLabel = isDone ? "Terminée" : isOngoing ? "En cours" : "À venir";

              const fmt = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

              return (
                <li key={mission.booking_id}>
                  <Card className="transition-shadow hover:shadow-md">
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e8f3f1]">
                              <Briefcase className="size-4 text-[#4b8a7b]" />
                            </div>
                            <div className="min-w-0">
                              <h2 className="text-base font-semibold text-foreground leading-snug">
                                {mission.job_post_title}
                              </h2>
                              {mission.event_title && (
                                <p className="mt-0.5 text-sm text-muted-foreground">
                                  Événement : {mission.event_title}
                                </p>
                              )}
                            </div>
                          </div>

                          <Badge className={`mt-3 text-[11px] px-2 py-0 h-5 font-medium ${badgeClass}`}>
                            {badgeLabel}
                          </Badge>

                          <div className="mt-3 space-y-1.5">
                            {mission.city && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <MapPin className="size-3.5 shrink-0" />
                                <span>{mission.city}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="size-3.5 shrink-0" />
                              <span>{fmt(mission.start_at)} → {fmt(mission.end_at)}</span>
                            </div>
                            {mission.agreed_pay_amount != null && (
                              <p className="text-xs font-medium text-foreground">
                                Rémunération : {mission.agreed_pay_amount.toLocaleString("fr-FR")} €
                              </p>
                            )}
                          </div>
                        </div>

                        {mission.job_post_id && (
                          <Link
                            href={`/annonces/${mission.job_post_id}`}
                            className="shrink-0 text-xs text-[#4b8a7b] hover:underline font-medium"
                          >
                            Voir l&apos;offre →
                          </Link>
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

  // ── VUE RECRUTEUR : ses événements ──────────────────────────────────────
  const { data: events, error } = await getMyEvents(user.id);
  const upcomingCount = events?.filter(e => new Date(e.end_at) >= new Date()).length ?? 0;

  if (error) return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Alert variant="destructive"><AlertDescription>Erreur : {error}</AlertDescription></Alert>
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Mes événements</h1>
          {!!upcomingCount && (
            <p className="mt-1 text-[13px] text-muted-foreground">{upcomingCount} événement{upcomingCount > 1 ? "s" : ""} à venir</p>
          )}
        </div>
        <AddEventModal />
      </div>

      {!events?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            {isRecruiter
              ? "Aucun événement pour le moment."
              : "Vous n'êtes inscrit à aucun événement pour le moment. Postulez à une mission pour rejoindre un événement."}
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-4" aria-label="Liste des événements">
          {events.map((event) => {
            const status = getEventStatusBadge(event);
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

