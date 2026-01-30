import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Admin | Intermeet",
  description: "Interface d’administration.",
};

export default async function AdminPage() {
  const supabase = await createClient();

  const [
    { count: usersCount },
    { count: profilesCount },
    { count: jobPostsCount },
    { count: eventsCount },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("intermittent_profiles").select("*", { count: "exact", head: true }),
    supabase.from("job_posts").select("*", { count: "exact", head: true }),
    supabase.from("events").select("*", { count: "exact", head: true }),
  ]);

  const cards = [
    { label: "Utilisateurs", count: usersCount ?? 0, href: "#" },
    { label: "Profils intermittents", count: profilesCount ?? 0, href: "#" },
    { label: "Annonces", count: jobPostsCount ?? 0, href: "/annonces" },
    { label: "Événements", count: eventsCount ?? 0, href: "/events" },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold text-foreground sm:text-3xl">
        Admin
      </h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map(({ label, count, href }) => (
          <Button key={label} variant="ghost" className="h-auto p-0" asChild>
            <Link href={href}>
              <Card className="w-full transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-muted-foreground">{label}</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">{count}</p>
                </CardContent>
              </Card>
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
