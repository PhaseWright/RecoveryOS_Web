#!/usr/bin/env node
// We fail the deploy build if any Firebase Vite env var is missing (avoids shipping a dead waitlist).
import process from "node:process";

const keys = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
];

let failed = false;
for (const k of keys) {
  const v = process.env[k];
  if (typeof v !== "string" || !v.trim()) {
    console.error(`ci-verify-firebase-env: missing or empty ${k}`);
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}
console.log("ci-verify-firebase-env: all required VITE_FIREBASE_* vars present.");
