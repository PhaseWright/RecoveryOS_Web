// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  initContactLinkTracking,
  initStoreLinkTracking,
  observeViewContentOnce,
  trackContact,
  trackLead,
  trackStandardEvent,
  trackStoreListingClick,
  trackViewContent,
} from "./metaPixel.js";

describe("metaPixel", () => {
  beforeEach(() => {
    vi.stubGlobal("fbq", vi.fn());
    document.body.innerHTML = "";
  });

  it("forwards standard events to fbq with params", () => {
    trackLead({ content_name: "beta_waitlist" });
    expect(window.fbq).toHaveBeenCalledWith("track", "Lead", { content_name: "beta_waitlist" });
  });

  it("forwards standard events without params", () => {
    trackViewContent();
    expect(window.fbq).toHaveBeenCalledWith("track", "ViewContent");
  });

  it("no-ops when fbq is missing", () => {
    vi.stubGlobal("fbq", undefined);
    expect(() => trackStandardEvent("Lead")).not.toThrow();
  });

  it("fires ViewContent once when the observed section becomes visible", () => {
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

    observeViewContentOnce("#waitlist", { content_name: "beta_waitlist_section" });
    callback?.([{ isIntersecting: true, target }], /** @type {IntersectionObserver} */ ({}));

    expect(window.fbq).toHaveBeenCalledWith("track", "ViewContent", {
      content_name: "beta_waitlist_section",
    });
    expect(disconnect).toHaveBeenCalled();
  });

  it("tracks Contact on mailto clicks", () => {
    document.body.innerHTML = '<a href="mailto:support@recoveryos.org">Support</a>';
    initContactLinkTracking(document.body);

    document.querySelector("a")?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(window.fbq).toHaveBeenCalledWith("track", "Contact", {
      content_name: "support_email",
      content_category: "marketing_site",
    });
  });

  it("tracks ViewContent when an activated store badge is clicked", () => {
    document.body.innerHTML =
      '<a href="https://play.google.com/store/apps/details?id=org.recoveryos.app" data-store-link="google_play">Google Play</a>';
    initStoreLinkTracking(document.body);

    document.querySelector("a")?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(window.fbq).toHaveBeenCalledWith("track", "ViewContent", {
      content_name: "google_play",
      content_category: "app_store_listing",
      content_type: "product",
    });
  });

  it("ignores pending store badges without listing URLs", () => {
    document.body.innerHTML = '<a href="#" data-store-link="google_play">Google Play</a>';
    initStoreLinkTracking(document.body);

    document.querySelector("a")?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(window.fbq).not.toHaveBeenCalled();
  });

  it("exposes trackStoreListingClick for direct calls", () => {
    trackStoreListingClick("app_store");
    expect(window.fbq).toHaveBeenCalledWith("track", "ViewContent", {
      content_name: "app_store",
      content_category: "app_store_listing",
      content_type: "product",
    });
  });
});
