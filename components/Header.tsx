"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { User, FileText, Calendar, Building2, Settings, Menu } from "lucide-react";

const navItems = [
  { href: "/", label: "Intermittents", icon: User },
  { href: "/annonces", label: "Mes annonces", icon: FileText },
  { href: "/planning", label: "Planning", icon: Calendar },
  { href: "/entreprise", label: "Entreprise", icon: Building2 },
  { href: "/parametres", label: "Paramètres", icon: Settings },
] as const;

export function Header() {
  const pathname = usePathname();

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

        <div className="flex md:hidden">
          <Button variant="ghost" size="icon" aria-label="Menu" asChild>
            <Link href="/">
              <Menu className="size-6" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
