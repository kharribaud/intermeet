import Link from "next/link";
import { IntermittentSignUpForm } from "./IntermittentSignUpForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Inscription intermittent | Intermeet",
  description: "Créez votre profil intermittent Intermeet.",
};

export default function InscriptionIntermittentPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/inscription" className="hover:text-foreground">
          Inscription
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Intermittent</span>
      </nav>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Inscription intermittent</CardTitle>
          <CardDescription>
            Créez votre profil pour être visible auprès des recruteurs et recevoir des propositions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <IntermittentSignUpForm />
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
