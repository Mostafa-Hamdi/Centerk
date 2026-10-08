# سنترك — Backend requests from the frontend team

**For:** the .NET backend developer · **From:** frontend (Next.js) · **Date:** 2026-10-08
**Compared against:** live Swagger `https://teachercenter.runasp.net/swagger/v1/swagger.json` (TeacherCenters API v1)
and `backend-spec.md` v1.0 §10.

## TL;DR

|                                               | Count                |
| --------------------------------------------- | -------------------- |
| Endpoints in `backend-spec.md` §10            | 283                  |
| Live operations in Swagger                    | 127                  |
| Spec endpoints **missing** from the live API  | **184** (list in §5) |
| Live operations **without a response schema** | **124 of 127**       |

The frontend already runs against the live API for **auth** and **dashboard summary / today sessions**, and is built
for **students**. Everything else is served by a frontend mock until the endpoints below exist.

**Please do in this order:**

1. **P0 — blocking what is already built:** §1 (cross-cutting), §2 (auth), §3 (dashboard), §4 (students), CORS.
2. **P1 — next frontend phases:** groups/sessions/halls, attendance, quizzes, finance, cash drawer, messages.
3. **P2 — later:** question bank & online exams, materials, content, portal, staff, roles, audit, reports, settings, centers.

---

## 1. Cross-cutting (P0)

### 1.1 Add response schemas to Swagger — most important

124 of 127 operations return `200 OK` with **no schema**, so the frontend cannot generate response types
(`npm run api:codegen` uses `@rtk-query/codegen-openapi`). Please annotate every action, e.g.:

```csharp
[ProducesResponseType(typeof(PagedResult<StudentListItemDto>), StatusCodes.Status200OK)]
[ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
```

and use **named DTOs** (not anonymous objects) so Swashbuckle emits `components.schemas`.
The shapes the frontend currently expects are in the **Appendix** — matching them means zero frontend changes.

### 1.2 CORS

Allow these origins (credentials not needed — the browser sends a Bearer token, not cookies):

- `http://localhost:3000` (already works)
- The production Vercel domain (e.g. `https://centerk.vercel.app` — confirm the final domain with the frontend team)

| Setting                  | Value                                                                                  |
| ------------------------ | -------------------------------------------------------------------------------------- |
| Allowed methods          | `GET, POST, PUT, PATCH, DELETE, OPTIONS`                                               |
| Allowed request headers  | `Authorization, Content-Type, Accept-Language, X-Branch-Id, Idempotency-Key, If-Match` |
| Exposed response headers | `X-Trace-Id, Content-Disposition, ETag`                                                |

### 1.3 List conventions (spec §10, §18)

Every list endpoint should accept and return the same shapes:

| Item        | Contract                                                                                                        |
| ----------- | --------------------------------------------------------------------------------------------------------------- |
| Query       | `?search=&page=1&pageSize=20&sort=fullName,-createdAt` + module filters                                         |
| Sort        | Comma list, `-` prefix = descending, whitelisted fields per endpoint. **Not implemented on any live list yet.** |
| Response    | `{ "items": [], "page": 1, "pageSize": 20, "totalCount": 412, "totalPages": 21 }`                               |
| Export      | `GET /{resource}/export?format=xlsx` with the same filters → file + `Content-Disposition`                       |
| Bulk delete | `POST /{resource}/bulk-delete` `{ "ids": [] }` → per-id result `[{ id, ok, code? }]`                            |

### 1.4 Errors (already good — please keep)

RFC 9457 ProblemDetails with `code`, Arabic `title`, camelCase `errors` dictionary and `traceId`
(e.g. `401 invalid-credentials`, `400 validation-error`). The frontend maps these codes to Arabic messages:
`duplicate-phone, group-full, hall-clash, session-closed, not-in-group, student-blocked, shift-not-open,
shift-closed, discount-over-limit, reason-required, already-delivered, out-of-stock, role-in-use,
owner-role-locked, plan-required (402), quota-exceeded, attempt-expired, concurrency-conflict (412),
invalid-credentials, invalid-otp, session-expired`. Field keys in `errors` should be camelCase paths matching the
request body (`guardian.phone`), so the frontend can put the message under the right input.

