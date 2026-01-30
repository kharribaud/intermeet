import Link from "next/link";
import { RecruteurSignUpForm } from "./RecruteurSignUpForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Inscription recruteur | Intermeet",
  description: "Créez votre compte recruteur Intermeet.",
};

export default function InscriptionRecruteurPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/inscription" className="hover:text-foreground">
          Inscription
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Recruteur</span>
      </nav>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Inscription recruteur</CardTitle>
          <CardDescription>
            Renseignez les informations de votre entreprise pour créer votre compte.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecruteurSignUpForm />
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Button variant="link" className="p-0" asChild>
          <Link href="/connexion">Déjà un compte ? Se connecter</Link>
        </Button>
      </p>
    </div>
  );
}
