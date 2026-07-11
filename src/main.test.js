// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("screenshot lightbox", () => {
  beforeEach(() => {
    vi.resetModules();
    document.body.innerHTML = '<div id="app"></div>';
    document.body.style.overflow = "";
    window.dataLayer = [];
  });

  it("keeps a reopened image after a pending close transition finishes", async () => {
    await import("./main.js");

    const viewerThumbs = document.querySelectorAll(".included-viewer__thumb");
    const mainImg = document.querySelector(".included-viewer__main");
    const overlay = document.querySelector(".screenshot-lightbox");
    const lightboxImg = document.querySelector(".screenshot-lightbox__img");
    const closeBtn = document.querySelector(".screenshot-lightbox__close");

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
});

describe("included screenshot viewer", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    document.body.innerHTML = '<div id="app"></div>';
    document.body.style.overflow = "";
    window.dataLayer = [];
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("updates the main image and caption when a thumbnail is selected", async () => {
    await import("./main.js");

    const thumbnails = document.querySelectorAll(".included-viewer__thumb");
    const mainImg = document.querySelector(".included-viewer__main");
    const captionTitle = document.querySelector("#included-caption-title");

    thumbnails[2].dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));

    expect(mainImg.src).toContain("/screenshots/Calendar.png");
    expect(mainImg.alt).toBe("Calendar intelligence");
    expect(mainImg.getAttribute("aria-label")).toBe("Preview: Calendar intelligence");
    expect(captionTitle.textContent).toBe("Calendar intelligence");
    expect(thumbnails[2].getAttribute("aria-current")).toBe("true");
  });

  it("auto-advances every four seconds", async () => {
    await import("./main.js");

    const mainImg = document.querySelector(".included-viewer__main");
    expect(mainImg.src).toContain("/screenshots/Workbook.png");

    vi.advanceTimersByTime(4000);

    expect(mainImg.src).toContain("/screenshots/Spark.png");
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
    const joinWaitlist = vi.fn().mockResolvedValue({
      status: "created",
      message: "Thanks. You're signed up for beta testing.",
    });

    vi.doMock("./firebaseClient.js", () => ({
      isFirebaseConfigured: vi.fn(() => true),
    }));

    vi.doMock("./waitlist.js", () => ({
      joinWaitlist,
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
    expect(joinWaitlist).toHaveBeenCalledWith("test@example.com");
    expect(document.querySelector('input[name="interests"]')).toBeNull();
  });
});
