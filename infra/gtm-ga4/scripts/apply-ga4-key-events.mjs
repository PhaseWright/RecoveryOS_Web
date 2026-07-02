// Marks GA4 events as Key Events (conversions) for the RecoveryOS property.
//
// Modes:
//   node apply-ga4-key-events.mjs          -> dry run
//   node apply-ga4-key-events.mjs --apply  -> creates missing key events
//
// Requires: GOOGLE_APPLICATION_CREDENTIALS pointing at the service account key.
import { GoogleAuth } from "google-auth-library";

const GA4_PROPERTY_ID = "543969137";

// GA4 event names (post-GTM-mapping) that should count as conversions.
const KEY_EVENTS = ["sign_up"];

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");

const auth = new GoogleAuth({
  scopes: ["https://www.googleapis.com/auth/analytics.edit"],
});

async function api(client, method, url, body) {
  const res = await client.request({ url, method, data: body });
  return res.data;
}

async function main() {
  const client = await auth.getClient();
  const base = `https://analyticsadmin.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}`;

  const { keyEvents: existing = [] } = await api(client, "GET", `${base}/keyEvents`);
  const existingNames = new Set(existing.map((e) => e.eventName));

  console.log(`Property: properties/${GA4_PROPERTY_ID}`);
  console.log(`Mode: ${APPLY ? "APPLY" : "DRY RUN"}\n`);

  for (const eventName of KEY_EVENTS) {
    if (existingNames.has(eventName)) {
      console.log(`  [skip] ${eventName} already a key event`);
      continue;
    }
    console.log(`  [create] ${eventName}`);
    if (APPLY) {
      await api(client, "POST", `${base}/keyEvents`, {
        eventName,
        countingMethod: "ONCE_PER_EVENT",
      });
    }
  }

  if (!APPLY) {
    console.log("\nDry run complete. Re-run with --apply to create these key events.");
  } else {
    console.log("\nKey events applied.");
  }
}

main().catch((err) => {
  console.error("Fatal:", err.response?.data ?? err);
  process.exit(1);
});
