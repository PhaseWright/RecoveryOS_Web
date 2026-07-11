# Visual Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the site's generic, dated visual language (Inter everywhere, flat gradient-blob backgrounds, every section styled as an identical bordered card) with the approved design: a warm amber+teal+blue "aurora" background used sparingly on the hero and founder-note as accents (not wallpaper), Fraunces+Manrope typography, an editorial (no-card) treatment for the founder note, and a shared token stylesheet so the site's 5 static subpages stop drifting out of sync with the homepage and each other.

**Architecture:** One new shared CSS file (`public/brand/theme.css`) defines color/font/texture tokens as CSS custom properties. `index.html` and all 5 static subpages link it; `src/style.css` (the homepage bundle) consumes the same tokens via `var()` without redefining them. A new `.aurora-surface` utility class in `src/style.css` provides the animated gradient+grain background, applied only to the hero and founder-note sections. The 5 static subpages get font/background token updates only, no layout restructuring, since each has a legitimately different structure (long-form article, FAQ list, blog post, plain legal document).

**Tech Stack:** Plain CSS custom properties, Google Fonts (Fraunces, Manrope), vanilla JS template strings (`src/main.js`), Vite static asset serving from `public/`.

**Reference:** Full design rationale and rejected alternatives are in `docs/superpowers/specs/2026-07-09-visual-refresh-design.md`. Read it first if anything below seems under-motivated.

---

## Before you start

This is a pure visual/CSS change. There are no new unit tests to write: instead, every task ends with (a) running the existing `vitest` suite to catch regressions and (b) a specific visual check using the `preview_*` browser tools (screenshot, `preview_inspect` for computed styles). Do not skip the visual checks; CSS changes that don't break JS logic will still pass `vitest` while looking completely wrong.

Start the dev server once at the beginning (`preview_start` with the `dev` config already in `.claude/launch.json`, `npm run dev` on port 5173) and reuse it across tasks; reload between tasks with `preview_eval` (`window.location.reload()`).

---

### Task 1: Create the shared token stylesheet

**Files:**
- Create: `public/brand/theme.css`

- [ ] **Step 1: Write the token file**

```css
/*
 * Shared visual tokens for RecoveryOS. Every HTML surface on the site
 * (the Vite-bundled homepage app and the static pages in /public) links
 * this file so color, type, and texture stay in sync instead of
 * drifting apart. This file defines tokens only, no layout or
 * component rules.
 */
:root {
  /* Color */
  --bg-base: #060d16;
  --accent-teal: #00d4aa;
  --accent-teal-soft: #7af5de;
  --accent-blue: #246bfe;
  --accent-warm: #ffb066;

  /* RGB triplets for use inside rgba(), since a hex custom property
     can't be passed directly to rgba(). */
  --accent-teal-rgb: 0, 212, 170;
  --accent-blue-rgb: 36, 107, 254;
  --accent-warm-rgb: 255, 176, 102;

  /* Type */
  --font-display: 'Fraunces', Georgia, serif;
  --font-body: 'Manrope', 'Segoe UI', Roboto, sans-serif;

  /* Shared grain texture, used by .aurora-surface in src/style.css */
  --grain-svg: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.45'/%3E%3C/svg%3E");
}
```

- [ ] **Step 2: Commit**

```bash
git add public/brand/theme.css
git commit -m "feat: add shared visual token stylesheet"
```

---

### Task 2: Wire the homepage onto the token layer

**Files:**
- Modify: `index.html:46-49`
- Modify: `src/style.css:1-12` (root font/background), and the block starting `/* ============================================================\n   TYPOGRAPHY — Inter\n   ============================================================ */` (currently around line 933-938)
- Modify: `src/style.css:64-72` (body background wash)

- [ ] **Step 1: Swap the font `<link>` and add the theme link in `index.html`**

Find:
```html
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
```

Replace with:
```html
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Manrope:wght@400;600;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/brand/theme.css" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
```

- [ ] **Step 2: Make `src/style.css`'s root font/background consume the tokens**

