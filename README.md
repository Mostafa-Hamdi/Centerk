# سنترك — Frontend

Production frontend for **سنترك**, a multi-tenant SaaS for Egyptian tutoring centers.
Backend contract: `backend-spec.md` (kept local, not in this repo) and the backend Swagger · contract gaps: [`docs/api-gaps.md`](./docs/api-gaps.md).

## Stack

Next.js 15 (App Router) · React 19 · TypeScript strict (+ `noUncheckedIndexedAccess`) · Redux Toolkit + RTK Query ·
Tailwind CSS v4 (token-driven) · React Hook Form + Zod 4 · Framer Motion (LazyMotion) · Radix UI ·
TanStack Table/Virtual · cva + clsx + tailwind-merge · lucide-react · date-fns (`ar`) + Intl `ar-EG` ·
Vitest + Testing Library · Playwright · ESLint (next/core-web-vitals + typescript-eslint strict-type-checked) ·
Prettier (+ tailwind plugin) · Husky + lint-staged · @next/bundle-analyzer.

## Getting started

```bash
cp .env.example .env.local    # then set NEXT_PUBLIC_API_URL
npm install
npm run dev                   # http://localhost:3000
```

| Script                            | What it does                                               |
| --------------------------------- | ---------------------------------------------------------- |
| `npm run dev` / `build` / `start` | Next.js                                                    |
| `npm run check`                   | typecheck + lint + unit tests                              |
| `npm run lint` / `lint:fix`       | ESLint (type-aware)                                        |
| `npm run format` / `format:check` | Prettier                                                   |
| `npm test` / `test:watch`         | Vitest                                                     |
| `npm run e2e`                     | Playwright (first time: `npx playwright install chromium`) |
| `npm run analyze`                 | Build with bundle analyzer report                          |

Pre-commit runs `lint-staged` (ESLint fix + Prettier on staged files).

## Environment

| Variable              | Example                          | Notes                                                   |
| --------------------- | -------------------------------- | ------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | `https://api.example.com/api/v1` | Backend base incl. `/api/v1`. Change the domain freely. |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000`          | Used for metadata / OG / sitemap.                       |

Validated at startup in `src/lib/env.ts` (the build fails fast if missing).

## Design tokens

All brand values live in `src/styles/tokens.css` as CSS variables on `:root` (a `[data-theme="dark"]`
block with the same names is ready). `src/styles/globals.css` maps them into Tailwind — **default Tailwind
palettes are removed**, so only token colors compile.

| Utility                                                               | Token                                                                               |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `bg-canvas`                                                           | `--bg`                                                                              |
| `bg-surface`, `glass` (utility)                                       | `--surface`, `--surface-glass`                                                      |
| `text-ink`, `text-muted`, `border-line`                               | `--ink`, `--muted`, `--line`                                                        |
| `bg-primary` / `-hover` / `-ink` / `-tint` / `-soft`                  | `--primary*`                                                                        |
| `bg-cyan` / `-deep` / `-tint` / `-light`                              | `--cyan*`                                                                           |
| `success` / `warning` / `danger` / `info` (+ `-hover`, `-tint`)       | status tokens                                                                       |
| `font-display`, `font-body`                                           | `--font-display`, `--font-body` (Alexandria / IBM Plex Sans Arabic via `next/font`) |
| `rounded-sm` 12 · `rounded-md` 16 · `rounded-lg` 20 · `rounded-xl` 24 | `--radius-*`                                                                        |
| `shadow-card`, `shadow-lift`                                          | `--shadow`, `--shadow-hover`                                                        |
| `ease-brand`                                                          | `--ease`                                                                            |
| `w-(--side-open)`, `h-(--header-h)` …                                 | layout tokens via Tailwind's `(--var)` shorthand                                    |

## Conventions

- **RTL first**: `<html lang="ar" dir="rtl">`. Logical utilities only (`ms-/me-/ps-/pe-/start-/end-`);
  ESLint rejects `ml-`, `pr-`, `left-`, `text-right` …
- **No hardcoded colors** in components — use token utilities. Values needed outside CSS live in `src/config/brand.ts`.
- **No inline route strings** — use `src/config/routes.ts`.
- **All copy** in `src/i18n/ar.ts`.
- **Formatting** through `src/lib/format.ts` (`ar-EG`, `Africa/Cairo`, currency `ج.م`). Phones render inside `dir="ltr"`.
- **Animations**: `LazyMotion strict` is on — use `m.div`, not `motion.div`. Reduced motion is respected globally.
- **Class names**: compose with `cn()` (`src/lib/cn.ts`).

## Structure

```
src/
  app/            (auth)/…, (app)/… route groups, layout.tsx, providers.tsx
  components/     ui/ feedback/ layout/ data/ form/
  features/       <module>/{api,types,schemas,columns}.ts(x), components/, hooks/
  hooks/          useUrlState, usePermission, useMediaQuery …
  lib/            cn, format, env, problem-details …
  services/       api.ts (createApi), baseQueryWithReauth.ts
  store/          store.ts, authSlice.ts, uiSlice.ts
  config/         routes.ts, brand.ts
  styles/         tokens.css, globals.css
  i18n/           ar.ts
e2e/              Playwright specs
docs/             api-gaps.md
```

## Phases

- [x] 0 · Setup, tooling, tokens, Tailwind mapping, fonts, structure
- [x] 1 · Auth (login tabs, OTP, forgot/reset password, BFF, baseQueryWithReauth, middleware, `/me`)
- [~] 2 · Floating shell (done) + shared components + `/dev/components` (in progress)
- [ ] 3 · Dashboard
- [ ] 4 · Students (reference CRUD)
- [ ] 5+ · Remaining modules

> **Note:** the repo lives inside OneDrive. Syncing `node_modules`/`.next` is slow and can lock files
> during installs/builds — consider moving the repo outside OneDrive or excluding those folders.

## Auth architecture (Phase 1)

- **Access token**: Redux memory only (`store/authSlice.ts`). **Refresh token**: httpOnly cookie set by the
  BFF route handlers in `src/app/api/auth/*` — never readable by JS, never in localStorage.
- `services/baseQueryWithReauth.ts`: on a backend 401 → one refresh (async-mutex) → retry; rejected refresh →
  logout + `/login?next=…`; backend down → session kept, error shown.
- `src/middleware.ts` gates routes on the refresh cookie; `AuthGate` restores the session after reloads and loads `/me`.
- Permissions: `usePermission('students.create')` and `<Can permission="…">` (owner = allow all).

## Troubleshooting

**`EINVAL: invalid argument, readlink '...\.next\...'` on `npm run dev` / `build`** — OneDrive turned files in
`.next` into online-only placeholders. Run `npm run dev:clean` (deletes `.next`, then starts dev). Permanent fix:
move the project outside OneDrive, or right-click the project folder → **Always keep on this device**.

**Guardian / student login shows "خدمة إرسال رمز التحقق غير مفعّلة حاليًا"** — the backend has no OTP provider
configured (`503 otp-provider-unavailable`); it needs a provider or `Otp:DemoEnabled=true` on the server.
