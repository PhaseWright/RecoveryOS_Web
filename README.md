# RecoveryOS Web

Marketing site for RecoveryOS at `https://recoveryos.org`.

## Local development

```bash
npm install
npm run sync:privacy
npm run dev
```

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
