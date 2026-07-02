// Declarative source of truth for the RecoveryOS GTM container. Mirrors
// docs/ga4-gtm-tagging.md — update both together.

export const GA4_MEASUREMENT_ID = "G-9M4GTKXQNZ";

export const DATA_LAYER_VARIABLES = [
  "page_type",
  "signup_status",
  "section_name",
  "content_name",
  "content_category",
  "contact_method",
  "store_name",
];

// eventName: the dataLayer event name the site emits (docs/ga4-gtm-tagging.md).
// ga4EventName: the GA4 event name it should map to.
// params: dataLayer keys to forward as GA4 event parameters (same name both sides).
export const EVENT_MAPPINGS = [
  {
    eventName: "recoveryos_waitlist_signup",
    ga4EventName: "sign_up",
    params: ["page_type", "signup_status", "content_name", "content_category"],
  },
  {
    eventName: "recoveryos_section_view",
    ga4EventName: "recoveryos_section_view",
    params: ["page_type", "section_name", "content_name", "content_category"],
  },
  {
    eventName: "recoveryos_screenshot_open",
    ga4EventName: "recoveryos_screenshot_open",
    params: ["page_type", "content_name", "content_category"],
  },
  {
    eventName: "recoveryos_contact_click",
    ga4EventName: "contact",
    params: ["page_type", "contact_method", "content_name"],
  },
  {
    eventName: "recoveryos_store_click",
    ga4EventName: "select_content",
    params: ["page_type", "store_name", "content_name", "content_category"],
  },
];

export const GA4_CONFIG_TAG_NAME = "GA4 Configuration - RecoveryOS";

// GTM's constant pseudo-ID for the built-in "All Pages" trigger. Stable across
// every container; not returned by triggers.list because it is not a real,
// user-owned trigger resource.
export const ALL_PAGES_TRIGGER_ID = "2147479553";
