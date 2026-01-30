import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb } from "lucide-react";

/**
 * Bannière "Suggestions intelligentes" sur la page Talents recommandés
 */
export function SmartSuggestionsBanner() {
  return (
    <Alert className="rounded-xl bg-muted">
      <Lightbulb className="size-5 text-primary" />
      <AlertTitle>Suggestions intelligentes</AlertTitle>
      <AlertDescription>
        Ces profils sont recommandés en fonction de vos annonces actives et de vos événements à venir.
        Les talents affichés sont disponibles aux dates de vos événements.
      </AlertDescription>
    </Alert>
  );
}
