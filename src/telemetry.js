// We keep PII-free breadcrumbs for waitlist failures (sessionStorage only; no third-party SDK).

/**
 * @param {string} name
 * @param {Record<string, string | number | boolean | undefined>} [payload]
 */
export function telemetryEvent(name, payload = {}) {
  try {
    const line = JSON.stringify({ t: Date.now(), name, ...payload });
    const prev = sessionStorage.getItem("recoveryos_web_telemetry");
    const lines = (prev ? `${prev}\n${line}` : line).split("\n").slice(-20);
    sessionStorage.setItem("recoveryos_web_telemetry", lines.join("\n"));
  } catch {
    // We never throw from telemetry.
  }
}
