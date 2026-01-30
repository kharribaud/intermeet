import type { Metadata } from "next";
import "@/app/globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Intermeet - Talents intermittents & Recruteurs",
  description:
    "Plateforme de mise en relation entre talents intermittents et recruteurs pour l'événementiel.",
  openGraph: {
    title: "Intermeet - Talents intermittents & Recruteurs",
    description:
      "Plateforme de mise en relation entre talents intermittents et recruteurs pour l'événementiel.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <Header />
        <main className="min-h-[calc(100vh-8rem)]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
