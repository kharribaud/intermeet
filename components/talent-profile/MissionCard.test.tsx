import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MissionCard } from "./MissionCard";

const mission = {
  id: "mission-1",
  job_title: "Ingénieur du son",
  event_title: "Concert Olympia",
  skills: ["Mixage", "Régie FOH"],
  location: "Paris Expo Porte de Versailles",
  client: "S Group",
  date: "2025-03-15",
};

describe("MissionCard", () => {
  it("affiche le métier, l'événement et les métadonnées", () => {
    render(<MissionCard mission={mission} />);

    expect(screen.getByText("Ingénieur du son")).toBeInTheDocument();
    expect(screen.getByText("Concert Olympia")).toBeInTheDocument();
    expect(screen.getByText("Mixage")).toBeInTheDocument();
    expect(screen.getByText("Paris Expo Porte de Versailles")).toBeInTheDocument();
    expect(screen.getByText("S Group")).toBeInTheDocument();
  });
});