Find:
```css
:root {
  font-family: "Segoe UI", Inter, Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  color: #dde8f0;
  background: #070d18;
  color-scheme: dark;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

Replace with:
```css
:root {
  font-family: var(--font-body);
  line-height: 1.5;
  font-weight: 400;
  color: #dde8f0;
  background: var(--bg-base);
  color-scheme: dark;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1, h2, h3, blockquote {
  font-family: var(--font-display);
}
```

- [ ] **Step 3: Delete the now-conflicting second `:root` override**

Later in the same file there is a redundant block that would silently undo Step 2 (same-specificity `:root` rules resolve by source order, so this one, coming later, would win and bring back Inter). Find:

```css
/* ============================================================
   TYPOGRAPHY — Inter
   ============================================================ */
:root {
  font-family: "Inter", "Segoe UI", system-ui, sans-serif;
}
```

Replace with:
```css
/* ============================================================
   TYPOGRAPHY: Fraunces (display) + Manrope (body), via theme.css
   ============================================================ */
```

- [ ] **Step 4: Tokenize the body background wash and add a subtle warm accent**

Find:
```css
body {
  margin: 0;
  background:
    radial-gradient(circle at top right, rgba(0, 212, 170, 0.18), transparent 38%),
    radial-gradient(circle at 20% 10%, rgba(0, 168, 255, 0.12), transparent 34%),
    radial-gradient(circle at 70% 65%, rgba(36, 107, 254, 0.12), transparent 48%),
    #070d18;
  color: #dde8f0;
}
```

Replace with:
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

(The `rgba(0, 168, 255, 0.12)` layer is a distinct cyan used only for texture variety: it doesn't match any named token, so it's left as a literal. Only stop-colors that actually match a defined accent get tokenized.)

- [ ] **Step 5: Verify**

Run: `npx vitest run`
Expected: `5 passed`, `22 passed` (same as before this change, since no test file references fonts or colors, so this is a pure regression check).

Start/reload the dev server and check:
```
preview_start (name: "dev")
preview_eval: window.location.reload()
preview_inspect selector "h1", styles ["font-family"]
```
Expected: computed `font-family` starts with `Fraunces`.
```
preview_inspect selector "body", styles ["font-family"]
```
Expected: computed `font-family` starts with `Manrope`.
```
preview_screenshot
```
Expected: page still renders (no layout breakage), text now in the new typefaces, background wash visually similar to before but with a faint warm tint.

- [ ] **Step 6: Commit**

```bash
git add index.html src/style.css
git commit -m "feat: switch homepage typography to Fraunces/Manrope and consume shared tokens"
```

---

### Task 3: Build the aurora-surface utility and apply it to the hero

**Files:**
- Modify: `src/style.css` (insert new rules after `.phone-frame img { ... }`, and inside the existing `@media (prefers-reduced-motion: reduce)` block)
- Modify: `src/style.css:943-948` (`.hero` grid rule, add padding)
- Modify: `src/main.js:37` (add class to hero section)

- [ ] **Step 1: Add the `.aurora-surface` utility**

Find (the end of the phone-frame rules, right before the "HERO ENTRANCE ANIMATION" section comment):
```css
.phone-frame img {
  width: 100%;
  border-radius: 2rem;
  display: block;
}

/* ============================================================
   HERO ENTRANCE ANIMATION
   ============================================================ */
```

Replace with:
```css
.phone-frame img {
  width: 100%;
  border-radius: 2rem;
  display: block;
}

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

- [ ] **Step 2: Give `.hero` panel padding so the aurora has room to breathe**

Find:
```css
.hero {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2.5rem;
  align-items: center;
}
```

Replace with:
```css
.hero {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2.5rem;
  align-items: center;
  padding: 2.75rem 2.5rem;
}
```

- [ ] **Step 3: Disable the drift animation under reduced motion**

Find:
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

  .waitlist-check input[type="checkbox"] {
    transition: none;
  }
}
```

Replace with:
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

  .aurora-surface::before {
    animation: none !important;
  }

  .waitlist-check input[type="checkbox"] {
    transition: none;
  }
}
```

- [ ] **Step 4: Apply the class to the hero section in `src/main.js`**

Find:
```javascript
      <section class="hero">
```

Replace with:
```javascript
      <section class="hero aurora-surface">
```

- [ ] **Step 5: Verify**

Run: `npx vitest run`
Expected: `5 passed`, `22 passed`.

```
preview_eval: window.location.reload()
preview_screenshot
```
Expected: hero now sits inside a rounded panel with a visible amber/teal/blue gradient glow and faint grain texture, headline and store badges still fully readable on top of it.

```
preview_inspect selector ".hero", styles ["padding", "border-radius", "overflow"]
```
Expected: `padding: 44px 40px` (2.75rem/2.5rem at default 16px root), `border-radius: 20px` (1.25rem), `overflow: hidden`.

