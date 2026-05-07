import { describe, it, expect } from "vitest";
import { validateEmail } from "./waitlist.js";

describe("validateEmail", () => {
  it("rejects empty", () => {
    expect(validateEmail("").ok).toBe(false);
  });

  it("rejects invalid format", () => {
    expect(validateEmail("not-an-email").ok).toBe(false);
  });

  it("normalizes case", () => {
    const r = validateEmail(" Test@Example.COM ");
    expect(r.ok).toBe(true);
    expect(r.normalized).toBe("test@example.com");
  });
});
