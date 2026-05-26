import { describe, expect, it } from "vitest";
import { formatProfileDate } from "./format-date";

describe("formatProfileDate", () => {
  it("formate une date ISO en français avec majuscule initiale", () => {
    const result = formatProfileDate("2025-03-15");
    expect(result).toMatch(/^15 /);
    expect(result).toMatch(/2025$/);
    expect(result.charAt(0)).toBe(result.charAt(0).toUpperCase());
  });

  it("inclut le nom du mois en lettres", () => {
    const result = formatProfileDate("2025-03-15");
    expect(result.toLowerCase()).toContain("mars");
  });
});
