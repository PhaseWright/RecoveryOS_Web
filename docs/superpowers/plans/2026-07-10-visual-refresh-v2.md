# Visual Refresh v2 (Continuous Background + Steam-Style Gallery) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the bounded, isolated `.aurora-surface` panel (built in the original Task 3, commit `7520617`) with a continuous fixed aurora background behind the whole homepage, apply a three-way per-section treatment (no-box / frosted glass / solid card) based on content type, replace the screenshot gallery + Free/Pro comparison + Pro-highlight sections with one combined "What's included" + Steam-store-style screenshot viewer, simplify the waitlist form, and give every non-homepage page (story, legal, AEO, blog) its own background identity instead of a flat token-only swap.

**Architecture:** A fixed, full-viewport `body::before`/`body::after` pair (gradient + grain, reusing the existing `aurora-drift` keyframe) replaces the old bounded `.aurora-surface` utility on the homepage. A new `.frosted-panel` utility class provides the translucent/blurred treatment for the small set of sections that need it (founder note, the new screenshot viewer, the waitlist). Sections that need neither frosted glass nor a solid card simply have no background at all, letting the fixed aurora show through. The 5 non-homepage pages each get their own background treatment (warm continuous for the story page, "zoned rhythm" dark aurora fading to solid for the 4 legal/AEO/blog pages) implemented in their own embedded `<style>` blocks, consistent with how these standalone pages already duplicate shared boilerplate (GTM/consent scripts) rather than sharing a stylesheet.

**Tech Stack:** Plain CSS (custom properties, `backdrop-filter`, CSS Grid), vanilla JS (`src/main.js`), Vite static asset serving, existing `vitest` suite.

**Reference:** Full design rationale, rejected alternatives, and the section-by-section treatment map are in `docs/superpowers/specs/2026-07-09-visual-refresh-design.md` (see the "Revision (2026-07-10)" section specifically). Read it first if anything below seems under-motivated.

---

## Before you start

