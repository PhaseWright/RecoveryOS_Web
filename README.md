# RecoveryOS Web

Marketing site for RecoveryOS at `https://recoveryos.org`.

**Cursor / AI agents:** we keep onboarding and tool rules in [`AGENTS.md`](AGENTS.md) (aligned with the RecoveryOS app repo).

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

7. **Optional but recommended:** add `VITE_FIREBASE_APPCHECK_SITE_KEY` (reCAPTCHA v3 site key from Firebase Console → App Check) as a build secret so production bundles send App Check tokens. Then enable **App Check enforcement** for Firestore in the console when you are ready.

The Firebase Web API key is intentionally public — security depends on Firestore rules in `firestore.rules`, client-side throttles/honeypot, and (recommended) App Check enforcement.

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

## App bug report relay (Firebase no-reply worker)

This repo now also hosts the RecoveryOS app bug-report relay endpoint:

- Function export: `bugReportRelay`
- HTTP route: `POST /bug-report` (on the function URL)
- Purpose: receive bug reports from the mobile app, store them in Firestore, and email the developer inbox via Resend
- Sender: `RecoveryOS <no-reply@recoveryos.org>`
- Admin recipient: `codemanmike@outlook.com`
- Reply-to header: `support@recoveryos.org`
- Firestore collections:
  - `app_bug_reports` (raw payload metadata + context)
  - `app_bug_report_mail_log` (delivery state to Resend)
  - `app_bug_report_rate_limit` (short rolling rate window per client fingerprint)
  - `app_bug_report_dedupe` (short-window duplicate suppression fingerprint)

### Bug report payload contract (from app)

Required:

- `source`: must be `recoveryos-app`
- `message`: free text (server normalizes + truncates)

Optional:

- `screenshot.dataUrl`: `data:image/*;base64,...` (max ~2 MB decoded)
- `context`: structured diagnostics (app version, device metadata, recent logs, last error, settings snapshot)

### Abuse controls (enabled)

- **Rate limiting:** max 5 requests per ~10 minutes per client fingerprint; returns HTTP `429` with `Retry-After`.
- **Duplicate suppression:** repeated near-identical reports in a 5-minute window are acknowledged with HTTP `202` (`{ ok: true, deduped: true }`) and are not re-emailed.

### One-time setup for bug relay

1. Ensure function deps are installed:

   ```powershell
   cd functions
   npm install
   cd ..
   ```

2. Make sure Resend is already configured (`RESEND_API_KEY` secret), then deploy:

   ```powershell
   firebase deploy --only functions
   ```

3. After deploy, get the HTTPS function URL:

   ```powershell
   firebase functions:list
   ```

   Copy the URL for `bugReportRelay` (region `us-central1`).

4. In the app repo (`E:\PhaseWright\Apps\RecoveryOS`), set:

   - `.env.local` for local dev:

     ```env
     VITE_FIREBASE_NOREPLY_WORKER_URL=https://us-central1-<your-project-id>.cloudfunctions.net/bugReportRelay
     ```

   - CI / release env with the same key/value.

   The app appends `/bug-report` automatically if needed, so point at the function base URL above.

5. Rebuild/deploy the app with that env var present.

### Validation checklist (end-to-end)

1. Open app -> Dashboard -> `Report a bug` -> submit message + screenshot.
2. Confirm HTTP success in app UI (`Report sent`).
3. In Firebase Console, verify:
   - new doc in `app_bug_reports`
   - matching status doc in `app_bug_report_mail_log` with `status: sent`
4. Confirm email arrives in `codemanmike@outlook.com` from `no-reply@recoveryos.org`.
5. If email fails, inspect:

   ```powershell
   firebase functions:log --only bugReportRelay
   ```

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
cd dist
npx wrangler pages deploy . --project-name=recoveryos-web
```

Run Wrangler from `dist` so the sibling Firebase `functions/` project is not
misclassified as Cloudflare Pages Functions during a static-site upload.

## Waitlist data model

Collection: `waitlist_signups`

Document fields:

- `email` (normalized lowercase)
- `createdAt` (Firestore `serverTimestamp`)
- `source` (`recoveryos-web-landing`)
- `page` (`home`)
- `legacyId` (slug derived from email for migration tooling)

Duplicate handling is best-effort at client level by using a deterministic document id based on normalized email.

## Firestore rules

The active rules live in `firestore.rules` and are validated server-side on every write:

- only the `waitlist_signups` collection accepts writes;
- writes must be `create` only (no read/update/delete);
- the document must contain exactly `email`, `createdAt`, `source`, `page`, and `legacyId` (deterministic id + migration marker);
- `email` must be a string ≤ 254 chars and match a basic email regex;
- `source` must equal `recoveryos-web-landing`;
- `createdAt` must equal `request.time` (forces use of `serverTimestamp()`).

Deploy or refresh rules with:

```powershell
firebase deploy --only firestore:rules
```
