import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("fusionne les classes Tailwind en résolvant les conflits", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("ignore les valeurs falsy", () => {
    expect(cn("base", false && "hidden", undefined, "end")).toBe("base end");
  });
});
