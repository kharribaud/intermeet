"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus } from "lucide-react";
import { createMissionForEvent } from "@/app/actions/job-posts";

const JOB_TYPES = [
  "Technicien son",
  "Technicien lumière",
  "Régisseur",
  "Rigger",
  "Road",
  "Technicien structure",
  "Chef de chantier",
  "Cadreur",
  "Opérateur caméra tourelle",
  "Technicien vidéo",
  "Assistant son",
  "Assistant lumière",
  "Assistant vidéo",
  "Assistant structure",
  "Technicien électricien",
  "Chauffeur PL",
  "Conducteur de nacelle",
];

interface Props {
  eventId: string;
  eventTitle: string;
  eventStartAt: string;
  eventEndAt: string;
  variant?: "default" | "outline";
}

export function CreateMissionModal({ eventId, eventTitle, eventStartAt, eventEndAt, variant = "default" }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [jobType, setJobType] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  // Format YYYY-MM-DD for input[type=date] default values
  const toDateInput = (iso: string) => iso.slice(0, 10);

  function handleOpenChange(val: boolean) {
    setOpen(val);
    if (!val) {
      setJobType("");
      setError(null);
      formRef.current?.reset();
    }
  }

  async function handleSubmit(formData: FormData) {
    formData.set("title", jobType);
    formData.set("event_id", eventId);
    const result = await createMissionForEvent(formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    setOpen(false);
    setJobType("");
    setError(null);
    formRef.current?.reset();
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {variant === "outline" ? (
          <Button size="sm" variant="outline" className="shrink-0 rounded-full h-8 px-4 text-xs">
            Créer une mission
          </Button>
        ) : (
          <Button className="bg-[#eb7a41] hover:bg-[#d66e3a] text-white gap-1.5">
            <Plus className="h-4 w-4" />
            Créer une mission
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Créer une mission pour l&apos;événement {eventTitle}
          </DialogTitle>
        </DialogHeader>

        <form
          ref={formRef}
          action={(formData) => startTransition(() => handleSubmit(formData))}
          className="space-y-5 mt-2"
        >
          {/* Type de poste */}
          <div className="space-y-2">
            <Label htmlFor="job_type" className="font-normal text-sm">
              Type de poste
            </Label>
            <Select value={jobType} onValueChange={setJobType} required>
              <SelectTrigger id="job_type" className="h-10">
                <SelectValue placeholder="Sélectionner un poste" />
              </SelectTrigger>
              <SelectContent>
                {JOB_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="start_at" className="font-normal text-sm">
                Date de début
              </Label>
              <Input
                id="start_at"
                name="start_at"
                type="date"
                required
                defaultValue={toDateInput(eventStartAt)}
                className="h-10 text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_at" className="font-normal text-sm">
                Date de fin
              </Label>
              <Input
                id="end_at"
                name="end_at"
                type="date"
                required
                defaultValue={toDateInput(eventEndAt)}
                className="h-10 text-foreground"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="font-normal text-sm">
              Description du poste
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Décrivez les missions du poste, le contenu, les responsabilités, etc."
              rows={4}
              className="resize-none"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <Button
              type="submit"
              className="bg-[#eb7a41] hover:bg-[#d66e3a] text-white px-6"
              disabled={pending || !jobType}
            >
              {pending ? "Création…" : "Créer une mission"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
