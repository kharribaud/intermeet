"use client";

import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function DeconnexionButton() {
  async function handleDeconnexion() {
    await signOut();
    window.location.href = "/";
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="gap-2"
      onClick={handleDeconnexion}
    >
      <LogOut className="size-4" />
      Déconnexion
    </Button>
  );
}
