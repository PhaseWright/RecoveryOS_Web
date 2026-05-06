import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { defineSecret } from "firebase-functions/params";

const RESEND_API_KEY = defineSecret("RESEND_API_KEY");
const FROM_EMAIL = "no-reply@recoveryos.org";
const TESTER_CONTACT_EMAIL = "michael@recoveryos.org";
const ADMIN_NOTIFY_EMAIL = "codemanmike@outlook.com";

initializeApp();
const db = getFirestore();

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
