import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const requiredKeys = ["apiKey", "authDomain", "projectId", "appId"];

export function isFirebaseConfigured() {
  return requiredKeys.every((key) => {
    const value = firebaseConfig[key];
    return typeof value === "string" && value.trim() !== "";
  });
}

export function getFirebaseApp() {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not configured. Set VITE_FIREBASE_* env vars.");
  }

  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

export function getFirebaseDb() {
  return getFirestore(getFirebaseApp());
}

let appCheckReady = Promise.resolve();
let appCheckInitStarted = false;

/**
 * When VITE_FIREBASE_APPCHECK_SITE_KEY is set, we attach App Check (reCAPTCHA v3) before Firestore writes.
 * Enable enforcement in Firebase Console to rely on tokens server-side; we still validate shape in rules.
 */
export function ensureFirebaseAppCheck() {
  const siteKey = (import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY || "").trim();
  if (!siteKey || !isFirebaseConfigured()) {
    return Promise.resolve();
  }
  if (!appCheckInitStarted) {
    appCheckInitStarted = true;
    appCheckReady = (async () => {
      const app = getFirebaseApp();
      const { initializeAppCheck, ReCaptchaV3Provider } = await import("firebase/app-check");
      if (import.meta.env.DEV) {
        // We use the debug provider flow in local dev; register the printed token in Firebase Console once.
        globalThis.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
      }
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(siteKey),
        isTokenAutoRefreshEnabled: true,
      });
    })();
  }
  return appCheckReady;
}
