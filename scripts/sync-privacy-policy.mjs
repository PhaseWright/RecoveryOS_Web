import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { applyMarketingSiteShell } from "./privacy-policy-shell.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, "..");
const targetDir = path.join(webRoot, "public", "legal");
const targetPath = path.join(targetDir, "privacy-policy.html");

const sourceCandidates = [
  process.env.PRIVACY_POLICY_SOURCE_PATH,
  "E:/PhaseWright/Apps/RecoveryOS/public/legal/privacy-policy.html",
  path.resolve(webRoot, "..", "Apps", "RecoveryOS", "public", "legal", "privacy-policy.html"),
  targetPath,
].filter(Boolean);

let sourcePath;
for (const candidate of sourceCandidates) {
  try {
    await access(candidate);
    sourcePath = candidate;
    break;
  } catch {
    // Try next candidate.
  }
}

if (!sourcePath) {
  throw new Error(
    `No privacy policy source found. Set PRIVACY_POLICY_SOURCE_PATH or ensure one of these exists: ${sourceCandidates.join(", ")}`
  );
}

const policyHtml = await readFile(sourcePath, "utf8");
const finalHtml = applyMarketingSiteShell(
  applyMarketingSiteOverlay(policyHtml, sourcePath === targetPath),
);

await mkdir(targetDir, { recursive: true });
await writeFile(targetPath, finalHtml, "utf8");

console.log(`Synced privacy policy from ${sourcePath} to ${targetPath}`);

/**
 * The canonical privacy-policy.html lives in the app repo and describes only the
 * app's own data practices. This site additionally needs, on top of that shared
 * legal content: the Consent Mode v2 / GTM / Meta Pixel head scripts (matching every
 * other page here), a disclosure section for recoveryos.org's own cookies, and footer
 * links to the site's other legal/AEO pages. We apply those as an overlay here so a
 * future re-sync from the app repo doesn't silently strip them out again.
 *
 * @param {string} html
 * @param {boolean} isSelfSync True when the source and target are the same file (no
 *   canonical app-repo copy was found) - in that case the overlay may already be
 *   present, so we skip re-applying it to stay idempotent.
 */
function applyMarketingSiteOverlay(html, isSelfSync) {
  if (isSelfSync && html.includes("id=\"ros-privacy-overlay-marker\"")) {
    return html;
  }

  let out = html;

  const headScripts = `
  <!-- Consent Mode v2 defaults - see index.html for the full explanation. Must run before GTM. -->
  <script id="ros-privacy-overlay-marker">
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      wait_for_update: 500,
    });
    (function () {
      try {
        var saved = JSON.parse(localStorage.getItem('rios_consent_v1') || 'null');
        if (saved && typeof saved === 'object') {
          gtag('consent', 'update', {
            analytics_storage: saved.analytics ? 'granted' : 'denied',
            ad_storage: saved.marketing ? 'granted' : 'denied',
            ad_user_data: saved.marketing ? 'granted' : 'denied',
            ad_personalization: saved.marketing ? 'granted' : 'denied',
          });
        }
      } catch (e) { /* We treat unreadable storage as "no decision yet". */ }
    })();
  </script>
  <!-- Google Tag Manager -->
  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-TCL443VB');</script>
  <!-- End Google Tag Manager -->
  <script defer src="/cookie-consent.js"></script>
`;

  if (out.includes("id=\"ros-privacy-overlay-marker\"")) {
    // Already overlaid (e.g. re-running against last output) - don't double-inject the head scripts.
  } else {
    out = out.replace(/<head>/i, `<head>${headScripts}`);
  }

  const bodyNoscript = `
  <!-- Google Tag Manager (noscript) -->
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TCL443VB"
  height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <!-- End Google Tag Manager (noscript) -->
`;
  if (!out.includes("googletagmanager.com/ns.html")) {
    out = out.replace(/<body>/i, `<body>${bodyNoscript}`);
  }

  out = out.replace(
    />6\. Analytics and advertising<\/h2>/,
    ">6. Analytics and advertising (the app)</h2>",
  );

  const cookieSection = `
  <h2>6a. Cookies and tracking on recoveryos.org (marketing site)</h2>
  <p>Our public marketing site at <a href="https://recoveryos.org" rel="noopener noreferrer">recoveryos.org</a> — separate from the app itself — uses cookies and similar technologies for analytics and marketing, gated behind the cookie banner shown on your first visit:</p>
  <table>
    <thead>
      <tr><th>Category</th><th>Technology</th><th>Purpose</th><th>Loads before consent?</th></tr>
    </thead>
    <tbody>
      <tr>
        <td>Necessary</td>
        <td>Local storage of your cookie choice</td>
        <td>Remembers your cookie preference so we don't ask every visit</td>
        <td>Yes (required for the banner itself to function)</td>
      </tr>
      <tr>
        <td>Analytics</td>
        <td>Google Tag Manager (GTM) &amp; Google Analytics 4 (GA4)</td>
        <td>Aggregate traffic and usage measurement (pages viewed, waitlist conversions, section engagement)</td>
        <td>No — only after you accept analytics cookies</td>
      </tr>
      <tr>
        <td>Marketing</td>
        <td>Meta (Facebook) Pixel</td>
        <td>Measuring and improving campaign performance for RecoveryOS ads and posts</td>
        <td>No — only after you accept marketing cookies</td>
      </tr>
    </tbody>
  </table>
  <p>You can change your choice at any time using the <strong>Cookie settings</strong> link in the site footer. Where Google Consent Mode v2 is supported, we also signal your choice directly to Google's tags. This site does not currently offer a full cookie policy separate from this section; the categories above are exhaustive for recoveryos.org as of the effective date below.</p>
`;

  if (!out.includes("6a. Cookies and tracking on recoveryos.org")) {
    const waitlistHeadingPattern = /<h2>6a\. Marketing site waitlist([^<]*)<\/h2>/;
    if (waitlistHeadingPattern.test(out)) {
      out = out.replace(
        waitlistHeadingPattern,
        (_match, suffix) => `${cookieSection}\n  <h2>6b. Marketing site waitlist${suffix}</h2>`,
      );
    } else {
      console.warn(
        "[sync-privacy-policy] Could not find the '6a. Marketing site waitlist' heading to anchor the cookie-disclosure overlay; skipping that insert. Check whether the canonical source's section numbering changed.",
      );
    }
  }

  const footerLinks = `
  <hr class="legal-rule" />
  <p class="muted">
    <a href="/">RecoveryOS home</a> ·
    <a href="/legal/terms-of-service.html">Terms of service</a> ·
    <a href="/ai-info.html">AI info</a> ·
    <a href="#" data-ros-open-consent>Cookie settings</a>
  </p>
`;
  if (!out.includes("data-ros-open-consent")) {
    out = out.replace(/<\/body>/i, `${footerLinks}</body>`);
  }

  return out;
}
