export const metadata = {
  title: "Planning | Intermeet",
  description: "Votre planning et disponibilités.",
};

export default function PlanningPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold text-foreground sm:text-3xl">
        Planning
      </h1>
      <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
        Vue planning à venir. Les blocs de type BOOKED, UNAVAILABLE, HOLD, TRAVEL
        (table <code className="rounded bg-muted px-1 py-0.5 text-foreground">calendar_blocks</code>)
        pourront être affichés ici.
      </div>
    </div>
  );
}
