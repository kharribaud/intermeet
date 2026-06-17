"use client";

import { useState } from "react";
import { createEvent } from "@/app/actions/events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

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

function DateRangeFields({ prefix, label }: { prefix: string; label: string }) {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-foreground text-base">{label}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor={`${prefix}_start`} className="font-normal text-sm text-foreground">Date de début</Label>
          <Input id={`${prefix}_start`} name={`${prefix}_start_at`} type="date" className="h-10 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${prefix}_end`} className="font-normal text-sm text-foreground">Date de fin</Label>
          <Input id={`${prefix}_end`} name={`${prefix}_end_at`} type="date" className="h-10 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}

function EventFormContent({ onClose }: { onClose: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [eventType, setEventType] = useState<string>("");

  async function handleSubmit(formData: FormData) {
    formData.set("event_type", eventType);
    setError(null);
    setPending(true);
    const { error: err } = await createEvent(formData);
    setPending(false);
    if (err) setError(err);
  }

  return (
    <form action={handleSubmit} className="space-y-6 mt-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div className="space-y-2">
          <Label htmlFor="title" className="font-normal text-sm text-foreground">Nom de l'événement</Label>
          <Input id="title" name="title" placeholder="Nom de l'événement" required className="h-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div className="space-y-2">
          <Label htmlFor="event_type" className="font-normal text-sm text-foreground">Type d'événement</Label>
          <Select value={eventType} onValueChange={setEventType}>
            <SelectTrigger id="event_type" className="h-10 text-muted-foreground">
              <SelectValue placeholder="Stand, séminaire, festival, etc." />
            </SelectTrigger>
            <SelectContent>
              {EVENT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="font-normal text-sm text-foreground">Description de l'événement</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Décrivez l'événement"
          rows={4}
          className="resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div className="space-y-2">
          <Label htmlFor="address" className="font-normal text-sm text-foreground">Adresse</Label>
          <Input id="address" name="address" placeholder="Adresse du lieu de l'événement" className="h-10" />
        </div>
      </div>

      <DateRangeFields prefix="setup" label="Montage" />
      <DateRangeFields prefix="teardown" label="Démontage" />

      <div className="space-y-4">
        <h3 className="font-bold text-foreground text-base">Exploitation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="start_at" className="font-normal text-sm text-foreground">Date de début</Label>
            <Input id="start_at" name="start_at" type="date" required className="h-10 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_at" className="font-normal text-sm text-foreground">Date de fin</Label>
            <Input id="end_at" name="end_at" type="date" required className="h-10 text-muted-foreground" />
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="pt-2">
        <Button type="submit" className="w-auto px-6 bg-[#eb7a41] hover:bg-[#d66e3a] text-white font-medium" disabled={pending}>
          {pending ? "Création…" : "Créer un événement"}
        </Button>
      </div>
    </form>
  );
}

export function EventForm() {
  return <EventFormContent onClose={() => {}} />;
}

export function AddEventModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-[#eb7a41] hover:bg-[#d66e3a] text-white">
        <Plus className="size-4 mr-2" />
        Ajouter un événement
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl p-6 md:p-8">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-bold">Créer un événement</DialogTitle>
          </DialogHeader>
          <EventFormContent onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
