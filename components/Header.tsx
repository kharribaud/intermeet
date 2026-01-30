"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { getCurrentUserAvatar } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon, Handshake, Briefcase, Calendar, Building2, Menu, LogIn, UserPlus } from "lucide-react";

const navItems = [
  { href: "/", label: "Talents", icon: Handshake },
  { href: "/events", label: "Mes événements", icon: Briefcase },
  { href: "/planning", label: "Planning", icon: Calendar },
  { href: "/entreprise", label: "Entreprise", icon: Building2 },
] as const;

export function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
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

  useEffect(() => {
    if (!user?.id) {
      setAvatarUrl(null);
      return;
    }
    getCurrentUserAvatar().then(setAvatarUrl);
  }, [user?.id]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-sm">
      <div className="flex h-16 w-full items-center justify-between">
        <div className="flex shrink-0 items-center pl-3 sm:pl-4">
          <Link
            href="/"
            aria-label="Intermeet Accueil"
            className="flex items-center p-0 min-w-0"
          >
            <Image
              src="/logo_intermeet.png"
              alt="Intermeet"
              width={40}
              height={40}
              className="h-10 w-10 object-contain block"
              priority
            />
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end gap-1 pr-4 sm:pr-6 lg:pr-8">
          {user && (
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
          )}

          <div className={`flex items-center gap-2 ${user ? "ml-4 sm:ml-6" : ""}`}>
          {!loading && (
            <>
              {user ? (
                <>
                  <Button variant="ghost" size="icon" className="rounded-full" asChild>
                    <Link href="/parametres" aria-label="Mon compte">
                      <Avatar className="size-8 ring-2 ring-border">
                        <AvatarImage src={avatarUrl ?? undefined} alt="" />
                        <AvatarFallback className="bg-muted text-muted-foreground">
                          <UserIcon className="size-4" />
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                  </Button>
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
      </div>
    </header>
  );
}
