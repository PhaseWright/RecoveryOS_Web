/** @typedef {'google_play' | 'app_store'} StorePlatform */

const STORE_CONFIG = {
  google_play: {
    envKey: "VITE_GOOGLE_PLAY_URL",
    imgSrc: "/store/google-play.svg",
    imgAlt: "Get RecoveryOS on Google Play",
    imgClass: "",
  },
  app_store: {
    envKey: "VITE_APP_STORE_URL",
    imgSrc: "/store/app-store.svg",
    imgAlt: "Download RecoveryOS on the App Store",
    imgClass: "hero-store-badge--app-store",
  },
};

/**
 * We only accept https store URLs from build-time env (no javascript: or relative links).
 * @param {string | undefined} raw
 */
export function normalizeStoreUrl(raw) {
  const trimmed = raw?.trim();
  if (!trimmed) return "";

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:") return "";
    return parsed.href;
  } catch {
    return "";
  }
}

/** @param {StorePlatform} platform */
export function getStoreUrl(platform) {
  const key = STORE_CONFIG[platform].envKey;
  return normalizeStoreUrl(import.meta.env[key]);
}

/** @param {StorePlatform} platform */
export function isStoreLinkActive(platform) {
  return Boolean(getStoreUrl(platform));
}

/**
 * @param {StorePlatform} platform
 * @returns {string}
 */
export function renderStoreBadge(platform) {
  const config = STORE_CONFIG[platform];
  const href = getStoreUrl(platform);
  const img = `<img class="hero-store-badge ${config.imgClass}" src="${config.imgSrc}" alt="${config.imgAlt}" decoding="async" />`;

  if (href) {
    return `<a class="hero-store-item hero-store-item--active" href="${href}" data-store-link="${platform}" target="_blank" rel="noopener noreferrer">${img}</a>`;
  }

  return `<div class="hero-store-item hero-store-item--pending" aria-disabled="true">${img}<span class="store-badge store-badge--soon">Coming soon</span></div>`;
}

/** @returns {{ googlePlay: string, appStore: string }} */
export function getStoreBadgeMarkup() {
  return {
    googlePlay: renderStoreBadge("google_play"),
    appStore: renderStoreBadge("app_store"),
  };
}
