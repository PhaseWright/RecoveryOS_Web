// We emit first-party GTM/GA4 events via dataLayer so tag config stays in GTM.

/**
 * @param {Record<string, string | number | boolean | undefined>} payload
 */
export function pushDataLayerEvent(payload) {
  try {
    if (typeof window === "undefined") return;

    const dataLayer = Array.isArray(window.dataLayer)
      ? window.dataLayer
      : (window.dataLayer = []);

    dataLayer.push(payload);
  } catch {
    // We never throw from analytics helpers.
  }
}

/**
 * @param {Record<string, string | number | boolean | undefined>} payload
 */
export function trackWaitlistSignup(payload) {
  pushDataLayerEvent({
    event: "recoveryos_waitlist_signup",
    page_type: "landing",
    ...payload,
  });
}

/**
 * @param {Record<string, string | number | boolean | undefined>} payload
 */
export function trackSectionView(payload) {
  pushDataLayerEvent({
    event: "recoveryos_section_view",
    page_type: "landing",
    ...payload,
  });
}

/**
 * @param {Record<string, string | number | boolean | undefined>} payload
 */
export function trackScreenshotOpen(payload) {
  pushDataLayerEvent({
    event: "recoveryos_screenshot_open",
    page_type: "landing",
    ...payload,
  });
}

/**
 * @param {Record<string, string | number | boolean | undefined>} payload
 */
export function trackContactClick(payload) {
  pushDataLayerEvent({
    event: "recoveryos_contact_click",
    ...payload,
  });
}

/**
 * @param {Record<string, string | number | boolean | undefined>} payload
 */
export function trackStoreClick(payload) {
  pushDataLayerEvent({
    event: "recoveryos_store_click",
    page_type: "landing",
    ...payload,
  });
}

/**
 * We observe high-intent sections once per page load and push a GA event when visible.
 * @param {string} selector
 * @param {Record<string, string | number | boolean | undefined>} payload
 */
export function observeAnalyticsEventOnce(selector, payload) {
  if (typeof IntersectionObserver === "undefined") return;

  const target = document.querySelector(selector);
  if (!target) return;

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.some((entry) => entry.isIntersecting);
      if (!visible) return;

      trackSectionView(payload);
      observer.disconnect();
    },
    { threshold: 0.35, rootMargin: "0px 0px -48px 0px" },
  );

  observer.observe(target);
}

/** We fire a GA contact event when someone taps a mailto support link. */
export function initAnalyticsContactTracking(root = document) {
  root.addEventListener(
    "click",
    (event) => {
      const anchor = /** @type {Element | null} */ (
        event.target instanceof Element ? event.target.closest('a[href^="mailto:"]') : null
      );
      if (!anchor) return;

      trackContactClick({
        page_type: "marketing_site",
        contact_method: "email",
        content_name: "support_email",
      });
    },
    true,
  );
}

/** We track clicks only on activated store badges (real https listing URLs). */
export function initAnalyticsStoreTracking(root = document) {
  root.addEventListener(
    "click",
    (event) => {
      const anchor = /** @type {Element | null} */ (
        event.target instanceof Element ? event.target.closest("a[data-store-link]") : null
      );
      if (!anchor) return;

      const store = anchor.getAttribute("data-store-link");
      const href = anchor.getAttribute("href")?.trim() ?? "";
      if (!store || !href || href.startsWith("#")) return;

      try {
        const parsed = new URL(href);
        if (parsed.protocol !== "https:") return;
      } catch {
        return;
      }

      if (store !== "google_play" && store !== "app_store") return;

      trackStoreClick({
        store_name: store,
        content_name: store,
        content_category: "app_store_listing",
      });
    },
    true,
  );
}
