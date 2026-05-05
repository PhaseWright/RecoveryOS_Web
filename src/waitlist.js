import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseDb, isFirebaseConfigured } from "./firebaseClient";

const WAITLIST_COLLECTION = "waitlist_signups";
const SOURCE_MARKER = "recoveryos-web-landing";

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

  const db = getFirebaseDb();
  const normalizedEmail = validation.normalized;
  const entryRef = doc(db, WAITLIST_COLLECTION, toWaitlistDocId(normalizedEmail));
  const existing = await getDoc(entryRef);

  if (existing.exists()) {
    return { status: "duplicate", message: "You're already on the waitlist." };
  }

  // Keep backward compatibility with legacy IDs while avoiding false duplicates from collisions.
  const legacyRef = doc(db, WAITLIST_COLLECTION, toLegacyWaitlistDocId(normalizedEmail));
  const legacyExisting = await getDoc(legacyRef);
  if (legacyExisting.exists() && legacyExisting.data()?.email === normalizedEmail) {
    return { status: "duplicate", message: "You're already on the waitlist." };
  }

  await setDoc(entryRef, {
    email: normalizedEmail,
    createdAt: serverTimestamp(),
    source: SOURCE_MARKER,
    page: "home",
  });

  return { status: "created", message: "Thanks. You're on the waitlist." };
}
