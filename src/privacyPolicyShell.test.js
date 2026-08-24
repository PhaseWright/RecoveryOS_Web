import { describe, expect, it } from "vitest";
import { applyMarketingSiteShell } from "../scripts/privacy-policy-shell.mjs";

const canonicalPolicy = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Recovery OS - Privacy Policy</title>
  <style>body { color: #1a2a3a; background: #f7fafc; }</style>
</head>
<body>
  <h1>RECOVERY OS: PRIVACY POLICY</h1>
  <p>Canonical policy content.</p>
</body>
</html>`;

describe("applyMarketingSiteShell", () => {
  it("preserves canonical content inside the website legal-page shell", () => {
    const result = applyMarketingSiteShell(canonicalPolicy);

    expect(result).toContain('<link rel="stylesheet" href="/brand/theme.css" />');
    expect(result).toContain('<div class="aurora-zone"></div>');
    expect(result).toContain('<main class="legal-page">');
    expect(result).toContain("Canonical policy content.");
    expect(result).toContain("background: var(--bg-base)");
    expect(result).not.toContain("background: #f7fafc");
  });

  it("does not duplicate the shell when applied twice", () => {
    const result = applyMarketingSiteShell(applyMarketingSiteShell(canonicalPolicy));

    expect(result.match(/class="aurora-zone"/g)).toHaveLength(1);
    expect(result.match(/class="legal-page"/g)).toHaveLength(1);
    expect(result.match(/\/brand\/theme\.css/g)).toHaveLength(1);
  });
});
