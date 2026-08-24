// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  calculateScrollVisibility,
  initScrollAnimations,
} from "./scrollAnimations.js";

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
