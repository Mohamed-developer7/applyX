# Devlog 01 — From dashboard to application command center

## Problem
Application workflows are fragmented. Requirements, deadlines, documents and personal evidence live in different places.

## Product decision
ApplyX is designed around one question: **what is the next thing I should do?**

## Three QoL improvements
1. Requirements become a structured checklist.
2. Achievements become reusable evidence.
3. Readiness becomes a measurable score with a next-best action.

## Technical decisions
- Keep the demo local-first so it can run without paid credentials.
- Isolate external services behind Next.js route handlers.
- Use the Hipo university directory for live institution discovery.
- Use optional OpenAI Structured Outputs for schema-constrained extraction.
- Keep an explicit deterministic fallback so the core workflow is never dependent on AI availability.

## Integrity note
Development time, commits and later devlogs should reflect actual work. Do not fabricate hours or development history.
