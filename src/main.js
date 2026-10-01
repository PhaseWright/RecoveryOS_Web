import "./style.css";
import { isFirebaseConfigured } from "./firebaseClient.js";
import { joinWaitlist } from "./waitlist.js";
import { telemetryEvent } from "./telemetry.js";
import {
  initAnalyticsContactTracking,
  initAnalyticsStoreTracking,
  observeAnalyticsEventOnce,
  trackScreenshotOpen,
  trackWaitlistSignup,
} from "./googleAnalytics.js";
import {
  initContactLinkTracking,
  initStoreLinkTracking,
  observeViewContentOnce,
  trackLead,
  trackViewContent,
} from "./metaPixel.js";
import { getStoreBadgeMarkup } from "./storeLinks.js";
import { renderPageMarkup } from "./pageMarkup.js";
import { initScrollAnimations } from "./scrollAnimations.js";

// Brand social accounts are live (Facebook, Instagram, Bluesky, X, LinkedIn, Threads), so this
// section shows by default now. VITE_SHOW_SOCIAL=false is an explicit opt-out escape hatch.
const socialSectionHidden = import.meta.env.VITE_SHOW_SOCIAL === "false" ? "hidden" : "";

const { googlePlay: googlePlayBadge, appStore: appStoreBadge } = getStoreBadgeMarkup();

const app = document.querySelector("#app");
// The build prerenders this markup into index.html. We only render on the client when it is
// missing (tests, or a shell served without the prerender step) so we do not re-parse the page.
if (!app.querySelector(".page")) {
  app.innerHTML = renderPageMarkup({ googlePlayBadge, appStoreBadge, socialSectionHidden });
}

const form = document.querySelector("#waitlist-form");
const emailInput = document.querySelector("#waitlist-email");
const submitButton = document.querySelector("#waitlist-submit");
const messageEl = document.querySelector("#waitlist-message");

const firebaseReady = isFirebaseConfigured();

function setFormState({ loading = false, tone = "neutral", message = "" } = {}) {
  submitButton.disabled = loading || !firebaseReady;
  submitButton.textContent = loading ? "Joining..." : "Join the beta testing";
  messageEl.textContent = message;
  messageEl.dataset.tone = tone;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const hp = document.querySelector("#waitlist-hp");
  if (hp?.value?.trim()) {
    telemetryEvent("waitlist_honeypot_hit");
    setFormState({ loading: false, tone: "success", message: "Thanks. You're signed up for beta testing." });
    form.reset();
    return;
  }

  if (!firebaseReady) {
    setFormState({
      tone: "error",
      message: "Beta testing signup is temporarily unavailable. Please try again after setup.",
    });
    return;
  }

  setFormState({ loading: true, tone: "neutral", message: "Submitting..." });

  try {
    const email = emailInput.value ?? "";
    const result = await joinWaitlist(email);

    if (result.status === "created") {
      trackLead({
        content_name: "beta_waitlist",
        content_category: "marketing_site",
      });
      trackWaitlistSignup({
        signup_status: "created",
        content_name: "beta_waitlist",
        content_category: "marketing_site",
      });
      setFormState({ loading: false, tone: "success", message: result.message });
      form.reset();
      return;
    }

    if (result.status === "duplicate") {
      setFormState({ loading: false, tone: "neutral", message: result.message });
      return;
    }

    setFormState({ loading: false, tone: "error", message: result.message });
  } catch (error) {
    telemetryEvent("waitlist_submit_error", { code: error?.code || "unknown" });
    setFormState({
      loading: false,
      tone: "error",
      message: "Something went wrong while saving your signup. Please retry.",
    });
    console.error("[waitlist] signup failed", error);
  }
});

setFormState({ loading: false, tone: "neutral", message: "" });

/**
 * We compute an initial fit scale from the thumbnail's natural dimensions so the image opens at a
 * comfortable size. Wheel zoom works over the full overlay (image + backdrop). Min zoom is 0.1
 * so you can zoom all the way out. Smooth fade + pop-in on open, fade-out on close.
 */
