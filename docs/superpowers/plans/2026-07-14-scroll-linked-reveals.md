# Scroll-Linked Reveals Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace one-shot homepage reveals with smooth, reversible opacity and translation values driven directly by each element's viewport position.

**Architecture:** Add a focused scroll-animation module containing a pure visibility calculation and a requestAnimationFrame-coalesced DOM controller. `main.js` initializes the controller, while `style.css` maps the computed custom property to opacity and translation with a reduced-motion override.

**Tech Stack:** Vanilla JavaScript ES modules, CSS custom properties, Vite 8, Vitest 4, jsdom.

---

## File structure

- Create `src/scrollAnimations.js`: Own the viewport-position calculation and scroll/resize controller.
- Create `src/scrollAnimations.test.js`: Test the pure calculation, initial DOM update, and animation-frame coalescing.
- Modify `src/main.js`: Import and initialize the focused controller; remove the old one-shot observer.
- Modify `src/style.css`: Replace time-based reveal transitions and stagger delays with scroll-linked opacity and translation.

### Task 1: Pure visibility calculation

**Files:**
- Create: `src/scrollAnimations.js`
- Test: `src/scrollAnimations.test.js`

- [ ] **Step 1: Write the failing visibility tests**

Create `src/scrollAnimations.test.js` with:

```js
// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { calculateScrollVisibility } from "./scrollAnimations.js";

describe("calculateScrollVisibility", () => {
  it("is hidden when the element is outside the viewport", () => {
    expect(calculateScrollVisibility({ top: 1100, bottom: 1200 }, 1000)).toBe(0);
    expect(calculateScrollVisibility({ top: -200, bottom: -100 }, 1000)).toBe(0);
  });

  it("follows the lower entry fade zone", () => {
    expect(calculateScrollVisibility({ top: 825, bottom: 1025 }, 1000)).toBeCloseTo(0.5);
  });

  it("is fully visible through the central reading zone", () => {
    expect(calculateScrollVisibility({ top: 350, bottom: 650 }, 1000)).toBe(1);
    expect(calculateScrollVisibility({ top: -200, bottom: 1200 }, 1000)).toBe(1);
  });

  it("follows the upper exit fade zone", () => {
    expect(calculateScrollVisibility({ top: -25, bottom: 175 }, 1000)).toBeCloseTo(0.5);
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npx vitest run src/scrollAnimations.test.js`

Expected: FAIL because `src/scrollAnimations.js` does not exist.

- [ ] **Step 3: Implement the pure calculation**

Create `src/scrollAnimations.js` with:

```js
const DEFAULT_FADE_ZONE_RATIO = 0.35;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function calculateScrollVisibility(
  { top, bottom },
  viewportHeight,
  fadeZoneRatio = DEFAULT_FADE_ZONE_RATIO,
) {
  if (viewportHeight <= 0) return 1;

  const fadeDistance = viewportHeight * fadeZoneRatio;
  if (fadeDistance <= 0) return 1;

  const entryProgress = clamp((viewportHeight - top) / fadeDistance, 0, 1);
  const exitProgress = clamp(bottom / fadeDistance, 0, 1);

  return Math.min(entryProgress, exitProgress);
}
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `npx vitest run src/scrollAnimations.test.js`

Expected: 4 tests pass.

### Task 2: Animation-frame controller

**Files:**
- Modify: `src/scrollAnimations.js`
- Modify: `src/scrollAnimations.test.js`

- [ ] **Step 1: Write the failing controller tests**

Append to `src/scrollAnimations.test.js`:

```js
import { beforeEach, vi } from "vitest";
import { initScrollAnimations } from "./scrollAnimations.js";

describe("initScrollAnimations", () => {
  beforeEach(() => {
    document.body.innerHTML = '<section data-animate></section>';
  });

  it("sets the initial visibility before the user scrolls", () => {
    const target = document.querySelector("[data-animate]");
    vi.spyOn(target, "getBoundingClientRect").mockReturnValue({
      top: 825,
      bottom: 1025,
    });

    const viewport = {
      innerHeight: 1000,
      requestAnimationFrame: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      matchMedia: vi.fn(() => ({ matches: false })),
    };

    initScrollAnimations({ root: document, viewport });

    expect(target.style.getPropertyValue("--scroll-visibility")).toBe("0.500");
  });

  it("coalesces repeated scroll events into one animation frame", () => {
    const listeners = new Map();
    let frameCallback;
    const target = document.querySelector("[data-animate]");
    vi.spyOn(target, "getBoundingClientRect")
      .mockReturnValueOnce({ top: 825, bottom: 1025 })
      .mockReturnValue({ top: 350, bottom: 650 });

    const viewport = {
      innerHeight: 1000,
      requestAnimationFrame: vi.fn((callback) => {
        frameCallback = callback;
        return 1;
      }),
      cancelAnimationFrame: vi.fn(),
      addEventListener: vi.fn((type, listener) => listeners.set(type, listener)),
      removeEventListener: vi.fn(),
      matchMedia: vi.fn(() => ({ matches: false })),
    };

    const cleanup = initScrollAnimations({ root: document, viewport });
    listeners.get("scroll")();
    listeners.get("scroll")();

    expect(viewport.requestAnimationFrame).toHaveBeenCalledTimes(1);

    frameCallback();
    expect(target.style.getPropertyValue("--scroll-visibility")).toBe("1.000");

    cleanup();
    expect(viewport.removeEventListener).toHaveBeenCalledWith("scroll", expect.any(Function));
    expect(viewport.removeEventListener).toHaveBeenCalledWith("resize", expect.any(Function));
  });

  it("leaves content visible when reduced motion is requested", () => {
    const target = document.querySelector("[data-animate]");
    const viewport = {
      requestAnimationFrame: vi.fn(),
      addEventListener: vi.fn(),
      matchMedia: vi.fn(() => ({ matches: true })),
    };

    initScrollAnimations({ root: document, viewport });

    expect(target.style.getPropertyValue("--scroll-visibility")).toBe("");
    expect(viewport.addEventListener).not.toHaveBeenCalled();
  });
});
```

Consolidate the Vitest imports at the top of the file so each symbol is imported once.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npx vitest run src/scrollAnimations.test.js`

