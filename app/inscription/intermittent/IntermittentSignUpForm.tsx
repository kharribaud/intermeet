"use client";

import { useState } from "react";
import Link from "next/link";
import { signUpIntermittent } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function IntermittentSignUpForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setPending(true);
    const { error: err } = await signUpIntermittent(formData);
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
          placeholder="vous@exemple.com"
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
        <Label htmlFor="display_name">Nom d&apos;affichage *</Label>
        <Input
          id="display_name"
          name="display_name"
          type="text"
          placeholder="Jean Dupont"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bio">Présentation</Label>
        <Textarea
          id="bio"
          name="bio"
          rows={3}
          placeholder="Quelques mots sur votre parcours et vos compétences..."
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
          {pending ? "Création…" : "Créer mon profil intermittent"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/inscription">Retour</Link>
        </Button>
      </div>
    </form>
  );
}
