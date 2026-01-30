import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Building2 } from "lucide-react";

export const metadata = {
  title: "Inscription | Intermeet",
  description: "Créez votre compte Intermeet en tant que recruteur ou intermittent.",
};

export default function InscriptionPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Inscription</h1>
        <p className="mt-2 text-muted-foreground">
          Choisissez le type de compte correspondant à votre profil.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader>
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-4">
                <User className="size-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-center">Intermittent</CardTitle>
            <CardDescription className="text-center">
              Vous êtes artiste, technicien ou professionnel du spectacle. Créez votre profil,
              indiquez vos compétences et recevez des propositions d&apos;événements.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link href="/inscription/intermittent">S&apos;inscrire en tant qu&apos;intermittent</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardHeader>
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-4">
                <Building2 className="size-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-center">Recruteur</CardTitle>
            <CardDescription className="text-center">
              Vous recrutez pour des événements, festivals ou sociétés. Publiez des annonces
              et trouvez les talents correspondant à vos besoins.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="secondary" asChild>
              <Link href="/inscription/recruteur">S&apos;inscrire en tant que recruteur</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Déjà un compte ?{" "}
        <Button variant="link" className="p-0 font-medium" asChild>
          <Link href="/connexion">Se connecter</Link>
        </Button>
      </p>
    </div>
  );
}
