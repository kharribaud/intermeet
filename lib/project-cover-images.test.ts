import { describe, expect, it } from "vitest";
import { getProjectCoverImage } from "./project-cover-images";

describe("getProjectCoverImage", () => {
  it("returns demo cover for demo projects", () => {
    const url = getProjectCoverImage({ id: "demo-1", event_type: "Salon" });
    expect(url).toContain("unsplash.com");
  });

  it("returns type-based cover for real events", () => {
    const url = getProjectCoverImage({
      id: "event-123",
      event_type: "Concert",
    });
    expect(url).toContain("unsplash.com");
  });

  it("prefers explicit cover_image_url", () => {
    const url = getProjectCoverImage({
      id: "event-123",
      event_type: "Concert",
      cover_image_url: "https://example.com/cover.jpg",
    });
    expect(url).toBe("https://example.com/cover.jpg");
  });
});
