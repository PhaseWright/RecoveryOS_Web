import { execFileSync } from "node:child_process";

const SITE_ORIGIN = "https://recoveryos.org";

// The homepage is assembled from several sources, so its lastmod is the newest commit across them.
const HOME_SOURCES = ["index.html", "src/pageMarkup.js", "src/storeLinks.js"];

/**
 * We map a sitemap <loc> to the tracked files that produce that page.
 * @param {string} loc
 * @returns {string[]}
 */
export function sourcesForLoc(loc) {
  const path = loc.replace(SITE_ORIGIN, "");
  if (path === "/" || path === "") return HOME_SOURCES;
  return [`public${path}`];
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
      return /^\d{4}-\d{2}-\d{2}$/.test(next ?? "") ? `${head}${next}${tail}` : match;
    },
  );
}

/**
 * We read the last commit date (YYYY-MM-DD) touching any of the given paths. Shallow clones
 * report the checkout commit for every file, so we treat them as "unknown".
 * @param {string} cwd
 * @returns {(loc: string) => string | null}
 */
export function createGitDateResolver(cwd) {
  const git = (args) =>
    execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();

  try {
    if (git(["rev-parse", "--is-shallow-repository"]) !== "false") return () => null;
  } catch {
    return () => null;
  }

  return (loc) => {
    try {
      return git(["log", "-1", "--format=%cs", "--", ...sourcesForLoc(loc)]) || null;
    } catch {
      return null;
    }
  };
}
