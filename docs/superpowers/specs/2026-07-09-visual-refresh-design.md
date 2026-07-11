# Visual refresh: aurora, editorial type, and a shared token layer

Date: 2026-07-09
Revised: 2026-07-10 (background/layout direction reconsidered and re-approved, see "Revision" section)
Status: Approved, ready for implementation planning

## Problem

The site (all 6 HTML surfaces: homepage, `story.html`, `ai-info.html`, the blog post, and two legal pages) reads as templated and dated:

- The hero/section backgrounds are the same flat radial-gradient-blob treatment that was everywhere on SaaS landing pages circa 2019-2023.
- Type is Inter throughout, the default font on a huge share of AI-generated and templated sites.
- Nearly every content block uses the identical visual treatment (dark card, 1px border, ~0.85rem radius), regardless of whether the content is a data grid or a personal story. Nothing is told apart from anything else.
- The five non-homepage pages each carry their own copy-pasted `<style>` block, already drifted slightly out of sync with each other and with the homepage, and the legal pages in particular are flat black-and-white with no brand color at all.

## Design process (original pass, 2026-07-09)

Explored via the brainstorming visual companion (`.superpowers/brainstorm/469-1783612215/`). Key decisions, in order:

1. **Emotional target: warm and human** (chosen over calm/safe, serious/credible, hopeful momentum).
2. **Background: refined aurora**, evolving the gradient-mesh idea rather than photography, a founder-portrait hero, or hand-drawn organic linework (all three mocked up and rejected).
3. **Warm glow confirmed**: amber blended with the existing teal/blue, not a pure cool palette.
4. **Typography: Fraunces (display) + Manrope (body)**, replacing Inter.
5. **Scope: whole site in one pass**, not homepage-first.
6. **Motion: subtle ambient drift**, gated behind `prefers-reduced-motion`.
7. At this stage, the aurora was scoped to two isolated "moments" (hero, founder note) with cards kept everywhere else, and a fixed full-page aurora with frosted-glass panels sitewide was prototyped and rejected as generic glassmorphism.

Tasks 1-3 of the original implementation plan (token stylesheet, homepage font/color token wiring, and a bounded `.aurora-surface` panel applied to the hero) were built and committed against this version. **Task 3's hero treatment is superseded by the revision below** and needs to change from a bounded panel to a no-box treatment sitting on a continuous background; the token layer and typography from Tasks 1-2 are unaffected and stay as built.

## Revision (2026-07-10): continuous background, per-section treatment, expanded scope

Reopened via a fresh visual-companion session (`.superpowers/brainstorm/1339-1783670838/`) after seeing the isolated-moments treatment live. Three things changed:

1. **The aurora becomes the homepage's continuous background**, not two bounded panels. Sections no longer opt into an aurora "moment"; instead every section picks one of three treatments against the same always-present background, chosen by content type, not by section importance:
   - **No box**: plain text directly on the aurora, separated by spacing/a hairline rule only. For narrative/persuasive prose that doesn't need containment.
   - **Frosted glass**: a translucent, blurred panel (the aurora shows through faintly). Reserved for a small number of genuine "moments," not applied broadly (this is exactly what was rejected on 2026-07-09 when applied to *every* section; it's approved now because it's applied selectively).
   - **Solid card**: fully opaque, hides the aurora behind it. For comparable/tabular/data-dense content that needs a stable, high-contrast reading surface.
