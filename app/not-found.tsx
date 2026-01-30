import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-bold text-foreground">404</h1>
      <p className="mt-2 text-muted-foreground">Cette page n’existe pas.</p>
      <Button asChild className="mt-6">
        <Link href="/">Retour à l’accueil</Link>
      </Button>
    </div>
  );
}
