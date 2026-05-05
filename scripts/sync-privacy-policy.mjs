import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
await mkdir(targetDir, { recursive: true });
await writeFile(targetPath, policyHtml, "utf8");

console.log(`Synced privacy policy from ${sourcePath} to ${targetPath}`);
