import { Suspense } from "react";
import Link from "next/link";
import { ConnexionForm } from "./ConnexionForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Connexion | Intermeet",
  description: "Connectez-vous à votre compte Intermeet.",
};

export default function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-12">
      <Card>
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Connexion</CardTitle>
          <CardDescription>
            <Suspense fallback={null}>
              <Message searchParams={searchParams} />
            </Suspense>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ConnexionForm />
          <p className="text-center text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <Button variant="link" className="p-0 font-medium" asChild>
              <Link href="/inscription">S&apos;inscrire</Link>
            </Button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

async function Message({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;
  if (!message) return <>Connectez-vous avec votre email et mot de passe.</>;
  return <span className="text-primary">{message}</span>;
}
