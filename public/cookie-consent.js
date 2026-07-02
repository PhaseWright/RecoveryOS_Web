/*
 * RecoveryOS cookie consent banner.
 *
 * Plain, dependency-free script (not an ES module) because several pages on this site
 * (story.html, legal/*.html, blog/*.html) are static files in public/ that Vite copies
 * verbatim rather than bundling — they can't import from src/. Loading this one file with
 * a plain <script defer> tag keeps behavior identical everywhere.
 *
 * Each page must run a small inline snippet in <head>, before the GTM tag, that sets
 * Google Consent Mode v2 defaults to "denied" and restores any saved choice. This script
 * renders the banner UI, persists the choice, and pushes consent updates + unlocks the
 * Meta Pixel loader (window.__recoveryOSLoadMetaPixel) once marketing consent is granted.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "rios_consent_v1";

  function readConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch (err) {
      return null;
    }
  }

  function writeConsent(consent) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    } catch (err) {
      /* Storage may be unavailable (private mode, quota) - the banner still works this session. */
    }
  }

  function pushConsentUpdate(consent) {
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    gtag("consent", "update", {
      analytics_storage: consent.analytics ? "granted" : "denied",
      ad_storage: consent.marketing ? "granted" : "denied",
      ad_user_data: consent.marketing ? "granted" : "denied",
      ad_personalization: consent.marketing ? "granted" : "denied",
    });

    if (consent.marketing && typeof window.__recoveryOSLoadMetaPixel === "function") {
      window.__recoveryOSLoadMetaPixel(window.__recoveryOSPixelId, window.__recoveryOSPixelExtraEvent);
    }
  }

  function injectStyles() {
    if (document.getElementById("ros-consent-styles")) return;
    var style = document.createElement("style");
    style.id = "ros-consent-styles";
    style.textContent =
      ".ros-consent{position:fixed;left:0;right:0;bottom:0;z-index:2147483000;display:flex;justify-content:center;padding:0.85rem;pointer-events:none;opacity:0;transition:opacity .18s ease;}" +
      ".ros-consent--open{opacity:1;pointer-events:auto;}" +
      ".ros-consent__card{width:min(58rem,100%);background:#0d1626;border:1px solid #1d3047;border-radius:0.85rem;padding:1.1rem 1.25rem;box-shadow:0 12px 32px rgba(0,0,0,0.45);color:#dde8f0;font-family:'Inter','Segoe UI',system-ui,sans-serif;}" +
      ".ros-consent__text{margin:0 0 0.85rem;font-size:0.88rem;line-height:1.55;color:#c8dae8;}" +
      ".ros-consent__text a{color:#00d4aa;}" +
      ".ros-consent__categories{margin:0 0 0.9rem;display:flex;flex-wrap:wrap;gap:0.75rem 1.5rem;}" +
      ".ros-consent__categories[hidden]{display:none;}" +
      ".ros-consent__toggle{display:flex;align-items:center;gap:0.45rem;font-size:0.85rem;color:#c8dae8;}" +
      ".ros-consent__toggle em{color:#7aa8bc;font-style:normal;}" +
      ".ros-consent__actions{display:flex;flex-wrap:wrap;gap:0.6rem;}" +
      ".ros-consent__btn{border-radius:0.45rem;padding:0.55rem 1.05rem;font-size:0.85rem;font-weight:600;cursor:pointer;border:1px solid transparent;font-family:inherit;}" +
      ".ros-consent__btn--primary{background:#00d4aa;color:#021018;}" +
      ".ros-consent__btn--outline{background:transparent;color:#dde8f0;border-color:#2a4060;}" +
      ".ros-consent__btn--ghost{background:transparent;color:#7aa8bc;border-color:transparent;}" +
      ".ros-consent__btn:hover{opacity:0.85;}" +
      "@media (max-width:640px){.ros-consent__card{padding:1rem;}.ros-consent__actions{flex-direction:column;}.ros-consent__btn{width:100%;text-align:center;}}";
    document.head.appendChild(style);
  }

  function buildBanner() {
    var el = document.createElement("div");
    el.className = "ros-consent";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", "Cookie preferences");
    el.innerHTML =
      '<div class="ros-consent__card">' +
      '<p class="ros-consent__text">' +
      "We use cookies that are necessary for this site to run, plus optional analytics (GA4) and marketing (Meta Pixel) cookies that stay off until you say yes. See our " +
      '<a href="/legal/privacy-policy.html">privacy policy</a> for the full list.' +
      "</p>" +
      '<div class="ros-consent__categories" data-ros-categories hidden>' +
      '<label class="ros-consent__toggle"><input type="checkbox" checked disabled /><span>Necessary <em>(always on)</em></span></label>' +
      '<label class="ros-consent__toggle"><input type="checkbox" data-ros-category="analytics" /><span>Analytics</span></label>' +
      '<label class="ros-consent__toggle"><input type="checkbox" data-ros-category="marketing" /><span>Marketing</span></label>' +
      "</div>" +
      '<div class="ros-consent__actions">' +
      '<button type="button" class="ros-consent__btn ros-consent__btn--ghost" data-ros-action="customize">Customize</button>' +
      '<button type="button" class="ros-consent__btn ros-consent__btn--outline" data-ros-action="reject">Reject non-essential</button>' +
      '<button type="button" class="ros-consent__btn ros-consent__btn--primary" data-ros-action="accept">Accept all</button>' +
      '<button type="button" class="ros-consent__btn ros-consent__btn--primary" data-ros-action="save" hidden>Save preferences</button>' +
      "</div>" +
      "</div>";
    return el;
  }

  injectStyles();
  var banner = buildBanner();
  document.body.appendChild(banner);

  var categoriesEl = banner.querySelector("[data-ros-categories]");
  var analyticsToggle = banner.querySelector('[data-ros-category="analytics"]');
  var marketingToggle = banner.querySelector('[data-ros-category="marketing"]');
  var saveBtn = banner.querySelector('[data-ros-action="save"]');
  var acceptBtn = banner.querySelector('[data-ros-action="accept"]');
  var rejectBtn = banner.querySelector('[data-ros-action="reject"]');
  var customizeBtn = banner.querySelector('[data-ros-action="customize"]');

  function showBanner() {
    banner.classList.add("ros-consent--open");
  }

  function hideBanner() {
    banner.classList.remove("ros-consent--open");
  }

  function showCustomizePanel(prefill) {
    categoriesEl.hidden = false;
    analyticsToggle.checked = !!(prefill && prefill.analytics);
    marketingToggle.checked = !!(prefill && prefill.marketing);
    acceptBtn.hidden = true;
    rejectBtn.hidden = true;
    saveBtn.hidden = false;
    showBanner();
  }

  function applyConsent(consent) {
    writeConsent(consent);
    pushConsentUpdate(consent);
    hideBanner();
  }

  customizeBtn.addEventListener("click", function () {
    showCustomizePanel(readConsent());
  });

  acceptBtn.addEventListener("click", function () {
    applyConsent({ necessary: true, analytics: true, marketing: true, ts: Date.now() });
  });

  rejectBtn.addEventListener("click", function () {
    applyConsent({ necessary: true, analytics: false, marketing: false, ts: Date.now() });
  });

  saveBtn.addEventListener("click", function () {
    applyConsent({
      necessary: true,
      analytics: !!analyticsToggle.checked,
      marketing: !!marketingToggle.checked,
      ts: Date.now(),
    });
  });

  /** Reopens the banner in customize mode so a visitor can change an earlier choice. */
  function openConsentPanel() {
    showCustomizePanel(readConsent());
  }

  window.RecoveryOSConsent = {
    get: readConsent,
    open: openConsentPanel,
  };

  document.addEventListener(
    "click",
    function (event) {
      var trigger = event.target && event.target.closest ? event.target.closest("[data-ros-open-consent]") : null;
      if (!trigger) return;
      event.preventDefault();
      openConsentPanel();
    },
    true,
  );

  var existing = readConsent();
  if (existing) {
    // We re-apply on every load so Meta Pixel (which isn't persistent like GTM's own
    // consent-aware tags) gets unlocked again on repeat visits that already said yes.
    pushConsentUpdate(existing);
  } else {
    showBanner();
  }
})();
