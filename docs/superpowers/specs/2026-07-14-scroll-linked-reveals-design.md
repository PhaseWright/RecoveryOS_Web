# Scroll-Linked Reveal Design

**Date:** 2026-07-14
**Status:** Approved

## Goal

Replace the homepage's one-shot entrance animations with visibility that follows the user's scroll position. Marked content should fade in as it enters the viewport, remain fully readable through the central viewing area, and fade out as it leaves. Reversing scroll direction must reverse the effect immediately.

## Existing behavior

`initScrollAnimations()` observes `[data-animate]` elements with a single `IntersectionObserver`. When an element first intersects, the function adds `.animated` and permanently stops observing it. CSS then runs a time-based opacity, translation, and scale transition. This produces the current pop-in behavior and cannot fade content back out.

## Interaction model

Each `[data-animate]` element receives a continuous visibility value between `0` and `1`:

- `0` when the element is outside the viewport.
- Increasing from `0` to `1` while the element enters through the lower fade zone.
- `1` while the element spans the central reading zone.
- Decreasing from `1` to `0` while the element exits through the upper fade zone.

The upper and lower fade zones each occupy 35 percent of the viewport height. Visibility is the smaller of the entry and exit progress values. This keeps sections taller than the viewport fully visible while they span the central reading zone instead of relying on the element's center point.

The CSS treatment uses the visibility value for opacity and a subtle vertical offset. Scaling is removed. The effect is continuous and reversible, so its rate follows the user's actual scrolling.

## Architecture

### Visibility calculation

A small pure function accepts an element rectangle, viewport height, and fade-zone ratio. It returns the clamped visibility value. Keeping this calculation independent from the DOM makes the boundary behavior directly testable.

### Scroll controller

`initScrollAnimations()` keeps the existing `[data-animate]` markers and:

1. Collects the marked elements.
2. Schedules at most one visual update per animation frame.
3. Reads each element's current `getBoundingClientRect()`.
4. Writes `--scroll-visibility` as an inline custom property.
5. Responds to passive `scroll` events and `resize` events.
6. Performs an initial synchronous update so content has the correct state before the first interaction.

The controller uses `requestAnimationFrame` to coalesce rapid events and avoid repeated layout work within a frame. No new production dependency is required.

### Styling

`[data-animate]` reads `--scroll-visibility`, defaulting to `1` if JavaScript is unavailable. Opacity maps directly to visibility. Translation maps from a small positive offset at `0` to no offset at `1`. There are no time-based transitions or per-card stagger delays, because either would make the effect lag behind the scroll position.

The hero's existing load animation remains unchanged because it is tied to initial page entry, not scrolling.

## Accessibility and fallback behavior

- Under `prefers-reduced-motion: reduce`, marked content is always fully visible and has no transform.
- If `requestAnimationFrame` or another required browser API is unavailable, the CSS default keeps content fully visible.
- The effect changes presentation only. Reading order, focus order, links, forms, and semantics do not change.
- Opacity reaches full strength throughout the central reading zone so content is not persistently dim while being read.

## Testing

Focused unit tests cover:

- Fully outside the viewport returns `0`.
- Entry through the lower fade zone produces an intermediate value.
- Content spanning the central reading zone returns `1`.
- Exit through the upper fade zone produces an intermediate value.
- Equivalent positions produce the same value regardless of scroll direction.
- The controller updates the CSS property initially and coalesces scroll work through one animation frame.

Repository verification remains:

- `npm test`
- `npm run build`
- `git diff --check`
- Browser smoke testing at desktop and mobile viewport sizes, including reduced-motion behavior and console errors.

## Scope

This change applies only to existing homepage elements marked with `[data-animate]`. It does not add new animation targets, change the hero animation, alter auxiliary pages, or modify analytics observers.
