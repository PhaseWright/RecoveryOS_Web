/**
 * We download multicolor brand SVGs from Wikimedia Commons (stable upload.wikimedia.org URLs).
 * Sources documented per file; re-run after updating URLs: npm run fetch:marketing-assets
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const assets = [
  {
    dir: "public/store",
    file: "google-play.svg",
    url: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Google_Play_2022_logo.svg",
    note: "Commons: Google_Play_2022_logo.svg",
  },
  {
    dir: "public/store",
    file: "app-store.svg",
    url: "https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg",
    note: "Commons: Download_on_the_App_Store_Badge.svg",
  },
  {
    dir: "public/social",
    file: "facebook.svg",
    url: "https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg",
    note: "Commons: 2021_Facebook_icon.svg",
  },
  {
    dir: "public/social",
    file: "instagram.svg",
    url: "https://upload.wikimedia.org/wikipedia/commons/9/95/Instagram_logo_2022.svg",
    note: "Commons: Instagram_logo_2022.svg",
  },
  {
    dir: "public/social",
    file: "linkedin.svg",
    url: "https://upload.wikimedia.org/wikipedia/commons/c/c9/Linkedin.svg",
    note: "Commons: Linkedin.svg",
  },
  {
    dir: "public/social",
    file: "youtube.svg",
    url: "https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg",
    note: "Commons: YouTube_full-color_icon_(2017).svg",
  },
  {
    dir: "public/social",
    file: "x.svg",
    url: "https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg",
    note: "Commons: X_logo_2023.svg",
  },
];

async function downloadOne({ dir, file, url, note }) {
  const outDir = join(root, dir);
  const outPath = join(outDir, file);
  await mkdir(outDir, { recursive: true });
  const res = await fetch(url, {
    redirect: "follow",
    headers: {
      "User-Agent": "RecoveryOS_web/fetch-marketing-assets (local dev; contact: support@recoveryos.org)",
    },
  });
  if (!res.ok) {
    throw new Error(`[fetch-marketing-assets] ${file}: ${res.status} ${res.statusText} — ${note}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(outPath, buf);
  console.log(`Wrote ${dir}/${file} (${buf.length} bytes) ← ${note}`);
}

for (const item of assets) {
  await downloadOne(item);
  /* We pace requests so Wikimedia does not rate-limit sequential downloads. */
  await new Promise((r) => setTimeout(r, 700));
}

console.log("Done. Trademark use remains subject to each brand’s guidelines.");
