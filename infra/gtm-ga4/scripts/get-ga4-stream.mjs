// Fetches the web data stream(s) and measurement ID(s) for the RecoveryOS GA4 property.
import { GoogleAuth } from "google-auth-library";

const GA4_PROPERTY_ID = "543969137";

const auth = new GoogleAuth({
  scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
});

async function main() {
  const client = await auth.getClient();
  const res = await client.request({
    url: `https://analyticsadmin.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}/dataStreams`,
  });
  console.log(JSON.stringify(res.data, null, 2));
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
