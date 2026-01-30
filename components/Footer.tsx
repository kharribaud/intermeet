import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Intermeet. Tous droits réservés.
          </p>
          <nav className="flex items-center gap-2" aria-label="Pied de page">
            <Button variant="link" size="sm" className="text-muted-foreground" asChild>
              <Link href="/mentions-legales">Mentions légales</Link>
            </Button>
            <Separator orientation="vertical" className="h-4" />
            <Button variant="link" size="sm" className="text-muted-foreground" asChild>
              <Link href="/confidentialite">Confidentialité</Link>
            </Button>
            <Separator orientation="vertical" className="h-4" />
            <Button variant="link" size="sm" className="text-muted-foreground" asChild>
              <Link href="/contact">Contact</Link>
            </Button>
            <Separator orientation="vertical" className="h-4" />
            <Button variant="link" size="sm" className="text-muted-foreground" asChild>
              <Link href="/admin">Admin</Link>
            </Button>
          </nav>
        </div>
      </div>
    </footer>
  );
}
