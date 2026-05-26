import { describe, expect, it } from "vitest";
import { buildSkillGroups, DEFAULT_SKILL_GROUPS } from "./talent-skills";

describe("buildSkillGroups", () => {
  it("retourne les groupes par défaut si aucune compétence", () => {
    expect(buildSkillGroups([])).toEqual(DEFAULT_SKILL_GROUPS);
  });

  it("classe les compétences logicielles", () => {
    const groups = buildSkillGroups([
      { name: "Grand MA2", category: "Logiciel" },
    ]);
    expect(groups.software).toContain("Grand MA2");
    expect(groups.technical.length).toBeGreaterThan(0);
  });

  it("classe les habilitations et certifications", () => {
    const groups = buildSkillGroups([
      { name: "Permis PL", category: "Permis" },
    ]);
    expect(groups.certifications).toContain("Permis PL");
  });

  it("place les compétences sans catégorie en techniques", () => {
    const groups = buildSkillGroups([{ name: "Mixage", category: null }]);
    expect(groups.technical).toContain("Mixage");
  });
});
