# Starlens Architecture Overview

## Vision & Guiding Principles
- Rapid, private, actionable readings spanning 3–24 months.
- Intake finished in ~90 seconds with frictionless mobile UX.
- Modular engines for Western, Vedic, BaZi, Numerology, and optional packs.
- Privacy-first: stateless API, ephemeral data, export/delete controls.

## Technology Stack
- Frontend: Next.js 14 (App Router) + TypeScript + Tailwind CSS + Radix UI primitives for accessibility.
- Form validation: Zod + react-hook-form; client + server validation.
- State: Zustand for client session store; React Query for API orchestration.
- Internationalization: next-intl; leverage Intl APIs for dates/numbers.
- Deployment: Vercel (edge + node runtimes). Alternate: Netlify.
- API: Next.js Route Handlers (`app/api`). Optional Python FastAPI microservice for astro calculations (future).
- Testing: Vitest + Testing Library + Playwright for E2E.
- Tooling: ESLint, Prettier, Husky + lint-staged, pnpm package manager.

## Application Structure
```
app/
  layout.tsx            // global shell, theme provider, nav/footer
  page.tsx              // home
  intake/
    page.tsx            // wizard container
    step-birth.tsx
    step-names.tsx
    step-focus.tsx
    boosters.tsx
  results/
    page.tsx            // results dashboard
    components/
      timeline.tsx
      confidence-bar.tsx
      profiles-accordion.tsx
      optional-packs.tsx
  privacy/page.tsx
  about/page.tsx
  api/
    reading/route.ts    // POST handler
    tarot/route.ts
    iching/route.ts
components/
  ui/                   // buttons, inputs, nav, etc.
  icons/
lib/
  astrology/
  numerology/
  bazi/
  utils/
  geo/
config/
  theme.ts
  zodiac.ts
  numerology.ts
store/
  intake-store.ts
  results-store.ts
public/
  fonts/
  illustrations/
tests/
  unit/
  e2e/
```

## Data Flow
1. User visits `/intake`; steps persist to Zustand + sessionStorage backup.
2. On submission, client POSTs to `/api/reading` with normalized payload.
3. `reading` handler orchestrates calculation modules (pure functions).
4. Response cached in-memory for session; optionally encrypt in transit only.
5. `/results` fetches reading via React Query; displays timeline + profiles.
6. Optional modules call dedicated calculators (`lib/electional`, etc.).

## Calculation Engines (MVP)
- Western astrology: use `astronomy-engine` JS; degrade gracefully.
- Vedic: initial implementation approximates dasha timelines algorithmically.
- BaZi: implement solar term conversion + stems/branches tables.
- Numerology: deterministic calculators with tests.
- Tarot/I Ching: deterministic PRNG via `seedrandom`.

## Privacy & Security
- No persistent DB for MVP; ephemeral in-memory cache (Map) or Vercel KV if needed.
- Add `Delete my data` action that clears session + instructs API to discard cache.
- Audit logging disabled by default.
- CSP headers, secure cookies only when introduced.

## Performance Targets
- Lighthouse 90+; TTFB < 200ms on Vercel edge.
- Payload < 70kb gzipped initial load; code-split optional packs.

## Roadmap
1. Scaffold Next.js app, theme, navigation, and routes.
2. Implement intake wizard with validation + timezone detection (timezonecomplete).
3. Build calculation modules with deterministic outputs and tests.
4. Flesh out results dashboard with accessible components.
5. Integrate optional boosters + PDF export.
6. Add telemetry hooks (PostHog or Plausible) respecting privacy.
7. Internationalization + localization QA.
