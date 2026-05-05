# RecoveryOS Web

Marketing site for RecoveryOS at `https://recoveryos.org`.

The landing page includes an early-access waitlist form backed by Firebase Firestore.

## First-time Firebase setup (waitlist)

We use a dedicated Firebase project for the marketing site so it stays isolated from app/sync data.

1. Create a project at <https://console.firebase.google.com/> named `recoveryos-web` (or `recoveryos-marketing`). Keep Google Analytics off to match privacy posture.
2. Add a **Web** app inside that project (`</>` icon, nickname `RecoveryOS Web Landing`). Copy the six config values into `.env` (template at `.env.example`).
3. **Build → Firestore Database → Create database** in **production mode**. Pick the region closest to launch users (e.g. `europe-west1`); record it here once chosen.
4. Leave **Authentication** disabled — the waitlist does not need it.
5. Deploy Firestore rules from this repo (one-off, not in CI):

   ```powershell
   npm install -g firebase-tools
   firebase login
   firebase use --add        # pick the new project, alias 'default' (creates .firebaserc)
   firebase deploy --only firestore:rules
   ```

6. Add the same six values as **GitHub repository secrets** (`Settings → Secrets and variables → Actions`) so the production build carries them:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

   Confirm `CLOUDFLARE_API_TOKEN` is also present (scope: Account → Cloudflare Pages: Edit).

The Firebase Web API key is intentionally public — security depends on Firestore rules in `firestore.rules` and (recommended later) App Check with reCAPTCHA v3.

## Local development

```bash
npm install
npm run sync:privacy
npm run dev
```

To enable waitlist storage locally, create `.env` from `.env.example` and set your Firebase Web app values.

## Build

```bash
npm run sync:privacy
npm run build
npm run preview
```

The legal page is shipped from `public/legal/privacy-policy.html`.

## Privacy policy source sync

The canonical policy source currently lives in the app repo at:

`E:/PhaseWright/Apps/RecoveryOS/public/legal/privacy-policy.html`

Before every release or deploy, run:

```bash
npm run sync:privacy
```

## Cloudflare Pages deployment

This repo deploys to a Cloudflare Pages project (recommended project name: `recoveryos-web`) with:

- Build command: `npm run sync:privacy && npm run build`
- Build output directory: `dist`
- Custom domains: `recoveryos.org`, `www.recoveryos.org`

For CLI deploys:

```bash
npx wrangler pages deploy dist --project-name=recoveryos-web
```

## Waitlist data model

Collection: `waitlist_signups`

Document fields:

- `email` (normalized lowercase)
- `createdAt` (Firestore `serverTimestamp`)
- `source` (`recoveryos-web-landing`)
- `page` (`home`)

Duplicate handling is best-effort at client level by using a deterministic document id based on normalized email.

## Firestore rules

The active rules live in `firestore.rules` and are validated server-side on every write:

- only the `waitlist_signups` collection accepts writes;
- writes must be `create` only (no read/update/delete);
- the document must contain exactly `email`, `createdAt`, `source`, `page`;
- `email` must be a string ≤ 254 chars and match a basic email regex;
- `source` must equal `recoveryos-web-landing`;
- `createdAt` must equal `request.time` (forces use of `serverTimestamp()`).

Deploy or refresh rules with:

```powershell
firebase deploy --only firestore:rules
```