This revises work already committed under the original visual-refresh plan (`docs/superpowers/plans/2026-07-09-visual-refresh.md`, Tasks 1-3). Tasks 1-2 of that plan (the shared token stylesheet, and wiring the homepage's fonts/colors to it) are unaffected and stay as-is. Task 3 (the bounded `.aurora-surface` panel) is superseded starting with Task 1 below.

This is mostly a visual/CSS/markup change, but Task 3 also changes JS behavior (the screenshot viewer) and touches an existing test file (`src/main.test.js`). Every task ends with `npx vitest run` and a specific visual check using the `preview_*` browser tools. Start the dev server once (`preview_start` with the `dev` config in `.claude/launch.json`) and reuse it across tasks.

**On subagent execution:** if running this plan via subagent-driven-development, be aware that a prior run of the *previous* plan hit a real bug: `git add <file>` stages a file's entire current diff, not just the task's own changes, and this repo's `src/main.js`/`src/style.css` often have other uncommitted work sitting in them between tasks. Before committing any task in this plan, run `git status` and `git diff --stat` first and confirm the diff you're about to stage matches only what this task describes. If it doesn't, stop and ask the controller rather than trying to fix it with `git stash` or manual git-object surgery.

---

### Task 1: Continuous fixed background, frosted-panel utility, hero to no-box

**Files:**
- Modify: `src/style.css` (remove old `.aurora-surface` utility and old static body wash; add continuous background + `.frosted-panel` utility)
- Modify: `src/main.js:37` (remove `aurora-surface` class from hero)

- [ ] **Step 1: Remove the old bounded `.aurora-surface` utility**

Find:
```css
/* ============================================================
   AURORA SURFACE: shared background treatment for the hero and
   founder-note "moments" only. Deliberately not applied to every
   section: an accent, not wallpaper.
   ============================================================ */
.aurora-surface {
  position: relative;
  border-radius: 1.25rem;
  overflow: hidden;
  isolation: isolate;
}

.aurora-surface::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  background-image:
    radial-gradient(ellipse 55% 45% at 78% 10%, rgba(var(--accent-warm-rgb), 0.30), transparent 55%),
    radial-gradient(circle at 12% 28%, rgba(var(--accent-teal-rgb), 0.26), transparent 46%),
    radial-gradient(circle at 60% 92%, rgba(var(--accent-blue-rgb), 0.24), transparent 55%),
    linear-gradient(165deg, #0a1622 0%, #060d16 60%, #04080f 100%);
  background-size: 130% 130%, 130% 130%, 130% 130%, 100% 100%;
  background-position: 0% 0%, 0% 0%, 0% 0%, 0% 0%;
  animation: aurora-drift 22s ease-in-out infinite alternate;
}

.aurora-surface::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  opacity: 0.3;
  mix-blend-mode: overlay;
  background-image: var(--grain-svg);
  pointer-events: none;
}

.aurora-surface > * {
  position: relative;
  z-index: 2;
}

@keyframes aurora-drift {
  0%   { background-position: 0% 0%, 0% 0%, 0% 0%, 0% 0%; }
  100% { background-position: 4% 5%, -3% 3%, 3% -4%, 0% 0%; }
}

/* ============================================================
   HERO ENTRANCE ANIMATION
   ============================================================ */
```

Replace with:
```css
/* ============================================================
   CONTINUOUS AURORA BACKGROUND: a fixed, full-viewport gradient +
   grain layer behind the whole homepage. Content sections choose
   no-box (nothing, aurora shows through), .frosted-panel (translucent
   blur, aurora shows through faintly), or a solid card (fully opaque)
   depending on content type, not on section importance.
   ============================================================ */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 0;
  background-image:
    radial-gradient(ellipse 55% 45% at 78% 10%, rgba(var(--accent-warm-rgb), 0.30), transparent 55%),
    radial-gradient(circle at 12% 28%, rgba(var(--accent-teal-rgb), 0.26), transparent 46%),
    radial-gradient(circle at 60% 92%, rgba(var(--accent-blue-rgb), 0.24), transparent 55%),
    linear-gradient(165deg, #0a1622 0%, #060d16 60%, #04080f 100%);
  background-size: 130% 130%, 130% 130%, 130% 130%, 100% 100%;
  background-position: 0% 0%, 0% 0%, 0% 0%, 0% 0%;
  animation: aurora-drift 22s ease-in-out infinite alternate;
  pointer-events: none;
}

body::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 0;
  opacity: 0.3;
  mix-blend-mode: overlay;
  background-image: var(--grain-svg);
  pointer-events: none;
}

@keyframes aurora-drift {
  0%   { background-position: 0% 0%, 0% 0%, 0% 0%, 0% 0%; }
  100% { background-position: 4% 5%, -3% 3%, 3% -4%, 0% 0%; }
}

/* ============================================================
   FROSTED PANEL: shared translucent/blurred treatment for the small
   set of sections that are a "moment" (founder note, the screenshot
   viewer, the waitlist). Not applied broadly, most sections use no
   box at all, letting the continuous background show through directly.
   ============================================================ */
.frosted-panel {
  position: relative;
  z-index: 1;
  background: rgba(6, 13, 22, 0.6);
  -webkit-backdrop-filter: blur(16px) saturate(1.1);
  backdrop-filter: blur(16px) saturate(1.1);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 1rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

/* ============================================================
   HERO ENTRANCE ANIMATION
   ============================================================ */
```

- [ ] **Step 2: Remove the old static body background wash and the hero's bounded-panel padding**

Find:
```css
body {
  margin: 0;
  background:
    radial-gradient(circle at top right, rgba(var(--accent-teal-rgb), 0.18), transparent 38%),
    radial-gradient(circle at 20% 10%, rgba(0, 168, 255, 0.12), transparent 34%),
    radial-gradient(circle at 70% 65%, rgba(var(--accent-blue-rgb), 0.12), transparent 48%),
    radial-gradient(circle at 50% 100%, rgba(var(--accent-warm-rgb), 0.05), transparent 45%),
    var(--bg-base);
  color: #dde8f0;
}
```

Replace with:
```css
body {
  margin: 0;
  background: var(--bg-base);
  color: #dde8f0;
}
```

(The old wash's gradients are superseded by the `body::before` continuous background added in Step 1; keeping both would double-paint the same effect.)

- [ ] **Step 3: Give `.page` a stacking context above the fixed background layers**

Find:
```css
.page {
  width: min(1080px, 100%);
  margin: 0 auto;
  padding: 1.5rem 1rem 3rem;
  padding-bottom: calc(3rem + env(safe-area-inset-bottom, 0px));
}
```

Replace with:
```css
.page {
  position: relative;
  z-index: 1;
  width: min(1080px, 100%);
  margin: 0 auto;
  padding: 1.5rem 1rem 3rem;
  padding-bottom: calc(3rem + env(safe-area-inset-bottom, 0px));
}
```

- [ ] **Step 4: Remove the hero's bounded-panel padding**

Find:
```css
.hero {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2.5rem;
  align-items: center;
  padding: 2.75rem 2.5rem;
}
```

Replace with:
```css
.hero {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2.5rem;
  align-items: center;
}
```

- [ ] **Step 5: Remove the mobile-only static body background override**

Find (inside the `@media (max-width: 880px)` block):
```css
@media (max-width: 880px) {
  body {
    background:
      radial-gradient(circle at 100% 0%, rgba(0, 212, 170, 0.08), transparent 34%),
      radial-gradient(circle at 20% 8%, rgba(0, 168, 255, 0.18), transparent 40%),
      radial-gradient(circle at 74% 70%, rgba(36, 107, 254, 0.18), transparent 52%),
      #070d18;
  }

  .hero {
    grid-template-columns: 1fr;
  }
```

Replace with:
```css
@media (max-width: 880px) {
  .hero {
    grid-template-columns: 1fr;
  }
```

(The continuous `body::before`/`body::after` background from Step 1 now applies at every width; there's no longer a separate mobile-only static wash to override.)

- [ ] **Step 6: Point the reduced-motion rule at the new `body::before`**

The old bounded utility's `::before` was disabled under reduced motion; that selector no longer exists after Step 1, so the drift on the new continuous background would keep animating even with reduced motion requested unless this rule is updated too. Find:

```css
  .aurora-surface::before {
    animation: none !important;
  }
```

Replace with:
```css
  body::before {
    animation: none !important;
  }
```

- [ ] **Step 7: Remove the `aurora-surface` class from the hero markup**

In `src/main.js`, find:
```javascript
      <section class="hero aurora-surface">
```

Replace with:
```javascript
      <section class="hero">
```

- [ ] **Step 8: Verify**

Run: `npx vitest run`
Expected: `5 passed`, `22 passed`.

```
preview_start (name: "dev")
preview_eval: window.location.reload()
preview_screenshot
```
Expected: the hero no longer sits in a rounded, padded panel; the headline and store badges sit directly on the page background. The amber/teal/blue gradient + grain is visible behind the hero (and continues behind the rest of the page as you scroll, since it's now `position: fixed`).

Scroll down past the feature grid (still solid cards at this point, unaffected) and confirm the background is still visible and animating behind the plain (no-box) "the real problem" section text (that section still has its own card styling until Task 5; for now just confirm the fixed background paints correctly behind semi-transparent or no-background areas, and stays fully hidden behind opaque cards).

```
preview_resize (preset: "mobile")
preview_screenshot
```
Expected: no layout shift or missing background at mobile width.

Confirm the reduced-motion fix from Step 6 actually took:
```bash
grep -n "body::before" src/style.css
```
Expected: two matches, the base rule (with `animation: aurora-drift ...`) and the one inside `@media (prefers-reduced-motion: reduce)` (with `animation: none !important;`).

- [ ] **Step 9: Commit**

```bash
git add src/style.css src/main.js
git commit -m "feat: replace bounded aurora-surface with a continuous fixed background"
```

---

### Task 2: Rebuild the founder note using the frosted-panel utility

**Files:**
- Modify: `src/main.js:102-130` (founder-quote markup)
- Modify: `src/style.css:784-826` (founder-quote rules)

- [ ] **Step 1: Update the founder-note markup**

Find:
```javascript
      <section class="founder-quote" data-animate>
        <div class="founder-quote__layout">
          <img
            class="founder-photo"
            src="/brand/founder-michael.png"
            alt="Michael, founder of RecoveryOS"
            width="72"
            height="72"
            loading="lazy"
            decoding="async"
          />
```

Replace with:
```javascript
      <section class="founder-quote frosted-panel" data-animate>
        <div class="founder-quote__layout">
          <img
            class="founder-photo"
            src="/brand/founder-michael.png"
            alt="Michael, founder of RecoveryOS"
            width="140"
            height="140"
            loading="lazy"
            decoding="async"
          />
```

(The rest of the section, blockquote copy, signoff, story link, is unchanged.)

- [ ] **Step 2: Replace the card styling with the editorial treatment**

Find:
```css
.founder-quote {
  margin-bottom: 2rem;
  background: linear-gradient(180deg, rgba(16, 216, 196, 0.1), rgba(36, 107, 254, 0.08));
  border: 1px solid rgba(16, 216, 196, 0.4);
  border-radius: 0.85rem;
  padding: 1rem 1.1rem;
}

.founder-quote__layout {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.founder-photo {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid rgba(16, 216, 196, 0.5);
}

.founder-quote__body {
  min-width: 0;
}

.founder-quote h2 {
  margin: 0 0 0.7rem;
}

.founder-quote blockquote {
  margin: 0;
  color: #d3e8f5;
  font-size: 0.98rem;
  line-height: 1.7;
}

.founder-signoff {
  margin: 0.9rem 0 0;
  color: #10d8c4;
  font-weight: 600;
}
```

Replace with:
```css
.founder-quote {
  padding: 2.5rem 2.25rem;
}

.founder-quote__layout {
  display: flex;
  gap: 1.75rem;
  align-items: flex-start;
}

.founder-photo {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid rgba(var(--accent-teal-rgb), 0.5);
}

.founder-quote__body {
  min-width: 0;
}

.founder-quote h2 {
  margin: 0 0 0.9rem;
}

.founder-quote blockquote {
  margin: 0;
  color: #eaf3f8;
  font-size: 1.2rem;
  line-height: 1.6;
  border-left: 2px solid var(--accent-teal);
  padding-left: 1.1rem;
}

.founder-signoff {
  margin: 1.1rem 0 0;
  color: var(--accent-teal-soft);
  font-weight: 600;
}
```

(`background`/`border`/`border-radius` are gone from `.founder-quote` because `.frosted-panel`, added to this section's class list in Step 1, now provides all three. `margin-bottom` isn't re-declared here because a later consolidated rule, `.founder-quote { margin-bottom: 2.5rem; }`, already sets it.)

- [ ] **Step 3: Verify**

Run: `npx vitest run`
Expected: `5 passed`, `22 passed`.

```
preview_eval: window.location.reload()
```
Scroll to the founder-note section and:
```
preview_screenshot
```
Expected: a translucent, blurred panel (not a flat solid card) with the continuous aurora background visible faintly behind the text; a 140px circular photo of Michael; a larger serif pull-quote with a left accent border.

```
preview_inspect selector ".founder-photo", styles ["width", "height", "border-radius"]
```
Expected: `width: 140px`, `height: 140px`, `border-radius: 50%`.

- [ ] **Step 4: Commit**

```bash
git add src/main.js src/style.css
git commit -m "feat: rebuild founder note using the frosted-panel utility"
```

---

### Task 3: Replace the screenshot gallery, Free/Pro comparison, and Pro-highlight with a combined "What's included" + Steam-style viewer

This is the biggest task in the plan: it deletes three existing sections and their CSS, adds one new section with new CSS and new JS behavior, and updates two existing tests that reference the deleted markup.

**Files:**
- Modify: `src/main.js` (delete 3 sections, add 1 new section, add viewer JS, update `initScreenshotLightbox`'s selector)
- Modify: `src/style.css` (delete `.feature-gallery`/`.screenshot-card*`/`.compare-*`/`.pro-highlight*` rules and their mobile/stagger references; add `.included-*` rules)
- Modify: `src/main.test.js` (update the 2 lightbox tests to use the new viewer markup)

- [ ] **Step 1: Delete the old screenshot gallery, compare section, and Pro-highlight markup; add the new combined section**

Find (in `src/main.js`, everything from the old gallery through the old Pro-highlight section):
```javascript
      <section class="feature-gallery" aria-label="RecoveryOS app screenshots">
        <article class="screenshot-card" data-animate>
          <img src="/screenshots/Workbook.png" alt="RecoveryOS workbook progression view" loading="lazy" />
          <h3>Workbooks</h3>
          <p>Long-form identity and recovery work with chapter progression.</p>
        </article>
        <article class="screenshot-card" data-animate>
          <img src="/screenshots/Spark.png" alt="RecoveryOS Spark insights reading view" loading="lazy" />
          <h3>Spark insights</h3>
          <p>Evidence-based entries that keep mindset, meaning, and direction in motion.</p>
        </article>
        <article class="screenshot-card" data-animate>
          <img src="/screenshots/Calendar.png" alt="RecoveryOS recovery calendar and trend view" loading="lazy" />
          <h3>Calendar intelligence</h3>
          <p>Review patterns, streaks, and trigger context across real calendar time.</p>
        </article>
        <article class="screenshot-card" data-animate>
          <img src="/screenshots/Mood_Challenges.png" alt="RecoveryOS mood and challenge dashboard" loading="lazy" />
          <h3>Mood and challenge signal</h3>
          <p>Daily score tracking with weekly insight blocks and practical wins logging.</p>
        </article>
        <article class="screenshot-card" data-animate>
          <img src="/screenshots/Backup_report.png" alt="RecoveryOS backup and report export tools" loading="lazy" />
          <h3>Backup and reports</h3>
          <p>Build support-ready summaries and retain ownership of your data.</p>
        </article>
        <article class="screenshot-card" data-animate>
          <img src="/screenshots/Settings.png" alt="RecoveryOS settings and progression panel" loading="lazy" />
          <h3>Adaptive settings</h3>
          <p>Personalize text size, safety options, goals, and progression framing.</p>
        </article>
      </section>

      <section id="plans" class="compare-section trust" aria-labelledby="plans-heading" data-animate>
        <h2 id="plans-heading">Free vs Pro: what's included</h2>
        <p class="compare-intro">
          RecoveryOS stays useful without a subscription. Pro deepens regulation, insight, and reporting when you want the full toolkit.
        </p>
        <div class="compare-grid">
          <div class="compare-column compare-column--basic">
            <h3 class="compare-heading">Basic (free)</h3>
            <p class="compare-tagline">Mobile-first daily practice, strong on its own.</p>
            <ul class="compare-list">
              <li>Daily log across seven inventory domains including honesty check-in and end-of-day reflection</li>
              <li>Dashboard essentials: clean day counter, streaks, XP, challenges, Today's Signal, weekly insight card</li>
              <li>Emergency toolkit: physiological sigh, grounding, HALT, mismatch protocol and more, all with full guidance support</li>
              <li>History: month calendar, year aggregates, rich day detail</li>
              <li>Journal with gratitude replay</li>
              <li>Backup and restore, so your data stays portable</li>
              <li>App lock</li>
              <li>Badges, monthly challenges, and milestone share card</li>
            </ul>
          </div>
          <div class="compare-column compare-column--pro">
            <h3 class="compare-heading compare-heading--pro">Pro</h3>
            <p class="compare-tagline compare-tagline--pro">Depth for regulation, insight, and clinical-adjacent reporting.</p>
            <ul class="compare-list compare-list--pro">
              <li>Spark daily insights reader</li>
              <li>Three structured workbooks (to start with, more to come)</li>
              <li>Guided self-regulation audio sessions</li>
              <li>Urge Surfing helper</li>
              <li>Voice memo journal</li>
              <li>Medication and supplement reminders</li>
              <li>Get reminded about what wins you've had, to keep you motivated and grounded.</li>
              <li>Dashboard 7-day mood sparkline</li>
              <li>Weekly summary notifications to keep you on track</li>
              <li>Your own personalized PDF progress report to share with your therapist, sponsor, or loved ones</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="pro" class="pro-highlight" aria-labelledby="pro-heading" data-animate>
        <div class="pro-highlight__inner">
          <p class="pro-highlight__eyebrow">RecoveryOS Pro</p>
          <h2 id="pro-heading">Regulate deeper. Get access to our <em>Spark</em> daily insights. Bring a real report to the conversation.</h2>
          <p class="pro-highlight__copy">
            Pro layers regulation audio (NSDR today; expanded meditation library planned), Spark's evidence-grounded
            "just for today" readings, and a PDF progress workflow so you can export a structured summary when
            <em>you</em> choose to share it, with therapists, sponsors, coaches, or loved ones supporting your recovery.
          </p>
          <ul class="pro-highlight__bullets">
            <li>Body-first tools alongside journaling and analytics.</li>
            <li>First look at new features while we're still building them.</li>
            <li>Your feedback during beta testing directly shapes what ships.</li>
          </ul>
          <div class="pro-highlight__cta">
            <a class="btn btn-primary pro-highlight__btn" href="#waitlist">Join the beta testing for launch + Pro updates</a>
          </div>
        </div>
      </section>
```

Replace with:
```javascript
      <section id="included" class="included-section" data-animate>
        <div class="included-text">
          <p class="eyebrow">Free vs Pro</p>
          <h2>What's included, and what you'll see in the app</h2>
          <p class="included-tagline">Mobile-first daily practice, strong on its own.</p>
          <h3>Basic (free)</h3>
          <ul class="included-list">
            <li>Daily log across seven inventory domains including honesty check-in and end-of-day reflection</li>
            <li>Dashboard essentials: clean day counter, streaks, XP, challenges, Today's Signal, weekly insight card</li>
            <li>Emergency toolkit: physiological sigh, grounding, HALT, mismatch protocol and more, all with full guidance support</li>
            <li>History: month calendar, year aggregates, rich day detail</li>
            <li>Journal with gratitude replay</li>
            <li>Backup and restore, so your data stays portable</li>
            <li>App lock</li>
            <li>Badges, monthly challenges, and milestone share card</li>
          </ul>
          <h3 class="included-pro-heading">Pro</h3>
          <p class="included-tagline">Depth for regulation, insight, and clinical-adjacent reporting.</p>
          <ul class="included-list included-list--pro">
            <li>Spark daily insights reader</li>
            <li>Three structured workbooks (to start with, more to come)</li>
            <li>Guided self-regulation audio sessions</li>
            <li>Urge Surfing helper</li>
            <li>Voice memo journal</li>
            <li>Medication and supplement reminders</li>
            <li>Get reminded about what wins you've had, to keep you motivated and grounded.</li>
            <li>Dashboard 7-day mood sparkline</li>
            <li>Weekly summary notifications to keep you on track</li>
            <li>Your own personalized PDF progress report to share with your therapist, sponsor, or loved ones</li>
          </ul>
        </div>

        <div class="included-viewer frosted-panel">
          <div class="included-viewer__stage">
            <img class="included-viewer__main" src="/screenshots/Workbook.png" alt="Workbooks" decoding="async" />
            <span class="included-viewer__hint">Click to zoom</span>
          </div>
          <div class="included-viewer__thumbs">
            <img class="included-viewer__thumb included-viewer__thumb--active" src="/screenshots/Workbook.png" alt="Workbooks" data-caption="Workbooks" data-detail="Long-form identity and recovery work with chapter progression." loading="lazy" />
            <img class="included-viewer__thumb" src="/screenshots/Spark.png" alt="Spark insights" data-caption="Spark insights" data-detail="Evidence-based entries that keep mindset, meaning, and direction in motion." loading="lazy" />
            <img class="included-viewer__thumb" src="/screenshots/Calendar.png" alt="Calendar intelligence" data-caption="Calendar intelligence" data-detail="Review patterns, streaks, and trigger context across real calendar time." loading="lazy" />
            <img class="included-viewer__thumb" src="/screenshots/Mood_Challenges.png" alt="Mood and challenge signal" data-caption="Mood and challenge signal" data-detail="Daily score tracking with weekly insight blocks and practical wins logging." loading="lazy" />
            <img class="included-viewer__thumb" src="/screenshots/Backup_report.png" alt="Backup and reports" data-caption="Backup and reports" data-detail="Build support-ready summaries and retain ownership of your data." loading="lazy" />
            <img class="included-viewer__thumb" src="/screenshots/Settings.png" alt="Adaptive settings" data-caption="Adaptive settings" data-detail="Personalize text size, safety options, goals, and progression framing." loading="lazy" />
          </div>
          <p class="included-viewer__caption">
            <strong id="included-caption-title">Workbooks</strong>
            <span id="included-caption-detail">Long-form identity and recovery work with chapter progression.</span>
          </p>
        </div>
      </section>
```

- [ ] **Step 2: Remove the old CSS for the deleted sections**

Find (the entire `.feature-gallery`/`.screenshot-card` block):
```css
.feature-gallery {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.screenshot-card {
  background: #0b1524;
  border: 1px solid #1a2e44;
  border-radius: 0.85rem;
  padding: 0.75rem;
}

.screenshot-card img {
  width: 100%;
  height: auto;
  border-radius: 0.6rem;
  border: 1px solid #1f3249;
  display: block;
  cursor: zoom-in;
}

.screenshot-card img:focus-visible {
  outline: 2px solid #00d4aa;
  outline-offset: 3px;
}

.screenshot-card h3 {
  margin: 0.7rem 0 0.35rem;
  font-size: 1rem;
  color: #e7f2f9;
}

.screenshot-card p {
  margin: 0;
  color: #9fb8ca;
  font-size: 0.9rem;
}

/* --- Free vs Pro --- */
.compare-intro {
  margin: 0 0 1rem;
  color: #a9c0d0;
}

.compare-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  align-items: stretch;
}

.compare-column {
  background: #0b1524;
  border: 1px solid #1a2e44;
  border-radius: 0.85rem;
  padding: 1rem 1.05rem;
  min-width: 0;
}

.compare-column--pro {
  background: rgba(245, 166, 35, 0.07);
  border-color: rgba(245, 166, 35, 0.3);
  box-shadow:
    0 0 18px rgba(245, 166, 35, 0.16),
    inset 0 1px 0 rgba(245, 166, 35, 0.08);
}

.compare-heading {
  margin: 0 0 0.35rem;
  font-size: 1.15rem;
  color: #f2f8fc;
}

.compare-heading--pro {
  color: #f5a623;
}

.compare-tagline {
  margin: 0 0 0.75rem;
  color: #98b2c6;
  font-size: 0.92rem;
}

.compare-tagline--pro {
  color: #a07820;
}

.compare-list {
  margin: 0;
  padding-left: 1.15rem;
  color: #a9c0d0;
  font-size: 0.92rem;
}

.compare-list li + li {
  margin-top: 0.4rem;
}

.compare-list--pro li::marker {
  color: #f5a623;
}

@media (max-width: 720px) {
  .compare-grid {
    grid-template-columns: 1fr;
  }

  /* We stack Basic first, Pro second per mobile requirement */
  .compare-column--basic {
    order: 1;
  }

  .compare-column--pro {
    order: 2;
  }
}

/* --- Pro highlight band --- */
.pro-highlight {
  margin-bottom: 2rem;
  padding: 0;
  border-radius: 0.85rem;
  border: 1px solid rgba(245, 166, 35, 0.3);
  background: rgba(245, 166, 35, 0.07);
  box-shadow: 0 0 22px rgba(245, 166, 35, 0.14);
  overflow: hidden;
}

.pro-highlight__inner {
  padding: 1.25rem 1.2rem;
  border-left: 4px solid rgba(245, 166, 35, 0.55);
}

.pro-highlight__eyebrow {
  margin: 0 0 0.4rem;
  font-weight: 800;
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #f5a623;
}

.pro-highlight h2 {
  margin: 0 0 0.65rem;
  font-size: clamp(1.35rem, 3vw, 1.75rem);
  color: #f2f8fc;
}

.pro-highlight__copy {
  margin: 0;
  color: #c9dce8;
  font-size: 0.98rem;
  line-height: 1.65;
  max-width: 52rem;
}

.pro-highlight__copy em {
  color: #f5d178;
  font-style: normal;
  font-weight: 700;
}

.pro-highlight__bullets {
  margin: 1rem 0 0;
  padding-left: 1.15rem;
  color: #a07820;
  font-size: 0.92rem;
}

.pro-highlight__bullets li + li {
  margin-top: 0.35rem;
}

.pro-highlight__cta {
  margin-top: 1.15rem;
}

.pro-highlight__btn {
  background: linear-gradient(90deg, #f5a623, #d4891c);
  color: #1a0f05;
  border: 1px solid rgba(245, 166, 35, 0.5);
  box-shadow:
    0 8px 26px rgba(245, 166, 35, 0.22),
    0 0 18px rgba(245, 166, 35, 0.16);
}

.pro-highlight__btn:hover {
  filter: brightness(1.06);
}

.pro-highlight__btn:focus-visible {
  outline-color: #f5a623;
}
```

Replace with:
```css
/* --- What's included + screenshot viewer --- */
.included-section {
  display: grid;
  grid-template-columns: 0.85fr 1.15fr;
  gap: 2.5rem;
  align-items: start;
  margin-bottom: 3rem;
}

.included-tagline {
  margin: 0 0 0.5rem;
  color: #8fa9bb;
  font-size: 0.9rem;
}

.included-text h3 {
  margin: 1.4rem 0 0.5rem;
  font-size: 1.1rem;
}

.included-text h3:first-of-type {
  margin-top: 0;
}

.included-pro-heading {
  color: #ffb066;
}

.included-list {
  margin: 0 0 0.5rem;
  padding-left: 1.15rem;
  color: #a9c0d0;
  font-size: 0.92rem;
}

.included-list li + li {
  margin-top: 0.4rem;
}

.included-list--pro li::marker {
  color: var(--accent-warm);
}

.included-viewer {
  padding: 1rem;
}

.included-viewer__stage {
  position: relative;
  border-radius: 0.6rem;
  overflow: hidden;
  background: #000;
  aspect-ratio: 16 / 11;
  cursor: zoom-in;
}

.included-viewer__main {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.included-viewer__hint {
  position: absolute;
  bottom: 0.6rem;
  right: 0.7rem;
  font-size: 0.7rem;
  background: rgba(0, 0, 0, 0.55);
  color: #cfe3ee;
  padding: 0.25rem 0.6rem;
  border-radius: 1rem;
}

.included-viewer__thumbs {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.6rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
}

.included-viewer__thumb {
  width: 76px;
  height: 54px;
  object-fit: cover;
  border-radius: 0.4rem;
  cursor: pointer;
  opacity: 0.55;
  border: 2px solid transparent;
  transition: opacity 0.2s ease, border-color 0.2s ease;
  flex-shrink: 0;
}

.included-viewer__thumb:hover {
  opacity: 0.85;
}

.included-viewer__thumb--active {
  opacity: 1;
  border-color: var(--accent-teal);
}

.included-viewer__caption {
  margin: 0.6rem 0 0;
  font-size: 0.85rem;
  color: #a9c0d0;
}

.included-viewer__caption strong {
  color: #eaf3f8;
  margin-right: 0.35rem;
}

@media (max-width: 860px) {
  .included-section {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 3: Remove the `.pro-highlight` reference from the consolidated spacing block**

Find:
```css
.section-block  { margin-bottom: 2.5rem; }
.features       { margin-bottom: 3rem; }
.feature-gallery { margin-bottom: 3rem; }
.trust          { margin-bottom: 2.5rem; }
.pro-highlight  { margin-bottom: 2.5rem; }
.founder-quote  { margin-bottom: 2.5rem; }
.feature-card   { padding: 1.4rem; }
.roadmap-card   { padding: 1rem 1.1rem; }
```

Replace with:
```css
.section-block  { margin-bottom: 2.5rem; }
.features       { margin-bottom: 3rem; }
.trust          { margin-bottom: 2.5rem; }
.founder-quote  { margin-bottom: 2.5rem; }
.feature-card   { padding: 1.4rem; }
.roadmap-card   { padding: 1rem 1.1rem; }
```

- [ ] **Step 4: Remove the deleted section's references from the card stagger rule and the mobile gallery layout**

Find:
```css
.features .feature-card:nth-child(2),
.feature-gallery .screenshot-card:nth-child(2),
.roadmap-grid .roadmap-card:nth-child(2) {
  transition-delay: 0.08s;
}

.features .feature-card:nth-child(3),
.feature-gallery .screenshot-card:nth-child(3),
.roadmap-grid .roadmap-card:nth-child(3) {
  transition-delay: 0.16s;
}

.feature-gallery .screenshot-card:nth-child(4),
.roadmap-grid .roadmap-card:nth-child(4) {
  transition-delay: 0.24s;
}

.feature-gallery .screenshot-card:nth-child(5),
.roadmap-grid .roadmap-card:nth-child(5) {
  transition-delay: 0.32s;
}

.feature-gallery .screenshot-card:nth-child(6) {
  transition-delay: 0.4s;
}
```

Replace with:
```css
.features .feature-card:nth-child(2),
.roadmap-grid .roadmap-card:nth-child(2) {
  transition-delay: 0.08s;
}

.features .feature-card:nth-child(3),
.roadmap-grid .roadmap-card:nth-child(3) {
  transition-delay: 0.16s;
}

.roadmap-grid .roadmap-card:nth-child(4) {
  transition-delay: 0.24s;
}

.roadmap-grid .roadmap-card:nth-child(5) {
  transition-delay: 0.32s;
}
```

- [ ] **Step 5: Remove the mobile horizontal-scroll rules for the deleted gallery**

Find (inside the `@media (max-width: 880px)` block):
```css
  .feature-gallery {
    display: flex;
    flex-direction: row;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scroll-padding-inline: 0.2rem;
    gap: 0.9rem;
    border-radius: 0.85rem;
    touch-action: pan-x;
    -ms-overflow-style: none;
  }

  .feature-gallery::-webkit-scrollbar {
    display: none;
  }

  .screenshot-card {
    scroll-snap-align: center;
    flex: 0 0 min(84vw, 420px);
  }

  .site-header {
    margin-bottom: 2rem;
  }
```

Replace with:
```css
  .site-header {
    margin-bottom: 2rem;
  }
```

- [ ] **Step 6: Update `initScreenshotLightbox()` to target the new viewer's main image, and add the viewer's own click/thumbnail/auto-advance behavior**

Find (in `src/main.js`):
```javascript
function initScreenshotLightbox() {
  const thumbs = document.querySelectorAll(".screenshot-card img");
  if (!thumbs.length) return;
```

Replace with:
```javascript
function initScreenshotLightbox() {
  const thumbs = document.querySelectorAll(".included-viewer__main");
  if (!thumbs.length) return;
```

- [ ] **Step 7: Add the viewer's thumbnail-click and auto-advance behavior**

Find:
```javascript
function initScrollAnimations() {
```

Replace with:
```javascript
/**
 * We swap the main image synchronously (no delayed cross-fade) so the
 * interaction stays simple and easy to test. Auto-advance runs every 4s
 * and resets whenever the visitor clicks a thumbnail directly.
 */
function initIncludedViewer() {
  const thumbs = Array.from(document.querySelectorAll(".included-viewer__thumb"));
  const mainImg = document.querySelector(".included-viewer__main");
  const captionTitle = document.querySelector("#included-caption-title");
  const captionDetail = document.querySelector("#included-caption-detail");
  if (!thumbs.length || !mainImg || !captionTitle || !captionDetail) return;

  const AUTO_ADVANCE_MS = 4000;
  let current = 0;
  let timer;

  function setActive(index, userInitiated) {
    current = index;
    thumbs.forEach((thumb, i) => {
      thumb.classList.toggle("included-viewer__thumb--active", i === index);
    });
    mainImg.src = thumbs[index].src;
    mainImg.alt = thumbs[index].alt;
    captionTitle.textContent = thumbs[index].dataset.caption;
    captionDetail.textContent = thumbs[index].dataset.detail;
    if (userInitiated) restartAutoAdvance();
  }

  function restartAutoAdvance() {
    window.clearInterval(timer);
    timer = window.setInterval(() => {
      setActive((current + 1) % thumbs.length, false);
    }, AUTO_ADVANCE_MS);
  }

  thumbs.forEach((thumb, i) => {
    thumb.addEventListener("click", () => setActive(i, true));
  });

  restartAutoAdvance();
}

function initScrollAnimations() {
```

- [ ] **Step 8: Call the new init function alongside the others**

Find:
```javascript
initScreenshotLightbox();
initScrollAnimations();
```

Replace with:
```javascript
initScreenshotLightbox();
initIncludedViewer();
initScrollAnimations();
```

- [ ] **Step 9: Update the two lightbox tests in `src/main.test.js` to use the new viewer markup**

Find:
```javascript
  it("keeps a reopened image after a pending close transition finishes", async () => {
    await import("./main.js");

    const thumbs = document.querySelectorAll(".screenshot-card img");
    const overlay = document.querySelector(".screenshot-lightbox");
    const lightboxImg = document.querySelector(".screenshot-lightbox__img");
    const closeBtn = document.querySelector(".screenshot-lightbox__close");

    thumbs[0].dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    closeBtn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    thumbs[1].dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    overlay.dispatchEvent(new TransitionEvent("transitionend", { bubbles: true }));

    expect(lightboxImg.src).toBe(thumbs[1].currentSrc || thumbs[1].src);
    expect(lightboxImg.alt).toBe(thumbs[1].alt);
  });

  it("traps tab focus inside the open lightbox", async () => {
    await import("./main.js");

    const thumb = document.querySelector(".screenshot-card img");
    const closeBtn = document.querySelector(".screenshot-lightbox__close");

    thumb.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));

    const tabEvent = new KeyboardEvent("keydown", {
      key: "Tab",
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(tabEvent);

    expect(tabEvent.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(closeBtn);
  });
```

Replace with:
```javascript
  it("keeps a reopened image after a pending close transition finishes", async () => {
    await import("./main.js");

    const viewerThumbs = document.querySelectorAll(".included-viewer__thumb");
    const mainImg = document.querySelector(".included-viewer__main");
    const overlay = document.querySelector(".screenshot-lightbox");
    const lightboxImg = document.querySelector(".screenshot-lightbox__img");
    const closeBtn = document.querySelector(".screenshot-lightbox__close");

    // Open the lightbox on the first screenshot, close it (schedules a
    // pending cleanup waiting for the CSS transition to finish), switch
    // the main image to a different screenshot via its thumbnail, then
    // reopen before that stray transitionend fires.
    mainImg.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    closeBtn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    viewerThumbs[1].dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    mainImg.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    overlay.dispatchEvent(new TransitionEvent("transitionend", { bubbles: true }));

    expect(lightboxImg.src).toBe(mainImg.currentSrc || mainImg.src);
    expect(lightboxImg.alt).toBe(mainImg.alt);
  });

  it("traps tab focus inside the open lightbox", async () => {
    await import("./main.js");

    const mainImg = document.querySelector(".included-viewer__main");
    const closeBtn = document.querySelector(".screenshot-lightbox__close");

    mainImg.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));

    const tabEvent = new KeyboardEvent("keydown", {
      key: "Tab",
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(tabEvent);

    expect(tabEvent.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(closeBtn);
  });
```

- [ ] **Step 10: Run the tests**

Run: `npx vitest run`
Expected: `5 passed`, `22 passed`. If the lightbox tests fail, check that `.included-viewer__thumb` elements exist in the rendered markup (Step 1) and that `initIncludedViewer()` is actually being called (Step 8).

- [ ] **Step 11: Verify in the browser**

```
preview_eval: window.location.reload()
```
Scroll to the new combined section and:
```
preview_screenshot
```
Expected: "What's included" text on the left with no card/border; a single frosted-glass container on the right holding a large screenshot, a row of 6 thumbnails below it, and a caption.

Click a thumbnail (not the main image):
```
preview_click selector ".included-viewer__thumb:nth-child(3)"
preview_screenshot
```
Expected: the main image and caption update to match the clicked thumbnail; that thumbnail now has a teal border.

Click the main image:
```
preview_click selector ".included-viewer__main"
preview_screenshot
```
Expected: a full-screen zoom overlay opens showing the currently-selected screenshot.

Wait a few seconds without interacting and take another screenshot; expected: the viewer auto-advances to the next screenshot on its own (confirm by comparing two screenshots ~5 seconds apart).

- [ ] **Step 12: Commit**

```bash
git add src/main.js src/style.css src/main.test.js
git commit -m "feat: replace screenshot gallery, Free/Pro comparison, and Pro-highlight with a combined What's-included + Steam-style viewer"
```

---

### Task 4: Remove the waitlist interest checkboxes; apply the frosted-panel treatment

**Files:**
- Modify: `src/main.js` (remove `.waitlist-interests` markup, apply `frosted-panel` class, simplify the submit handler)
- Modify: `src/style.css` (remove `.waitlist-interests*`/`.waitlist-check*` rules, remove `.waitlist`'s own background/border)

- [ ] **Step 1: Apply the frosted-panel class and remove the interest checkboxes from the form**

Find:
```javascript
      <section id="waitlist" class="waitlist" data-animate>
```

Replace with:
```javascript
      <section id="waitlist" class="waitlist frosted-panel" data-animate>
```

Find:
```javascript
            <button id="waitlist-submit" class="btn btn-primary" type="submit">
              Join the beta testing
            </button>
          </div>
          <div class="waitlist-interests" role="group" aria-labelledby="interests-label">
            <p id="interests-label" class="waitlist-interests__legend">What interests you most? <span class="waitlist-interests__opt">(optional)</span></p>
            <div class="waitlist-interests__grid">
              <label class="waitlist-check">
                <input type="checkbox" name="interests" value="daily-structure" />
                <span>Daily structure &amp; journaling</span>
              </label>
              <label class="waitlist-check">
                <input type="checkbox" name="interests" value="craving-management" />
                <span>Craving &amp; trigger management</span>
              </label>
              <label class="waitlist-check">
                <input type="checkbox" name="interests" value="progress-tracking" />
                <span>Progress tracking &amp; reporting</span>
              </label>
              <label class="waitlist-check">
                <input type="checkbox" name="interests" value="community" />
                <span>Community &amp; accountability</span>
              </label>
            </div>
          </div>
          <p id="waitlist-message" class="waitlist-message" role="status" aria-live="polite"></p>
```

Replace with:
```javascript
            <button id="waitlist-submit" class="btn btn-primary" type="submit">
              Join the beta testing
            </button>
          </div>
          <p id="waitlist-message" class="waitlist-message" role="status" aria-live="polite"></p>
```

- [ ] **Step 2: Simplify the submit handler to stop reading interests**

Find:
```javascript
  try {
    const email = emailInput.value ?? "";
    const interests = [...form.querySelectorAll('input[name="interests"]:checked')].map(
      (el) => el.value,
    );
    const result = await joinWaitlist(email, interests);
```

Replace with:
```javascript
  try {
    const email = emailInput.value ?? "";
    const result = await joinWaitlist(email);
```

- [ ] **Step 3: Remove `.waitlist`'s own background/border (now provided by `.frosted-panel`)**

Find:
```css
.waitlist {
  background: linear-gradient(180deg, #0d1626 0%, #0a121f 100%);
  border: 1px solid #1d3047;
  border-radius: 0.85rem;
  padding: 1.2rem;
}
```

Replace with:
```css
.waitlist {
  padding: 1.2rem;
}
```

- [ ] **Step 4: Remove the interest-checkbox CSS block**

Find:
```css
/* ============================================================
   WAITLIST INTEREST CHECKBOXES
   ============================================================ */
.waitlist-interests {
  margin: 1rem 0 0;
  padding: 0;
  border: none;
  min-width: 0;
  max-width: 100%;
}

.waitlist-interests__legend {
  color: #cadce8;
  font-size: 0.9rem;
  margin-bottom: 0.6rem;
  padding: 0;
  display: block;
  max-width: 100%;
}

.waitlist-interests__opt {
  color: #7aa8bc;
  font-size: 0.82rem;
  font-weight: 400;
}

.waitlist-interests__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem 2rem;
}

.waitlist-check {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.88rem;
  line-height: 1.35;
  color: #a9c0d0;
  -webkit-user-select: none;
  user-select: none;
  min-width: 0;
  -webkit-tap-highlight-color: transparent;
}

/* We let label text wrap in the grid cell; min-width 0 avoids flex overflow clipping the gutter. */
.waitlist-check span {
  min-width: 0;
  line-height: inherit;
}

/* We replace native checkbox paint — WebKit often ignores width/height/accent-color, so we draw a consistent box + tick for Safari and Chromium. */
.waitlist-check input[type="checkbox"] {
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
  width: 1.125rem;
  height: 1.125rem;
  min-width: 1.125rem;
  min-height: 1.125rem;
  flex-shrink: 0;
  align-self: center;
  box-sizing: border-box;
  border: 2px solid #7aa8bc;
  border-radius: 4px;
  background: #060b14;
  cursor: pointer;
  position: relative;
  vertical-align: middle;
  transition: border-color 0.12s ease, background-color 0.12s ease;
}

.waitlist-check input[type="checkbox"]:hover {
  border-color: #9bb7c9;
}

.waitlist-check input[type="checkbox"]:checked {
  background-color: #00d4aa;
  border-color: #00c49a;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath fill='none' stroke='%23021018' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round' d='M2.5 6L5 8.5 9.5 3.5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: 50% 55%;
  background-size: 10px 10px;
}

.waitlist-check input[type="checkbox"]:focus-visible {
  outline: 2px solid #00d4aa;
  outline-offset: 2px;
}

.waitlist-check:hover span {
  color: #dde8f0;
}

@media (max-width: 520px) {
  .waitlist-interests__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 880px) {
```

Replace with:
```css
@media (max-width: 880px) {
```

- [ ] **Step 5: Remove the now-orphaned checkbox reduced-motion rule**

By this point, Task 1 has already updated the old `.aurora-surface::before` selector in this block to `body::before` (see Task 1, Step 6), so the block currently reads:

```css
@media (prefers-reduced-motion: reduce) {
  [data-animate],
  .hero-content,
  .hero-visual {
    animation: none !important;
    transition: none !important;
    opacity: 1 !important;
    transform: none !important;
  }

  body::before {
    animation: none !important;
  }

  .waitlist-check input[type="checkbox"] {
    transition: none;
  }
}
```

Remove only the checkbox rule (the `body::before` rule must stay, it's what disables the continuous background's drift under reduced motion). Find:
```css
  body::before {
    animation: none !important;
  }

  .waitlist-check input[type="checkbox"] {
    transition: none;
  }
}
```

Replace with:
```css
  body::before {
    animation: none !important;
  }
}
```

- [ ] **Step 6: Check for test coverage of the removed checkboxes**

Run: `grep -n "interests" src/main.test.js src/waitlist.test.js`
Expected: no matches referencing form checkboxes (the waitlist analytics test in `main.test.js` submits the form via email only and doesn't reference `interests`, so it should be unaffected; `waitlist.test.js` tests `joinWaitlist()` directly with explicit arguments and doesn't touch the DOM, so it's also unaffected). If either file does reference the removed checkboxes, update it to stop doing so before proceeding.

- [ ] **Step 7: Verify**

Run: `npx vitest run`
Expected: `5 passed`, `22 passed`.

```
preview_eval: window.location.reload()
```
Scroll to the waitlist section and:
```
preview_screenshot
```
Expected: a frosted-glass panel containing just the eyebrow/heading/copy, the email input, and the submit button, no checkbox grid below it.

- [ ] **Step 8: Commit**

```bash
git add src/main.js src/style.css
git commit -m "feat: remove waitlist interest checkboxes, apply frosted-panel treatment"
```

---

### Task 5: Strip card chrome from "the real problem", "professionals", "privacy", and the roadmap wrapper (no-box)

**Files:**
- Modify: `src/style.css:220-230` (`.section-block` rule)
- Modify: `src/style.css:320-326` (`.trust` rule)

`#professionals`, `#privacy`, and the `#roadmap` section wrapper all currently get their box styling from the shared `.trust` class (so does `.site-social`, the footer-area "Follow us" block). Per the approved treatment map, professionals/privacy/roadmap should all be no-box. Rather than removing the `.trust` class from 3 of its 4 usages in markup (which would also strip `.trust h2`/`.trust p`'s margin/color rules from those sections), this task edits `.trust` itself to drop its background/border, since a plain, unboxed treatment is appropriate for all four sections that use it, including `.site-social`. No markup changes needed for this task.

- [ ] **Step 1: Remove `.section-block`'s card background/border/padding**

Find:
```css
.section-block {
  display: grid;
  grid-template-columns: 1.25fr 0.75fr;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.5rem;
  background: #0d1626;
  border: 1px solid #162538;
  border-radius: 0.85rem;
  padding: 1.1rem;
}
```

Replace with:
```css
.section-block {
  display: grid;
  grid-template-columns: 1.25fr 0.75fr;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1.1rem 0;
}
```

(Horizontal padding is dropped since there's no longer a box edge to pad away from; vertical padding stays so the section still has breathing room above/below.)

- [ ] **Step 2: Remove `.trust`'s card background/border**

Find:
```css
.trust {
  margin-bottom: 2rem;
  background: #0b1524;
  border: 1px solid #162538;
  border-radius: 0.85rem;
  padding: 1.1rem;
}
```

Replace with:
```css
.trust {
  margin-bottom: 2rem;
  padding: 1.1rem 0;
}
```

- [ ] **Step 3: Verify**

Run: `npx vitest run`
Expected: `5 passed`, `22 passed`.

```
preview_eval: window.location.reload()
preview_screenshot
```
Scroll to "Other apps count your days...", "For professionals", "Privacy and trust signals", and the roadmap grid's outer wrapper. Expected: none of them show a card box anymore; the brand mark SVG and all this text sit directly on the continuous background. The roadmap grid's individual cards (`.roadmap-card`) are unaffected and still show as solid cards, since `.roadmap-card` is a separate class from `.trust`. Also check the "Follow us" social-links section near the footer: it uses the same `.trust` class, so it will have lost its box too; confirm it still reads fine as a plain section (this wasn't separately discussed, but it's a natural, low-risk extension of the same "no-box for plain content" pattern, not a data-dense section that needed containment).

- [ ] **Step 4: Commit**

```bash
git add src/style.css
git commit -m "refactor: strip card chrome from plain-content sections (no-box)"
```

---

### Task 6: Soften remaining card borders (feature grid, roadmap grid) to the shared teal token

**Files:**
- Modify: `src/style.css` (`.feature-card`, `.roadmap-card`)

- [ ] **Step 1: `.feature-card`**

Find:
```css
.feature-card {
  background: #0d1626;
  border: 1px solid #162538;
  border-radius: 0.85rem;
  padding: 1.1rem;
}
```

Replace with:
```css
.feature-card {
  background: #0d1626;
  border: 1px solid rgba(var(--accent-teal-rgb), 0.16);
  border-radius: 0.85rem;
  padding: 1.1rem;
}
```

- [ ] **Step 2: `.roadmap-card`**

Find:
```css
.roadmap-card {
  margin: 0;
  padding: 0.85rem 0.95rem;
  border-radius: 0.75rem;
  border: 1px solid #1f3249;
  background: #0d1626;
}
```

Replace with:
```css
.roadmap-card {
  margin: 0;
  padding: 0.85rem 0.95rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(var(--accent-teal-rgb), 0.16);
  background: #0d1626;
}
```

- [ ] **Step 3: Verify**

Run: `npx vitest run`
Expected: `5 passed`, `22 passed`.

```
preview_eval: window.location.reload()
preview_screenshot
```
Scroll through the feature grid and roadmap grid; expected: both sets of cards now show a single, subtle teal-tinted border instead of two slightly different flat navy shades, still opaque and fully hiding the continuous background behind them.

- [ ] **Step 4: Commit**

```bash
git add src/style.css
git commit -m "refactor: unify feature/roadmap card border colors to the shared teal token"
```

---

### Task 7: Story page: link the token layer, warm continuous background, no-box essay, one frosted synopsis

**Files:**
- Modify: `public/story.html`

- [ ] **Step 1: Add the theme and font links**

Find:
```html
  </script>

  <style>
```

Replace with:
```html
  </script>

  <link rel="stylesheet" href="/brand/theme.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Manrope:wght@400;600;800&display=swap" rel="stylesheet" />

  <style>
```

- [ ] **Step 2: Replace the font stack and static body wash with the warm continuous background**

Find:
```css
    :root {
      font-family: "Segoe UI", Inter, Roboto, "Helvetica Neue", Arial, sans-serif;
      font-synthesis: none;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
    }

    body {
      margin: 0;
      background:
        radial-gradient(circle at top right, rgba(0, 212, 170, 0.14), transparent 38%),
        radial-gradient(circle at 20% 10%, rgba(0, 168, 255, 0.08), transparent 34%),
        radial-gradient(circle at 70% 65%, rgba(36, 107, 254, 0.08), transparent 48%),
        #070d18;
      color: #dde8f0;
      line-height: 1.7;
    }
```

Replace with:
```css
    :root {
      font-family: var(--font-body);
      font-synthesis: none;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
    }

    h1, h2, h3, blockquote {
      font-family: var(--font-display);
    }

    body {
      margin: 0;
      color: #f0e6dc;
      line-height: 1.7;
    }

    /* Warm-shifted continuous background: amber-dominant, reversed from the
       homepage's teal/blue-dominant one, so the story page reads as its own space. */
    .aurora-fixed {
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      background-image:
        radial-gradient(ellipse 60% 50% at 25% 15%, rgba(255, 176, 102, 0.40), transparent 55%),
        radial-gradient(circle at 80% 30%, rgba(255, 140, 90, 0.22), transparent 50%),
        radial-gradient(circle at 60% 85%, rgba(0, 212, 170, 0.14), transparent 55%),
        radial-gradient(circle at 15% 90%, rgba(36, 107, 254, 0.10), transparent 50%),
        linear-gradient(165deg, #1a1006 0%, #0e0804 55%, #080502 100%);
      background-size: 140% 140%, 140% 140%, 140% 140%, 140% 140%, 100% 100%;
      background-position: 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%;
      animation: story-aurora-drift 24s ease-in-out infinite alternate;
    }

    .aurora-fixed::after {
      content: '';
      position: absolute;
      inset: 0;
      opacity: 0.3;
      mix-blend-mode: overlay;
      background-image: var(--grain-svg);
    }

    @keyframes story-aurora-drift {
      0%   { background-position: 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%; }
      100% { background-position: 3% 4%, -3% 3%, 2% -3%, -2% 2%, 0% 0%; }
    }

    @media (prefers-reduced-motion: reduce) {
      .aurora-fixed {
        animation: none;
      }
    }
```

- [ ] **Step 3: Give `.page` a stacking context above the fixed background**

Find:
```css
    .page {
      width: min(780px, 100%);
      margin: 0 auto;
      padding: 1.5rem 1.25rem 4rem;
    }
```

Replace with:
```css
    .page {
      position: relative;
      z-index: 1;
      width: min(780px, 100%);
      margin: 0 auto;
      padding: 1.5rem 1.25rem 4rem;
    }
```

- [ ] **Step 4: Convert the "brief version" synopsis to the frosted treatment**

Find:
```css
    .brief-block {
      background: #0d1626;
      border: 1px solid #162538;
      border-left: 3px solid #00d4aa;
      border-radius: 0.5rem;
      padding: 1.5rem 1.75rem;
      margin: 0 0 3rem;
    }
```

Replace with:
```css
    .brief-block {
      background: rgba(20, 12, 6, 0.55);
      -webkit-backdrop-filter: blur(18px) saturate(1.15);
      backdrop-filter: blur(18px) saturate(1.15);
      border: 1px solid rgba(255, 176, 102, 0.25);
      border-left: 3px solid var(--accent-warm);
      border-radius: 0.75rem;
      padding: 1.5rem 1.75rem;
      margin: 0 0 3rem;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
    }
```

- [ ] **Step 5: Add the fixed background element to the page markup**

Find:
```html
  <div class="page">

    <header class="site-header">
```

Replace with:
```html
  <div class="aurora-fixed"></div>
  <div class="page">

    <header class="site-header">
```

- [ ] **Step 6: Verify**

This page isn't covered by `vitest` (it's a static file with no JS logic), so verification is visual only.

```
preview_eval: window.location.href = 'http://localhost:5173/story.html'
preview_screenshot
```
Expected: warm amber-dominant background (visibly different hue from the homepage's teal/blue one), heading and blockquote in Fraunces, body copy in Manrope, no boxes anywhere in the flowing essay text, and the "brief version" synopsis near the top now reads as a frosted glass panel rather than a flat solid card.

```
preview_inspect selector "h1", styles ["font-family"]
```
Expected: starts with `Fraunces`.

- [ ] **Step 7: Commit**

```bash
git add public/story.html
git commit -m "feat: give story.html a warm continuous background, no-box essay, and a frosted synopsis panel"
```

---

### Task 8: Zoned rhythm: `ai-info.html`

**Files:**
- Modify: `public/ai-info.html`

This page and the next three (blog post, both legal pages) share the same "zoned rhythm" recipe: the aurora is visible behind the page header/title for roughly the first 560px, fades over the next 300px, and is fully solid dark for the rest of the page. Each page gets its own copy of this CSS in its own embedded `<style>` block (consistent with how these standalone pages already duplicate the GTM/consent script boilerplate rather than sharing it).

- [ ] **Step 1: Add the theme and font links**

Find:
```html
  </script>

  <style>
```

Replace with:
```html
  </script>

  <link rel="stylesheet" href="/brand/theme.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Manrope:wght@400;600;800&display=swap" rel="stylesheet" />

  <style>
```

- [ ] **Step 2: Replace the font stack and static body wash with the zoned-rhythm background**

Find:
```css
    :root { font-family: "Segoe UI", Inter, Roboto, "Helvetica Neue", Arial, sans-serif; }
    body {
      margin: 0;
      background:
        radial-gradient(circle at top right, rgba(0, 212, 170, 0.14), transparent 38%),
        radial-gradient(circle at 20% 10%, rgba(0, 168, 255, 0.08), transparent 34%),
        #070d18;
      color: #dde8f0;
      line-height: 1.7;
    }
```

Replace with:
```css
    :root { font-family: var(--font-body); }
    h1, h2, h3, blockquote { font-family: var(--font-display); }

    body {
      margin: 0;
      background: var(--bg-base);
      color: #dde8f0;
      line-height: 1.7;
    }

    /* Zoned rhythm: aurora visible behind the header, fades to solid for the
       rest of the page. Not the homepage's fully continuous treatment. */
    .aurora-fixed {
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      background-image:
        radial-gradient(ellipse 55% 45% at 78% 10%, rgba(var(--accent-warm-rgb), 0.28), transparent 55%),
        radial-gradient(circle at 12% 28%, rgba(var(--accent-teal-rgb), 0.22), transparent 46%),
        radial-gradient(circle at 60% 62%, rgba(var(--accent-blue-rgb), 0.18), transparent 52%),
        linear-gradient(165deg, #0a1622 0%, #060d16 55%, #04080f 100%);
      background-size: 130% 130%, 130% 130%, 130% 130%, 100% 100%;
      background-position: 0% 0%, 0% 0%, 0% 0%, 0% 0%;
      animation: aux-aurora-drift 22s ease-in-out infinite alternate;
    }

    .aurora-fixed::after {
      content: '';
      position: absolute;
      inset: 0;
      opacity: 0.28;
      mix-blend-mode: overlay;
      background-image: var(--grain-svg);
    }

    .aurora-zone-dim {
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      background: linear-gradient(180deg, transparent 0px, transparent 560px, var(--bg-base) 860px);
    }

    @keyframes aux-aurora-drift {
      0%   { background-position: 0% 0%, 0% 0%, 0% 0%, 0% 0%; }
      100% { background-position: 3% 4%, -3% 3%, 2% -3%, 0% 0%; }
    }

    @media (prefers-reduced-motion: reduce) {
      .aurora-fixed {
        animation: none;
      }
    }
```

- [ ] **Step 3: Give `.page` a stacking context above the fixed background layers**

Find:
```css
    .page { width: min(780px, 100%); margin: 0 auto; padding: 1.5rem 1.25rem 4rem; }
```

Replace with:
```css
    .page { position: relative; z-index: 1; width: min(780px, 100%); margin: 0 auto; padding: 1.5rem 1.25rem 4rem; }
```

- [ ] **Step 4: Add the fixed background elements to the page markup**

Find:
```html
  <div class="page">
    <header class="site-header">
```

Replace with:
```html
  <div class="aurora-fixed"></div>
  <div class="aurora-zone-dim"></div>
  <div class="page">
    <header class="site-header">
```

- [ ] **Step 5: Verify**

```
preview_eval: window.location.href = 'http://localhost:5173/ai-info.html'
preview_screenshot
```
Expected: aurora visible behind the page title and lede, fading to a flat solid dark background further down the Q&A list; headings in Fraunces, body in Manrope.

```
preview_inspect selector ".page-title", styles ["font-family"]
```
Expected: starts with `Fraunces`.

Confirm the FAQ structured data wasn't touched (this page has two `<script type="application/ld+json">` blocks; the edits only touched the `<style>` block and the opening of `<body>`, but verify anyway):
```bash
cd "E:/PhaseWright/RecoveryOS_web" && node -e "
const fs = require('fs');
const html = fs.readFileSync('public/ai-info.html','utf8');
const re = /<script type=\"application\/ld\+json\">([\s\S]*?)<\/script>/g;
let m, i=0;
while ((m = re.exec(html))) { i++; try { JSON.parse(m[1]); console.log('block', i, 'OK'); } catch(e) { console.log('block', i, 'FAILED:', e.message); } }
"
```
Expected: `block 1 OK`, `block 2 OK`.

- [ ] **Step 6: Commit**

```bash
git add public/ai-info.html
git commit -m "feat: give ai-info.html a zoned-rhythm aurora background"
```

---

### Task 9: Zoned rhythm: the blog post

**Files:**
- Modify: `public/blog/recoveryos-development-update-2026-07.html`

Same recipe as Task 8.

- [ ] **Step 1: Add the theme and font links**

Find:
```html
  </script>

  <style>
```

Replace with:
```html
  </script>

  <link rel="stylesheet" href="/brand/theme.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Manrope:wght@400;600;800&display=swap" rel="stylesheet" />

  <style>
```

- [ ] **Step 2: Replace the font stack and static body wash with the zoned-rhythm background**

Find:
```css
    :root { font-family: "Segoe UI", Inter, Roboto, "Helvetica Neue", Arial, sans-serif; }
    body {
      margin: 0;
      background:
        radial-gradient(circle at top right, rgba(0, 212, 170, 0.14), transparent 38%),
        radial-gradient(circle at 20% 10%, rgba(0, 168, 255, 0.08), transparent 34%),
        #070d18;
      color: #dde8f0;
      line-height: 1.7;
    }
```

Replace with:
```css
    :root { font-family: var(--font-body); }
    h1, h2, h3, blockquote { font-family: var(--font-display); }

    body {
      margin: 0;
      background: var(--bg-base);
      color: #dde8f0;
      line-height: 1.7;
    }

    .aurora-fixed {
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      background-image:
        radial-gradient(ellipse 55% 45% at 78% 10%, rgba(var(--accent-warm-rgb), 0.28), transparent 55%),
        radial-gradient(circle at 12% 28%, rgba(var(--accent-teal-rgb), 0.22), transparent 46%),
        radial-gradient(circle at 60% 62%, rgba(var(--accent-blue-rgb), 0.18), transparent 52%),
        linear-gradient(165deg, #0a1622 0%, #060d16 55%, #04080f 100%);
      background-size: 130% 130%, 130% 130%, 130% 130%, 100% 100%;
      background-position: 0% 0%, 0% 0%, 0% 0%, 0% 0%;
      animation: aux-aurora-drift 22s ease-in-out infinite alternate;
    }

    .aurora-fixed::after {
      content: '';
      position: absolute;
      inset: 0;
      opacity: 0.28;
      mix-blend-mode: overlay;
      background-image: var(--grain-svg);
    }

    .aurora-zone-dim {
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      background: linear-gradient(180deg, transparent 0px, transparent 560px, var(--bg-base) 860px);
    }

    @keyframes aux-aurora-drift {
      0%   { background-position: 0% 0%, 0% 0%, 0% 0%, 0% 0%; }
      100% { background-position: 3% 4%, -3% 3%, 2% -3%, 0% 0%; }
    }

    @media (prefers-reduced-motion: reduce) {
      .aurora-fixed {
        animation: none;
      }
    }
```

- [ ] **Step 3: Give `.page` a stacking context above the fixed background layers**

Find:
```css
    .page { width: min(720px, 100%); margin: 0 auto; padding: 1.5rem 1.25rem 4rem; }
```

Replace with:
```css
    .page { position: relative; z-index: 1; width: min(720px, 100%); margin: 0 auto; padding: 1.5rem 1.25rem 4rem; }
```

- [ ] **Step 4: Add the fixed background elements to the page markup**

Find:
```html
  <div class="page">
    <header class="site-header">
```

Replace with:
```html
  <div class="aurora-fixed"></div>
  <div class="aurora-zone-dim"></div>
  <div class="page">
    <header class="site-header">
```

- [ ] **Step 5: Verify**

```
preview_eval: window.location.href = 'http://localhost:5173/blog/recoveryos-development-update-2026-07.html'
preview_screenshot
```
Expected: same zoned pattern as `ai-info.html`, post title in Fraunces, body in Manrope, content unchanged.

```
preview_inspect selector ".post-title", styles ["font-family"]
```
Expected: starts with `Fraunces`.

- [ ] **Step 6: Commit**

```bash
git add "public/blog/recoveryos-development-update-2026-07.html"
git commit -m "feat: give the blog post a zoned-rhythm aurora background"
```

---

### Task 10: Zoned rhythm: `privacy-policy.html`

**Files:**
- Modify: `public/legal/privacy-policy.html`

This page (and Task 11's terms page) currently use a light theme (`#f7fafc` background, dark text) instead of the dark wash the other pages have. Per the design revision, legal pages move to the same dark, token-driven palette as the rest of the site.

- [ ] **Step 1: Add the theme and font links**

Find:
```html
  <title>Recovery OS | Privacy Policy</title>
  <style>
```

Replace with:
```html
  <title>Recovery OS | Privacy Policy</title>

  <link rel="stylesheet" href="/brand/theme.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Manrope:wght@400;600;800&display=swap" rel="stylesheet" />

  <style>
```

- [ ] **Step 2: Replace the light theme with the dark zoned-rhythm background**

Find:
```css
    body { font-family: system-ui, Segoe UI, sans-serif; line-height: 1.6; max-width: 42rem; margin: 0 auto; padding: 1.25rem; color: #1a2a3a; background: #f7fafc; }
    h1 { font-size: 1.35rem; letter-spacing: 0.08em; }
    h2 { font-size: 1.05rem; margin-top: 1.75rem; }
    p, li, td, th { font-size: 0.95rem; }
```

Replace with:
```css
    body {
      font-family: var(--font-body), system-ui, Segoe UI, sans-serif;
      line-height: 1.6;
      max-width: 42rem;
      margin: 0 auto;
      padding: 1.25rem;
      color: #dde8f0;
      background: var(--bg-base);
      position: relative;
      z-index: 1;
    }
    h1, h2 { font-family: var(--font-display); }
    h1 { font-size: 1.5rem; letter-spacing: 0.02em; color: #f2f8fc; }
    h2 { font-size: 1.2rem; margin-top: 1.75rem; color: #f2f8fc; }
    p, li, td, th { font-size: 0.95rem; color: #c8dae8; }

    .aurora-fixed {
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      background-image:
        radial-gradient(ellipse 55% 45% at 78% 10%, rgba(var(--accent-warm-rgb), 0.28), transparent 55%),
        radial-gradient(circle at 12% 28%, rgba(var(--accent-teal-rgb), 0.22), transparent 46%),
        radial-gradient(circle at 60% 62%, rgba(var(--accent-blue-rgb), 0.18), transparent 52%),
        linear-gradient(165deg, #0a1622 0%, #060d16 55%, #04080f 100%);
      background-size: 130% 130%, 130% 130%, 130% 130%, 100% 100%;
      background-position: 0% 0%, 0% 0%, 0% 0%, 0% 0%;
      animation: aux-aurora-drift 22s ease-in-out infinite alternate;
    }

    .aurora-fixed::after {
      content: '';
      position: absolute;
      inset: 0;
      opacity: 0.28;
      mix-blend-mode: overlay;
      background-image: var(--grain-svg);
    }

    .aurora-zone-dim {
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      background: linear-gradient(180deg, transparent 0px, transparent 560px, var(--bg-base) 860px);
    }

    @keyframes aux-aurora-drift {
      0%   { background-position: 0% 0%, 0% 0%, 0% 0%, 0% 0%; }
      100% { background-position: 3% 4%, -3% 3%, 2% -3%, 0% 0%; }
    }

    @media (prefers-reduced-motion: reduce) {
      .aurora-fixed {
        animation: none;
      }
    }
```

Note: this page has no wrapping `.page` div (the `body` itself is the constrained-width container, per its own `max-width: 42rem; margin: 0 auto;`), so `position: relative; z-index: 1` is applied directly to `body` here instead of a `.page` element like the other pages.

- [ ] **Step 3: Add the fixed background elements right after `<body>`**

Find:
```html
<body>
  <!-- Google Tag Manager (noscript) -->
```

Replace with:
```html
<body>
  <div class="aurora-fixed"></div>
  <div class="aurora-zone-dim"></div>
  <!-- Google Tag Manager (noscript) -->
```

- [ ] **Step 4: Check for any other hardcoded light-theme colors on this page**

Run: `grep -n "color:\s*#1a2a3a\|background:\s*#f7fafc\|background:\s*#fff" public/legal/privacy-policy.html`
Expected: no remaining matches outside what Step 2 already changed. If there are table-specific or callout-specific styles further down the file using the old light-theme colors (e.g. table borders, code blocks), read them and update to dark-theme-appropriate colors (light border on dark background, not dark-on-dark) using the same palette as the rest of the site (`#dde8f0` body text, `#f2f8fc` headings, `rgba(255,255,255,0.1)`-ish borders) before moving on.

- [ ] **Step 5: Verify**

```
preview_eval: window.location.href = 'http://localhost:5173/legal/privacy-policy.html'
preview_screenshot
```
Expected: dark background with the zoned aurora visible near the top, all text clearly readable against it (check contrast, this is a legal document, readability matters more here than anywhere else on the site).

```
preview_inspect selector "body", styles ["background", "color"]
```
Expected: `background` resolves to the dark token value, not `#f7fafc`.

- [ ] **Step 6: Commit**

```bash
git add public/legal/privacy-policy.html
git commit -m "feat: move privacy-policy.html to the dark zoned-rhythm palette"
```

---

### Task 11: Zoned rhythm: `terms-of-service.html`

**Files:**
- Modify: `public/legal/terms-of-service.html`

Same pattern as Task 10.

- [ ] **Step 1: Add the theme and font links**

Find:
```html
  <title>Recovery OS | Terms of Service</title>
  <style>
```

Replace with:
```html
  <title>Recovery OS | Terms of Service</title>

  <link rel="stylesheet" href="/brand/theme.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Manrope:wght@400;600;800&display=swap" rel="stylesheet" />

  <style>
```

- [ ] **Step 2: Replace the light theme with the dark zoned-rhythm background**

Find:
```css
    body { font-family: system-ui, Segoe UI, sans-serif; line-height: 1.6; max-width: 42rem; margin: 0 auto; padding: 1.25rem; color: #1a2a3a; background: #f7fafc; }
    h1 { font-size: 1.35rem; letter-spacing: 0.08em; }
    h2 { font-size: 1.05rem; margin-top: 1.75rem; }
    p, li, td, th { font-size: 0.95rem; }
```

Replace with:
```css
    body {
      font-family: var(--font-body), system-ui, Segoe UI, sans-serif;
      line-height: 1.6;
      max-width: 42rem;
      margin: 0 auto;
      padding: 1.25rem;
      color: #dde8f0;
      background: var(--bg-base);
      position: relative;
      z-index: 1;
    }
    h1, h2 { font-family: var(--font-display); }
    h1 { font-size: 1.5rem; letter-spacing: 0.02em; color: #f2f8fc; }
    h2 { font-size: 1.2rem; margin-top: 1.75rem; color: #f2f8fc; }
    p, li, td, th { font-size: 0.95rem; color: #c8dae8; }

    .aurora-fixed {
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      background-image:
        radial-gradient(ellipse 55% 45% at 78% 10%, rgba(var(--accent-warm-rgb), 0.28), transparent 55%),
        radial-gradient(circle at 12% 28%, rgba(var(--accent-teal-rgb), 0.22), transparent 46%),
        radial-gradient(circle at 60% 62%, rgba(var(--accent-blue-rgb), 0.18), transparent 52%),
        linear-gradient(165deg, #0a1622 0%, #060d16 55%, #04080f 100%);
      background-size: 130% 130%, 130% 130%, 130% 130%, 100% 100%;
      background-position: 0% 0%, 0% 0%, 0% 0%, 0% 0%;
      animation: aux-aurora-drift 22s ease-in-out infinite alternate;
    }

    .aurora-fixed::after {
      content: '';
      position: absolute;
      inset: 0;
      opacity: 0.28;
      mix-blend-mode: overlay;
      background-image: var(--grain-svg);
    }

    .aurora-zone-dim {
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      background: linear-gradient(180deg, transparent 0px, transparent 560px, var(--bg-base) 860px);
    }

    @keyframes aux-aurora-drift {
      0%   { background-position: 0% 0%, 0% 0%, 0% 0%, 0% 0%; }
      100% { background-position: 3% 4%, -3% 3%, 2% -3%, 0% 0%; }
    }

    @media (prefers-reduced-motion: reduce) {
      .aurora-fixed {
        animation: none;
      }
    }
```

- [ ] **Step 3: Add the fixed background elements right after `<body>`**

Find:
```html
<body>
  <!-- Google Tag Manager (noscript) -->
```

Replace with:
```html
<body>
  <div class="aurora-fixed"></div>
  <div class="aurora-zone-dim"></div>
  <!-- Google Tag Manager (noscript) -->
```

- [ ] **Step 4: Check for any other hardcoded light-theme colors on this page**

Run: `grep -n "color:\s*#1a2a3a\|background:\s*#f7fafc\|background:\s*#fff" public/legal/terms-of-service.html`
Expected: no remaining matches beyond what Step 2 already changed; update any that remain (callouts, tables) the same way as Task 10 Step 4.

- [ ] **Step 5: Verify**

```
preview_eval: window.location.href = 'http://localhost:5173/legal/terms-of-service.html'
preview_screenshot
```
Expected: same as Task 10's check, dark palette, zoned aurora, readable text.

```
preview_inspect selector "body", styles ["background", "color"]
```
Expected: `background` resolves to the dark token value, not `#f7fafc`.

- [ ] **Step 6: Commit**

```bash
git add public/legal/terms-of-service.html
git commit -m "feat: move terms-of-service.html to the dark zoned-rhythm palette"
```

---

### Task 12: Full-site verification pass

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite one more time**

Run: `npx vitest run`
Expected: `Test Files 5 passed (5)`, `Tests 22 passed (22)`.

- [ ] **Step 2: Walk every page at desktop width**

For each of: `/`, `/story.html`, `/ai-info.html`, `/blog/recoveryos-development-update-2026-07.html`, `/legal/privacy-policy.html`, `/legal/terms-of-service.html`:
```
preview_resize (width: 1440, height: 1000)
preview_eval: window.location.href = 'http://localhost:5173/<path>'
preview_screenshot
```
Expected: no layout breakage; homepage shows the continuous aurora with no-box/frosted/solid sections as mapped; story page shows the warm palette; the 4 auxiliary pages show zoned rhythm; legal pages are fully readable on the new dark background.

- [ ] **Step 3: Walk the homepage at mobile width, including the new viewer**

```
preview_resize (preset: "mobile")
preview_eval: window.location.href = 'http://localhost:5173/'
preview_screenshot
```
Scroll through hero, founder note, and the "What's included" + viewer section specifically.
Expected: the combined section stacks vertically (viewer above text, per the `@media (max-width: 860px)` rule from Task 3), thumbnails remain usable at narrow width, no horizontal overflow.

- [ ] **Step 4: Confirm the continuous background and reduced-motion behavior**

```bash
grep -n "body::before\|body::after" src/style.css
```
Expected: one `animation: aurora-drift ...` declaration on `body::before`, and the existing `prefers-reduced-motion` block should disable it (check that block still exists and targets the right things after Task 4's edits removed the checkbox-specific rule from it).

- [ ] **Step 5: Confirm no dead CSS selectors remain from the deleted sections**

```bash
grep -n "screenshot-card\|compare-column\|compare-grid\|pro-highlight\|waitlist-interests\|waitlist-check" src/style.css src/main.js
```
Expected: no matches. If any remain, remove them (they're leftovers from a task that wasn't fully applied).

- [ ] **Step 6: Final commit (only if any cleanup happened during verification)**

If Steps 1-5 required no fixes, there's nothing to commit here, this task is a checkpoint, not a code change. If a fix was needed, commit it with a message describing what the verification pass caught.
