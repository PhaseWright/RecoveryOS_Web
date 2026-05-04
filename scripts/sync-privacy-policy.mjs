import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, "..");
const sourcePath = "E:/PhaseWright/Apps/RecoveryOS/public/legal/privacy-policy.html";
const targetDir = path.join(webRoot, "public", "legal");
const targetPath = path.join(targetDir, "privacy-policy.html");

const policyHtml = await readFile(sourcePath, "utf8");
await mkdir(targetDir, { recursive: true });
await writeFile(targetPath, policyHtml, "utf8");

console.log(`Synced privacy policy to ${targetPath}`);
