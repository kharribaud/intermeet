import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Mot de passe oublié | Intermeet",
  description: "Réinitialisez votre mot de passe.",
};

export default function MotDePasseOubliePage() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col justify-center px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Mot de passe oublié</CardTitle>
          <CardDescription>
            Cette fonctionnalité sera bientôt disponible. En attendant, contactez le support ou
            utilisez la réinitialisation depuis le tableau de bord Supabase (Auth).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/connexion">Retour à la connexion</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
