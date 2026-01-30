"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { User as UserIcon, FileText, Calendar, Building2, Settings, Menu, LogIn, UserPlus } from "lucide-react";

const navItems = [
  { href: "/", label: "Intermittents", icon: UserIcon },
  { href: "/annonces", label: "Mes annonces", icon: FileText },
  { href: "/planning", label: "Planning", icon: Calendar },
  { href: "/entreprise", label: "Entreprise", icon: Building2 },
  { href: "/parametres", label: "Paramètres", icon: Settings },
] as const;

export function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" size="icon" className="shrink-0" asChild>
          <Link href="/" aria-label="Intermeet Accueil">
            <Image
              src="/logo_intermeet.png"
              alt="Intermeet"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
              priority
            />
          </Link>
        </Button>

        <nav className="hidden md:flex md:items-center md:gap-1" aria-label="Navigation principale">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Button
                key={href}
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                className={isActive ? "text-primary" : ""}
                asChild
              >
                <Link href={href} className="flex items-center gap-2">
                  <Icon className="size-4" aria-hidden />
                  {label}
                </Link>
              </Button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {!loading && (
            <>
              {user ? (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/parametres" className="flex items-center gap-2">
                      <UserIcon className="size-4" />
                      <span className="hidden sm:inline">Mon compte</span>
                    </Link>
                  </Button>
                  <form action={signOut}>
                    <Button type="submit" variant="outline" size="sm">
                      Déconnexion
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/connexion" className="flex items-center gap-2">
                      <LogIn className="size-4" />
                      Connexion
                    </Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/inscription" className="flex items-center gap-2">
                      <UserPlus className="size-4" />
                      Inscription
                    </Link>
                  </Button>
                </>
              )}
            </>
          )}
          <div className="flex md:hidden">
            <Button variant="ghost" size="icon" aria-label="Menu" asChild>
              <Link href="/">
                <Menu className="size-6" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
