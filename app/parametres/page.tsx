import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRecruiterProfilePage } from "@/app/actions/recruiter-profile";
import { RecruiterSettingsView } from "@/components/recruiter-profile/RecruiterSettingsView";
import { DeconnexionButton } from "./DeconnexionButton";

export const metadata = {
  title: "Mon profil | Intermeet",
  description: "Profil recruteur et paramètres du compte.",
};

export default async function ParametresPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  const role = user.user_metadata?.role as string | undefined;

  if (role === "RECRUITER") {
    const { data: profile, error } = await getRecruiterProfilePage(user.id);

    if (error || !profile) {
      return (
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="mb-4 text-2xl font-bold text-foreground">Mon profil</h1>
          <p className="text-muted-foreground">
            Impossible de charger le profil recruteur. {error}
          </p>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <RecruiterSettingsView profile={profile} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold text-foreground sm:text-3xl">
        Paramètres
      </h1>
      <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
        Paramètres utilisateur (auth, notifications, préférences).
      </div>
      <div className="mt-8">
        <DeconnexionButton />
      </div>
    </div>
  );
}
