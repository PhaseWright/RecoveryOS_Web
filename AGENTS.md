# RecoveryOS Web — Agent Instructions

## Overview

We ship a Vite 8 marketing site for RecoveryOS (`recoveryos.org`). The waitlist uses Firebase Web SDK + Firestore; confirmation email uses Firebase Functions + Resend. We deploy static assets to Cloudflare Pages (`recoveryos-web`). See [`README.md`](README.md) for Firebase/Resend/CI setup.

## Agent bootstrap (read first)

1. **Plugin surface** — Enabled Cursor plugins live in [`.cursor/settings.json`](.cursor/settings.json). We keep this aligned with the RecoveryOS app repo so agents see the same toolchain (Firebase, Resend, Cloudflare, orchestrate, cursor-sdk, browse, superpowers, etc.).
2. **Hermes parity** — Hermes should load `E:/PhaseWright/HERMES.md`, then this file. Use this repo's [`.mcp.json`](.mcp.json) for cross-client MCPs and `/home/codemanmike/.hermes/config.yaml` for Hermes-native MCPs: GitHub, Firebase, Cloudflare, Playwright/browser, filesystem, Postiz, Resend, Figma, Sentry, Postman, Outlook, Windows-MCP, and Blender where transport allows. Postiz uses `http://localhost:4007/api/mcp` plus `E:/PhaseWright/postiz`; set `POSTIZ_API_KEY` before MCP/CLI writes.
3. **Secrets** — Never commit API keys. Use `.env` from [`.env.example`](.env.example) locally; CI uses GitHub secrets. Do not paste `CURSOR_API_KEY` or provider keys into chat or tracked files.
4. **Auth order for tooling** — When we need external control planes in one session:
   - `CURSOR_API_KEY` — user API key minted at `https://cursor.com/dashboard/cloud-agents`. Set as a **PowerShell environment variable** (`$env:CURSOR_API_KEY = "cursor_..."`) in the shell where the orchestrate CLI runs, or pass explicitly as `apiKey: process.env.CURSOR_API_KEY!` in SDK code. The SDK reads the env var if `apiKey` is omitted; no config file or keychain. The **orchestrate plugin only activates when the user explicitly types `/orchestrate <goal>`** in chat — agents do not call it autonomously (`disable-model-invocation: true`).
   - **Firebase** — mandatory preflight (below) before any Firebase/Firestore MCP or CLI work.
   - **Resend** — use Resend MCP `connect-to-editor` if required, then verify with read-only calls (e.g. `list-domains`).

## Firebase auth preflight (mandatory)

Before any Firebase or Firestore operation (rules deploy, console checks via MCP, project listing, env refresh):

1. Run an **auth check**: Firebase MCP `firebase_list_projects` (or CLI `firebase projects:list` / `firebase login:list` if MCP unavailable).
2. If the check **fails**, run **reauth**: Firebase MCP `firebase_login` (or CLI `firebase login` / `firebase login --reauth` when the CLI reports expired credentials), then repeat the auth check until it succeeds.
3. Only then call `firebase_get_environment`, deploy rules, or touch project config.

We document this so every agent follows the same gate even when the user does not mention login.

## Resend

- Functions use `RESEND_API_KEY` as a Firebase secret (see README). For **Resend MCP** in Cursor, connect when prompted, then prefer read-only verification (`list-domains`, `list-templates`) unless the task requires sends.

## Orchestrator and long work

- **Large or long-running work** (multi-file refactors, broad audits, parallel investigations): use **orchestrate** / background agents / Cursor SDK patterns so we do not block the foreground chat on wall-clock work.
- Prefer splitting work into resumable chunks with clear acceptance criteria.

## Memory and long chats

- After **large chat windows** or **major architectural decisions**, we persist durable context (user preferences, repo facts, ADRs) via the project **memory** workflow / `CLAUDE.md` / this file — not one-off chat-only notes.

## Plugin activation policy (proactive)

We **use** enabled plugins when the task matches; we do not wait for the user to name the plugin.

| Trigger | Action |
|--------|--------|
| Any unclear or multi-path task start | Consult **superpowers** workflow when applicable. |
| Live URL checks, form flows, screenshots, post-deploy verification | Use **browse** / browser automation MCP, not guesswork. |
| Firebase/Firestore/Hosting/rules | **Firebase preflight** above; for codegen/docs use Firebase plugin skills as appropriate. |
| Email templates, domains, deliverability via Resend API | **Resend** MCP where available. |
| Workers/Pages/DNS | **Cloudflare** plugin MCP. |
| Long-running parallel work | **Orchestrate** + Cursor SDK with valid `CURSOR_API_KEY`. |

If a plugin clearly fits the task and we skip it, we **state why** (e.g. MCP not connected in this session, read-only safety).

## Cross-repo context

- App repo: `E:/PhaseWright/Apps/RecoveryOS` — client app; see that repo’s `AGENTS.md`.
- We align `.cursor/settings.json` and agent conventions with the app repo for a single workspace experience.

## Commands (quick reference)

| Task | Command |
|------|---------|
| Dev server | `npm run dev` |
| Production build | `npm run build` |
| Tests | `npm test` |
| Lint | `npm run lint` |

We use Node per `package.json` `engines` where specified.

## Verification (agents + workspace)

- **Settings parity:** `node -e` comparing both repos’ `.cursor/settings.json` parsed objects should report equality (same plugin enable map).
- **Firebase:** From repo root, `firebase projects:list` must succeed before we rely on local CLI; on auth errors we run reauth per preflight above.
- **Bootstrap acceptance:** On a fresh agent, we expect Firebase preflight + at least one task-matched plugin (e.g. browse for URL checks) without the user naming the plugin.