Watch the hero for ~5 seconds in a screenshot taken a couple of seconds apart from the first: the gradient position should have shifted very slightly (the drift is intentionally subtle; if it's not visible at all, double check the `animation` shorthand and keyframe percentages).

- [ ] **Step 6: Commit**

```bash
git add src/style.css src/main.js
git commit -m "feat: add aurora-surface background utility, apply to hero"
```

---

### Task 4: Rebuild the founder note as an editorial aurora panel

**Files:**
- Modify: `src/main.js:163-191` (founder-quote section markup)
- Modify: `src/style.css:779-838` (founder-quote rules)

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
      <section class="founder-quote aurora-surface" data-animate>
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

(The rest of the section, the blockquote copy, signoff, and story link, is unchanged.)

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

(`.founder-quote`'s `margin-bottom` was dropped here because a later consolidated rule in the same file, `.founder-quote { margin-bottom: 2.5rem; }`, already sets it: leaving the old declaration in would just be dead code immediately overridden by source order. `border-radius`/`background`/`border` are gone because `.aurora-surface`, added to this section's class list in Step 1, now provides all three.)

- [ ] **Step 3: Verify**

Run: `npx vitest run`
Expected: `5 passed`, `22 passed`.

```
preview_eval: window.location.reload()
```
Scroll to the founder-note section (it's directly above the screenshot gallery) and:
```
preview_screenshot
```
Expected: no card box/border around the section anymore; a 140px circular photo of Michael on the left; a larger serif pull-quote with a left accent border on the right; the same aurora gradient+grain background as the hero, visibly distinct from the plain dark sections above and below it.

```
preview_inspect selector ".founder-photo", styles ["width", "height", "border-radius"]
```
Expected: `width: 140px`, `height: 140px`, `border-radius: 50%`.

- [ ] **Step 4: Commit**

```bash
git add src/main.js src/style.css
git commit -m "feat: rebuild founder note as an editorial aurora panel"
```

---

### Task 5: Soften card borders to the shared teal token

**Files:**
- Modify: `src/style.css`: `.feature-card`, `.screenshot-card`, `.trust`, `.compare-column`, `.roadmap-card`

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

- [ ] **Step 2: `.screenshot-card`**

Find:
```css
.screenshot-card {
  background: #0b1524;
  border: 1px solid #1a2e44;
  border-radius: 0.85rem;
  padding: 0.75rem;
}
```

Replace with:
```css
.screenshot-card {
  background: #0b1524;
  border: 1px solid rgba(var(--accent-teal-rgb), 0.16);
  border-radius: 0.85rem;
  padding: 0.75rem;
}
```

- [ ] **Step 3: `.trust`**

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
  background: #0b1524;
  border: 1px solid rgba(var(--accent-teal-rgb), 0.16);
  border-radius: 0.85rem;
  padding: 1.1rem;
}
```

- [ ] **Step 4: `.compare-column`**

Find:
```css
.compare-column {
  background: #0b1524;
  border: 1px solid #1a2e44;
  border-radius: 0.85rem;
  padding: 1rem 1.05rem;
  min-width: 0;
}
```

Replace with:
```css
.compare-column {
  background: #0b1524;
  border: 1px solid rgba(var(--accent-teal-rgb), 0.16);
  border-radius: 0.85rem;
  padding: 1rem 1.05rem;
  min-width: 0;
}
```

- [ ] **Step 5: `.roadmap-card`**

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

- [ ] **Step 6: Verify**

Run: `npx vitest run`
Expected: `5 passed`, `22 passed`.

```
preview_eval: window.location.reload()
preview_screenshot
```
Scroll through the features grid, screenshot gallery, Free/Pro comparison, and roadmap grid. Expected: all card borders now read as a single, subtle teal-tinted line instead of the previous three slightly different flat navy shades. It's a small change, but check it isn't so faint the cards lose definition against their background.

- [ ] **Step 7: Commit**

```bash
git add src/style.css
git commit -m "refactor: unify card border colors to the shared teal token"
```

---

### Task 6: Roll tokens onto `story.html`

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

- [ ] **Step 2: Swap the font stack and background wash to tokens**

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
      background:
        radial-gradient(circle at top right, rgba(var(--accent-teal-rgb), 0.14), transparent 38%),
        radial-gradient(circle at 20% 10%, rgba(0, 168, 255, 0.08), transparent 34%),
        radial-gradient(circle at 70% 65%, rgba(var(--accent-blue-rgb), 0.08), transparent 48%),
        radial-gradient(circle at 50% 100%, rgba(var(--accent-warm-rgb), 0.04), transparent 45%),
        var(--bg-base);
      color: #dde8f0;
      line-height: 1.7;
    }
```

- [ ] **Step 3: Verify**

This page isn't covered by `vitest` (it's a static file with no JS logic), so verification is visual only.

