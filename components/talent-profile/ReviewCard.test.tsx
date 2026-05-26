import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReviewCard } from "./ReviewCard";

const review = {
  id: "review-1",
  rating: 4,
  title: "Très bien",
  body: "Intermittent fiable et autonome sur le terrain.",
  event_title: "Stand Engie Vivatech 2025",
  client: "S Group",
};

describe("ReviewCard", () => {
  it("affiche la note, le titre et le contenu de l'avis", () => {
    render(<ReviewCard review={review} />);

    expect(screen.getByText("4/5")).toBeInTheDocument();
    expect(screen.getByText("Très bien")).toBeInTheDocument();
    expect(
      screen.getByText("Intermittent fiable et autonome sur le terrain.")
    ).toBeInTheDocument();
    expect(screen.getByText("Stand Engie Vivatech 2025")).toBeInTheDocument();
    expect(screen.getByText("S Group")).toBeInTheDocument();
  });
});
