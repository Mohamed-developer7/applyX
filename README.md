# ApplyX v0.2

**Application Command Center** — turn scattered college, scholarship, fellowship and program requirements into a clear path to submission.

## What changed in v0.2
- Application pipeline with per-requirement readiness scoring.
- Next-best-action prioritization.
- Evidence Vault with reusable achievement records.
- Requirement → evidence matching with transparent match scores.
- Live university discovery using the Hipo University Domains API.
- Public application URL ingestion route that extracts readable page text.
- Requirement analysis route with a deterministic local parser and optional OpenAI Structured Outputs mode.
- Local-first persistence so the demo works without credentials.
- Responsive, polished SaaS-style interface, including a bottom tab bar for mobile navigation.

## Hardening pass (this revision)
The project didn't actually build out of the box (`tsconfig.json` was missing the `@/*` path alias), and shipped on a Next.js/React version affected by a critical, publicly disclosed RCE (CVE-2025-66478 and its Dec 11 follow-up advisories). This revision:
- Fixes the build (`tsconfig.json` path alias).
- Upgrades to patched `next@15.5.9` / `react@19.2.1` / `react-dom@19.2.1`.
- Adds a mobile bottom tab bar — the sidebar (the only place navigation lived) was fully hidden below 700px with no replacement, so mobile users had no way to switch tabs.
- Blocks `/api/fetch-url` from being used as an SSRF vector into localhost/private IP ranges/cloud metadata endpoints, and stops it from silently following redirects.
- Adds a request-size cap to `/api/analyze`.
- Adds a fetch timeout to `/api/universities`.
- Adds `aria-label`s to icon-only buttons and `role="dialog"` to the two modals, plus Escape-to-close.
- Adds Open Graph/Twitter metadata, `robots.txt`, `sitemap.xml`, and an app icon (there was none of this before).
- Fixes `.gitignore`: the previous `.env*` pattern also excluded `.env.example` from git, so the template file this README tells people to copy would never actually have been committed.
- Adds ESLint config (there wasn't one, so `npm run lint` couldn't run) and clears all lint warnings.

## API integrations

### University discovery
ApplyX proxies searches to the Hipo University Domains API. The API provides university names, domains and countries and supports name/country search. See the upstream project: https://github.com/Hipo/university-domains-list-api

### AI requirement extraction (optional)
If `OPENAI_API_KEY` is present, `/api/analyze` uses OpenAI Structured Outputs to return a strict JSON schema. If no key is present or the AI request fails, ApplyX falls back to its local parser, so the product remains demonstrable.

Environment variables:

```text
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5-mini
NEXT_PUBLIC_SITE_URL=https://your-deployed-domain.com
```

Never commit secrets. `.env.example` documents variable names only.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Build verification

```bash
npm run build
npm run lint
```

Both currently pass clean (0 errors, 0 warnings) as of this revision.

## Architecture

```text
Next.js App Router
├── UI + local workspace
├── /api/universities      → Hipo University Domains API
├── /api/fetch-url         → public application page ingestion (SSRF-guarded)
└── /api/analyze           → local parser / optional OpenAI structured extraction

Production target
├── Supabase Auth
├── Postgres + RLS
├── Supabase Storage
├── background document extraction
└── calendar/reminder integrations
```

Supabase's current Next.js guidance supports cookie-based Auth, Postgres, Storage and Row Level Security; those are the intended production persistence layer, not required for the local demo.

## Product principles

1. **Next action over noise.** Every screen should answer what the applicant should do next.
2. **Evidence over invention.** AI may organize and rewrite user-provided evidence; it must not invent achievements.
3. **Transparent intelligence.** Matching scores show why evidence is considered relevant.
4. **Local-first demo.** The project should remain usable even without paid API credentials.

## Known limitations

- Persistence is `localStorage` only — data doesn't sync across devices and clears if browser storage is cleared. Supabase persistence (see `supabase/schema.sql`) is scaffolded but not wired up yet.
- There is no authentication — the workspace is single-user/local by design in this revision.
- The local requirement parser is keyword/heuristic-based; it won't match the accuracy of the optional OpenAI mode on unusually phrased source text.
- Evidence matching (`lib/scoring.ts`) uses simple keyword overlap, not semantic matching.

## Stardance / Frictionless

The project is designed around three major QoL improvements:

1. Messy requirements → structured checklist.
2. Scattered achievements → searchable evidence vault.
3. "Am I ready?" → readiness score + next best action.

Development should be documented honestly with real commits, devlogs and actual work time.
