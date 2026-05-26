import { describe, expect, it } from "vitest";
import {
  DEMO_MISSIONS_PREVIEW,
  DEMO_MISSIONS_TOTAL,
  DEMO_REVIEWS_PREVIEW,
  DEMO_REVIEWS_TOTAL,
  buildDemoMissions,
  buildDemoReviews,
} from "./talent-demo";

describe("buildDemoMissions", () => {
  it("génère le nombre demandé de missions avec des identifiants uniques", () => {
    const missions = buildDemoMissions(5);
    expect(missions).toHaveLength(5);
    expect(new Set(missions.map((m) => m.id)).size).toBe(5);
  });

  it("utilise 42 missions par défaut", () => {
    expect(buildDemoMissions()).toHaveLength(DEMO_MISSIONS_TOTAL);
  });

  it("inclut les compétences attendues sur chaque mission", () => {
    const mission = buildDemoMissions(1)[0];
    expect(mission.skills).toContain("Mixage");
    expect(mission.skills).toContain("Travail d'équipe");
  });
});

describe("buildDemoReviews", () => {
  it("génère le nombre demandé d'avis", () => {
    expect(buildDemoReviews(10)).toHaveLength(10);
  });

  it("utilise 27 avis par défaut", () => {
    expect(buildDemoReviews()).toHaveLength(DEMO_REVIEWS_TOTAL);
  });

  it("cycle sur les modèles d'avis", () => {
    const reviews = buildDemoReviews(6);
    expect(reviews[0].title).toBe(reviews[5].title);
  });
});

describe("previews", () => {
  it("expose des aperçus de taille fixe", () => {
    expect(DEMO_MISSIONS_PREVIEW).toHaveLength(4);
    expect(DEMO_REVIEWS_PREVIEW).toHaveLength(3);
  });
});