2. **Legal pages get color, and every non-homepage page gets its own background identity** rather than a uniform token swap:
   - **Story page**: a warm/amber-dominant continuous background (color-shifted from the homepage's teal/blue-dominant one, so it reads as its own space), no boxes in the essay itself, and exactly one frosted-glass element (the existing "brief version" synopsis callout near the top).
   - **Legal pages (privacy policy, terms of service) + auxiliary pages (`ai-info.html`, the blog post)**: "zoned rhythm." The aurora is visible in 1-2 bands (e.g. behind the page header) and dims to a solid dark tone in between, still no boxes, still using the shared type/color tokens. This replaces the "light theme stays as-is, tokens only" plan from 2026-07-09 (see "Rejected directions" below for why that was superseded, not just re-derived from nothing).
3. **Two homepage sections merged, one removed, one form field group removed:**
   - The old screenshot gallery, the Free/Pro comparison, and the Pro-highlight upsell section collapse into **one new combined section**: "What's included" (Free vs Pro, no-box, plain list) on the left, a Steam-store-style screenshot viewer (one frosted/bordered container: large main image, clickable thumbnail strip, auto-advance every 4s that resets on manual interaction, click-to-zoom on the main image) on the right. Stacks vertically on narrow viewports, viewer above the text.
   - The Pro-highlight section (separate upsell CTA block) is removed entirely; its content is superseded by the combined section above.
   - The waitlist form's "What interests you most?" checkbox group is removed. The form becomes email + submit only (the honeypot field is unaffected, it's not user-visible).

### Updated homepage section-by-section treatment map

| Section | Treatment |
|---|---|
| Hero | No box |
| "The real problem" | No box |
| Feature grid (3 cards) | Solid |
| Founder note | Frosted glass |
| **What's included + screenshot viewer** (new, replaces gallery/compare/pro-highlight) | No box (text) + one frosted container (viewer) |
| Professionals | No box |
| Roadmap grid | Solid |
| Privacy & trust | No box |
| Waitlist (simplified, no checkboxes) | Frosted glass |

## Rejected directions (do not re-litigate without new input)

- Full-bleed documentary/stock photography in the hero.
- A large founder-portrait treatment as the primary hero visual.
- Hand-drawn organic linework / illustration as the background system.
- A pure cool (teal/blue only) aurora with no warm accent.
- A single confident sans-serif system (no display serif).
- Soft/rounded type (Quicksand-style): read as too consumer-app/young for a clinically-grounded product.
- Sans + monospace technical-accent pairing.
- **Frosted glass applied to every section with no exceptions** (the 2026-07-09 "windows" prototype): rejected then, and still rejected now. The 2026-07-10 revision does NOT reintroduce this: it applies frosted glass to a small, deliberate subset of sections (founder note, the screenshot viewer, the waitlist) while keeping solid cards for data-dense content and no-box for plain prose. The distinction that matters: *selective, content-driven* glass vs. *universal, decorative* glass.
- **Isolated two-moment aurora with solid cards everywhere else** (the original 2026-07-09 approach, and what Task 3 actually built): superseded by the continuous-background + three-way-treatment system above. Not a rejection of the aurora itself, a rejection of scoping it to only 2 bounded panels.
- **"Zoned rhythm" was considered as one of four full-page background options (alongside continuous-no-box, continuous-frosted, and the isolated-moments baseline) and picked specifically for legal/auxiliary pages**, not the homepage. Those get the continuous treatment described above instead.

## Technical spec

### 1. Token layer (built, Task 1; unchanged by this revision)

`public/brand/theme.css` defines color/font/grain tokens as CSS custom properties, linked by every HTML surface. See the file itself for the current values (`--bg-base`, `--accent-teal`, `--accent-teal-soft`, `--accent-blue`, `--accent-warm`, `--accent-teal-rgb`, `--accent-blue-rgb`, `--accent-warm-rgb`, `--font-display`, `--font-body`, `--grain-svg`).

### 2. Homepage: continuous aurora background (revises Task 3)

Replace the bounded `.aurora-surface` panel approach with a fixed, full-viewport aurora layer behind the entire homepage:

- A `position: fixed; inset: 0; z-index: 0` element (or a `body::before`), holding the same warm/teal/blue radial-gradient stack + grain overlay + slow drift animation already built in Task 1-3, just no longer scoped to a bounded, rounded-corner box.
- All page content sits in a wrapper at `z-index: 1` or higher above it.
- `prefers-reduced-motion: reduce` still disables the drift, same as today.

Three new/adjusted utility treatments, applied per the section map above:

