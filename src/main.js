import "./style.css";

document.querySelector("#app").innerHTML = `
  <div class="page">
    <header class="site-header">
      <a class="wordmark" href="/" aria-label="RecoveryOS home">RecoveryOS</a>
      <nav class="header-links" aria-label="Primary">
        <a href="#features">Features</a>
        <a href="#support">Support</a>
        <a href="/legal/privacy-policy.html">Privacy</a>
      </nav>
    </header>

    <main>
      <section class="hero">
        <p class="eyebrow">Recovery support. Local-first.</p>
        <h1>Built for real recovery journeys, not one-size-fits-all programs.</h1>
        <p class="hero-copy">
          RecoveryOS helps you track routines, journal honestly, and stay grounded with private tools
          that live on your device by default.
        </p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="https://play.google.com/store" rel="noopener noreferrer">
            Get it on Google Play
          </a>
          <a class="btn btn-secondary" href="/legal/privacy-policy.html">
            View privacy policy
          </a>
        </div>
      </section>

      <section id="features" class="features">
        <article class="feature-card">
          <h2>Local-first by design</h2>
          <p>
            Journal entries, recovery logs, and personal settings stay on your device unless you
            explicitly choose to export.
          </p>
        </article>
        <article class="feature-card">
          <h2>Structured without rigid doctrine</h2>
          <p>
            Build your own rhythm with practical tools for consistency, reflection, and relapse
            prevention.
          </p>
        </article>
        <article class="feature-card">
          <h2>Simple Pro unlock paths</h2>
          <p>
            Android users can unlock Pro through Google Play Billing, with support and gift paths
            retained for operations and access continuity.
          </p>
        </article>
      </section>
    </main>

    <footer id="support" class="site-footer">
      <p>Built by PhaseWright Labs.</p>
      <p>
        Need support?
        <a href="mailto:frenchie.mike1123@gmail.com">frenchie.mike1123@gmail.com</a>
      </p>
    </footer>
  </div>
`;
