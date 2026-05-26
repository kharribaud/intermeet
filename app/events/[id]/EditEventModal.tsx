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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Pencil } from "lucide-react";
import { updateEvent } from "@/app/actions/events";
import type { Event } from "@/types/database";

const EVENT_TYPES = [
  "Convention",
  "Séminaire",
  "Salon",
  "Festival",
  "Concert",
  "Spectacle",
  "Soirée",
  "Exposition",
  "Vernissage",
  "Conférence",
  "Conférence de presse",
  "Événement presse",
];

function toDateInput(iso: string | null) {
  if (!iso) return "";
  return iso.slice(0, 10);
}

function DateRangeFields({
  prefix,
  label,
  defaultStart,
  defaultEnd,
}: {
  prefix: string;
  label: string;
  defaultStart: string;
  defaultEnd: string;
}) {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-foreground text-base">{label}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor={`${prefix}_start`} className="font-normal text-sm text-foreground">
            Date de début
          </Label>
          <Input
            id={`${prefix}_start`}
            name={`${prefix}_start_at`}
            type="date"
            defaultValue={defaultStart}
            className="h-10 text-muted-foreground"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${prefix}_end`} className="font-normal text-sm text-foreground">
            Date de fin
          </Label>
          <Input
            id={`${prefix}_end`}
            name={`${prefix}_end_at`}
            type="date"
            defaultValue={defaultEnd}
            className="h-10 text-muted-foreground"
          />
        </div>
      </div>
    </div>
  );
}

interface Props {
  event: Event;
}

export function EditEventModal({ event }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [eventType, setEventType] = useState(event.event_type ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleOpenChange(val: boolean) {
    setOpen(val);
    if (!val) {
      setError(null);
      setEventType(event.event_type ?? "");
    }
  }

  async function handleSubmit(formData: FormData) {
    formData.set("event_type", eventType);
    const result = await updateEvent(event.id, formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl p-6 md:p-8">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-bold">Modifier l&apos;événement</DialogTitle>
        </DialogHeader>

        <form
          action={(formData) => startTransition(() => handleSubmit(formData))}
          className="space-y-6 mt-2"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <div className="space-y-2">
              <Label htmlFor="title" className="font-normal text-sm text-foreground">
                Nom de l&apos;événement
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="Nom de l'événement"
                required
                defaultValue={event.title}
                className="h-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <div className="space-y-2">
              <Label htmlFor="event_type" className="font-normal text-sm text-foreground">
                Type d&apos;événement
              </Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger id="event_type" className="h-10 text-muted-foreground">
                  <SelectValue placeholder="Stand, séminaire, festival, etc." />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-normal text-sm text-foreground">
              Description de l&apos;événement
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Décrivez l'événement"
              rows={4}
              defaultValue={event.description ?? ""}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <div className="space-y-2">
              <Label htmlFor="address" className="font-normal text-sm text-foreground">
                Adresse
              </Label>
              <Input
                id="address"
                name="address"
                placeholder="Adresse du lieu de l'événement"
                defaultValue={event.address ?? ""}
                className="h-10"
              />
            </div>
          </div>

          <DateRangeFields
            prefix="setup"
            label="Montage"
            defaultStart={toDateInput(event.setup_start_at)}
            defaultEnd={toDateInput(event.setup_end_at)}
          />
          <DateRangeFields
            prefix="teardown"
            label="Démontage"
            defaultStart={toDateInput(event.teardown_start_at)}
            defaultEnd={toDateInput(event.teardown_end_at)}
          />

          <div className="space-y-4">
            <h3 className="font-bold text-foreground text-base">Exploitation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="start_at" className="font-normal text-sm text-foreground">
                  Date de début
                </Label>
                <Input
                  id="start_at"
                  name="start_at"
                  type="date"
                  required
                  defaultValue={toDateInput(event.start_at)}
                  className="h-10 text-muted-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_at" className="font-normal text-sm text-foreground">
                  Date de fin
                </Label>
                <Input
                  id="end_at"
                  name="end_at"
                  type="date"
                  required
                  defaultValue={toDateInput(event.end_at)}
                  className="h-10 text-muted-foreground"
                />
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="pt-2">
            <Button
              type="submit"
              className="w-auto px-6 bg-[#eb7a41] hover:bg-[#d66e3a] text-white font-medium"
              disabled={pending}
            >
              {pending ? "Enregistrement…" : "Enregistrer les modifications"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
