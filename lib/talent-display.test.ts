import { describe, expect, it } from "vitest";
import { getInitials } from "./talent-display";

describe("getInitials", () => {
  it("retourne les initiales d'un nom complet", () => {
    expect(getInitials("Cédric Narolle")).toBe("CN");
  });

  it("limite à deux caractères", () => {
    expect(getInitials("Jean Pierre Paul Martin")).toBe("JP");
  });

  it("gère les espaces superflus", () => {
    expect(getInitials("  test  ")).toBe("T");
  });

  it("retourne une chaîne vide pour un nom vide", () => {
    expect(getInitials("   ")).toBe("");
  });
});
