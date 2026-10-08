# API gaps — frontend needs vs the backend

Sources: `backend-spec.md` (v1.0, kept local) and the **live Swagger**
`https://teachercenter.runasp.net/swagger/v1/swagger.json` (TeacherCenters API v1, 98 paths) — the live API wins
where they differ. Typed request DTOs are generated into `src/services/generated/backend.ts` (`npm run api:codegen`).

Items not covered are mocked behind the RTK Query endpoint that will use them (`src/mocks/handlers.ts`).
Status: `open` = assumption in code, waiting on backend · `decided` = settled.

## Requests for the backend team

| #   | Area  | Issue                                                                                                                                   | What the frontend does now                                                                                                      | Status |
| --- | ----- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1   | All   | **Most responses have no schema** in Swagger (e.g. `GET /me`, list endpoints, `POST /auth/otp/request`). Only request bodies are typed. | Hand-written response types per module; please add `[ProducesResponseType(typeof(...))]` so codegen covers them.                | open   |
| 2   | Auth  | **No forgot/reset-password endpoints** (`/auth/password/forgot`, `/auth/password/reset` from the spec are missing).                     | `/forgot-password` and `/reset-password` pages exist (spec flow: WhatsApp link → token); they work against the mock only.       | open   |
| 3   | Auth  | `GET /me` response shape unknown.                                                                                                       | `MeDto` in `src/features/auth/types.ts` (profile, tenant, plan, branches, permissions, scope, `kind`, `isOwner`, `hidePhones`). | open   |
| 4   | Auth  | `POST /auth/otp/request` response unknown, but `OtpVerify` needs `challengeId`.                                                         | Reads `challengeId`, `resendAfterSeconds`, `maskedDestination` if present; resend falls back to 60 s.                           | open   |
| 5   | CORS  | Preflight allows `http://localhost:3000`; the Vercel domain must be allowed too.                                                        | —                                                                                                                               | open   |
| 6   | Shell | Notifications bell: list, unread count, mark all read.                                                                                  | Mocked: `GET /notifications`, `POST /notifications/read-all`.                                                                   | open   |
| 7   | Shell | Global search for the command palette (Ctrl+K).                                                                                         | Searches navigation only; proposed `GET /search?q=&types=`.                                                                     | open   |
| 8   | Shell | Active branch header.                                                                                                                   | Sends `X-Branch-Id` on every call (CORS preflight already allows it).                                                           | open   |

## Settled (live API)

| Area   | Contract                                                                                                                          | Where                                                                          |
| ------ | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Auth   | Every `/auth/*` call needs `tenantSlug` ("كود السنتر"); the login form asks for it and remembers it per device.                   | `TenantSlugField.tsx`, BFF stores it in an httpOnly cookie for `/auth/refresh` |
| Auth   | Tokens: `AuthTokens {accessToken, refreshToken, expiresInSeconds, refreshExpiresAtUtc}`.                                          | `src/app/api/auth/_lib/bff.ts`                                                 |
| Auth   | OTP purpose `guardian-login` \| `student-login`; phone required for both, students add `studentCode`; verify sends `challengeId`. | `PortalLoginForm.tsx`, `OtpStep.tsx`                                           |
| Errors | ProblemDetails with `code`, Arabic `title`, camelCase `errors` — e.g. `401 invalid-credentials`.                                  | `src/lib/problem-details.ts`                                                   |
| Lists  | Idempotency-Key only on the POSTs listed in spec §18.                                                                             | `idempotencyHeaders()` in `src/services/api.ts`                                |
