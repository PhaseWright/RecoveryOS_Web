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
