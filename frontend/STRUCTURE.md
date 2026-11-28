# AMS front end (Next.js)

Built fresh from the front-end technical overview (`ProjectStructure`), the team repository `ipl-frontend-develop` and Standard v0.3 section 9.

Created 25 Nov 2026 as an empty folder skeleton (each folder holds a `.gitkeep`). No code is written yet: `/prd` copies the pseudo-code of one story at a time into these folders, and `/dev` elaborates it. Files `package.json`, `tsconfig.json` and the framework configuration come from the foundation sub-tasks (see `docs/modules/ADM-A1/subtasks/EPIC-ADM-01/`).

## Differences from the team's structure document
| Item in the team repository | Here | Why |
|---|---|---|
| `features/auth`, `features/users` | Kept; `features/roles` and `features/permissions` added | EPIC-ADM-01 screens ADM-02 and ADM-03 |
| `features/*` with `hooks/` and `services/` empty | Every feature has `components`, `hooks`, `services`, `schemas`, `types` | Standard §9.3 |
| `tests/` holds Playwright only | Added `tests/unit` (Vitest) and `tests/e2e` | Vitest replaces Jest on the front end |
| `src/styles/ams*.css` large files | Not carried over as they are; they are brought in only as screens are touched (Standard §9.1) | Alignment list items 3 and 4 |
| `.storybook` default sample stories | Not carried over | Alignment list item 6 |

## Folders

| Folder | Purpose |
|---|---|
| `.github/workflows` | Continuous integration |
| `.husky` | Local git hooks |
| `.storybook` | Storybook configuration |
| `docs` | Design-token notes and pseudo-copy log written by /prd |
| `public` | Static assets |
| `scripts` | build-tokens.ts |
| `src/app/(admin)/dashboard` | Administrator dashboard route |
| `src/app/(admin)/permissions` | Permission Management route (ADM-03) |
| `src/app/(admin)/roles` | Role Management route (ADM-02) |
| `src/app/(admin)/users` | User Management route (ADM-01) |
| `src/app/(public)/login` | Sign-in page (thin route) |
| `src/app/api` | Next.js route handlers (only what the front end itself needs) |
| `src/components/ams` | Shared AMS pieces (DataTable, FilterBar, StatusBadge). Each has a story |
| `src/components/dashboard` | Dashboard widgets |
| `src/components/layout` | Page shell, sidebar, header |
| `src/components/ui` | Typed wrappers over UX4G (Button, Input, Modal, Tabs, Switch, Select ...). Each has a story |
| `src/constants` | Route policy and validation settings |
| `src/features/auth/components` | Sign-in and password screens |
| `src/features/auth/hooks` | Sign-in hooks |
| `src/features/auth/schemas` | Zod schemas of the auth forms |
| `src/features/auth/services` | Sign-in API functions |
| `src/features/auth/types` | Auth types |
| `src/features/permissions/components` | Matrix, switches, review panel |
| `src/features/permissions/hooks` | Matrix hooks and permissions.keys.ts |
| `src/features/permissions/schemas` | Zod schemas |
| `src/features/permissions/services` | API functions (API-PRM-01 to 03) |
| `src/features/permissions/types` | Permission types |
| `src/features/roles/components` | Role list, form, details, assign-users dialog |
| `src/features/roles/hooks` | Role hooks and roles.keys.ts |
| `src/features/roles/schemas` | Zod schemas |
| `src/features/roles/services` | API functions (API-ROL-01 to 06) |
| `src/features/roles/types` | Role types |
| `src/features/users/components` | User list, form, details, row menu |
| `src/features/users/hooks` | TanStack Query hooks and users.keys.ts |
| `src/features/users/schemas` | Zod schemas (same field names as the contract) |
| `src/features/users/services` | One API function per contract (API-USR-01 to 08) |
| `src/features/users/types` | User types |
| `src/lib` | API client, token helpers (access token in memory only), query config, utilities |
| `src/providers` | Theme and query providers |
| `src/store` | Zustand stores for session and company only |
| `src/styles` | Generated brand tokens and the app stylesheet (no new global CSS files) |
| `src/types` | Shared types |
| `stories` | Token and component examples |
| `tests/e2e` | Playwright end-to-end tests |
| `tests/unit` | Vitest setup and shared test helpers |
| `tests/visual` | Visual token tests |
| `tokens` | brand.json and mapping.ts (the only token files edited by hand) |

## Structure rules of 28 Nov 2026 (release R16)

The team agreed on 28 Nov 2026 to follow `ProjectStructure/28-Nov-2026/IPL_AMS_Project-Structure-v0.4` and `docs/standards/FRONTEND-STRUCTURE-v0.3`. In short:

| Rule | Meaning |
|---|---|
| One folder per component (F2) | `components/<Name>/<Name>.tsx` and `index.ts`; a whole screen is `<Thing>Page`, a URL-reading wrapper `<Thing>Route` |
| No loose files in a feature root (F14) | Helpers go to `utils/` or `constants/`; the root holds only `index.ts` |
| Component placement (F5) | Used by one feature: in that feature; by two or more: in `src/components/` (`ui`, `layout`, `ams`) |
| Route groups (F16) | `(public)`, `(admin)`, and `(workspace)` for business users when the first business screen is built |
| Features are named by module (F17) | `proposals`, `approvals` and so on, not by role |

**Status of the move (28 Nov 2026):** done. Every component is in its own folder with an `index.ts` (R16 S31 and S32); every feature has an `index.ts`. A page in `src/app` is a server component: it imports the component folder it renders, not the feature door (exception to F7). `npm run lint` runs the structure check (`scripts/check-structure.mjs`, rules in `structure.config.json`, known findings in `structure-allowlist.json`).

| Folder added | Purpose |
|---|---|
| `src/features/auth/utils` | Landing map and the remembered employee code and company |
| `src/features/auth/components/<Name>` | One folder per Login component, each with `index.ts` |
