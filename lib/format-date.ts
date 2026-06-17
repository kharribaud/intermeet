export function formatProfileDate(isoDate: string): string {
  const formatted = new Date(isoDate).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatDateRange(
  start: string | null,
  end: string | null
): string | null {
  if (!start || !end) return null;

  const format = (date: string) =>
    new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return `${format(start)} - ${format(end)}`;
}
