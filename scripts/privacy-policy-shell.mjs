const SITE_SHELL_LINKS = `
  <link rel="stylesheet" href="/brand/theme.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Manrope:wght@400;600;800&display=swap" rel="stylesheet" />`;

const SITE_SHELL_STYLES = `
    *, *::before, *::after { box-sizing: border-box; }
    html { background: var(--bg-base); }
    body { margin: 0; color: #dde8f0; background: var(--bg-base); }
    .legal-page { position: relative; z-index: 1; width: min(42rem, 100%); margin: 0 auto; padding: 1.25rem; font-family: var(--font-body), system-ui, Segoe UI, sans-serif; line-height: 1.6; }
    h1, h2 { font-family: var(--font-display); }
    h1 { font-size: 1.5rem; letter-spacing: 0.02em; color: #f2f8fc; }
    h2 { font-size: 1.2rem; margin-top: 1.75rem; color: #f2f8fc; }
    p, li, td, th { font-size: 0.95rem; color: #c8dae8; }
    ul { padding-left: 1.2rem; }
    table { width: 100%; border-collapse: collapse; margin-top: 0.5rem; }
    th, td { border: 1px solid rgba(255, 255, 255, 0.12); padding: 0.45rem 0.6rem; text-align: left; vertical-align: top; }
    th { background: rgba(var(--accent-teal-rgb), 0.08); color: #eaf3f8; }
    .muted { color: #8fa9bb; font-size: 0.88rem; }
    a { color: var(--accent-teal-soft); }
    .legal-rule { border: none; border-top: 1px solid rgba(255, 255, 255, 0.12); margin: 2rem 0 1rem; }
    .aurora-zone {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 860px;
      z-index: 0;
      pointer-events: none;
      background-image:
        radial-gradient(ellipse 55% 45% at 78% 10%, rgba(var(--accent-warm-rgb), 0.28), transparent 55%),
        radial-gradient(circle at 12% 28%, rgba(var(--accent-teal-rgb), 0.22), transparent 46%),
        radial-gradient(circle at 60% 62%, rgba(var(--accent-blue-rgb), 0.18), transparent 52%),
        linear-gradient(165deg, #0a1622 0%, #060d16 55%, #04080f 100%);
      background-size: 130% 130%, 130% 130%, 130% 130%, 100% 100%;
      background-position: 0% 0%, 0% 0%, 0% 0%, 0% 0%;
      -webkit-mask-image: linear-gradient(to bottom, #000 0, #000 560px, transparent 860px);
      mask-image: linear-gradient(to bottom, #000 0, #000 560px, transparent 860px);
      animation: aux-aurora-drift 22s ease-in-out infinite alternate;
    }
    .aurora-zone::after { content: ''; position: absolute; inset: 0; opacity: 0.28; mix-blend-mode: overlay; background-image: var(--grain-svg); }
    @keyframes aux-aurora-drift {
      0%   { background-position: 0% 0%, 0% 0%, 0% 0%, 0% 0%; }
      100% { background-position: 3% 4%, -3% 3%, 2% -3%, 0% 0%; }
    }
    @media (prefers-reduced-motion: reduce) { .aurora-zone { animation: none; } }
`;

export function applyMarketingSiteShell(html) {
  let out = html;

  if (!out.includes('/brand/theme.css')) {
    out = out.replace(/<style>/i, `${SITE_SHELL_LINKS}\n\n  <style>`);
  }

  out = out.replace(/<style>[\s\S]*?<\/style>/i, `<style>${SITE_SHELL_STYLES}  </style>`);

  if (!out.includes('class="aurora-zone"')) {
    out = out.replace(/<body>/i, '<body>\n  <div class="aurora-zone"></div>');
  }

  if (!out.includes('class="legal-page"')) {
    out = out.replace(/<h1\b/i, '<main class="legal-page">\n  <h1');
    out = out.replace(/<\/body>/i, '  </main>\n</body>');
  }

  return out.replace(/[ \t]+$/gm, "");
}