function initScreenshotLightbox() {
  const thumbs = document.querySelectorAll(".included-viewer__main");
  if (!thumbs.length) return;

  const overlay = document.createElement("div");
  overlay.className = "screenshot-lightbox";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Screenshot preview");
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML = `
    <div class="screenshot-lightbox__backdrop" data-lightbox-dismiss tabindex="-1"></div>
    <button type="button" class="screenshot-lightbox__close" aria-label="Close screenshot">&times;</button>
    <div class="screenshot-lightbox__stage">
      <div class="screenshot-lightbox__frame">
        <div class="screenshot-lightbox__pan">
          <img class="screenshot-lightbox__img" src="" alt="" draggable="false" decoding="async" />
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const pan = overlay.querySelector(".screenshot-lightbox__pan");
  const img = overlay.querySelector(".screenshot-lightbox__img");
  const closeBtn = overlay.querySelector(".screenshot-lightbox__close");
  const backdrop = overlay.querySelector("[data-lightbox-dismiss]");

  let scale = 1;
  let tx = 0;
  let ty = 0;
  /** @type {Element | null} */
  let lastFocus = null;
  /** @type {(() => void) | null} */
  let pendingCloseCleanup = null;

  function applyTransform() {
    pan.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  }

  function resetTransform() {
    scale = 1;
    tx = 0;
    ty = 0;
    pan.style.transform = "";
  }

  /**
   * We size the image to fill at most 90% viewport width and 88% viewport height.
   * CSS max constraints are removed so this is the sole sizing authority.
   * @param {HTMLImageElement} sourceImg
   */
  function computeFitScale(sourceImg) {
    const nw = sourceImg.naturalWidth || 390;
    const nh = sourceImg.naturalHeight || 844;
    return Math.min((window.innerWidth * 0.90) / nw, (window.innerHeight * 0.88) / nh);
  }

  /** @param {KeyboardEvent} e */
  function onDocumentKeydown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      closeBtn.focus({ preventScroll: true });
    }
  }

  /** @param {HTMLImageElement} sourceImg */
  function open(sourceImg) {
    if (pendingCloseCleanup) {
      overlay.removeEventListener("transitionend", pendingCloseCleanup);
      pendingCloseCleanup = null;
    }
    lastFocus = document.activeElement;
    img.src = sourceImg.currentSrc || sourceImg.src;
    img.alt = sourceImg.alt || "";
    trackViewContent({
      content_name: sourceImg.alt || "app_screenshot",
      content_category: "product_gallery",
    });
    trackScreenshotOpen({
      content_name: sourceImg.alt || "app_screenshot",
      content_category: "product_gallery",
    });
    scale = computeFitScale(sourceImg);
    tx = 0;
    ty = 0;
    applyTransform();
    overlay.classList.add("screenshot-lightbox--open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    document.removeEventListener("keydown", onDocumentKeydown, true);
    document.addEventListener("keydown", onDocumentKeydown, true);
    closeBtn.focus({ preventScroll: true });
  }

  function close() {
    overlay.classList.remove("screenshot-lightbox--open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onDocumentKeydown, true);
    /* We wait for the CSS fade-out to finish before clearing state so it doesn't snap away. */
    if (pendingCloseCleanup) {
      overlay.removeEventListener("transitionend", pendingCloseCleanup);
    }
    pendingCloseCleanup = () => {
      pendingCloseCleanup = null;
      img.removeAttribute("src");
      img.alt = "";
      resetTransform();
      if (lastFocus && typeof lastFocus.focus === "function") {
        lastFocus.focus({ preventScroll: true });
      }
    };
    overlay.addEventListener("transitionend", pendingCloseCleanup, { once: true });
  }

  /** @param {Touch} t1 @param {Touch} t2 */
  function distance(t1, t2) {
    return Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
  }

  let pinchStartDist = 0;
  let pinchBaseScale = 1;
  /** @type {number | null} */
  let panPointerId = null;
  let panStartX = 0;
  let panStartY = 0;
  let panOriginTx = 0;
  let panOriginTy = 0;

  pan.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length === 2) {
        pinchStartDist = distance(e.touches[0], e.touches[1]);
        pinchBaseScale = scale;
        panPointerId = null;
      } else if (e.touches.length === 1) {
        panPointerId = e.touches[0].identifier;
        panStartX = e.touches[0].clientX;
        panStartY = e.touches[0].clientY;
        panOriginTx = tx;
        panOriginTy = ty;
      }
    },
    { passive: true },
  );

  pan.addEventListener(
    "touchmove",
    (e) => {
      e.preventDefault();
      if (e.touches.length === 2 && pinchStartDist > 0) {
        scale = Math.min(10, Math.max(0.1, pinchBaseScale * (distance(e.touches[0], e.touches[1]) / pinchStartDist)));
        applyTransform();
      } else if (e.touches.length === 1 && e.touches[0].identifier === panPointerId) {
        tx = panOriginTx + (e.touches[0].clientX - panStartX);
        ty = panOriginTy + (e.touches[0].clientY - panStartY);
        applyTransform();
      }
    },
    { passive: false },
  );

  pan.addEventListener("touchend", (e) => {
    if (e.touches.length < 2) pinchStartDist = 0;
    if (e.touches.length === 0) panPointerId = null;
  });

  /* We listen on overlay so wheel works whether the cursor is over the image or the dark backdrop. */
  overlay.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      scale = Math.min(10, Math.max(0.1, scale * (e.deltaY < 0 ? 1.09 : 1 / 1.09)));
      applyTransform();
    },
    { passive: false },
  );

  let dragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragOriginTx = 0;
  let dragOriginTy = 0;

  pan.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;
    dragging = true;
    overlay.classList.add("screenshot-lightbox--dragging");
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragOriginTx = tx;
    dragOriginTy = ty;
    e.preventDefault();
  });

  function onMouseMove(e) {
    if (!dragging) return;
    tx = dragOriginTx + (e.clientX - dragStartX);
    ty = dragOriginTy + (e.clientY - dragStartY);
    applyTransform();
  }

  function onMouseUp() {
    if (dragging) overlay.classList.remove("screenshot-lightbox--dragging");
    dragging = false;
  }

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);

  closeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    close();
  });

  backdrop.addEventListener("click", (e) => {
    e.preventDefault();
    close();
  });

  thumbs.forEach((node) => {
    const thumb = /** @type {HTMLImageElement} */ (node);
    thumb.tabIndex = 0;
    thumb.setAttribute("role", "button");
    thumb.setAttribute(
      "aria-label",
      thumb.alt ? `Preview: ${thumb.alt}` : "Preview screenshot",
    );
    thumb.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      open(thumb);
    });
    thumb.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open(thumb);
      }
    });
  });
}

/**
 * We keep the viewer state in one place so manual selection and timed
 * advancement update the image, caption, and accessible state together.
 */
function initIncludedViewer() {
  const thumbs = Array.from(document.querySelectorAll(".included-viewer__thumb"));
  const mainImg = /** @type {HTMLImageElement | null} */ (
    document.querySelector(".included-viewer__main")
  );
  const captionTitle = document.querySelector("#included-caption-title");
  const captionDetail = document.querySelector("#included-caption-detail");
  if (!thumbs.length || !mainImg || !captionTitle || !captionDetail) return;

  const AUTO_ADVANCE_MS = 4000;
  let current = 0;
  let timer;

  function setActive(index, userInitiated = false) {
    const thumb = /** @type {HTMLButtonElement} */ (thumbs[index]);
    const thumbnailImage = /** @type {HTMLImageElement | null} */ (thumb.querySelector("img"));
    if (!thumbnailImage) return;

    current = index;
    thumbs.forEach((item, itemIndex) => {
      const isActive = itemIndex === index;
      item.classList.toggle("included-viewer__thumb--active", isActive);
      if (isActive) item.setAttribute("aria-current", "true");
      else item.removeAttribute("aria-current");
    });

    mainImg.src = thumbnailImage.src;
    mainImg.alt = thumb.dataset.caption || "RecoveryOS app screenshot";
    mainImg.setAttribute("aria-label", `Preview: ${mainImg.alt}`);
    captionTitle.textContent = thumb.dataset.caption || "";
    captionDetail.textContent = thumb.dataset.detail || "";

    if (userInitiated) restartAutoAdvance();
  }

  function restartAutoAdvance() {
    window.clearInterval(timer);
    timer = window.setInterval(() => {
      setActive((current + 1) % thumbs.length);
    }, AUTO_ADVANCE_MS);
  }

  thumbs.forEach((thumb, index) => {
    thumb.addEventListener("click", () => setActive(index, true));
  });

  restartAutoAdvance();
}

initScreenshotLightbox();
initIncludedViewer();
initScrollAnimations();
initAnalyticsContactTracking();
initContactLinkTracking();
initAnalyticsStoreTracking();
initStoreLinkTracking();
observeAnalyticsEventOnce("#waitlist", {
  section_name: "beta_waitlist_section",
  content_name: "beta_waitlist_section",
  content_category: "marketing_site",
});
observeViewContentOnce("#waitlist", {
  content_name: "beta_waitlist_section",
  content_category: "marketing_site",
});
observeAnalyticsEventOnce("#professionals", {
  section_name: "professionals_overview",
  content_name: "professionals_overview",
  content_category: "marketing_site",
});
observeViewContentOnce("#professionals", {
  content_name: "professionals_overview",
  content_category: "marketing_site",
});
