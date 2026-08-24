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
import { initScrollAnimations } from "./scrollAnimations.js";

// Brand social accounts are live (Facebook, Instagram, Bluesky, X, LinkedIn, Threads), so this
// section shows by default now. VITE_SHOW_SOCIAL=false is an explicit opt-out escape hatch.
const socialSectionHidden = import.meta.env.VITE_SHOW_SOCIAL === "false" ? "hidden" : "";

const { googlePlay: googlePlayBadge, appStore: appStoreBadge } = getStoreBadgeMarkup();

document.querySelector("#app").innerHTML = `
  <div class="page">
    <a class="skip-link" href="#waitlist">Skip to beta testing signup</a>
    <header class="site-header">
      <a class="brand-lockup" href="/" aria-label="RecoveryOS home">
        <img src="/brand/RecoveryOS_Horizontal_Logo.svg" alt="RecoveryOS" />
      </a>
    </header>

    <main>
      <section class="hero">
        <div class="hero-content">
          <h1>Recovery isn't willpower. It's practice.</h1>
          <p class="hero-copy">
            This is where the practice starts. Not a 12-step program. Not a shame tracker. Not a replacement for your counselor or your community.
            A daily tool built around how your body and brain actually heal.
          </p>
          <div class="hero-actions">
            <div class="hero-stores">
              <div class="hero-store-col">
                ${googlePlayBadge}
              </div>
              <div class="hero-store-col">
                ${appStoreBadge}
              </div>
            </div>
          </div>
        </div>
        <div class="hero-visual" aria-hidden="true">
          <div class="phone-frame">
            <img src="/screenshots/Mood_Challenges.webp" alt="" decoding="async" fetchpriority="high" />
          </div>
        </div>
      </section>

      <section id="gap" class="section-block" data-animate>
        <div>
          <p class="eyebrow">The real problem</p>
          <h2>Other apps count your days. RecoveryOS helps you survive them.</h2>
          <p>
            Sobriety is measured in moments, not milestones. When a craving hits at 2pm on a Tuesday,
            you don't need a streak counter - you need something that helps you regulate, recognize what's happening,
            and choose your next move. That's what I built RecoveryOS for.
          </p>
        </div>
      </section>

      <section id="protocol" class="features">
        <article class="feature-card" data-animate>
          <p class="feature-label">Regulate first</p>
          <h2>Stability before decisions</h2>
          <p>
            Your nervous system doesn't know the difference between a craving and a threat. RecoveryOS gives you
            body-first tools to regulate before you react - because good decisions come from calm, not willpower alone.
          </p>
        </article>
        <article class="feature-card" data-animate>
          <p class="feature-label">Know your patterns</p>
          <h2>Track urges without judgment</h2>
          <p>
            Log cravings, triggers, and responses over time. Not to shame you - to show you.
            Patterns you can see are patterns you can work with.
          </p>
        </article>
        <article class="feature-card" data-animate>
          <p class="feature-label">Build the self</p>
          <h2>Seven areas. One honest check-in.</h2>
          <p>
            A daily check-in across the nervous system, dopamine management, craving log, identity and mind, honesty check-in,
            connection, nutrition, and end-of-day reflections. Not to grade yourself - to know yourself.
          </p>
        </article>
      </section>

      <section class="founder-quote frosted-panel" data-animate>
        <div class="founder-quote__layout">
          <img
            class="founder-photo"
            src="/brand/founder-michael.webp"
            alt="Michael, founder of RecoveryOS"
            width="140"
            height="140"
            loading="lazy"
            decoding="async"
          />
          <div class="founder-quote__body">
            <h2>A note from the founder</h2>
            <blockquote>
              My happiest memory was on a river when I was twelve, in the rare hours my father was clear-headed enough to be fully present and not drunk.
              Loose muscles, slight smile, clear eyes, bright world - that's the state I've spent my life trying to get back to.
              Recovery gave me little pieces of it. Relapse took them away more than once, and each and every time I felt like I had to start over
              from nothing, day 0, just the same failure again. I don't believe that anymore. What I'd actually learned stayed learned; I just needed better tools to
              use it. So I built RecoveryOS for myself, and I now use it every day. It has helped me keep making the right choice, moment by moment.
              It helps me, and I want to share it with others with the hope that it might help them too.
            </blockquote>
            <p class="founder-signoff">
              Michael, founder of RecoveryOS ·
              <a href="https://www.facebook.com/MichaelFrenchieDuPreez" target="_blank" rel="noopener noreferrer">Follow me on Facebook</a>
            </p>
            <a class="founder-story-link" href="/story.html">Read the full story →</a>
          </div>
        </div>
      </section>

      <section id="included" class="included-section" data-animate>
        <div class="included-text">
          <p class="eyebrow">Free vs Pro</p>
          <h2>What's included, and what you'll see in the app</h2>
          <p class="included-tagline">Mobile-first daily practice, strong on its own.</p>
          <h3>Basic (free)</h3>
          <ul class="included-list">
            <li>Daily log across seven inventory domains including honesty check-in and end-of-day reflections</li>
            <li>Dashboard essentials: clean day counter, streaks, XP, challenges, Today's Signal (a small quote), weekly insight card</li>
            <li>Emergency toolkit: physiological sigh, grounding, HALT, mismatch protocol and more, all with full guidance support</li>
            <li>History: month calendar, year aggregates, rich day detail</li>
            <li>Journal with gratitude replay</li>
            <li>Backup and restore, so your logs are shared between your devices, but only yours</li>
            <li>App lock, to keep your journey safe</li>
            <li>Badges, monthly challenges, and milestone share card</li>
          </ul>
          <h3 class="included-pro-heading">Pro</h3>
          <p class="included-tagline">Depth for regulation, insight, and clinical-adjacent reporting.</p>
          <ul class="included-list included-list--pro">
            <li>Spark daily insights reader (written by me and put together from research done across many fields)</li>
            <li>Three structured workbooks (to start with, more to come)</li>
            <li>Guided self-regulation audio sessions (Beta)</li>
            <li>Urge Surfing helper</li>
            <li>Voice memo journal</li>
            <li>Medication and supplement reminders</li>
            <li>Get reminded about what wins you've had, to keep you motivated and grounded.</li>
            <li>Dashboard 7-day mood sparkline</li>
            <li>Weekly summary notifications to keep you on track</li>
            <li>Your own personalized PDF progress report to share with your therapist, sponsor, or loved ones</li>
          </ul>
        </div>

        <div class="included-viewer frosted-panel">
          <div class="included-viewer__stage">
            <img class="included-viewer__main" src="/screenshots/Workbook.webp" alt="Workbooks" decoding="async" loading="lazy" />
            <span class="included-viewer__hint">Click to zoom</span>
          </div>
          <div class="included-viewer__thumbs" aria-label="Choose an app screenshot">
            <button type="button" class="included-viewer__thumb included-viewer__thumb--active" data-caption="Workbooks" data-detail="Long-form identity and recovery work with chapter progression." aria-label="Show Workbooks screenshot" aria-current="true"><img src="/screenshots/Workbook.webp" alt="" loading="lazy" /></button>
            <button type="button" class="included-viewer__thumb" data-caption="Spark insights" data-detail="Evidence-based entries that keep mindset, meaning, and direction in motion." aria-label="Show Spark insights screenshot"><img src="/screenshots/Spark.webp" alt="" loading="lazy" /></button>
            <button type="button" class="included-viewer__thumb" data-caption="Calendar intelligence" data-detail="Review patterns, streaks, and trigger context across real calendar time." aria-label="Show Calendar intelligence screenshot"><img src="/screenshots/Calendar.webp" alt="" loading="lazy" /></button>
            <button type="button" class="included-viewer__thumb" data-caption="Mood and challenge signal" data-detail="Daily score tracking with weekly insight blocks and practical wins logging." aria-label="Show Mood and challenge signal screenshot"><img src="/screenshots/Mood_Challenges.webp" alt="" loading="lazy" /></button>
            <button type="button" class="included-viewer__thumb" data-caption="Backup and reports" data-detail="Build support-ready summaries and retain ownership of your data." aria-label="Show Backup and reports screenshot"><img src="/screenshots/Backup_report.webp" alt="" loading="lazy" /></button>
            <button type="button" class="included-viewer__thumb" data-caption="Adaptive settings" data-detail="Personalize text size, safety options, goals, and progression framing." aria-label="Show Adaptive settings screenshot"><img src="/screenshots/Settings.webp" alt="" loading="lazy" /></button>
          </div>
          <p class="included-viewer__caption" aria-live="polite">
            <strong id="included-caption-title">Workbooks</strong>
            <span id="included-caption-detail">Long-form identity and recovery work with chapter progression.</span>
          </p>
        </div>
      </section>

      <section id="professionals" class="trust" data-animate>
        <h2>For professionals</h2>
        <p>
          RecoveryOS can sit alongside therapy, coaching, mutual aid, medication, sober living, or aftercare planning.
          People using Pro can generate a <strong>structured PDF progress report</strong>: a support-ready snapshot they
          control, useful for prep between sessions, sponsor check-ins, or grounded conversations with loved ones who are
          part of their recovery network.
        </p>
        <p>
          Sharing is always user-initiated: they choose whether to export, what to include in conversation, and when.
          Raw inventory stays on-device unless they explicitly export or share; this site and beta testing signup follow the same privacy posture.
        </p>
        <p>
          It is not a replacement for treatment, therapy, medical advice, medication, crisis care, or clinical judgement.
        </p>
      </section>

      <section id="roadmap" class="roadmap-section trust" aria-labelledby="roadmap-heading">
        <h2 id="roadmap-heading">Product roadmap</h2>
        <p class="roadmap-disclaimer">
          These are our plans, not promises. Beta testing feedback will change what we build next.
        </p>
        <div class="roadmap-grid">
          <article class="roadmap-card" data-animate>
            <h3>Libraries &amp; audio</h3>
            <p>Additional workbook libraries and expanded meditation / regulation audio beyond today's Pro NSDR player.</p>
          </article>
          <article class="roadmap-card" data-animate>
            <h3>Community</h3>
            <p>A deliberate community layer, designed around safety and recovery-first norms.</p>
          </article>
          <article class="roadmap-card" data-animate>
            <h3>Backup &amp; sync</h3>
            <p>Encrypted cloud backup and cross-device sync while preserving local-first ownership principles.</p>
          </article>
          <article class="roadmap-card" data-animate>
            <h3>Accountability</h3>
            <p>User-chosen accountability buddy flows with thoughtful automation, consent-forward by design.</p>
          </article>
          <article class="roadmap-card roadmap-card--wide" data-animate>
            <h3>SupportOS</h3>
            <p>Companion experience for supporters, sponsors, and loved ones, extending the RecoveryOS ecosystem without blurring clinical boundaries.</p>
          </article>
        </div>
      </section>

      <section id="privacy" class="trust" data-animate>
        <h2>Privacy and trust signals</h2>
        <p>
          We built RecoveryOS to be useful without feeling invasive. You stay in control of what you share, when you share it,
          and why.
        </p>
        <ul class="trust-list">
          <li>All of your app data stays on your own device by default.</li>
          <li>You can use basic RecoveryOS without creating an account.</li>
          <li>We will never sell your data to third parties.</li>
          <li>We know how important your recovery and privacy is to you, and we will never compromise that.</li>
          <li>If you join the beta testing, we only keep the basics: your email, signup time, and where the signup came from.</li>
          <li>If you choose to send a bug report from the app, we receive only what you submit (message, optional screenshot, and diagnostics required to troubleshoot).</li>
        </ul>
      </section>

      <section id="waitlist" class="waitlist frosted-panel" data-animate>
        <div class="waitlist-head">
          <p class="eyebrow">Beta testing</p>
          <h2>Join the RecoveryOS beta testing</h2>
          <p>
            Build a life your body and mind want to return to.
            We will send launch updates, tester invites, and release announcements.
          </p>
        </div>

        <form id="waitlist-form" class="waitlist-form" novalidate>
          <!-- Honeypot: bots that fill this get a silent success so we do not train retries against Firestore. -->
          <input
            type="text"
            id="waitlist-hp"
            class="waitlist-hp"
            name="company"
            tabindex="-1"
            autocomplete="off"
            aria-hidden="true"
          />
          <label for="waitlist-email">Email address</label>
          <div class="waitlist-row">
            <input
              id="waitlist-email"
              name="email"
              type="email"
              autocomplete="email"
              inputmode="email"
              placeholder="you@example.com"
              required
            />
            <button id="waitlist-submit" class="btn btn-primary" type="submit">
              Join the beta testing
            </button>
          </div>
          <p id="waitlist-message" class="waitlist-message" role="status" aria-live="polite"></p>
        </form>
      </section>
    </main>

    <section class="site-social trust" ${socialSectionHidden} aria-labelledby="social-heading">
      <h2 id="social-heading">Social</h2>
      <p class="site-social-lead">
        Follow RecoveryOS for craving science, build updates, and beta news.
      </p>
      <ul class="site-social-list">
        <li>
          <a href="https://www.facebook.com/recoveryos" class="site-social-link" target="_blank" rel="noopener noreferrer">
            <img src="/social/facebook.svg" width="32" height="32" alt="Facebook" decoding="async" />
          </a>
        </li>
        <li>
          <a href="https://www.instagram.com/recovery_os/" class="site-social-link" target="_blank" rel="noopener noreferrer">
            <img src="/social/instagram.svg" width="32" height="32" alt="Instagram" decoding="async" />
          </a>
        </li>
        <li>
          <a href="https://bsky.app/profile/recoveryos.bsky.social" class="site-social-link" target="_blank" rel="noopener noreferrer">
            <img src="/social/bluesky.svg" width="32" height="32" alt="Bluesky" decoding="async" />
          </a>
        </li>
        <li>
          <a href="https://x.com/Recovery_OS" class="site-social-link" target="_blank" rel="noopener noreferrer">
            <img src="/social/x.svg" width="32" height="32" alt="X" decoding="async" />
          </a>
        </li>
        <li>
          <a href="https://www.linkedin.com/company/recovery-os" class="site-social-link" target="_blank" rel="noopener noreferrer">
            <img src="/social/linkedin.svg" width="32" height="32" alt="LinkedIn" decoding="async" />
          </a>
        </li>
        <li>
          <a href="https://www.threads.com/@recovery_os" class="site-social-link" target="_blank" rel="noopener noreferrer">
            <img src="/social/threads.svg" width="32" height="32" alt="Threads" decoding="async" />
          </a>
        </li>
        <li>
          <a href="#" class="site-social-link site-social-link--pending" aria-disabled="true" tabindex="-1">
            <img src="/social/youtube.svg" width="32" height="32" alt="YouTube" decoding="async" />
          </a>
        </li>
      </ul>
    </section>

    <footer id="support" class="site-footer">
      <p>Built by PhaseWright Labs.</p>
      <p>
        Need support?
        <a href="mailto:support@recoveryos.org">support@recoveryos.org</a>
      </p>
      <p class="footer-legal">
        <a href="/legal/privacy-policy.html">Privacy policy</a> ·
        <a href="/legal/terms-of-service.html">Terms of service</a> ·
        <a href="/ai-info.html">AI info</a> ·
        <a href="#" data-ros-open-consent>Cookie settings</a>
      </p>
    </footer>
  </div>
`;

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
