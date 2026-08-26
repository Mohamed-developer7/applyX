# ApplyX architecture

## Demo architecture

The current project is intentionally local-first: React state + localStorage makes the demo work immediately without accounts or secrets.

External integrations are isolated behind route handlers:

- `GET /api/universities` — institution discovery via Hipo's public university directory.
- `POST /api/fetch-url` — fetches a public HTTP(S) application page and strips markup.
- `POST /api/analyze` — extracts requirements using a deterministic parser, with optional OpenAI Structured Outputs when `OPENAI_API_KEY` is configured.

## Production architecture

```text
Browser
  │
  ├── Next.js App Router
  │     ├── authenticated workspace
  │     ├── application pipeline
  │     ├── evidence vault
  │     └── discovery
  │
  ├── Route handlers
  │     ├── institution discovery
  │     ├── source ingestion
  │     └── structured extraction
  │
  └── Supabase
        ├── Auth
        ├── Postgres + RLS
        └── Storage for evidence documents
```

## Security principles

- Never expose a secret API key in client-side code.
- Keep AI calls server-side.
- Restrict database rows by `auth.uid()` with Row Level Security.
- Treat fetched URLs as untrusted input.
- AI output is parsed as structured data and never allowed to invent user achievements.
