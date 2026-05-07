import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { createHash } from "node:crypto";

const RESEND_API_KEY = defineSecret("RESEND_API_KEY");
const FROM_EMAIL = "no-reply@recoveryos.org";
const TESTER_CONTACT_EMAIL = "michael@recoveryos.org";
const ADMIN_NOTIFY_EMAIL = "codemanmike@outlook.com";
const APP_SUPPORT_EMAIL = "support@recoveryos.org";
const MAX_BUG_MESSAGE_CHARS = 4000;
const MAX_SCREENSHOT_BYTES = 2_000_000;
const BUG_REPORTS_COLLECTION = "app_bug_reports";
const BUG_REPORT_MAIL_LOG_COLLECTION = "app_bug_report_mail_log";
const BUG_REPORT_RATE_LIMIT_COLLECTION = "app_bug_report_rate_limit";
const BUG_REPORT_DEDUPE_COLLECTION = "app_bug_report_dedupe";
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const DEDUPE_WINDOW_MS = 5 * 60 * 1000;
const ALLOWED_BUG_REPORT_ORIGINS = new Set([
  "https://recoveryos.org",
  "https://www.recoveryos.org",
  "http://localhost:5173",
  "http://localhost:4173",
  "capacitor://localhost",
  "http://localhost",
]);

initializeApp();
const db = getFirestore();

function addCorsHeaders(response, origin = "") {
  if (origin && ALLOWED_BUG_REPORT_ORIGINS.has(origin)) {
    response.set("Access-Control-Allow-Origin", origin);
  } else {
    response.set("Access-Control-Allow-Origin", "https://recoveryos.org");
  }
  response.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.set("Access-Control-Allow-Headers", "Content-Type");
  response.set("Access-Control-Max-Age", "3600");
  response.set("Vary", "Origin");
}

function normalizeMessage(input) {
  const cleaned = String(input ?? "")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return "No additional user message provided.";
  return cleaned.slice(0, MAX_BUG_MESSAGE_CHARS);
}

function sanitizeContext(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  try {
    return JSON.parse(JSON.stringify(input));
  } catch {
    return {};
  }
}

function parseScreenshotAttachment(screenshot) {
  if (!screenshot || typeof screenshot !== "object") return null;
  const dataUrl = String(screenshot.dataUrl || "").trim();
  if (!dataUrl) return null;
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) return { invalid: true, reason: "invalid_data_url" };

  const contentType = match[1];
  const base64Content = match[2];
  const approxBytes = Math.floor((base64Content.length * 3) / 4);
  if (approxBytes > MAX_SCREENSHOT_BYTES) {
    return { invalid: true, reason: "screenshot_too_large", bytes: approxBytes };
  }

  return {
    invalid: false,
    contentType,
    contentBase64: base64Content,
    bytes: approxBytes,
    filename: `bug-report-${Date.now()}.jpg`,
  };
}

function hashForId(value) {
  return createHash("sha256").update(String(value || ""), "utf8").digest("hex").slice(0, 40);
}

function getClientIp(request) {
  const xfwd = String(request.get("x-forwarded-for") || "").trim();
  if (xfwd) return xfwd.split(",")[0].trim();
  return String(request.ip || "").trim() || "unknown";
}

function buildBugFingerprint({ message, context, hasScreenshot }) {
  const appVersion = context?.app?.version || "unknown";
  const platform = context?.device?.platform || "unknown";
  const lastError =
    typeof context?.lastError === "string"
      ? context.lastError
      : context?.lastError?.message || context?.lastError?.error || "none";
  const raw = JSON.stringify({
    message,
    appVersion,
    platform,
    lastError,
    hasScreenshot: Boolean(hasScreenshot),
  });
  return hashForId(raw);
}

