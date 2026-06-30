import { describe, expect, it } from "vitest";
import { normalizeStoreUrl, renderStoreBadge } from "./storeLinks.js";

describe("storeLinks", () => {
  it("accepts https store URLs and rejects unsafe values", () => {
    expect(normalizeStoreUrl("https://play.google.com/store/apps/details?id=org.recoveryos.app")).toBe(
      "https://play.google.com/store/apps/details?id=org.recoveryos.app",
    );
    expect(normalizeStoreUrl("http://play.google.com")).toBe("");
    expect(normalizeStoreUrl("javascript:alert(1)")).toBe("");
    expect(normalizeStoreUrl("")).toBe("");
  });

  it("renders pending markup when the store URL is unset", () => {
    const html = renderStoreBadge("google_play");
    expect(html).toContain("hero-store-item--pending");
    expect(html).toContain("Coming soon");
    expect(html).not.toContain("data-store-link");
  });
});
