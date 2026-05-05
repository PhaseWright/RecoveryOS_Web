import "./style.css";
import { isFirebaseConfigured } from "./firebaseClient.js";
import { joinWaitlist } from "./waitlist.js";

document.querySelector("#app").innerHTML = `
  <div class="page">
    <header class="site-header">
      <a class="brand-lockup" href="/" aria-label="RecoveryOS home">
        <img src="/brand/RecoveryOS_Horizontal_Logo.svg" alt="RecoveryOS" />
      </a>
      <nav class="header-links" aria-label="Primary">
        <a href="#gap">Why RecoveryOS</a>
        <a href="#protocol">Daily protocol</a>
        <a href="#privacy">Privacy</a>
        <a href="#waitlist">Waitlist</a>
        <a href="/legal/privacy-policy.html">Policy</a>
      </nav>
    </header>

    <main>
      <section class="hero">
        <p class="eyebrow">RecoveryOS by PhaseWright Labs</p>
        <h1>Recovery isn't willpower. It's practice.</h1>
        <p class="hero-copy">
          Most days are won in the small moments - the pause before a bad decision, the breath before a craving peaks,
          the check-in you actually do. RecoveryOS is where that practice lives.
        </p>
        <div class="hero-actions">
          <!-- Install CTA intentionally disabled until store listing is live. -->
          <button class="btn btn-primary btn-disabled" type="button" disabled aria-disabled="true">
            Google Play release coming soon
          </button>
          <a class="btn btn-secondary" href="#waitlist">
            Join early access waitlist
          </a>
          <a class="btn btn-secondary" href="#professionals">
            View professional overview
          </a>
        </div>
      </section>

      <section class="positioning-strip" aria-label="RecoveryOS positioning">
        Not a 12-step program. Not a shame tracker. Not a replacement for your counselor or your community.
        A daily tool built around how your body and brain actually heal.
      </section>

      <section id="gap" class="section-block">
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
        <article class="feature-card">
          <p class="feature-label">Regulate first</p>
          <h2>Stability before decisions</h2>
          <p>
            Your nervous system doesn't know the difference between a craving and a threat. RecoveryOS gives you
            body-first tools to regulate before you react - because good decisions come from calm, not willpower alone.
          </p>
        </article>
        <article class="feature-card">
          <p class="feature-label">Know your patterns</p>
          <h2>Track urges without judgment</h2>
          <p>
            Log cravings, triggers, and responses over time. Not to shame you - to show you.
            Patterns you can see are patterns you can work with.
          </p>
        </article>
        <article class="feature-card">
          <p class="feature-label">Build the self</p>
          <h2>Six domains. One honest check-in.</h2>
          <p>
            A daily audit across nervous system, dopamine management, craving log, identity and mind, connection,
            and nutrition. Not to grade yourself - to know yourself.
          </p>
        </article>
      </section>

      <section class="trust">
        <h2>High-impact features people actually use daily</h2>
        <p>
          Beyond emergency protocols, RecoveryOS includes a full daily operating layer:
          structured workbooks, guided insights, pattern-rich calendars, momentum views, backup/report tools,
          and configurable routines that keep progress visible.
        </p>
      </section>

      <section class="feature-gallery" aria-label="RecoveryOS app screenshots">
        <p class="gallery-hint">On mobile: swipe up/down in this section to slide through screenshots.</p>
        <article class="screenshot-card">
          <img src="/screenshots/Workbook.png" alt="RecoveryOS workbook progression view" loading="lazy" />
          <h3>Workbooks</h3>
          <p>Long-form identity and recovery work with chapter progression.</p>
        </article>
        <article class="screenshot-card">
          <img src="/screenshots/Spark.png" alt="RecoveryOS Spark insights reading view" loading="lazy" />
          <h3>Spark insights</h3>
          <p>Evidence-based entries that keep mindset, meaning, and direction in motion.</p>
        </article>
        <article class="screenshot-card">
          <img src="/screenshots/Calendar.png" alt="RecoveryOS recovery calendar and trend view" loading="lazy" />
          <h3>Calendar intelligence</h3>
          <p>Review patterns, streaks, and trigger context across real calendar time.</p>
        </article>
        <article class="screenshot-card">
          <img src="/screenshots/Mood_Challenges.png" alt="RecoveryOS mood and challenge dashboard" loading="lazy" />
          <h3>Mood and challenge signal</h3>
          <p>Daily score tracking with weekly insight blocks and practical wins logging.</p>
        </article>
        <article class="screenshot-card">
          <img src="/screenshots/Backup_report.png" alt="RecoveryOS backup and report export tools" loading="lazy" />
          <h3>Backup and reports</h3>
          <p>Build support-ready summaries and retain ownership of your raw data.</p>
        </article>
        <article class="screenshot-card">
          <img src="/screenshots/Settings.png" alt="RecoveryOS settings and progression panel" loading="lazy" />
          <h3>Adaptive settings</h3>
          <p>Personalize text size, safety options, goals, and progression framing.</p>
        </article>
      </section>

      <section class="founder-quote">
        <h2>A note from the founder</h2>
        <blockquote>
          I have been in recovery for many years, and I have been involved in service and recovery support for all of that time.
          But nonetheless, relapses happened, and every time, I felt I had to start at the bottom again. That is not the case.
          I have learned, grown, and found new tools that helped me build a version of myself that can exist beyond recovery.
          I built RecoveryOS because I knew what I needed to stay focused on who I am, not what I was.
          It has been helping me. I hope it helps you.
        </blockquote>
        <p class="founder-signoff">— Michael, founder of RecoveryOS</p>
      </section>

      <section id="privacy" class="trust">
        <h2>Privacy and trust signals</h2>
        <ul class="trust-list">
          <li>Local-first architecture aligned with RecoveryOS app behavior.</li>
          <li>No mandatory account to use core app workflows.</li>
          <li>Policy transparency: legal and Firebase setup are documented publicly.</li>
          <li>Waitlist only stores what we need: email, signup timestamp, and source marker.</li>
        </ul>
      </section>

      <section id="professionals" class="trust">
        <h2>For professionals</h2>
        <p>
          Recovery OS can sit alongside therapy, coaching, mutual aid, medication, sober living, or aftercare planning.
          It gives people a structured way to bring real-life data back into support conversations.
        </p>
        <p>
          It is not a replacement for treatment, therapy, medical advice, medication, crisis care, or clinical judgement.
        </p>
      </section>

      <section id="waitlist" class="waitlist">
        <div class="waitlist-head">
          <p class="eyebrow">Early Access</p>
          <h2>Join the RecoveryOS tester waitlist</h2>
          <p>
            Build a life your body and mind want to return to.
            We will send launch updates, tester invites, and release announcements.
          </p>
        </div>

        <form id="waitlist-form" class="waitlist-form" novalidate>
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
              Join waitlist
            </button>
          </div>
          <p id="waitlist-message" class="waitlist-message" role="status" aria-live="polite"></p>
          <p id="waitlist-firebase-warning" class="waitlist-warning" hidden>
            Waitlist storage is not configured yet. Set the Firebase environment variables to enable signups.
          </p>
        </form>
      </section>
    </main>

    <footer id="support" class="site-footer">
      <p>Built by PhaseWright Labs.</p>
      <p>
        Need support?
        <a href="mailto:support@recoveryos.org">support@recoveryos.org</a>
      </p>
    </footer>
  </div>
`;

const form = document.querySelector("#waitlist-form");
const emailInput = document.querySelector("#waitlist-email");
const submitButton = document.querySelector("#waitlist-submit");
const messageEl = document.querySelector("#waitlist-message");
const firebaseWarning = document.querySelector("#waitlist-firebase-warning");

const firebaseReady = isFirebaseConfigured();
if (!firebaseReady) {
  firebaseWarning.hidden = false;
}

function setFormState({ loading = false, tone = "neutral", message = "" } = {}) {
  submitButton.disabled = loading || !firebaseReady;
  submitButton.textContent = loading ? "Joining..." : "Join waitlist";
  messageEl.textContent = message;
  messageEl.dataset.tone = tone;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!firebaseReady) {
    setFormState({
      tone: "error",
      message: "Waitlist is temporarily unavailable. Please try again after setup.",
    });
    return;
  }

  setFormState({ loading: true, tone: "neutral", message: "Submitting..." });

  try {
    const email = emailInput.value ?? "";
    const result = await joinWaitlist(email);

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
    setFormState({
      loading: false,
      tone: "error",
      message: "Something went wrong while saving your signup. Please retry.",
    });
    console.error("[waitlist] signup failed", error);
  }
});

setFormState({ loading: false, tone: "neutral", message: "" });
