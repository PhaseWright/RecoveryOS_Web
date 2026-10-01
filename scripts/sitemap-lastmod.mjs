import { execFileSync } from "node:child_process";
import { basename, dirname } from "node:path";

const SITE_ORIGIN = "https://recoveryos.org";
const PRIVACY_POLICY_PATH = "/legal/privacy-policy";

// The homepage is assembled from several sources, so its lastmod is the newest commit across them.
const HOME_SOURCES = ["index.html", "src/pageMarkup.js", "src/storeLinks.js"];

const isDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value ?? "");

/**
 * We map a sitemap <loc> to the tracked files that produce that page.
 * @param {string} loc
 * @returns {string[]}
 */
export function sourcesForLoc(loc) {
  const path = loc.replace(SITE_ORIGIN, "");
  if (path === "/" || path === "") return HOME_SOURCES;
  // Public URLs are extensionless (Cloudflare Pages redirects .html away); the files are not.
  return [`public${path}.html`];
}

/**
 * We rewrite each <lastmod> from a resolver and keep the committed value when the resolver has
 * no answer, so a build without git history never publishes a wrong date.
 * @param {string} xml
 * @param {(loc: string) => string | null | undefined} resolveDate
 * @returns {string}
 */
export function applyLastmod(xml, resolveDate) {
  return xml.replace(
    /(<loc>([^<]+)<\/loc>\s*<lastmod>)([^<]*)(<\/lastmod>)/g,
    (match, head, loc, current, tail) => {
      const next = resolveDate(loc.trim());
      return isDate(next) ? `${head}${next}${tail}` : match;
    },
  );
}

/**
 * We pick the newest of the dates we know about. A page synced from another repository at build
 * time (the privacy policy) can be newer than its last commit here, so the upstream date and the
 * "changed in this build" fallback both count.
 * @param {{ committed?: string | null, upstream?: string | null, dirty?: boolean, today: string }} facts
 * @returns {string | null}
 */
export function pickLastmod({ committed, upstream, dirty = false, today }) {
  const dates = [committed, upstream].filter(isDate);
  // Without an upstream date, uncommitted build-time changes can only be dated "now".
  if (dirty && !isDate(upstream)) dates.push(today);
  return dates.sort().at(-1) ?? null;
}

function gitIn(cwd, args) {
  return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
}

/** Shallow clones report the checkout commit for every file, so we treat them as "unknown". */
function lastCommitDate(cwd, paths) {
  try {
    if (gitIn(cwd, ["rev-parse", "--is-shallow-repository"]) !== "false") return null;
    return gitIn(cwd, ["log", "-1", "--format=%cs", "--", ...paths]) || null;
  } catch {
    return null;
  }
}

function hasWorkingTreeChanges(cwd, paths) {
  try {
    return gitIn(cwd, ["status", "--porcelain", "--", ...paths]) !== "";
  } catch {
    return false;
  }
}

/**
 * @param {string} cwd
 * @param {{ privacyPolicySourcePath?: string, today?: string }} [options]
 * @returns {(loc: string) => string | null}
 */
export function createGitDateResolver(
  cwd,
  {
    privacyPolicySourcePath = process.env.PRIVACY_POLICY_SOURCE_PATH,
    today = new Date().toISOString().slice(0, 10),
  } = {},
) {
  return (loc) => {
    const paths = sourcesForLoc(loc);
    const upstream =
      loc.endsWith(PRIVACY_POLICY_PATH) && privacyPolicySourcePath
        ? lastCommitDate(dirname(privacyPolicySourcePath), [basename(privacyPolicySourcePath)])
        : null;

    return pickLastmod({
      committed: lastCommitDate(cwd, paths),
      upstream,
      dirty: hasWorkingTreeChanges(cwd, paths),
      today,
    });
  };
}