- **No-box** (new): no background, no border; separation comes from padding/margin and a subtle `border-bottom: 1px solid rgba(255,255,255,0.06)` between sections, validated in `background-revisit.html` mode A.
- **Frosted** (new): `background: rgba(6,13,22,0.6); backdrop-filter: blur(16-18px) saturate(1.1); border: 1px solid rgba(255,255,255,0.07); box-shadow: 0 20px 60px rgba(0,0,0,0.3)`. Used for founder note, the screenshot-viewer container, and the waitlist.
- **Solid** (revises the existing card components, Task 5): unchanged in spirit from the original spec, opaque background fully occluding the aurora behind it. Used for the feature grid and roadmap grid.

Hero specifically: drop the rounded-panel/padding treatment Task 3 added (`.aurora-surface` class, `.hero { padding: ... }`); the hero becomes a no-box section like "the real problem," sitting directly on the continuous background.

### 3. Founder note (Task 4; unchanged by this revision)

As originally specced: drop the card box, ~140px portrait, larger serif blockquote with left-accent border, generous whitespace. Now uses the frosted treatment (translucent panel) rather than the old bounded `.aurora-surface`, but the internal layout/typography changes are the same as already planned.

### 4. New: "What's included" + Steam-style screenshot viewer (replaces the old gallery, compare section, and Pro-highlight)

Validated interactively in `included-gallery.html`. Two-column layout (stacks on narrow viewports, viewer first):

- **Left, no-box**: the Free/Pro comparison content, as plain headed lists (no card, no grid).
- **Right, one frosted container**: a large main image (`aspect-ratio: 16/11`, `object-fit: cover`, `cursor: zoom-in`), a horizontal thumbnail strip below it (active thumbnail gets a teal border + full opacity, inactive thumbnails dimmed), a caption line naming the current screenshot. Behavior:
  - Clicking a thumbnail swaps the main image (with a brief cross-fade) and updates the caption.
  - Auto-advance every 4 seconds to the next thumbnail, looping; any manual thumbnail click resets the auto-advance timer.
  - Clicking the main image opens a full-screen zoom overlay (dark backdrop, image at up to 90vw/88vh, click anywhere or a close button to dismiss). This can reuse the pan/zoom logic already in `initScreenshotLightbox()` in `src/main.js` rather than building new zoom code from scratch.
  - No progress bar (removed after review; it read as unnecessary chrome).

This section absorbs the six existing screenshots (`Workbook.png`, `Spark.png`, `Calendar.png`, `Mood_Challenges.png`, `Backup_report.png`, `Settings.png`) and the existing Free/Pro copy from `main.js`. The Pro-highlight section (`#pro`, `.pro-highlight`) is deleted outright, along with its CSS.

### 5. Waitlist form simplification

Remove the `.waitlist-interests` block (the "What interests you most?" checkbox group: daily-structure, craving-management, progress-tracking, community) from `src/main.js`. The form keeps the honeypot field, email input, and submit button.

`src/waitlist.js`'s `joinWaitlist(email, interests = [])` already defaults `interests` to an empty array and only writes an `interests` field to Firestore when it's non-empty (`...(interests.length ? { interests } : {})`). No change needed to `waitlist.js` itself: the submit handler in `src/main.js` should just stop querying `input[name="interests"]:checked` and call `joinWaitlist(email)` with no second argument.

### 6. Story page (revises the "token swap only" plan for `story.html`)

Not just a font/color token swap anymore:

