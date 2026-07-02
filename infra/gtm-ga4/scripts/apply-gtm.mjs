// Idempotent apply script for the RecoveryOS GTM container, driven by gtm-config.mjs.
// Creates Data Layer Variables, Custom Event triggers, the GA4 Configuration tag,
// and per-event GA4 Event tags — matching docs/ga4-gtm-tagging.md.
//
// Modes:
//   node apply-gtm.mjs                 -> dry run, prints the plan only
//   node apply-gtm.mjs --apply          -> creates/updates resources in the default
//                                          workspace (draft, NOT published)
//   node apply-gtm.mjs --apply --publish -> also creates a container version and
//                                          publishes it (goes live on recoveryos.org)
//
// Requires: GOOGLE_APPLICATION_CREDENTIALS pointing at the service account key.

import { GoogleAuth } from "google-auth-library";
import {
  GA4_MEASUREMENT_ID,
  DATA_LAYER_VARIABLES,
  EVENT_MAPPINGS,
  GA4_CONFIG_TAG_NAME,
  ALL_PAGES_TRIGGER_ID,
} from "./gtm-config.mjs";

const ACCOUNT_ID = "6363909866";
const CONTAINER_ID = "257156701";

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const PUBLISH = args.includes("--publish");

const auth = new GoogleAuth({
  scopes: [
    "https://www.googleapis.com/auth/tagmanager.edit.containers",
    "https://www.googleapis.com/auth/tagmanager.edit.containerversions",
    "https://www.googleapis.com/auth/tagmanager.publish",
  ],
});

async function api(client, method, url, body) {
  const res = await client.request({ url, method, data: body });
  return res.data;
}

function dlvName(key) {
  return `DLV - ${key}`;
}

function triggerName(eventName) {
  return `CE - ${eventName}`;
}

function tagName(mapping) {
  return `GA4 Event - ${mapping.ga4EventName} (${mapping.eventName})`;
}