async function enforceBugReportRateLimit({ request, response }) {
  const clientIp = getClientIp(request);
  const clientKey = hashForId(clientIp);
  const nowMs = Date.now();
  const limitRef = db.collection(BUG_REPORT_RATE_LIMIT_COLLECTION).doc(clientKey);

  const result = await db.runTransaction(async (tx) => {
    const snap = await tx.get(limitRef);
    const existing = snap.exists ? snap.data() : {};
    const recent = Array.isArray(existing.requestMs)
      ? existing.requestMs.filter((ts) => typeof ts === "number" && nowMs - ts < RATE_LIMIT_WINDOW_MS)
      : [];

    if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
      const oldest = recent[0];
      const retryAfterSeconds = Math.max(1, Math.ceil((RATE_LIMIT_WINDOW_MS - (nowMs - oldest)) / 1000));
      return { blocked: true, retryAfterSeconds };
    }

    recent.push(nowMs);
    tx.set(
      limitRef,
      {
        requestMs: recent.slice(-RATE_LIMIT_MAX_REQUESTS),
        lastSeenAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    return { blocked: false, retryAfterSeconds: 0 };
  });

  if (result.blocked) {
    response.set("Retry-After", String(result.retryAfterSeconds));
    response.status(429).json({ ok: false, error: "rate_limited", retryAfterSeconds: result.retryAfterSeconds });
    return { ok: false };
  }

  return { ok: true };
}

async function detectDuplicateBugReport({ message, context, hasScreenshot }) {
  const fingerprint = buildBugFingerprint({ message, context, hasScreenshot });
  const nowMs = Date.now();
  const dedupeRef = db.collection(BUG_REPORT_DEDUPE_COLLECTION).doc(fingerprint);

  const dedupe = await db.runTransaction(async (tx) => {
    const snap = await tx.get(dedupeRef);
    const existing = snap.exists ? snap.data() : null;
    const lastSeenMs = typeof existing?.lastSeenMs === "number" ? existing.lastSeenMs : 0;
    const duplicate = lastSeenMs > 0 && nowMs - lastSeenMs < DEDUPE_WINDOW_MS;

    tx.set(
      dedupeRef,
      {
        lastSeenMs: nowMs,
        firstSeenMs: existing?.firstSeenMs || nowMs,
        count: (existing?.count || 0) + 1,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return { duplicate, fingerprint };
  });

  return dedupe;
}

async function sendResendEmail(payload) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY.value()}`,
      "Content-Type": "application/json",
      "Idempotency-Key": payload.idempotencyKey,
    },
    body: JSON.stringify(payload.body),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend failed (${response.status}): ${body}`);
  }

  return response.json();
}

