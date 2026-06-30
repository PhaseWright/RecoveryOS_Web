// We forward Meta Pixel standard events when fbq is present (loaded from index.html).

/**
 * @param {string} eventName Meta standard event name (Lead, ViewContent, Contact, etc.)
 * @param {Record<string, string | number | boolean | undefined>} [params]
 */
export function trackStandardEvent(eventName, params) {
  try {
    const fbq = typeof window !== "undefined" ? window.fbq : undefined;
    if (typeof fbq !== "function") return;

    if (params && Object.keys(params).length > 0) {
      fbq("track", eventName, params);
      return;
    }

    fbq("track", eventName);
  } catch {
    // We never throw from pixel helpers.
  }
}

/** @param {Record<string, string | number | boolean | undefined>} [params] */
export function trackLead(params) {
  trackStandardEvent("Lead", params);
}

/** @param {Record<string, string | number | boolean | undefined>} [params] */
export function trackCompleteRegistration(params) {
  trackStandardEvent("CompleteRegistration", params);
}

/** @param {Record<string, string | number | boolean | undefined>} [params] */
export function trackViewContent(params) {
  trackStandardEvent("ViewContent", params);
}

/** @param {Record<string, string | number | boolean | undefined>} [params] */
export function trackContact(params) {
  trackStandardEvent("Contact", params);
}

/**
 * We fire ViewContent when someone clicks through to a live app store listing.
 * @param {'google_play' | 'app_store'} store
 */
export function trackStoreListingClick(store) {
  trackViewContent({
    content_name: store,
    content_category: "app_store_listing",
    content_type: "product",
  });
}

/** We track clicks only on activated store badges (real https listing URLs). */
export function initStoreLinkTracking(root = document) {
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

      trackStoreListingClick(store);
    },
    true,
  );
}

/**
 * We observe high-intent sections once per page load and fire ViewContent when they enter view.
 * @param {string} selector
 * @param {Record<string, string | number | boolean | undefined>} params
 */
export function observeViewContentOnce(selector, params) {
  if (typeof IntersectionObserver === "undefined") return;

  const target = document.querySelector(selector);
  if (!target) return;

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.some((entry) => entry.isIntersecting);
      if (!visible) return;

      trackViewContent(params);
      observer.disconnect();
    },
    { threshold: 0.35, rootMargin: "0px 0px -48px 0px" },
  );

  observer.observe(target);
}

/** We fire Contact when someone taps a mailto support link. */
export function initContactLinkTracking(root = document) {
  root.addEventListener(
    "click",
    (event) => {
      const anchor = /** @type {Element | null} */ (
        event.target instanceof Element ? event.target.closest('a[href^="mailto:"]') : null
      );
      if (!anchor) return;

      trackContact({
        content_name: "support_email",
        content_category: "marketing_site",
      });
    },
    true,
  );
}
