export const metadata = {
  title: "Entreprise | Intermeet",
  description: "Profil entreprise et recruteur.",
};

export default function EntreprisePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold text-foreground sm:text-3xl">
        Entreprise
      </h1>
      <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
        Profil entreprise (table <code className="rounded bg-muted px-1 py-0.5 text-foreground">recruiter_profiles</code>)
        : nom, site web, ville, vérification. À connecter après authentification.
      </div>
    </div>
  );
}
