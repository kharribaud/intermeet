"use client";

import { useRouter } from "next/navigation";
import { deleteEvent } from "@/app/actions/events";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface Props {
  id: string;
}

export function DeleteEventButton({ id }: Props) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Supprimer cet événement et toutes ses missions ?")) return;
    const { error } = await deleteEvent(id);
    if (error) {
      alert(error);
      return;
    }
    router.push("/events");
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 gap-2"
      onClick={handleDelete}
    >
      <Trash2 className="h-4 w-4" />
      Supprimer l&apos;événement
    </Button>
  );
}
