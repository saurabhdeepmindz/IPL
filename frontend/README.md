# AMS front end

Next.js 16 · React 19 · TypeScript · UX4G design system · Tailwind 4 (`tw:` prefix, layout only) · TanStack Query · Zustand · React Hook Form + Zod · Storybook · **Vitest** · Playwright.

Rules: `docs/standards/CODING-AND-DOCUMENTATION-STANDARD` (section 9) in the documents project. In one line: **UX4G first, brand tokens second, `tw:` Tailwind for layout gaps only; every file starts with a header block.**

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Start the app on port 3000 (use `-p 3001` when the API runs on 3000) |
| `npm run build` | Production build |
| `npm run lint` | ESLint and the header check |
| `npm run typecheck` | Next route types and TypeScript |
| `npm test` | Vitest unit and component tests (project `unit`) |
| `npm run test:stories` | Every story with a `play` function, in a real browser (project `storybook`) |
| `npm run tokens:build` | Rebuild `src/styles/brand-tokens.css` from `tokens/brand.json` (never edit the CSS by hand) |
| `npm run storybook` | Component and token pages on port 6006 |
| `npm run test:visual` | Playwright visual token test |

Copy `.env.example` to `.env.local`. Only `NEXT_PUBLIC_` values reach the browser. The front end holds no token secret.

## Status (ST-ADM01-000-FE-01, 25 Nov 2026)

Brought in from the team's repository: configuration, token pipeline, Storybook, the shared `Button`, `Input` and `Badge`, the providers and the UX4G wiring. Left out on purpose: the sample screens, the mock sign-in handler, the large `ams*.css` files and Jest. See `STRUCTURE.md` for the folders.
