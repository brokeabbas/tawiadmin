import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("class name composition", () => {
  it("combines conditional class names", () => {
    expect(cn("panel", false && "hidden", { active: true })).toBe(
      "panel active"
    );
  });

  it("resolves conflicting Tailwind utilities", () => {
    expect(cn("px-2 text-sm", "px-4 text-lg")).toBe("px-4 text-lg");
  });
});