### 1.5 Headers the frontend sends

| Header                           | When                                                                                                       | Backend action                                                                                                                      |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `Authorization: Bearer <access>` | every authenticated call                                                                                   | —                                                                                                                                   |
| `Accept-Language: ar`            | every call                                                                                                 | Arabic messages                                                                                                                     |
| `X-Branch-Id: <uuid>`            | every call (current branch from the switcher)                                                              | **Please support:** filter branch-scoped data by it (validate against the user's `branch_ids`); ignore for `AllBranches` endpoints. |
| `Idempotency-Key: <uuid>`        | `POST /payments`, `POST /attendance/scan`, `POST /campaigns/{id}/send-now`, `POST /payments/online/intent` | spec §18                                                                                                                            |
| `If-Match: <rowVersion>`         | `PUT` of entities that return `rowVersion`                                                                 | `412 concurrency-conflict` on mismatch                                                                                              |

---

## 2. Auth (P0)

Live and working: `POST /auth/login`, `/auth/otp/request`, `/auth/otp/verify`, `/auth/refresh`, `/auth/logout`,
`GET /me`. The frontend sends `tenantSlug` everywhere and keeps the refresh token in an httpOnly cookie
(Next.js BFF), never in JS.

| #   | Request                                                           | Details                                                                                                                                                                                            |
| --- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.1 | **Add `POST /auth/password/forgot`**                              | Body `{ tenantSlug, phone }` → `204`. Sends a reset link via WhatsApp: `https://<app>/reset-password?token=<token>`. Always `204` (don't reveal whether the phone exists). Rate limit like OTP.    |
| 2.2 | **Add `POST /auth/password/reset`**                               | Body `{ tenantSlug, token, newPassword }` → `204`. `400 invalid-token` when expired/used. Revoke all refresh tokens of that user. Password rule the UI enforces: ≥ 8 chars, ≥ 1 letter, ≥ 1 digit. |
| 2.3 | **Document `POST /auth/otp/request` response**                    | `{ "challengeId": "uuid", "resendAfterSeconds": 60, "maskedDestination": "0111****111" }`. `challengeId` is needed by `OtpVerify`.                                                                 |
| 2.4 | **Document `GET /me` response**                                   | Shape in Appendix A1. Must include `kind` (Staff/Guardian/Student), `isOwner`, `permissions[]` (codes from spec §6.3), `branches[]`, `dataScope`, `hidePhones`, `tenant { name, plan }`.           |
| 2.5 | `AuthTokens.profile` / `.tenant`                                  | Currently untyped. Either document them (same shape as `/me`) or drop them — the frontend calls `/me` after login.                                                                                 |
| 2.6 | Clarify `POST /api/auth/login` (non-v1) and `GET /api/tenants/me` | Are these legacy? The frontend uses `/api/v1/*` only.                                                                                                                                              |

---

## 3. Dashboard (P0)

| #   | Endpoint                                 | Status            | Response                                                                                             |
| --- | ---------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------- |
| 3.1 | `GET /dashboard/summary?branchId=&date=` | live, **untyped** | Appendix A4                                                                                          |
| 3.2 | `GET /dashboard/today-sessions`          | live, **untyped** | `TodaySessionDto[]` — Appendix A5                                                                    |
| 3.3 | `GET /dashboard/alerts`                  | **missing**       | `[{ "type": "consecutive-absences" \| "weak-last-quiz" \| "overdue-30" \| "waitlist", "count": 7 }]` |
| 3.4 | `GET /dashboard/alerts/{type}/students`  | **missing**       | Paged `StudentListItemDto` for the drill-down                                                        |
| 3.5 | `POST /dashboard/alerts/{type}/notify`   | **missing**       | Body `{ studentIds: [] }` (empty = all) → `{ queued: n }`                                            |
| 3.6 | `GET /dashboard/income-7d`               | **missing**       | `[{ "date": "2026-10-08", "amount": 12450 }]` (7 items, Cairo dates)                                 |

---

## 4. Students (P0 — frontend module is built)

Live: `GET/POST /students`, `GET/PUT/DELETE /students/{id}`, `PATCH /students/{id}/status`, enrollments,
balance, attendance, grades, discounts, `POST /students/{id}/qr/rotate`, `GET /guardians?phone=`,
`GET /reports/students.csv`.

| #    | Request                                    | Details                                                                                                                                                                                                                           |
| ---- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4.1  | **Filters + sort on `GET /students`**      | Add `gradeLevelId, groupId, status, hasDebt, sort` (spec §10.3). Sortable: `fullName, code, createdAt, balance`.                                                                                                                  |
| 4.2  | **Type the list + details responses**      | Appendix A2 (`StudentListItemDto`) and A3 (`StudentDetailsDto`). List rows must include `code`, `status`, `guardianName`, `balance`.                                                                                              |
| 4.3  | `DELETE /students/{id}` semantics          | Confirm it **archives** (status `Withdrawn`) as in spec, and that archived students are excluded from the default list. `?hard=true` owner-only.                                                                                  |
| 4.4  | `POST /students` → `409 duplicate-phone`   | When the guardian phone exists and `confirmSibling=false`. Include `errors: { "guardian.phone": [...] }`. The UI then asks "siblings?" and resends with `confirmSibling=true`. Return the created `StudentDetailsDto` with `201`. |
| 4.5  | **Add `GET /students/export?format=xlsx`** | Same filters as the list. (Today only `/reports/students.csv` exists — the UI uses it meanwhile.)                                                                                                                                 |
| 4.6  | **Add `POST /students/bulk-delete`**       | `{ ids: [] }` → per-id result. (The UI currently loops `DELETE`.)                                                                                                                                                                 |
| 4.7  | **Add import**                             | `POST /students/import/preview` (multipart xlsx ≤ 5 MB) → `{ previewId, columns[], rows[{ rowNumber, values, errors[] }] }`; `POST /students/import/commit` `{ previewId, mapping }` → `{ created, skipped, errors[] }`.          |
| 4.8  | **Add student card**                       | `GET /students/{id}/card.pdf`, `POST /students/{id}/card/send` `{ to: "student" \| "guardian" }`.                                                                                                                                 |
| 4.9  | **Guardians CRUD**                         | Live has only `GET /guardians`. Add `POST /guardians`, `PUT /guardians/{id}`, `DELETE /guardians/{id}`.                                                                                                                           |
| 4.10 | `NewStudent.grade`                         | Free text (≤ 60) today. Spec uses `gradeLevelId` — please confirm which one; the UI offers a fixed list (الأول الإعدادي … الثالث الثانوي).                                                                                        |

---

## 5. New endpoints not in the spec (P0/P1)

| #   | Endpoint                                         | Contract                                                                                                                                 |
| --- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 5.1 | `GET /notifications?unreadOnly=&page=&pageSize=` | `{ items: [{ id, title, body, type: "Payment"\|"Attendance"\|"Alert"\|"System", isRead, createdAt, link }], unreadCount }` — header bell |
| 5.2 | `POST /notifications/read-all`                   | `204`                                                                                                                                    |
| 5.3 | `POST /notifications/{id}/read`                  | `204`                                                                                                                                    |
| 5.4 | `GET /search?q=&types=students,groups,payments`  | `[{ type, id, label, subtitle }]`, max 10 per type — Ctrl+K palette. Arabic-normalized search (spec §4).                                 |

---

## 6. Missing spec endpoints by module (P1 / P2)

Automated diff of spec §10 against the live Swagger. A few may exist under a different path — if so, tell us the
real route and we will adapt.

| Module                       | Priority | Missing endpoints                                                                                                                                                                                                                                                                                                                                  |
| ---------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Groups, sessions, halls      | P1       | `DELETE /groups/{id}`, `POST /groups/{id}/duplicate`, `DELETE /groups/{id}/waitlist`, `DELETE /sessions/{id}`, `DELETE /halls/{id}`, `PATCH /halls/{id}/status`                                                                                                                                                                                    |
| Session quizzes              | P1       | `PUT /quizzes/{id}`, `DELETE /quizzes/{id}`, `PUT /quizzes/{id}/grades/{studentId}` (single-cell autosave)                                                                                                                                                                                                                                         |
| Finance                      | P1       | `PUT /payments/{id}`, `GET /payments/{id}/receipt.pdf`, `POST /payments/{id}/receipt/send`, `PUT/DELETE /charges/{id}`, `POST /payments/online/intent`, `POST /webhooks/paymob`                                                                                                                                                                    |
| Cash drawer & expenses       | P1       | `GET /cash-shifts?from=&to=&userId=` (history), `CRUD /expense-categories`                                                                                                                                                                                                                                                                         |
| Messages                     | P1       | `GET /messages/{id}`, `POST /messages/{id}/resend`, `POST /messages/direct`, `CRUD /campaigns` + `send-now`, `duplicate`, `recipients/preview`, `CRUD /message-templates` + `duplicate`, `CRUD /automation-rules` + `PATCH …/active`, `GET /messaging/usage`, `POST /webhooks/whatsapp`                                                            |
| Question bank & online exams | P2       | `CRUD /questions` + `duplicate`, `import`; `CRUD /units`; `CRUD /online-exams` + `publish`, `results`; `PUT /attempts/{id}/answers/{questionId}/grade`; portal: `GET /portal/exams`, `POST /portal/exams/{id}/attempts`, `PUT /portal/attempts/{id}/answers/{questionId}`, `POST /portal/attempts/{id}/submit`, `GET /portal/attempts/{id}/review` |
| Materials                    | P2       | `CRUD /materials` + `duplicate`, `CRUD /material-deliveries` + `collect`, `CRUD /stock-movements`                                                                                                                                                                                                                                                  |
| Content                      | P2       | `CRUD /videos` + `publish`, `stats`, `upload-url`; `CRUD /assignments` + `close`, `submissions`; `PUT /submissions/{id}/grade`; `CRUD /courses`; portal: `GET /portal/videos`, `POST /portal/videos/{id}/play`, `POST /portal/videos/views/{viewId}/progress`, `GET /portal/assignments`, `POST/DELETE /portal/assignments/{id}/submission`        |
| Portal                       | P2       | `POST /portal/students/{id}/pay`, `GET/POST /portal/threads`, `POST /portal/threads/{id}/messages`, `DELETE /portal/threads/{id}`                                                                                                                                                                                                                  |
| Staff & payroll              | P2       | `PUT/DELETE /staff/{id}`, `POST /staff/{id}/reset-password`, `CRUD /staff-attendance`, `CRUD /payrolls`, `POST /payrolls/{id}/pay`, `POST /payrolls/generate?month=`                                                                                                                                                                               |
| Roles & permissions          | P2       | `GET /permissions`, `GET/POST /roles`, `GET/PUT/DELETE /roles/{id}`, `PUT /roles/{id}/permissions`, `POST /roles/{id}/reset`, `POST /roles/{id}/duplicate`, `PUT /users/{id}/roles`                                                                                                                                                                |
| Audit                        | P2       | `GET /audit-logs/{id}`, `GET /audit-logs/export`; add filters `userId, action, entityType, entityId, from, to` to the list                                                                                                                                                                                                                         |
| Reports                      | P2       | `GET /reports/income-monthly`, `/attendance-by-group`, `/student-levels`, `/debts`, `/at-risk-students`, `/reports/{type}/export?format=xlsx\|pdf`, `CRUD /scheduled-reports` + `run-now`. (Live `GET /reports/attendance` and `/reports/financial` will be used too — please type them.)                                                          |
| Settings & billing           | P2       | `DELETE /branches/{id}`, `CRUD /subjects`, `GET /billing/subscription`, `GET /billing/invoices`, `GET /billing/invoices/{id}.pdf`, `POST /billing/invoices/{id}/pay`, `POST /billing/change-plan`                                                                                                                                                  |
| Centers                      | P2       | `GET /centers/halls-grid?date=`, `CRUD /hall-bookings` + `clashes`, `clashes/{id}/resolve`; `CRUD /teachers` + `agreements`; `GET /settlements?month=`, `POST /settlements/generate`, `POST /settlements/{id}/pay`, `POST /settlements/{id}/dispute`, `GET /teachers/me/settlements`                                                               |

Also please add **filters/sort** to existing lists: `GET /groups` (`gradeLevelId, status, teacherId`),
`GET /payments` (`date, shiftId, method, status`), `GET /staff` (paging), `GET /audit-logs` (see above).

---

## Appendix — response shapes the frontend expects

TypeScript, camelCase JSON, enums as strings. Money = number (EGP), dates = ISO 8601 UTC unless noted.

### A1. `GET /me`

```ts
interface MeDto {
  id: string;
  fullName: string;
  phone: string;
  avatarUrl: string | null;
  kind: 'Staff' | 'Guardian' | 'Student';
  isOwner: boolean;
  roles: { id: string; name: string }[];
  tenant: {
    id: string;
    name: string;
    logoUrl: string | null;
    plan: 'Free' | 'Solo' | 'Pro' | 'Center' | 'Enterprise';
  };
  branches: { id: string; name: string }[];
  permissions: string[]; // spec §6.3 codes, e.g. "students.create"
  dataScope: 'AllBranches' | 'OwnBranch' | 'OwnGroups' | 'Self';
  hidePhones: boolean;
}
```

### A2. `GET /students` row

```ts
interface StudentListItemDto {
  id: string;
  code: string; // "F-1024"
  fullName: string;
  phone: string | null; // masked per role, e.g. "010****5678"
  grade: string | null;
  status: 'Active' | 'Suspended' | 'Withdrawn' | 'Graduated';
  guardianName: string | null;
  balance: number; // open balance, EGP
  createdAt: string;
}
```

### A3. `GET /students/{id}`

```ts
interface StudentDetailsDto extends StudentListItemDto {
  branchId: string | null;
  guardians: { id: string; fullName: string; phone: string; relation: string }[];
  attendanceRate: number | null; // 0–1
  averageGrade: number | null;
  rowVersion?: string; // for If-Match
}
```

### A4. `GET /dashboard/summary`

```ts
interface DashboardSummaryDto {
  incomeToday: number;
  incomeYesterday: number;
  sessionsToday: { total: number; live: number; upcoming: number; done: number; cancelled: number };
  monthlyAttendanceRate: number; // 0–1
  openDues: { total: number; count: number };
  activeStudents: number;
}
```

### A5. `GET /dashboard/today-sessions`

```ts
interface TodaySessionDto {
  id: string;
  groupName: string;
  subject: string;
  teacherName: string;
  hallName: string | null;
  startTime: string; // "HH:mm", Cairo time
  endTime: string;
  status: 'Upcoming' | 'Live' | 'Done' | 'Cancelled';
  expected: number; // enrolled students
  present: number;
}
```

### A6. Paged envelope (all lists)

```ts
interface Paged<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
```

---

Questions → frontend team. Mock contracts live in `src/mocks/` and the gap tracker in `docs/api-gaps.md`.
