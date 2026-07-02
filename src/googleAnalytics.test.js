// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  initAnalyticsContactTracking,
  initAnalyticsStoreTracking,
  observeAnalyticsEventOnce,
  pushDataLayerEvent,
  trackScreenshotOpen,
  trackWaitlistSignup,
} from "./googleAnalytics.js";

describe("googleAnalytics", () => {
  beforeEach(() => {
    window.dataLayer = [];
    document.body.innerHTML = "";
  });

  it("pushes plain payloads into dataLayer", () => {
    pushDataLayerEvent({ event: "recoveryos_test_event", page_type: "landing" });

    expect(window.dataLayer).toEqual([
      { event: "recoveryos_test_event", page_type: "landing" },
    ]);
  });

  it("tracks waitlist signups with a stable GA event name", () => {
    trackWaitlistSignup({ signup_status: "created" });

    expect(window.dataLayer).toContainEqual({
      event: "recoveryos_waitlist_signup",
      page_type: "landing",
      signup_status: "created",
    });
  });

  it("tracks screenshot opens with a stable GA event name", () => {
    trackScreenshotOpen({ content_name: "Workbook" });

    expect(window.dataLayer).toContainEqual({
      event: "recoveryos_screenshot_open",
      page_type: "landing",
      content_name: "Workbook",
    });
  });

  it("fires a section-view event once when the section becomes visible", () => {
    document.body.innerHTML = '<section id="waitlist"></section>';
    const target = document.querySelector("#waitlist");
    const disconnect = vi.fn();
    /** @type {IntersectionObserverCallback | undefined} */
    let callback;

    vi.stubGlobal(
      "IntersectionObserver",
      vi.fn(function MockIntersectionObserver(cb) {
        callback = cb;
        this.observe = vi.fn();
        this.disconnect = disconnect;
      }),
    );

    observeAnalyticsEventOnce("#waitlist", { section_name: "beta_waitlist_section" });
    callback?.([{ isIntersecting: true, target }], /** @type {IntersectionObserver} */ ({}));

    expect(window.dataLayer).toContainEqual({
      event: "recoveryos_section_view",
      page_type: "landing",
      section_name: "beta_waitlist_section",
    });
    expect(disconnect).toHaveBeenCalled();
  });

  it("tracks support email clicks", () => {
    document.body.innerHTML = '<a href="mailto:support@recoveryos.org">Support</a>';
    initAnalyticsContactTracking(document.body);

    document.querySelector("a")?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(window.dataLayer).toContainEqual({
      event: "recoveryos_contact_click",
      page_type: "marketing_site",
      contact_method: "email",
      content_name: "support_email",
    });
  });

  it("tracks activated store badge clicks", () => {
    document.body.innerHTML =
      '<a href="https://play.google.com/store/apps/details?id=org.recoveryos.app" data-store-link="google_play">Google Play</a>';
    initAnalyticsStoreTracking(document.body);

    document.querySelector("a")?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(window.dataLayer).toContainEqual({
      event: "recoveryos_store_click",
      page_type: "landing",
      store_name: "google_play",
      content_name: "google_play",
      content_category: "app_store_listing",
    });
  });
});