Expected: FAIL because `initScrollAnimations` is not exported.

- [ ] **Step 3: Implement the controller**

Append to `src/scrollAnimations.js`:

```js
export function initScrollAnimations({
  root = document,
  viewport = window,
  fadeZoneRatio = DEFAULT_FADE_ZONE_RATIO,
} = {}) {
  const targets = [...root.querySelectorAll("[data-animate]")];
  const reducedMotion = viewport.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  if (!targets.length || reducedMotion || !viewport.requestAnimationFrame) {
    return () => {};
  }

  let frameId = null;

  const update = () => {
    targets.forEach((target) => {
      const visibility = calculateScrollVisibility(
        target.getBoundingClientRect(),
        viewport.innerHeight,
        fadeZoneRatio,
      );
      target.style.setProperty("--scroll-visibility", visibility.toFixed(3));
    });
  };

  const scheduleUpdate = () => {
    if (frameId !== null) return;

    frameId = viewport.requestAnimationFrame(() => {
      frameId = null;
      update();
    });
  };

  viewport.addEventListener("scroll", scheduleUpdate, { passive: true });
  viewport.addEventListener("resize", scheduleUpdate);
  update();

  return () => {
    viewport.removeEventListener("scroll", scheduleUpdate);
    viewport.removeEventListener("resize", scheduleUpdate);
    if (frameId !== null) viewport.cancelAnimationFrame?.(frameId);
  };
}
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `npx vitest run src/scrollAnimations.test.js`

Expected: 7 tests pass.

### Task 3: Homepage integration and styling

**Files:**
- Modify: `src/main.js:1-15, 727-748`
- Modify: `src/style.css:993-1045`

- [ ] **Step 1: Integrate the controller in `main.js`**

Add the import with the existing local imports:

```js
import { initScrollAnimations } from "./scrollAnimations.js";
```

Delete the existing local `initScrollAnimations()` function that creates an `IntersectionObserver`. Keep the existing initialization call near the bottom of the file:

```js
initScrollAnimations();
```

- [ ] **Step 2: Replace the one-shot CSS**

Replace the scroll-triggered animation block in `src/style.css` with:

```css
/* ============================================================
   SCROLL-LINKED VISIBILITY
   JavaScript updates one unitless value from viewport position. The
   presentation follows that value directly, so reversing scroll also
   reverses the effect without a time-based transition lag.
   ============================================================ */
[data-animate] {
  --scroll-visibility: 1;
  opacity: var(--scroll-visibility);
  transform: translateY(calc((1 - var(--scroll-visibility)) * 12px));
  will-change: opacity, transform;
}
```

Delete the `.animated` selector, transition declarations, and grid stagger rules. Preserve the existing `prefers-reduced-motion` block, which forces opacity and transform to their fully visible states.

- [ ] **Step 3: Run focused and full tests**

Run: `npx vitest run src/scrollAnimations.test.js src/main.test.js`

Expected: 12 tests pass.

Run: `npm test`

Expected: all repository tests pass.

- [ ] **Step 4: Build and inspect diff hygiene**

Run: `npm run build`

Expected: Vite production build succeeds.

Run: `git diff --check`

Expected: no whitespace errors.

Run: `rg -n "IntersectionObserver|\.animated|transition-delay" src/main.js src/style.css`

Expected: no matches from the removed reveal implementation.

- [ ] **Step 5: Commit the implementation**

```bash
git add src/scrollAnimations.js src/scrollAnimations.test.js src/main.js src/style.css
git commit -m "feat: link content reveals to scroll position"
```

### Task 4: Rendered verification and handoff

**Files:**
- Modify: `C:/Users/codem/AI-Brain/Systems/AgentLog/Current-Handoff.md`
- Create or modify: `C:/Users/codem/AI-Brain/Systems/AgentLog/2026-07-14 RecoveryOS web scroll-linked reveals.md`

- [ ] **Step 1: Start a local preview server**

Run: `npm run dev -- --host 127.0.0.1 --port 4179`

Expected: Vite reports `http://127.0.0.1:4179/` and leaves the process running.

- [ ] **Step 2: Verify desktop behavior**

At 1440 by 1000, verify that marked items increase opacity through the lower 35 percent, remain fully visible in the central reading zone, and decrease through the upper 35 percent. Scroll down and back up to confirm immediate reversal. Verify the console has no errors.

- [ ] **Step 3: Verify mobile and reduced motion**

At 390 by 844, verify the same reversible behavior and confirm document width does not exceed viewport width. Emulate `prefers-reduced-motion: reduce` and verify all marked content remains fully visible without transforms.

- [ ] **Step 4: Update the AgentLog**

Record the branch, commits, behavior delta, touched paths, exact verification results, preview URL, and the preserved unrelated `.mcp.json` and `.codex/` state. Keep unrelated concurrent handoff sections intact.

- [ ] **Step 5: Leave the preview server running**

Confirm port 4179 belongs to this repository's Vite process and report the URL to Michael. Do not stop or replace any unrelated local service.
