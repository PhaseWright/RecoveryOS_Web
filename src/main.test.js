// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";

describe("screenshot lightbox", () => {
  beforeEach(() => {
    vi.resetModules();
    document.body.innerHTML = '<div id="app"></div>';
    document.body.style.overflow = "";
  });

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
});
