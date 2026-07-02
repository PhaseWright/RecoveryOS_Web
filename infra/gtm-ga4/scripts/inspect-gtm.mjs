// Dumps the current GTM workspace contents (variables, triggers, tags) so we can see
// what already exists before generating Terraform config, and avoid duplicating or
// clobbering manual setup done via the GTM UI.
import { GoogleAuth } from "google-auth-library";

const ACCOUNT_ID = "6363909866";
const CONTAINER_ID = "257156701";

const auth = new GoogleAuth({
  scopes: ["https://www.googleapis.com/auth/tagmanager.readonly"],
});

async function callJson(client, url) {
  const res = await client.request({ url });
  return res.data;
}

async function main() {
  const client = await auth.getClient();
  const base = `https://www.googleapis.com/tagmanager/v2/accounts/${ACCOUNT_ID}/containers/${CONTAINER_ID}`;

  const { workspace: workspaces = [] } = await callJson(client, `${base}/workspaces`);
  const defaultWorkspace = workspaces[0];
  console.log(`Workspace: ${defaultWorkspace.name} (${defaultWorkspace.path})\n`);

  const wsBase = `https://www.googleapis.com/tagmanager/v2/${defaultWorkspace.path}`;

  const { variable: variables = [] } = await callJson(client, `${wsBase}/variables`);
  console.log(`== Variables (${variables.length}) ==`);
  for (const v of variables) {
    console.log(`- ${v.name} [${v.type}]`);
  }

  const { trigger: triggers = [] } = await callJson(client, `${wsBase}/triggers`);
  console.log(`\n== Triggers (${triggers.length}) ==`);
  for (const t of triggers) {
    console.log(`- ${t.name} [${t.type}]`);
  }

  const { tag: tags = [] } = await callJson(client, `${wsBase}/tags`);
  console.log(`\n== Tags (${tags.length}) ==`);
  for (const t of tags) {
    console.log(`- ${t.name} [${t.type}]`);
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
