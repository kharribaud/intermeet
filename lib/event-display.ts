export type EventStatusLabel = "En cours" | "Annulé" | "Terminé" | "Complet";

export function getEventStatusBadge(event: {
  status: string | null;
  start_at: string;
  end_at: string;
}): { label: EventStatusLabel; className: string } {
  if (event.status === "CANCELLED") {
    return {
      label: "Annulé",
      className:
        "bg-red-100 text-red-700 border-transparent hover:bg-red-100 font-medium",
    };
  }

  const now = new Date();
  const start = new Date(event.start_at);
  const end = new Date(event.end_at);

  if (now > end) {
    return {
      label: "Terminé",
      className:
        "bg-muted text-muted-foreground border-transparent hover:bg-muted font-medium",
    };
  }

  if (now >= start && now <= end) {
    return {
      label: "En cours",
      className:
        "bg-secondary text-secondary-foreground border-transparent hover:bg-secondary font-medium",
    };
  }

  return {
    label: "Complet",
    className:
      "bg-[#eb7a41] text-white border-transparent hover:bg-[#d66e3a] font-medium",
  };
}
