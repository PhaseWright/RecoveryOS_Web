// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";

describe("screenshot lightbox", () => {
  beforeEach(() => {
    vi.resetModules();
    document.body.innerHTML = '<div id="app"></div>';
    document.body.style.overflow = "";
    window.dataLayer = [];
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
});

describe("main analytics", () => {
  beforeEach(() => {
    vi.resetModules();
    document.body.innerHTML = '<div id="app"></div>';
    document.body.style.overflow = "";
    window.dataLayer = [];
  });

  it("pushes a GA signup event when the waitlist signup succeeds", async () => {
    vi.doMock("./firebaseClient.js", () => ({
      isFirebaseConfigured: vi.fn(() => true),
    }));

    vi.doMock("./waitlist.js", () => ({
      joinWaitlist: vi.fn().mockResolvedValue({
        status: "created",
        message: "Thanks. You're signed up for beta testing.",
      }),
    }));

    await import("./main.js");

    const form = /** @type {HTMLFormElement} */ (document.querySelector("#waitlist-form"));
    const emailInput = /** @type {HTMLInputElement} */ (document.querySelector("#waitlist-email"));
    emailInput.value = "test@example.com";

    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    await Promise.resolve();
    await Promise.resolve();

    expect(window.dataLayer).toContainEqual({
      event: "recoveryos_waitlist_signup",
      page_type: "landing",
      signup_status: "created",
      content_name: "beta_waitlist",
      content_category: "marketing_site",
    });
  });
});
