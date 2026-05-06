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

## Where waitlist emails are stored

In Firebase Console:

1. Open project `recoveryos-web`
2. Go to **Firestore Database**
3. Open collection `waitlist_signups`

Each document contains the submitted `email` plus metadata fields (`createdAt`, `source`, `page`, `legacyId`).

## Automatic confirmation emails (server-side, proper setup)

This repo now includes a Firebase Function trigger that sends a confirmation email whenever a new waitlist signup is created:

- Trigger: `waitlist_signups/{entryId}` create
- Provider API: Resend (`https://api.resend.com/emails`)
- Sender: `RecoveryOS <no-reply@recoveryos.org>`
- Reply-to / tester contact: `michael@recoveryos.org`
- Admin notification recipient: `codemanmike@outlook.com`
- Delivery logs: Firestore collection `waitlist_email_log`

### Email content sent

Subject: `You're on the RecoveryOS waitlist`

Body:

- Thank you for joining the waitlist
- CTA: email `michael@recoveryos.org` to join Android tester group
- Internal alert copy is also sent to `codemanmike@outlook.com` for each new signup

### One-time setup steps

1. Create/verify a Resend account and verify domain `recoveryos.org`.
2. Add and verify sender identity `no-reply@recoveryos.org`.
3. Create a Resend API key with mail send access.
4. In terminal at repo root:

   ```powershell
   cd functions
   npm install
   cd ..
   firebase functions:secrets:set RESEND_API_KEY
   ```

5. Paste the Resend API key when prompted.
6. Deploy functions:

   ```powershell
   firebase deploy --only functions
   ```

7. Test by submitting a new waitlist email on the site, then confirm:
   - signup doc appears in `waitlist_signups`
   - send log appears in `waitlist_email_log` with `status: sent`
   - recipient receives confirmation from `no-reply@recoveryos.org`

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