```
preview_eval: window.location.href = 'http://localhost:5173/story.html'
preview_screenshot
```
Expected: title and section headings now render in Fraunces, body copy in Manrope, background wash has a faint added warm tint, page otherwise unchanged (same content, same layout).

```
preview_inspect selector ".story-title", styles ["font-family"]
```
Expected: starts with `Fraunces`.

- [ ] **Step 4: Commit**

```bash
git add public/story.html
git commit -m "feat: roll shared visual tokens onto story.html"
```

---

### Task 7: Roll tokens onto `ai-info.html`

**Files:**
- Modify: `public/ai-info.html`

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

- [ ] **Step 2: Swap the font stack and background wash to tokens**

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
      background:
        radial-gradient(circle at top right, rgba(var(--accent-teal-rgb), 0.14), transparent 38%),
        radial-gradient(circle at 20% 10%, rgba(0, 168, 255, 0.08), transparent 34%),
        radial-gradient(circle at 50% 100%, rgba(var(--accent-warm-rgb), 0.04), transparent 45%),
        var(--bg-base);
      color: #dde8f0;
      line-height: 1.7;
    }
```

This page is a dense Q&A/FAQ reference, not a narrative page, so it intentionally keeps a calmer 2-color wash (teal + a faint warm touch) rather than adding the third blue radial `story.html` has. Don't add one.

- [ ] **Step 3: Verify**

```
preview_eval: window.location.href = 'http://localhost:5173/ai-info.html'
preview_screenshot
```
Expected: page title and Q&A headings in Fraunces, body/answer text in Manrope, background wash subtly warmer, all Q&A content unchanged.

```
preview_inspect selector ".page-title", styles ["font-family"]
```
Expected: starts with `Fraunces`.

Also confirm the FAQ structured data still parses (this page has two `<script type="application/ld+json">` blocks that must not have been touched by this edit, since the edit only touched the `<style>` block):
```bash
node -e "
const fs = require('fs');
const html = fs.readFileSync('public/ai-info.html','utf8');
const re = /<script type=\"application\/ld\+json\">([\s\S]*?)<\/script>/g;
let m, i=0;
while ((m = re.exec(html))) { i++; try { JSON.parse(m[1]); console.log('block', i, 'OK'); } catch(e) { console.log('block', i, 'FAILED:', e.message); } }
"
```
Expected: `block 1 OK`, `block 2 OK`.

- [ ] **Step 4: Commit**

```bash
git add public/ai-info.html
git commit -m "feat: roll shared visual tokens onto ai-info.html"
```

---

### Task 8: Roll tokens onto the blog post

**Files:**
- Modify: `public/blog/recoveryos-development-update-2026-07.html`

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

- [ ] **Step 2: Swap the font stack and background wash to tokens**

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
      background:
        radial-gradient(circle at top right, rgba(var(--accent-teal-rgb), 0.14), transparent 38%),
        radial-gradient(circle at 20% 10%, rgba(0, 168, 255, 0.08), transparent 34%),
        radial-gradient(circle at 50% 100%, rgba(var(--accent-warm-rgb), 0.04), transparent 45%),
        var(--bg-base);
      color: #dde8f0;
      line-height: 1.7;
    }
```

- [ ] **Step 3: Verify**

```
preview_eval: window.location.href = 'http://localhost:5173/blog/recoveryos-development-update-2026-07.html'
preview_screenshot
```
Expected: post title in Fraunces, body copy in Manrope, background wash subtly warmer, content unchanged.

```
preview_inspect selector ".post-title", styles ["font-family"]
```
Expected: starts with `Fraunces`.

- [ ] **Step 4: Commit**

```bash
git add "public/blog/recoveryos-development-update-2026-07.html"
git commit -m "feat: roll shared visual tokens onto the blog post"
```

---

### Task 9: Roll type tokens onto `privacy-policy.html` (typography only)

The legal pages use a deliberately different, light, plain color scheme (`#f7fafc` background, dark text) for readability, and that's correct and stays as-is. Only the font stack changes here, not the colors.

**Files:**
- Modify: `public/legal/privacy-policy.html`

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

- [ ] **Step 2: Swap the font stack, leave colors untouched**

Find:
```css
    body { font-family: system-ui, Segoe UI, sans-serif; line-height: 1.6; max-width: 42rem; margin: 0 auto; padding: 1.25rem; color: #1a2a3a; background: #f7fafc; }
    h1 { font-size: 1.35rem; letter-spacing: 0.08em; }
    h2 { font-size: 1.05rem; margin-top: 1.75rem; }
    p, li, td, th { font-size: 0.95rem; }
```

