import { describe, expect, it } from "vitest";
import { renderPageMarkup } from "./pageMarkup.js";
import { getStoreBadgeMarkup } from "./storeLinks.js";
import { applyLastmod, sourcesForLoc } from "../scripts/sitemap-lastmod.mjs";

describe("prerendered page markup", () => {
  const { googlePlay, appStore } = getStoreBadgeMarkup({});
  const html = renderPageMarkup({ googlePlayBadge: googlePlay, appStoreBadge: appStore });

  it("carries the content crawlers need without running JavaScript", () => {
    expect(html).toContain("A note from the founder");
    expect(html).toContain('href="/story.html"');
    expect(html).toContain("https://www.facebook.com/recoveryos");
    expect(html).toContain('id="waitlist-form"');
  });

  it("never exposes a personal mailbox", () => {
    expect(html).not.toMatch(/@gmail\.com/);
    expect(html).toContain("michael@recoveryos.org");
  });

  it("renders store links from the env it is given", () => {
    const active = getStoreBadgeMarkup({ VITE_GOOGLE_PLAY_URL: "https://play.google.com/store/apps/details?id=x" });
    expect(active.googlePlay).toContain('data-store-link="google_play"');
    expect(googlePlay).toContain("Coming soon");
  });
});

describe("sitemap lastmod", () => {
  const xml = `<url>
    <loc>https://recoveryos.org/</loc>
    <lastmod>2026-06-03</lastmod>
  </url>
  <url>
    <loc>https://recoveryos.org/story.html</loc>
    <lastmod>2026-06-03</lastmod>
  </url>`;

  it("replaces dates the resolver knows and keeps the rest", () => {
    const out = applyLastmod(xml, (loc) => (loc.endsWith("/") ? "2026-10-01" : null));
    expect(out).toContain("<loc>https://recoveryos.org/</loc>\n    <lastmod>2026-10-01</lastmod>");
    expect(out).toContain("<loc>https://recoveryos.org/story.html</loc>\n    <lastmod>2026-06-03</lastmod>");
  });

  it("maps locations to the files that produce them", () => {
    expect(sourcesForLoc("https://recoveryos.org/")).toContain("src/pageMarkup.js");
    expect(sourcesForLoc("https://recoveryos.org/story.html")).toEqual(["public/story.html"]);
  });
});