- A warm/amber-dominant continuous aurora background (color-shifted from the homepage's teal/blue-dominant one), validated in `story-page-treatment.html`.
- No boxes anywhere in the essay itself, plain flowing prose on the background.
- Exactly one frosted-glass element: the existing "brief version" synopsis callout near the top of the page, converted from its current solid `.brief-block` styling to the frosted treatment.
- Still links `theme.css` and uses `var(--font-display)`/`var(--font-body)` as originally specced.

### 7. Legal + auxiliary pages: "zoned rhythm" (revises the "token swap only, light theme unchanged" plan)

Applies to `public/legal/privacy-policy.html`, `public/legal/terms-of-service.html`, `public/ai-info.html`, and `public/blog/recoveryos-development-update-2026-07.html`. Validated conceptually in `background-revisit.html` mode C (still needs a pass against each page's actual real content before implementation, per the plan).

- These pages move to the same dark, token-driven palette as the rest of the site (superseding the earlier "legal pages keep their light theme, tokens are typography-only" decision: the user explicitly asked for legal pages to have "color of some kind" instead of staying black-and-white).
- The aurora is visible in 1-2 zones (top of page, and possibly one more break further down for longer pages) and dims to a flat solid dark background in between. Not the homepage's fully continuous treatment, and not frosted glass anywhere on these pages.
- No boxes; separation via spacing and type hierarchy, consistent with the rest of the site's no-box sections.
- Exact zone boundaries (how far down each zone extends) depend on each page's actual length and should be tuned per page during implementation, not hardcoded to match `background-revisit.html`'s generic 3-band demo.

### 8. Files affected (supersedes the 2026-07-09 list)

- `src/style.css`: replace the bounded `.aurora-surface` utility with a fixed continuous-background layer + no-box/frosted/solid utility classes; remove `.pro-highlight` styles; remove `.waitlist-interests` styles; add the new combined section's layout + Steam-viewer styles.
- `src/main.js`: remove the `.aurora-surface` class from the hero (and its now-unnecessary padding); restructure founder-note to use the frosted utility; delete the `#pro` / `.pro-highlight` section markup; delete the `.waitlist-interests` checkbox markup and adjust the `joinWaitlist(...)` call; replace the screenshot-gallery + compare-section markup with the new combined "What's included + viewer" section; wire up the viewer's thumbnail/auto-advance/zoom JS (can extend the existing `initScreenshotLightbox()` rather than duplicating zoom logic).
- `index.html`, `public/brand/theme.css`: unchanged by this revision (already built in Tasks 1-2).
- `public/story.html`: warm-shifted continuous background, no-box essay, one frosted synopsis callout (beyond the original token-swap-only plan).
- `public/ai-info.html`, `public/blog/recoveryos-development-update-2026-07.html`, `public/legal/privacy-policy.html`, `public/legal/terms-of-service.html`: zoned-rhythm background (beyond the original token-swap-only, light-theme-preserved plan).

### 9. Rollout order (supersedes the 2026-07-09 order)

1. Revise `src/style.css`/`src/main.js`: replace bounded `.aurora-surface` with the continuous background + no-box/frosted/solid utilities; move the hero to no-box. Verify visually before continuing.
2. Rebuild the founder note using the frosted utility (as originally planned in Task 4, just on the new background system).
3. Build the new combined "What's included + Steam-style viewer" section; delete the old screenshot gallery, compare section, and Pro-highlight section.
4. Remove the waitlist checkbox group and adjust the submit handler.
5. Refresh remaining card components (feature grid, roadmap grid) to the solid treatment with token colors (as Task 5 already planned).
6. Story page: warm continuous background, no-box essay, one frosted synopsis callout.
7. Legal + auxiliary pages: zoned-rhythm background, one page at a time, verifying each renders correctly (and that legal pages remain fully readable/accessible under the new dark palette) before moving to the next.
8. Full-site verification pass (all 6 pages, mobile + desktop, `vitest` regression check, reduced-motion check).

### 10. Verification (unchanged in approach)

- Visual: `preview_*` tools, walking each page at mobile and desktop widths.
- Existing `vitest` suite (22 tests) must keep passing; the waitlist-checkbox removal touches `src/main.js`'s submit handler, so re-check the waitlist-related tests specifically (`main.test.js`), not just run the full suite blind.
- No new automated tests needed for the pure-CSS/layout pieces; the waitlist form change is small enough not to need new test coverage beyond confirming existing tests still pass with the simplified DOM.

## Out of scope

- Any change to app functionality, analytics, or waitlist backend logic beyond removing the interests field from the form itself.
- Self-hosting fonts (staying on Google Fonts CDN).
- ~~A light-mode theme~~: superseded. Legal/auxiliary pages move to the dark palette (zoned rhythm) as part of this revision. There is still no separate light/dark *toggle*; the whole site is dark-themed by design, including the pages that were previously the one light-themed exception.
