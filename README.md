# Starlens

Starlens is a Next.js single-page application that delivers short-horizon (3–24 month) guidance by blending Western Astrology, Vedic/Jyotish, Chinese BaZi, Chinese Zodiac/Tai Sui, and Pythagorean Numerology. The intake flow emphasises speed, clarity, and privacy, while optional boosters (date picks, relocation-lite, home-lite, Tarot/I Ching) add extra context.

## Quick start

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000 to explore the intake wizard (3 concise steps plus boosters), sample results dashboard, privacy, and methodology pages. All calculations run locally through modular utility layers; the `/api/reading`, `/api/tarot`, and `/api/iching` route handlers are stateless.

### Scripts

| Command         | Purpose                                 |
|-----------------|-----------------------------------------|
| `pnpm dev`      | Start Next.js with Turbopack            |
| `pnpm build`    | Production build                        |
| `pnpm start`    | Serve the production build              |
| `pnpm lint`     | ESLint with zero tolerated warnings     |
| `pnpm test`     | Vitest (schema + numerology unit tests) |
| `pnpm format`   | Prettier write                          |
| `pnpm format:check` | Prettier check                      |
| `pnpm ci`       | Convenience alias for lint + test       |

## Project structure

```
src/
  app/
    (routes + layouts)
    intake/            // client wizard with Zod + Zustand
    results/           // client dashboard consuming the stored reading
    api/               // stateless reading/divination endpoints
  components/
    theme/             // Theme provider + toggle
    ui/                // Button, Card primitives
  lib/
    calculators/       // Placeholder engines for each tradition
    divination/        // Tarot + I Ching utilities
    schemas/           // Zod request/response contracts
    types/             // Shared TypeScript types
  store/               // Zustand stores for intake + results
  docs/                // Architecture notes
```

- **Intake flow** uses `react-hook-form` + Zod validation per step, session-backed Zustand persistence, and posts the aggregated payload to `/api/reading`.
- **Results dashboard** reads from `useReadingStore`, falling back to `sampleReading` when no API response is cached.
- **Calculators** currently provide deterministic placeholder output, keeping responsibilities separated for future integration with ephemeris libraries or external microservices.
- **Styling** relies on Tailwind CSS 4 theme tokens, shared UI primitives, and a theme toggle backed by `next-themes`.

## Testing and CI

- `vitest` drives unit tests (sample coverage for numerology math and request validation). Add new specs under `tests/` or alongside modules.
- ESLint is configured with flat config + Next rules; tests have relaxed globals for `describe/it/expect`.
- Prettier ensures consistent formatting (90 character width, trailing commas).
- `.github/workflows/ci.yml` runs pnpm install, lint, and test on pushes to `main` / `develop` and pull requests.

## Next steps

1. Replace placeholder calculation logic with real ephemeris, dasha, BaZi, and numerology engines (possibly via dedicated microservices).
2. Layer timezone inference + geocoding (e.g., Nominatim) and reinforce confidence scoring rules.
3. Expand testing (edge-case numerology, lunar new year boundary mapping, electional scoring heuristics, intake UI interaction tests).
4. Add PDF export, summary copy helpers, localization, and hardened data-deletion workflows before launch.
