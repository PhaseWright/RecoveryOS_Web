import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, loadEnv } from "vite";
import { renderPageMarkup } from "./src/pageMarkup.js";
import { getStoreBadgeMarkup } from "./src/storeLinks.js";
import { applyLastmod, createGitDateResolver } from "./scripts/sitemap-lastmod.mjs";

const APP_MARKER = "<!--app-html-->";

/**
 * We prerender the landing page into index.html so the server response carries the full
 * content (founder section, features, social links) instead of a shell that needs JavaScript.
 * src/main.js then attaches behaviour to the existing DOM.
 */
function prerenderHome(env) {
  return {
    name: "recoveryos-prerender-home",
    transformIndexHtml(html) {
      if (!html.includes(APP_MARKER)) {
        throw new Error(`[prerender] index.html is missing the ${APP_MARKER} marker inside #app.`);
      }
      const { googlePlay, appStore } = getStoreBadgeMarkup(env);
      return html.replace(
        APP_MARKER,
        renderPageMarkup({
          googlePlayBadge: googlePlay,
          appStoreBadge: appStore,
          socialSectionHidden: env.VITE_SHOW_SOCIAL === "false" ? "hidden" : "",
        }),
      );
    },
  };
}

/** We stamp sitemap lastmod from git on every build so it tracks real content changes. */
function sitemapLastmod() {
  let outDir = "dist";
  let root = process.cwd();
  return {
    name: "recoveryos-sitemap-lastmod",
    apply: "build",
    configResolved(config) {
      root = config.root;
      outDir = resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      const xml = readFileSync(resolve(root, "public/sitemap.xml"), "utf8");
      writeFileSync(resolve(outDir, "sitemap.xml"), applyLastmod(xml, createGitDateResolver(root)));
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  return {
    plugins: [prerenderHome(env), sitemapLastmod()],
  };
});