Replace with:
```css
    body { font-family: var(--font-body), system-ui, Segoe UI, sans-serif; line-height: 1.6; max-width: 42rem; margin: 0 auto; padding: 1.25rem; color: #1a2a3a; background: #f7fafc; }
    h1, h2 { font-family: var(--font-display); }
    h1 { font-size: 1.35rem; letter-spacing: 0.08em; }
    h2 { font-size: 1.05rem; margin-top: 1.75rem; }
    p, li, td, th { font-size: 0.95rem; }
```

- [ ] **Step 3: Verify**

```
preview_eval: window.location.href = 'http://localhost:5173/legal/privacy-policy.html'
preview_screenshot
```
Expected: page still light-background/dark-text exactly as before, only the heading and body typefaces have changed (Fraunces headings, Manrope body).

```
preview_inspect selector "body", styles ["background", "color"]
```
Expected: `background` still resolves to `#f7fafc` (or `rgb(247, 250, 252)`), `color` still `#1a2a3a` (or `rgb(26, 42, 58)`), confirming the color scheme genuinely didn't change.

- [ ] **Step 4: Commit**

```bash
git add public/legal/privacy-policy.html
git commit -m "feat: roll shared type tokens onto privacy-policy.html"
```

---

### Task 10: Roll type tokens onto `terms-of-service.html` (typography only)

Same rationale and pattern as Task 9.

**Files:**
- Modify: `public/legal/terms-of-service.html`

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

- [ ] **Step 2: Swap the font stack, leave colors untouched**

Find:
```css
    body { font-family: system-ui, Segoe UI, sans-serif; line-height: 1.6; max-width: 42rem; margin: 0 auto; padding: 1.25rem; color: #1a2a3a; background: #f7fafc; }
    h1 { font-size: 1.35rem; letter-spacing: 0.08em; }
    h2 { font-size: 1.05rem; margin-top: 1.75rem; }
    p, li, td, th { font-size: 0.95rem; }
```

Replace with:
```css
    body { font-family: var(--font-body), system-ui, Segoe UI, sans-serif; line-height: 1.6; max-width: 42rem; margin: 0 auto; padding: 1.25rem; color: #1a2a3a; background: #f7fafc; }
    h1, h2 { font-family: var(--font-display); }
    h1 { font-size: 1.35rem; letter-spacing: 0.08em; }
    h2 { font-size: 1.05rem; margin-top: 1.75rem; }
    p, li, td, th { font-size: 0.95rem; }
```

- [ ] **Step 3: Verify**

```
preview_eval: window.location.href = 'http://localhost:5173/legal/terms-of-service.html'
preview_screenshot
```
Expected: same as Task 9's check: light theme unchanged, only typefaces updated.

```
preview_inspect selector "body", styles ["background", "color"]
```
Expected: `background` still `#f7fafc`, `color` still `#1a2a3a`.

- [ ] **Step 4: Commit**

```bash
git add public/legal/terms-of-service.html
git commit -m "feat: roll shared type tokens onto terms-of-service.html"
```

---

### Task 11: Full-site verification pass

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
Expected: no layout breakage, correct fonts, dark pages keep the updated aurora-tinted wash, legal pages keep the light theme.

- [ ] **Step 3: Walk the homepage at mobile width**

```
preview_resize (preset: "mobile")
preview_eval: window.location.href = 'http://localhost:5173/'
preview_screenshot
```
Scroll through hero, founder note, and the card grids.
Expected: hero and founder-note aurora panels still render correctly at narrow width (the hero's `grid-template-columns: 1fr` mobile override already hides `.hero-visual`; confirm the aurora background and padding still look intentional with just the text content), card borders still visible, no horizontal scroll/overflow introduced by the new padding on `.hero`.

- [ ] **Step 4: Confirm the aurora drift is present and the reduced-motion rule is correctly scoped**

```
preview_inspect selector ".aurora-surface::before" 
```
(If the tool can't inspect pseudo-elements directly, instead grep the source to confirm the rule exists and is inside the media query as intended:)
```bash
grep -n "aurora-surface::before" -A 2 src/style.css
```
Expected: one `animation: aurora-drift ...` declaration in the base rule, and one `animation: none !important;` declaration inside `@media (prefers-reduced-motion: reduce)`.

- [ ] **Step 5: Final commit (only if any cleanup happened during verification)**

If Steps 1-4 required no fixes, there's nothing to commit here: this task is a checkpoint, not a code change. If a fix was needed, commit it with a message describing what the verification pass caught.
