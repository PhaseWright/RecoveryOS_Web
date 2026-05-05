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
        <h1>Recovery that trains the body, not just the will.</h1>
        <p class="hero-copy">
          Recovery OS is a compassionate daily system for people rebuilding life after addiction -
          with nervous system tools, craving awareness, journaling, patterns, and identity practice in one calm app.
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
        Not a 12-step program. Not a shame app. Not a replacement for professional care.
        A practical daily companion for the body, mind, and life you are rebuilding.
      </section>

      <section id="gap" class="section-block">
        <div>
          <p class="eyebrow">The gap</p>
          <h2>Most recovery apps count sober days. Recovery OS helps you build the day.</h2>
          <p>
            When stress, boredom, shame, or cravings show up, you need more than a number.
            You need a quick way to regulate, reflect, reconnect, and make the next useful move.
          </p>
        </div>
        <img class="section-mark" src="/brand/RecoveryOS_Mark.svg" alt="" aria-hidden="true" />
      </section>

      <section id="protocol" class="features">
        <article class="feature-card">
          <h2>Nervous system</h2>
          <p>
            Build body-level regulation before decision-making so recovery starts from stability, not panic.
          </p>
        </article>
        <article class="feature-card">
          <h2>Dopamine and cravings</h2>
          <p>
            Track urges, triggers, and actions in a way that creates signal over time without self-judgement.
          </p>
        </article>
        <article class="feature-card">
          <h2>Identity, connection, reflection</h2>
          <p>
            Use a gentle check-in across six domains: nervous system, dopamine management, craving log,
            identity and mind, connection, and nutrition/reflection.
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
          It has been helping me, and I hope it can help you too. We all deserve to be our best selves, free of shame,
          and proud of the new steps we take on this journey.
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
