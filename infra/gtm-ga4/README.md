# GTM + GA4 automation

Automates the RecoveryOS Google Tag Manager container and GA4 property configuration
described in [`docs/ga4-gtm-tagging.md`](../../docs/ga4-gtm-tagging.md), using plain
Node scripts against the official Google APIs (Tag Manager API v2, Analytics Admin API
v1beta) authenticated as a dedicated service account.

We chose hand-rolled scripts over a Terraform provider because the available community
GTM providers (`Manuel-Antunes/google-tag-manager`, `mirefly/google-tag-manager`) are
small, low-adoption, single-maintainer projects — too fragile for a production
container. The Google Cloud auth libraries and REST APIs used here are official and
stable.

## Resources

| Resource | ID |
| --- | --- |
| GCP project | `recoveryos-aa178` |
| GTM account | `6363909866` ("RecoveryOS") |
| GTM container | `257156701` (public ID `GTM-TCL443VB`) |
| GA4 account | `399845394` ("RecoveryOS") |
| GA4 property | `543969137` ("waitlist") |
| GA4 measurement ID | `G-9M4GTKXQNZ` |

## Service account

`marketing-tag-automation@recoveryos-aa178.iam.gserviceaccount.com`

- Created via `gcloud iam service-accounts create` in `recoveryos-aa178`.
- Key stored **outside the repo** at `E:\PhaseWright\private\recoveryos-aa178-marketing-tag-automation.json`
  (never commit this — it is a long-lived credential).
- Granted **Publish** access in GTM: Admin > User Management (container-level).
- Granted **Editor** access in GA4: Admin > Property Access Management.
- Auth is service-account-to-server (JWT bearer flow) — there is no OAuth consent
  screen involved, so it is unaffected by Google's restrictions on sensitive scopes for
  the shared `gcloud` CLI OAuth client.

## Scripts (`scripts/`)

Run from `infra/gtm-ga4/scripts/` with `GOOGLE_APPLICATION_CREDENTIALS` set to the
service account key path. All apply scripts default to a dry run; pass `--apply` to
actually write.

| Script | Purpose |
| --- | --- |
| `discover.mjs` | Finds the GTM account/container and GA4 account/property reachable by the service account. Useful after granting access to a new resource. |
| `inspect-gtm.mjs` | Lists all variables/triggers/tags currently in the GTM default workspace. |
| `get-ga4-stream.mjs` | Lists GA4 data streams and their measurement IDs. |
| `gtm-config.mjs` | Declarative source of truth: data layer variable names, event-to-GA4-event mappings, GA4 measurement ID. Keep in sync with `docs/ga4-gtm-tagging.md`. |
| `apply-gtm.mjs [--apply] [--publish]` | Creates the Data Layer Variables, Custom Event triggers, GA4 Configuration tag, and GA4 Event tags in the GTM workspace. `--apply` writes a draft; `--apply --publish` also creates and publishes a container version (goes live). Idempotent — skips anything that already exists by name. |
| `apply-ga4-custom-dimensions.mjs [--apply]` | Registers event-scoped GA4 custom dimensions for each data layer parameter, so they're queryable in GA4 reports (not just DebugView). Idempotent. |

### Example

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = "E:\PhaseWright\private\recoveryos-aa178-marketing-tag-automation.json"
cd infra/gtm-ga4/scripts
npm install          # first run only
node apply-gtm.mjs   # dry run
node apply-gtm.mjs --apply --publish
node apply-ga4-custom-dimensions.mjs --apply
```

## Adding a new tracked event

1. Add the event to `src/googleAnalytics.js` (or `public/story.html` inline script) and
   document it in `docs/ga4-gtm-tagging.md`.
2. Add any new parameter names to `DATA_LAYER_VARIABLES` and a new entry to
   `EVENT_MAPPINGS` in `scripts/gtm-config.mjs`.
3. Run `node apply-gtm.mjs` (dry run) to confirm the plan, then `--apply --publish`.
4. Run `node apply-ga4-custom-dimensions.mjs --apply` if new parameter names were added.
