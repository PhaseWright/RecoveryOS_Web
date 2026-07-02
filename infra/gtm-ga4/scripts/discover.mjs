// Discovers the GTM account/container and GA4 property/account IDs reachable by the
// marketing-tag-automation service account, using its JSON key directly (no OAuth
// consent screen involved — this is server-to-server auth).
//
// Usage:
//   GOOGLE_APPLICATION_CREDENTIALS="E:\PhaseWright\private\recoveryos-aa178-marketing-tag-automation.json" node discover.mjs

import { GoogleAuth } from "google-auth-library";

const GTM_CONTAINER_PUBLIC_ID = "GTM-TCL443VB";

const auth = new GoogleAuth({
  scopes: [
    "https://www.googleapis.com/auth/tagmanager.readonly",
    "https://www.googleapis.com/auth/analytics.readonly",
  ],
});

async function callJson(client, url) {
  const res = await client.request({ url });
  return res.data;
}

async function discoverGtm(client) {
  const { account: accounts = [] } = await callJson(
    client,
    "https://www.googleapis.com/tagmanager/v2/accounts"
  );
  if (accounts.length === 0) {
    throw new Error(
      "No GTM accounts visible to the service account. Confirm it was added as a User in GTM Admin > User Management."
    );
  }

  for (const account of accounts) {
    const { container: containers = [] } = await callJson(
      client,
      `https://www.googleapis.com/tagmanager/v2/${account.path}/containers`
    );
    const match = containers.find((c) => c.publicId === GTM_CONTAINER_PUBLIC_ID);
    if (match) {
      return {
        accountId: account.accountId,
        accountName: account.name,
        containerId: match.containerId,
        containerName: match.name,
        containerPath: match.path,
        workspacesUrl: `https://www.googleapis.com/tagmanager/v2/${match.path}/workspaces`,
      };
    }
  }

  throw new Error(
    `Service account can see GTM accounts but none contain a container with publicId ${GTM_CONTAINER_PUBLIC_ID}.`
  );
}

async function discoverGa4(client) {
  const { accountSummaries = [] } = await callJson(
    client,
    "https://analyticsadmin.googleapis.com/v1beta/accountSummaries"
  );
  if (accountSummaries.length === 0) {
    throw new Error(
      "No GA4 accounts visible to the service account. Confirm it was added as a User in GA4 Property Access Management."
    );
  }

  const properties = accountSummaries.flatMap((a) =>
    (a.propertySummaries || []).map((p) => ({
      accountName: a.account,
      accountDisplayName: a.displayName,
      propertyId: p.property.split("/")[1],
      propertyResource: p.property,
      propertyDisplayName: p.displayName,
    }))
  );

  return properties;
}

async function main() {
  const client = await auth.getClient();

  console.log("== GTM ==");
  try {
    const gtm = await discoverGtm(client);
    console.log(JSON.stringify(gtm, null, 2));
  } catch (err) {
    console.error("GTM discovery failed:", err.message);
  }

  console.log("\n== GA4 ==");
  try {
    const ga4Properties = await discoverGa4(client);
    console.log(JSON.stringify(ga4Properties, null, 2));
  } catch (err) {
    console.error("GA4 discovery failed:", err.message);
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
