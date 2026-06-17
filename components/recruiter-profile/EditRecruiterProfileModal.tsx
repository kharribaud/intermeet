"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Pencil } from "lucide-react";
import { updateRecruiterProfile } from "@/app/actions/recruiter-profile";
import type { RecruiterProfilePageData } from "@/lib/recruiter-profile";

interface EditRecruiterProfileModalProps {
  profile: RecruiterProfilePageData;
}

export function EditRecruiterProfileModal({ profile }: EditRecruiterProfileModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) setError(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await updateRecruiterProfile({
        company_name: (formData.get("company_name") as string) ?? "",
        tagline: (formData.get("tagline") as string) ?? "",
        bio: (formData.get("bio") as string) ?? "",
        city: (formData.get("city") as string) ?? "",
        website_url: (formData.get("website_url") as string) ?? "",
        founded_year: Number(formData.get("founded_year")),
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0 self-end sm:self-auto"
          aria-label="Modifier le profil"
        >
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Modifier le profil</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company_name">Nom de l&apos;entreprise</Label>
            <Input
              id="company_name"
              name="company_name"
              defaultValue={profile.company_name}
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagline">Accroche</Label>
            <Input
              id="tagline"
              name="tagline"
              defaultValue={profile.tagline}
              placeholder="Prestataire technique en événementiel"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Présentation</Label>
            <Textarea
              id="bio"
              name="bio"
              defaultValue={profile.bio}
              rows={5}
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Localisation</Label>
            <Input
              id="city"
              name="city"
              defaultValue={profile.locations}
              placeholder="Alès, Gard / Paris, Île-de-France"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website_url">Site web</Label>
            <Input
              id="website_url"
              name="website_url"
              type="url"
              defaultValue={profile.website_url ?? ""}
              placeholder="https://www.example.com"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="founded_year">Année de création</Label>
            <Input
              id="founded_year"
              name="founded_year"
              type="number"
              min={1800}
              max={new Date().getFullYear()}
              defaultValue={profile.founded_year}
              required
              disabled={isPending}
            />
          </div>

          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
