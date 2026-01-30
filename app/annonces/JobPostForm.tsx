"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createJobPost, updateJobPost } from "@/app/actions/job-posts";
import type { JobPost } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface JobPostFormProps {
  className?: string;
  jobPost?: JobPost | null;
}

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Brouillon" },
  { value: "PUBLISHED", label: "Publié" },
  { value: "PAUSED", label: "En pause" },
  { value: "CLOSED", label: "Fermé" },
] as const;

export function JobPostForm({ className, jobPost }: JobPostFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<string>(jobPost?.status ?? "DRAFT");
  const isEdit = !!jobPost?.id;

  async function handleSubmit(formData: FormData) {
    setError(null);
    setPending(true);
    formData.set("status", status);
    try {
      if (isEdit && jobPost) {
        const { error: err } = await updateJobPost(jobPost.id, formData);
        if (err) {
          setError(err);
          return;
        }
        router.push(`/annonces/${jobPost.id}`);
        router.refresh();
        return;
      }
      const { data, error: err } = await createJobPost(formData);
      if (err) {
        setError(err);
        return;
      }
      if (data?.id) {
        router.push(`/annonces/${data.id}`);
        router.refresh();
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={handleSubmit} className={cn("space-y-6", className)}>
      {isEdit && (
        <input type="hidden" name="id" value={jobPost.id} readOnly aria-hidden />
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Titre *</Label>
        <Input
          id="title"
          name="title"
          required
          defaultValue={jobPost?.title}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={jobPost?.description ?? ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="city">Ville</Label>
        <Input id="city" name="city" type="text" defaultValue={jobPost?.city ?? ""} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="start_at">Date de début *</Label>
          <Input
            id="start_at"
            name="start_at"
            type="datetime-local"
            required
            defaultValue={
              jobPost?.start_at
                ? new Date(jobPost.start_at).toISOString().slice(0, 16)
                : ""
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_at">Date de fin *</Label>
          <Input
            id="end_at"
            name="end_at"
            type="datetime-local"
            required
            defaultValue={
              jobPost?.end_at
                ? new Date(jobPost.end_at).toISOString().slice(0, 16)
                : ""
            }
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="required_count">Nombre de postes</Label>
          <Input
            id="required_count"
            name="required_count"
            type="number"
            min={1}
            defaultValue={jobPost?.required_count ?? 1}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pay_amount">Rémunération (€)</Label>
          <Input
            id="pay_amount"
            name="pay_amount"
            type="number"
            step="0.01"
            min={0}
            defaultValue={jobPost?.pay_amount ?? ""}
          />
        </div>
      </div>

      {isEdit && (
        <div className="space-y-2">
          <Label>Statut</Label>
          <Select name="status" value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Envoi…" : isEdit ? "Enregistrer" : "Créer l'annonce"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/annonces">Annuler</Link>
        </Button>
      </div>
    </form>
  );
}