export const bugReportRelay = onRequest(
  {
    region: "us-central1",
    secrets: [RESEND_API_KEY],
    retry: false,
    invoker: "public",
  },
  async (request, response) => {
    const origin = request.get("origin") || "";
    addCorsHeaders(response, origin);

    if (request.method === "OPTIONS") {
      response.status(204).send("");
      return;
    }

    if (request.method !== "POST") {
      response.status(405).json({ ok: false, error: "method_not_allowed" });
      return;
    }

    const path = String(request.path || "/");
    if (path !== "/" && path !== "/bug-report") {
      response.status(404).json({ ok: false, error: "not_found" });
      return;
    }

    try {
      const body = request.body && typeof request.body === "object" ? request.body : {};
      const source = String(body.source || "").trim();
      if (source !== "recoveryos-app") {
        response.status(400).json({ ok: false, error: "invalid_source" });
        return;
      }

      const rateLimit = await enforceBugReportRateLimit({ request, response });
      if (!rateLimit.ok) return;

      const message = normalizeMessage(body.message);
      const context = sanitizeContext(body.context);
      const screenshotMeta = parseScreenshotAttachment(body.screenshot);
      if (screenshotMeta?.invalid) {
        response.status(400).json({ ok: false, error: screenshotMeta.reason });
        return;
      }

      const dedupe = await detectDuplicateBugReport({
        message,
        context,
        hasScreenshot: Boolean(screenshotMeta),
      });
      if (dedupe.duplicate) {
        logger.info("App bug report deduped", { fingerprint: dedupe.fingerprint });
        response.status(202).json({ ok: true, deduped: true });
        return;
      }

      const reportRef = db.collection(BUG_REPORTS_COLLECTION).doc();
      const reportId = reportRef.id;
      const reportDoc = {
        source,
        message,
        context,
        fingerprint: dedupe.fingerprint,
        hasScreenshot: Boolean(screenshotMeta),
        screenshotBytes: screenshotMeta?.bytes || 0,
        createdAt: FieldValue.serverTimestamp(),
      };

      await reportRef.set(reportDoc);

      const appVersion = context?.app?.version || "unknown";
      const platform = context?.device?.platform || "unknown";
      const userAgent = context?.device?.userAgent || "unknown";
      const generatedAt = context?.generatedAt || "unknown";
      const recentLogsCount = Array.isArray(context?.recentLogs) ? context.recentLogs.length : 0;
      const lastErrorMessage =
        (context?.lastError && (context.lastError.message || context.lastError.error || context.lastError)) || "none";

      const subject = `RecoveryOS bug report (${appVersion})`;
      const text = [
        "New RecoveryOS app bug report",
        "",
        `Report ID: ${reportId}`,
        `App version: ${appVersion}`,
        `Platform: ${platform}`,
        `Generated at: ${generatedAt}`,
        `Recent logs attached in context: ${recentLogsCount}`,
        `Last error: ${typeof lastErrorMessage === "string" ? lastErrorMessage : JSON.stringify(lastErrorMessage)}`,
        "",
        "Message:",
        message,
        "",
        `User agent: ${userAgent}`,
      ].join("\n");

      const html = `<p><strong>New RecoveryOS app bug report</strong></p>
<ul>
  <li><strong>Report ID:</strong> ${reportId}</li>
  <li><strong>App version:</strong> ${appVersion}</li>
  <li><strong>Platform:</strong> ${platform}</li>
  <li><strong>Generated at:</strong> ${generatedAt}</li>
  <li><strong>Recent logs attached in context:</strong> ${recentLogsCount}</li>
  <li><strong>Last error:</strong> ${
    typeof lastErrorMessage === "string" ? lastErrorMessage : JSON.stringify(lastErrorMessage)
  }</li>
</ul>
<p><strong>Message:</strong></p>
<p>${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
<p><strong>User agent:</strong> ${userAgent.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`;

      const resendBody = {
        from: `RecoveryOS <${FROM_EMAIL}>`,
        to: [ADMIN_NOTIFY_EMAIL],
        subject,
        text,
        html,
        reply_to: APP_SUPPORT_EMAIL,
        tags: [
          { name: "channel", value: "app-bug-report" },
          { name: "report_id", value: reportId },
        ],
      };

      if (screenshotMeta) {
        resendBody.attachments = [
          {
            filename: screenshotMeta.filename,
            content: screenshotMeta.contentBase64,
            content_type: screenshotMeta.contentType,
          },
        ];
      }

      const mailLogRef = db.collection(BUG_REPORT_MAIL_LOG_COLLECTION).doc(reportId);
      await mailLogRef.set(
        {
          status: "sending",
          reportId,
          hasScreenshot: Boolean(screenshotMeta),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      const resendResult = await sendResendEmail({
        idempotencyKey: `app-bug-report-${reportId}`,
        body: resendBody,
      });

      await mailLogRef.set(
        {
          status: "sent",
          reportId,
          messageId: resendResult?.id ?? null,
          sentAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      logger.info("App bug report relayed", {
        reportId,
        appVersion,
        hasScreenshot: Boolean(screenshotMeta),
      });

      response.status(200).json({ ok: true, reportId });
    } catch (error) {
      logger.error("App bug report relay failed", { message: error?.message || String(error) });
      response.status(500).json({ ok: false, error: "internal_error" });
    }
  }
);

export const sendWaitlistConfirmationEmail = onDocumentCreated(
  {
    document: "waitlist_signups/{entryId}",
    region: "us-central1",
    secrets: [RESEND_API_KEY],
    retry: true,
  },
  async (event) => {
    const entryId = event.params.entryId;
    const signup = event.data?.data();

    if (!signup?.email || typeof signup.email !== "string") {
      logger.warn("Waitlist document missing email; skipping send", { entryId });
      return;
    }

    const recipient = signup.email.trim().toLowerCase();
    const logRef = db.collection("waitlist_email_log").doc(entryId);
    const logSnap = await logRef.get();

    if (logSnap.exists && logSnap.data()?.status === "sent") {
      logger.info("Confirmation already sent; skipping", { entryId, recipient });
      return;
    }

    await logRef.set(
      {
        status: "sending",
        email: recipient,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    const subject = "You're on the RecoveryOS waitlist";
    const text = `Thank you for joining the RecoveryOS waitlist.

If you'd like to join the Android tester group at this stage, email ${TESTER_CONTACT_EMAIL}.

- RecoveryOS Team`;

    const html = `<p>Thank you for joining the RecoveryOS waitlist.</p>
<p>If you'd like to join the Android tester group at this stage, email <a href="mailto:${TESTER_CONTACT_EMAIL}">${TESTER_CONTACT_EMAIL}</a>.</p>
<p>- RecoveryOS Team</p>`;

    const confirmationResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY.value()}`,
        "Content-Type": "application/json",
        // Keeps retries idempotent on provider side if function is re-run.
        "Idempotency-Key": `waitlist-confirmation-recipient-${entryId}`,
      },
      body: JSON.stringify({
        from: `RecoveryOS <${FROM_EMAIL}>`,
        to: [recipient],
        subject,
        text,
        html,
        reply_to: TESTER_CONTACT_EMAIL,
      }),
    });

    if (!confirmationResponse.ok) {
      const body = await confirmationResponse.text();
      await logRef.set(
        {
          status: "failed",
          errorStage: "recipient_confirmation",
          errorStatus: confirmationResponse.status,
          errorBody: body.slice(0, 4000),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      throw new Error(`Resend recipient confirmation failed (${confirmationResponse.status}): ${body}`);
    }

    const confirmationResult = await confirmationResponse.json();

    const adminSubject = "New RecoveryOS waitlist signup";
    const adminText = `A new waitlist signup was captured.

Email: ${recipient}
Document ID: ${entryId}
Source: ${signup.source ?? "unknown"}
Page: ${signup.page ?? "unknown"}

If this person requests Android tester access, route them to ${TESTER_CONTACT_EMAIL}.`;

    const adminHtml = `<p>A new waitlist signup was captured.</p>
<ul>
  <li><strong>Email:</strong> ${recipient}</li>
  <li><strong>Document ID:</strong> ${entryId}</li>
  <li><strong>Source:</strong> ${signup.source ?? "unknown"}</li>
  <li><strong>Page:</strong> ${signup.page ?? "unknown"}</li>
</ul>
<p>If this person requests Android tester access, route them to <a href="mailto:${TESTER_CONTACT_EMAIL}">${TESTER_CONTACT_EMAIL}</a>.</p>`;

    const adminResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY.value()}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `waitlist-confirmation-admin-${entryId}`,
      },
      body: JSON.stringify({
        from: `RecoveryOS <${FROM_EMAIL}>`,
        to: [ADMIN_NOTIFY_EMAIL],
        subject: adminSubject,
        text: adminText,
        html: adminHtml,
        reply_to: TESTER_CONTACT_EMAIL,
      }),
    });

    if (!adminResponse.ok) {
      const body = await adminResponse.text();
      await logRef.set(
        {
          status: "failed",
          errorStage: "admin_notification",
          errorStatus: adminResponse.status,
          errorBody: body.slice(0, 4000),
          confirmationMessageId: confirmationResult?.id ?? null,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      throw new Error(`Resend admin notification failed (${adminResponse.status}): ${body}`);
    }

    const adminResult = await adminResponse.json();
    await logRef.set(
      {
        status: "sent",
        provider: "resend",
        confirmationMessageId: confirmationResult?.id ?? null,
        adminMessageId: adminResult?.id ?? null,
        adminNotifyEmail: ADMIN_NOTIFY_EMAIL,
        sentAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    logger.info("Waitlist emails sent", {
      entryId,
      recipient,
      confirmationMessageId: confirmationResult?.id,
      adminMessageId: adminResult?.id,
      adminNotifyEmail: ADMIN_NOTIFY_EMAIL,
    });
  }
);
