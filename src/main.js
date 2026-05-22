import "./style.css";
import { isFirebaseConfigured } from "./firebaseClient.js";
import { joinWaitlist } from "./waitlist.js";
import { telemetryEvent } from "./telemetry.js";

const socialSectionHidden =
  import.meta.env.DEV || import.meta.env.VITE_SHOW_SOCIAL === "true" ? "" : "hidden";

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
                <div class="hero-store-item">
                  <img class="hero-store-badge" src="/store/google-play.svg" alt="Google Play" decoding="async" />
                  <span class="store-badge store-badge--soon">Coming soon</span>
                </div>
                <a class="btn btn-secondary" href="#waitlist">Join the beta testing</a>
              </div>
              <div class="hero-store-col">
                <div class="hero-store-item">
                  <img class="hero-store-badge hero-store-badge--app-store" src="/store/app-store.svg" alt="Download on the App Store" decoding="async" />
                  <span class="store-badge store-badge--soon">Coming soon</span>
                </div>
                <a class="btn btn-secondary" href="#professionals">View professional overview</a>
              </div>
            </div>
          </div>
        </div>
        <div class="hero-visual" aria-hidden="true">
          <div class="phone-frame">
            <img src="/screenshots/Mood_Challenges.png" alt="" decoding="async" />
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
            and choose your next move. That's what RecoveryOS is built for.
          </p>
        </div>
        <img class="section-mark" src="/brand/RecoveryOS_Mark.svg" alt="" aria-hidden="true" />
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
        <article class="feature-card" data-animate style="transition-delay: 0.1s">
          <p class="feature-label">Know your patterns</p>
          <h2>Track urges without judgment</h2>
          <p>
            Log cravings, triggers, and responses over time. Not to shame you - to show you.
            Patterns you can see are patterns you can work with.
          </p>
        </article>
        <article class="feature-card" data-animate style="transition-delay: 0.2s">
          <p class="feature-label">Build the self</p>
          <h2>Seven areas. One honest check-in.</h2>
          <p>
            A daily audit across nervous system, dopamine management, craving log, identity and mind, honesty check-in,
            connection, nutrition, and end-of-day reflection. Not to grade yourself - to know yourself.
          </p>
        </article>
      </section>

      <section class="feature-gallery" aria-label="RecoveryOS app screenshots">
        <article class="screenshot-card" data-animate>
          <img src="/screenshots/Workbook.png" alt="RecoveryOS workbook progression view" loading="lazy" />
          <h3>Workbooks</h3>
          <p>Long-form identity and recovery work with chapter progression.</p>
        </article>
        <article class="screenshot-card" data-animate style="transition-delay: 0.08s">
          <img src="/screenshots/Spark.png" alt="RecoveryOS Spark insights reading view" loading="lazy" />
          <h3>Spark insights</h3>
          <p>Evidence-based entries that keep mindset, meaning, and direction in motion.</p>
        </article>
        <article class="screenshot-card" data-animate style="transition-delay: 0.16s">
          <img src="/screenshots/Calendar.png" alt="RecoveryOS recovery calendar and trend view" loading="lazy" />
          <h3>Calendar intelligence</h3>
          <p>Review patterns, streaks, and trigger context across real calendar time.</p>
        </article>
        <article class="screenshot-card" data-animate style="transition-delay: 0.24s">
          <img src="/screenshots/Mood_Challenges.png" alt="RecoveryOS mood and challenge dashboard" loading="lazy" />
          <h3>Mood and challenge signal</h3>
          <p>Daily score tracking with weekly insight blocks and practical wins logging.</p>
        </article>
        <article class="screenshot-card" data-animate style="transition-delay: 0.32s">
          <img src="/screenshots/Backup_report.png" alt="RecoveryOS backup and report export tools" loading="lazy" />
          <h3>Backup and reports</h3>
          <p>Build support-ready summaries and retain ownership of your data.</p>
        </article>
        <article class="screenshot-card" data-animate style="transition-delay: 0.40s">
          <img src="/screenshots/Settings.png" alt="RecoveryOS settings and progression panel" loading="lazy" />
          <h3>Adaptive settings</h3>
          <p>Personalize text size, safety options, goals, and progression framing.</p>
        </article>
      </section>

      <section id="plans" class="compare-section trust" aria-labelledby="plans-heading" data-animate>
        <h2 id="plans-heading">Free vs Pro — what's included</h2>
        <p class="compare-intro">
          RecoveryOS stays useful without a subscription. Pro deepens regulation, insight, and reporting when you want the full toolkit.
        </p>
        <div class="compare-grid">
          <div class="compare-column compare-column--basic">
            <h3 class="compare-heading">Basic (free)</h3>
            <p class="compare-tagline">Mobile-first daily practice — strong on its own.</p>
            <ul class="compare-list">
              <li>Daily log across seven inventory domains including honesty check-in and end-of-day reflection</li>
              <li>Dashboard essentials: clean day counter, streaks, XP, challenges, Today's Signal, weekly insight card</li>
              <li>Emergency toolkit: physiological sigh, grounding, HALT, mismatch protocol and more, all with full guidance support</li>
              <li>History: month calendar, year aggregates, rich day detail</li>
              <li>Journal with gratitude replay</li>
              <li>Backup and restore — your data stays portable</li>
              <li>App lock</li>
              <li>Badges, monthly challenges, and milestone share card</li>
            </ul>
          </div>
          <div class="compare-column compare-column--pro">
            <h3 class="compare-heading compare-heading--pro">Pro</h3>
            <p class="compare-tagline compare-tagline--pro">Depth for regulation, insight, and clinical-adjacent reporting.</p>
            <ul class="compare-list compare-list--pro">
              <li>Spark daily insights reader</li>
              <li>Three structured workbooks (to start with, more to come)</li>
              <li>Guided self-regulation audio sessions</li>
              <li>Urge Surfing helper</li>
              <li>Voice memo journal</li>
              <li>Medication and supplement reminders</li>
              <li>Get reminded about what wins you've had, to keep you motivated and grounded.</li>
              <li>Dashboard 7-day mood sparkline</li>
              <li>Weekly summary notifications to keep you on track</li>
              <li>Your own personalized PDF progress report to share with your therapist, sponsor, or loved ones</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="pro" class="pro-highlight" aria-labelledby="pro-heading" data-animate>
        <div class="pro-highlight__inner">
          <p class="pro-highlight__eyebrow">RecoveryOS Pro</p>
          <h2 id="pro-heading">Regulate deeper. Get access to our <em>Spark</em> daily insights. Bring a real report to the conversation.</h2>
          <p class="pro-highlight__copy">
            Pro layers regulation audio (NSDR today; expanded meditation library planned), Spark's evidence-grounded just for today,
            and a PDF progress workflow so you can export a structured summary when <em>you</em> choose to share it —
            with therapists, sponsors, coaches, or loved ones supporting your recovery.
          </p>
          <ul class="pro-highlight__bullets">
            <li>Body-first tools alongside journaling and analytics.</li>
            <li>Early access to new features and improvements.</li>
            <li>You get to help shape RecoveryOS into the best tool for your recovery.</li>
          </ul>
          <div class="pro-highlight__cta">
            <a class="btn btn-primary pro-highlight__btn" href="#waitlist">Join the beta testing for launch + Pro updates</a>
          </div>
        </div>
      </section>

      <section id="professionals" class="trust" data-animate>
        <h2>For professionals</h2>
        <p>
          RecoveryOS can sit alongside therapy, coaching, mutual aid, medication, sober living, or aftercare planning.
          People using Pro can generate a <strong>structured PDF progress report</strong> — a support-ready snapshot they
          control — useful for prep between sessions, sponsor check-ins, or grounded conversations with loved ones who are
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
          These are our plans, but we will grow and evolve with your feedback.
        </p>
        <div class="roadmap-grid">
          <article class="roadmap-card" data-animate>
            <h3>Libraries &amp; audio</h3>
            <p>Additional workbook libraries and expanded meditation / regulation audio beyond today's Pro NSDR player.</p>
          </article>
          <article class="roadmap-card" data-animate style="transition-delay: 0.08s">
            <h3>Community</h3>
            <p>A deliberate community layer — designed around safety and recovery-first norms.</p>
          </article>
          <article class="roadmap-card" data-animate style="transition-delay: 0.16s">
            <h3>Backup &amp; sync</h3>
            <p>Encrypted cloud backup and cross-device sync while preserving local-first ownership principles.</p>
          </article>
          <article class="roadmap-card" data-animate style="transition-delay: 0.24s">
            <h3>Accountability</h3>
            <p>User-chosen accountability buddy flows with thoughtful automation — consent-forward by design.</p>
          </article>
          <article class="roadmap-card roadmap-card--wide" data-animate style="transition-delay: 0.32s">
            <h3>SupportOS</h3>
            <p>Companion experience for supporters, sponsors, and loved ones — extending the RecoveryOS ecosystem without blurring clinical boundaries.</p>
          </article>
        </div>
      </section>

      <section class="founder-quote" data-animate>
        <h2>A note from the founder</h2>
        <blockquote>
          I have been in recovery for many years, and I have been involved in service and recovery support for all of that time.
          But nonetheless, relapses happened, and every time, I felt I had to start at the bottom again. That is not the case.
          I have learned, grown, and found new tools that helped me build a version of myself that can exist beyond recovery.
          I built RecoveryOS because I knew what I needed to stay focused on who I am, not what I was.
          It has been helping me. I hope it helps you.
        </blockquote>
        <p class="founder-signoff">— Michael, founder of RecoveryOS</p>
        <a class="founder-story-link" href="/story.html">Read the full story →</a>
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

      <section id="waitlist" class="waitlist" data-animate>
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
          <div class="waitlist-interests" role="group" aria-labelledby="interests-label">
            <p id="interests-label" class="waitlist-interests__legend">What interests you most? <span class="waitlist-interests__opt">(optional)</span></p>
            <div class="waitlist-interests__grid">
              <label class="waitlist-check">
                <input type="checkbox" name="interests" value="daily-structure" />
                <span>Daily structure &amp; journaling</span>
              </label>
              <label class="waitlist-check">
                <input type="checkbox" name="interests" value="craving-management" />
                <span>Craving &amp; trigger management</span>
              </label>
              <label class="waitlist-check">
                <input type="checkbox" name="interests" value="progress-tracking" />
                <span>Progress tracking &amp; reporting</span>
              </label>
              <label class="waitlist-check">
                <input type="checkbox" name="interests" value="community" />
                <span>Community &amp; accountability</span>
              </label>
            </div>
          </div>
          <p id="waitlist-message" class="waitlist-message" role="status" aria-live="polite"></p>
        </form>
      </section>
    </main>

    <section class="site-social trust" ${socialSectionHidden} aria-labelledby="social-heading">
      <h2 id="social-heading">Social</h2>
      <p class="site-social-lead">
        We will wire real links here when our public channels go live. Icons below use standard brand artwork for recognition only.
      </p>
      <ul class="site-social-list">
        <li>
          <a href="#" class="site-social-link site-social-link--pending" aria-disabled="true" tabindex="-1">
            <img src="/social/facebook.svg" width="32" height="32" alt="Facebook" decoding="async" />
          </a>
        </li>
        <li>
          <a href="#" class="site-social-link site-social-link--pending" aria-disabled="true" tabindex="-1">
            <img src="/social/instagram.svg" width="32" height="32" alt="Instagram" decoding="async" />
          </a>
        </li>
        <li>
          <a href="#" class="site-social-link site-social-link--pending" aria-disabled="true" tabindex="-1">
            <img src="/social/linkedin.svg" width="32" height="32" alt="LinkedIn" decoding="async" />
          </a>
        </li>
        <li>
          <a href="#" class="site-social-link site-social-link--pending" aria-disabled="true" tabindex="-1">
            <img src="/social/youtube.svg" width="32" height="32" alt="YouTube" decoding="async" />
          </a>
        </li>
        <li>
          <a href="#" class="site-social-link site-social-link--pending" aria-disabled="true" tabindex="-1">
            <img src="/social/x.svg" width="32" height="32" alt="X" decoding="async" />
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
        <a href="/legal/privacy-policy.html">Privacy policy</a>
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
    const interests = [...form.querySelectorAll('input[name="interests"]:checked')].map(
      (el) => el.value,
    );
    const result = await joinWaitlist(email, interests);

    if (result.status === "created") {
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
  const thumbs = document.querySelectorAll(".screenshot-card img");
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

function initScrollAnimations() {
  // We skip when IntersectionObserver is unavailable (jsdom in Vitest, very old browsers).
  if (typeof IntersectionObserver === "undefined") return;

  const targets = document.querySelectorAll("[data-animate]");
  if (!targets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animated");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -32px 0px" },
  );

  targets.forEach((el) => observer.observe(el));
}

initScreenshotLightbox();
initScrollAnimations();