async function main() {
  const client = await auth.getClient();
  const base = `https://www.googleapis.com/tagmanager/v2/accounts/${ACCOUNT_ID}/containers/${CONTAINER_ID}`;

  const { workspace: workspaces = [] } = await api(client, "GET", `${base}/workspaces`);
  const ws = workspaces[0];
  const wsBase = `https://www.googleapis.com/tagmanager/v2/${ws.path}`;
  console.log(`Target workspace: ${ws.name} (${ws.path})`);
  console.log(`Mode: ${APPLY ? (PUBLISH ? "APPLY + PUBLISH (live)" : "APPLY (draft only)") : "DRY RUN"}\n`);

  const { variable: existingVars = [] } = await api(client, "GET", `${wsBase}/variables`);
  const { trigger: existingTriggers = [] } = await api(client, "GET", `${wsBase}/triggers`);
  const { tag: existingTags = [] } = await api(client, "GET", `${wsBase}/tags`);

  const varByName = new Map(existingVars.map((v) => [v.name, v]));
  const triggerByName = new Map(existingTriggers.map((t) => [t.name, t]));
  const tagByName = new Map(existingTags.map((t) => [t.name, t]));

  // 1. Data Layer Variables
  console.log("== Data Layer Variables ==");
  const createdVarIds = new Map();
  for (const key of DATA_LAYER_VARIABLES) {
    const name = dlvName(key);
    if (varByName.has(name)) {
      console.log(`  [skip] ${name} already exists`);
      continue;
    }
    console.log(`  [create] ${name}`);
    if (APPLY) {
      const body = {
        name,
        type: "v",
        parameter: [
          { type: "TEMPLATE", key: "name", value: key },
          { type: "INTEGER", key: "dataLayerVersion", value: "2" },
        ],
      };
      const created = await api(client, "POST", `${wsBase}/variables`, body);
      createdVarIds.set(name, created.variableId);
    }
  }

  // 2. Custom Event triggers (one per emitted dataLayer event name)
  console.log("\n== Custom Event Triggers ==");
  const triggerIdByEvent = new Map();
  for (const mapping of EVENT_MAPPINGS) {
    const name = triggerName(mapping.eventName);
    const existing = triggerByName.get(name);
    if (existing) {
      console.log(`  [skip] ${name} already exists`);
      triggerIdByEvent.set(mapping.eventName, existing.triggerId);
      continue;
    }
    console.log(`  [create] ${name}`);
    if (APPLY) {
      const body = {
        name,
        type: "CUSTOM_EVENT",
        customEventFilter: [
          {
            type: "EQUALS",
            parameter: [
              { type: "TEMPLATE", key: "arg0", value: "{{_event}}" },
              { type: "TEMPLATE", key: "arg1", value: mapping.eventName },
            ],
          },
        ],
      };
      const created = await api(client, "POST", `${wsBase}/triggers`, body);
      triggerIdByEvent.set(mapping.eventName, created.triggerId);
    }
  }

  // 3. GA4 Configuration tag, fires on All Pages
  console.log("\n== GA4 Configuration Tag ==");
  let configTagExists = tagByName.has(GA4_CONFIG_TAG_NAME);
  if (configTagExists) {
    console.log(`  [skip] ${GA4_CONFIG_TAG_NAME} already exists`);
  } else {
    console.log(`  [create] ${GA4_CONFIG_TAG_NAME} (measurementId=${GA4_MEASUREMENT_ID})`);
    if (APPLY) {
      const body = {
        name: GA4_CONFIG_TAG_NAME,
        type: "gaawc",
        parameter: [{ type: "TEMPLATE", key: "measurementId", value: GA4_MEASUREMENT_ID }],
        firingTriggerId: [ALL_PAGES_TRIGGER_ID],
      };
      await api(client, "POST", `${wsBase}/tags`, body);
    }
  }

  // 4. GA4 Event tags, one per mapping, referencing the config tag by name
  console.log("\n== GA4 Event Tags ==");
  for (const mapping of EVENT_MAPPINGS) {
    const name = tagName(mapping);
    if (tagByName.has(name)) {
      console.log(`  [skip] ${name} already exists`);
      continue;
    }
    const triggerId = triggerIdByEvent.get(mapping.eventName);
    console.log(`  [create] ${name} -> event "${mapping.ga4EventName}", params: ${mapping.params.join(", ")}`);
    if (APPLY) {
      if (!triggerId) {
        console.log(`    [error] no trigger id resolved for ${mapping.eventName}, skipping tag`);
        continue;
      }
      const body = {
        name,
        type: "gaawe",
        parameter: [
          { type: "TEMPLATE", key: "eventName", value: mapping.ga4EventName },
          { type: "BOOLEAN", key: "sendEcommerceData", value: "false" },
          {
            type: "LIST",
            key: "eventParameters",
            list: mapping.params.map((p) => ({
              type: "MAP",
              map: [
                { type: "TEMPLATE", key: "name", value: p },
                { type: "TEMPLATE", key: "value", value: `{{${dlvName(p)}}}` },
              ],
            })),
          },
          { type: "TAG_REFERENCE", key: "measurementId", value: GA4_CONFIG_TAG_NAME },
        ],
        firingTriggerId: [triggerId],
      };
      await api(client, "POST", `${wsBase}/tags`, body);
    }
  }

  if (!APPLY) {
    console.log("\nDry run complete. Re-run with --apply to create these in the GTM workspace (draft, not published).");
    return;
  }

  console.log("\nWorkspace changes applied. Review in the GTM UI under Default Workspace.");

  if (PUBLISH) {
    console.log("\nCreating and publishing a container version...");
    const version = await api(client, "POST", `${wsBase}:create_version`, {
      name: "Automated: GA4 dataLayer event tagging",
      notes: "Created by infra/gtm-ga4/scripts/apply-gtm.mjs",
    });
    const containerVersionId = version.containerVersion.containerVersionId;
    await api(
      client,
      "POST",
      `https://www.googleapis.com/tagmanager/v2/accounts/${ACCOUNT_ID}/containers/${CONTAINER_ID}/versions/${containerVersionId}:publish`
    );
    console.log(`Published container version ${containerVersionId}. Live on recoveryos.org.`);
  } else {
    console.log("Not published. Re-run with --apply --publish once you have reviewed the draft.");
  }
}

main().catch((err) => {
  console.error("Fatal:", err.response?.data ?? err);
  process.exit(1);
});
