# Fitboard

Recruiter platform for construction, engineering, architecture, and accounting desks.

**Tagline:** *Rank the bench. Run the board.*

FitScore matching, a Conflict Wall (do-not-pitch holds), shareable FitCards, BenchAlert, and a live Twin Cities placement board. No rented ATS.

---

## Surfaces

| Surface | Purpose |
| --- | --- |
| **/** | Placement war room — watch a fill play out |
| **Industries / Jobs / About / Contact** | Public pages |
| **Login** | Desk password (`demo@fitboard.app`) → `/portal` |
| **Portal** | Import · Agents · LinkedIn assist · FitScore · FitCards · Conflict Wall · Bench · Heat Map |
| **/card?job=&person=** | Shareable hiring-manager scorecard (no contact PII) |
| **/twin** | Optional 3D talent twin |
| **/yard** | Trailer-yard nav |

FitScore is pure TypeScript (`src/lib/fitscore.ts`).

---

## Unique pieces

1. **FitScore** — auditable local rank (skills, title, industry, location, years, project types).
2. **Conflict Wall** — do-not-pitch holds so the same PM is not sent to two competing GCs.
3. **FitCard** — send a hiring manager the number and the “why,” not a résumé dump.

---

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev                  # http://0.0.0.0:8080
npm run ci                   # lint + typecheck + test + build
```

Local desk login:

- Email: `demo@fitboard.app`
- Password: `fitboard-dev-only` (override with `PORTAL_PASSWORD`)

Production **must** set `PORTAL_PASSWORD` (min 8). There is no hardcoded production default.

---

## Deploy (Vercel)

Build output is Vercel Nitro. Deploy from Git.

| Variable | Required in prod | Notes |
| --- | --- | --- |
| `PORTAL_PASSWORD` | Yes | Min 8 chars |
| `BETTER_AUTH_SECRET` | Recommended | Signs portal cookie |
| `VITE_PUBLIC_HOSTNAME` | For SEO | Hostname only |
| `DATABASE_URL` | For durable auth/data | Neon recommended |
| `VITE_AUTH_ENABLED` | Leave unset / `true` | Never `false` on public prod |

```text
GET /api/health   → { ok: true, status: "healthy", ... }
GET /             → placement board
GET /portal       → redirects to login when signed out
```

---

## License / ownership

You own the repo. Demo roster data is fictional. Do not commit secrets.
