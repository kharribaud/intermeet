"use client";

import { useState } from "react";
import Link from "next/link";
import { signUpRecruiter } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function RecruteurSignUpForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setPending(true);
    const { error: err } = await signUpRecruiter(formData);
    setPending(false);
    if (err) setError(err);
  }

  return (
    <form action={handleSubmit} className="space-y-4" encType="multipart/form-data">
      <div className="space-y-2">
        <Label htmlFor="avatar">Photo de profil (optionnel)</Label>
        <Input
          id="avatar"
          name="avatar"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="cursor-pointer file:mr-2 file:cursor-pointer"
        />
        <p className="text-xs text-muted-foreground">JPG, PNG, WebP ou GIF. Max 2 Mo.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="contact@entreprise.com"
          required
          autoComplete="email"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe *</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
        />
        <p className="text-xs text-muted-foreground">Minimum 6 caractères.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="company_name">Nom de l&apos;entreprise *</Label>
        <Input
          id="company_name"
          name="company_name"
          type="text"
          placeholder="Ma Société"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="website_url">Site web</Label>
        <Input
          id="website_url"
          name="website_url"
          type="url"
          placeholder="https://..."
          autoComplete="url"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="city">Ville</Label>
        <Input id="city" name="city" type="text" placeholder="Paris" />
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="flex gap-3">
        <Button type="submit" className="flex-1" disabled={pending}>
          {pending ? "Création…" : "Créer mon compte recruteur"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/inscription">Retour</Link>
        </Button>
      </div>
    </form>
  );
}
