// Registers event-scoped GA4 custom dimensions for the dataLayer event parameters we
// forward from GTM, so they are queryable in GA4 reports (not just DebugView/realtime).
//
// Modes:
//   node apply-ga4-custom-dimensions.mjs          -> dry run, prints the plan only
//   node apply-ga4-custom-dimensions.mjs --apply  -> creates missing custom dimensions
//
// Requires: GOOGLE_APPLICATION_CREDENTIALS pointing at the service account key.

import { GoogleAuth } from "google-auth-library";
import { DATA_LAYER_VARIABLES } from "./gtm-config.mjs";

const GA4_PROPERTY_ID = "543969137";

const DIMENSION_DESCRIPTIONS = {
  page_type: "Which site page emitted the event (home, story, etc.)",
  signup_status: "Result of a waitlist signup attempt",
  section_name: "Named section that became visible or was interacted with",
  content_name: "Specific content item associated with the event",
  content_category: "Content grouping associated with the event",
  contact_method: "Method used to initiate contact (e.g. mailto)",
  store_name: "App store associated with a store badge click",
};

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

  const { customDimensions: existing = [] } = await api(client, "GET", `${base}/customDimensions`);
  const existingByParam = new Map(existing.map((d) => [d.parameterName, d]));

  console.log(`Property: properties/${GA4_PROPERTY_ID}`);
  console.log(`Mode: ${APPLY ? "APPLY" : "DRY RUN"}\n`);

  for (const key of DATA_LAYER_VARIABLES) {
    if (existingByParam.has(key)) {
      console.log(`  [skip] ${key} already registered as a custom dimension`);
      continue;
    }
    console.log(`  [create] ${key}`);
    if (APPLY) {
      const body = {
        parameterName: key,
        displayName: key,
        description: DIMENSION_DESCRIPTIONS[key] ?? "",
        scope: "EVENT",
      };
      await api(client, "POST", `${base}/customDimensions`, body);
    }
  }

  if (!APPLY) {
    console.log("\nDry run complete. Re-run with --apply to create these custom dimensions.");
  } else {
    console.log("\nCustom dimensions applied. New/updated GA4 events can take up to 24-48h to fully populate reports.");
  }
}

main().catch((err) => {
  console.error("Fatal:", err.response?.data ?? err);
  process.exit(1);
});
