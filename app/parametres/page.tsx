export const metadata = {
  title: "Paramètres | Intermeet",
  description: "Paramètres du compte.",
};

export default function ParametresPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold text-foreground sm:text-3xl">
        Paramètres
      </h1>
      <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
        Paramètres utilisateur (auth, notifications, préférences). À connecter avec Supabase Auth.
      </div>
    </div>
  );
}
