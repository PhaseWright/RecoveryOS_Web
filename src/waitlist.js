import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { ensureFirebaseAppCheck, getFirebaseDb, isFirebaseConfigured } from "./firebaseClient";

const WAITLIST_COLLECTION = "waitlist_signups";
const SOURCE_MARKER = "recoveryos-web-landing";

/** Same-tab throttle to blunt scripted spam (rules remain the real contract). */
const MIN_SUBMIT_INTERVAL_MS = 2500;
let lastJoinAttemptAt = 0;

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function toWaitlistDocId(normalizedEmail) {
  return `v2_${encodeURIComponent(normalizedEmail)}`;
}

function toLegacyWaitlistDocId(normalizedEmail) {
  return normalizedEmail.replace(/[^a-z0-9]/g, "_");
}

export function validateEmail(email) {
  const normalized = normalizeEmail(email);
  const basicEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!normalized) {
    return { ok: false, message: "Email is required." };
  }

  if (!basicEmailPattern.test(normalized)) {
    return { ok: false, message: "Enter a valid email address." };
  }

  return { ok: true, normalized };
}

export async function joinWaitlist(email) {
  if (!isFirebaseConfigured()) {
    throw new Error("Waitlist is unavailable because Firebase is not configured.");
  }

  const validation = validateEmail(email);
  if (!validation.ok) {
    return { status: "invalid", message: validation.message };
  }

  const now = Date.now();
  if (lastJoinAttemptAt && now - lastJoinAttemptAt < MIN_SUBMIT_INTERVAL_MS) {
    return { status: "invalid", message: "Please wait a moment before trying again." };
  }
  lastJoinAttemptAt = now;

  await ensureFirebaseAppCheck();

  const db = getFirebaseDb();
  const normalizedEmail = validation.normalized;
  const entryRef = doc(db, WAITLIST_COLLECTION, toWaitlistDocId(normalizedEmail));

  try {
    await setDoc(entryRef, {
      email: normalizedEmail,
      createdAt: serverTimestamp(),
      source: SOURCE_MARKER,
      page: "home",
      // Keep legacy marker field to support future migration tooling if needed.
      legacyId: toLegacyWaitlistDocId(normalizedEmail),
    });
  } catch (error) {
    // Rules deny updates, so a second signup to the same deterministic doc id
    // is interpreted as an already-registered email.
    if (error?.code === "permission-denied") {
      return { status: "duplicate", message: "You're already on the waitlist." };
    }
    throw error;
  }

  return { status: "created", message: "Thanks. You're on the waitlist." };
}
