# GA4 Tagging Via GTM

This site emits first-party `dataLayer` events and lets Google Tag Manager translate them into GA4 events.

> **Status: live.** The GTM variables/triggers/tags and GA4 custom dimensions described
> below are provisioned and kept in sync by scripts in
> [`infra/gtm-ga4/`](../infra/gtm-ga4/README.md) rather than manual clicking. Update
> `infra/gtm-ga4/scripts/gtm-config.mjs` and this doc together when adding new events.

## Event names emitted by the site

| dataLayer event | When it fires | Key params |
| --- | --- | --- |
| `recoveryos_waitlist_signup` | Successful beta waitlist signup (`created` only) | `page_type`, `signup_status`, `content_name`, `content_category` |
| `recoveryos_section_view` | High-intent sections become visible | `page_type`, `section_name`, `content_name`, `content_category` |
| `recoveryos_screenshot_open` | Screenshot lightbox opens | `page_type`, `content_name`, `content_category` |
| `recoveryos_contact_click` | Support `mailto:` link clicked | `page_type`, `contact_method`, `content_name` |
| `recoveryos_store_click` | Activated Google Play / App Store badge clicked | `page_type`, `store_name`, `content_name`, `content_category` |

## GTM setup

Create these **Data Layer Variables** in GTM:

- `page_type`
- `signup_status`
- `section_name`
- `content_name`
- `content_category`
- `contact_method`
- `store_name`

Create these **Custom Event** triggers:

- `recoveryos_waitlist_signup`
- `recoveryos_section_view`
- `recoveryos_screenshot_open`
- `recoveryos_contact_click`
- `recoveryos_store_click`

## Recommended GA4 mapping

| dataLayer event | GA4 event name |
| --- | --- |
| `recoveryos_waitlist_signup` | `sign_up` |
| `recoveryos_contact_click` | `contact` |
| `recoveryos_store_click` | `select_content` |
| `recoveryos_screenshot_open` | `recoveryos_screenshot_open` |
| `recoveryos_section_view` | `recoveryos_section_view` |

Map the Data Layer Variables into the GA4 Event Parameters with the same names.

## Validation

1. Open GTM Preview on `https://recoveryos.org/`.
2. Trigger each interaction.
3. Confirm the `dataLayer` event appears in GTM Preview.
4. Confirm the mapped GA4 tag fires.
5. Confirm the event arrives in GA4 DebugView.

## Notes

- We never send email addresses or other PII into GA4.
- Duplicate waitlist submissions, honeypot hits, and errors do not emit the signup conversion event.
- The founder-story page emits the same `recoveryos_contact_click` shape plus a `recoveryos_section_view` event for `founder_story`.
