# Parakh — Development Progress

## Current Phase
**Day 6 Complete** — Companies and Questions functionality (REST Route Handlers for public reading and admin mutations, Zod schema validation, admin authorization helper, referential integrity check on deletion, and real API-connected UI) implemented and verified.

## Completed
### Day 1
- [x] Next.js 16.4.2 project initialized (App Router, TypeScript, Tailwind CSS v4)
- [x] Base layout and font configurations
- [x] Initial landing page and project documentation

### Day 2
- [x] Reorganized layout components into `src/components/layout/` (`Navbar.tsx`, `Footer.tsx`)
- [x] Created reusable UI primitives in `src/components/ui/` (`Button.tsx`, `Card.tsx`, `EmptyState.tsx`)
- [x] Rebuilt `FeatureCard.tsx` on top of `Card.tsx`
- [x] Sticky footer layout (`min-h-screen flex flex-col`) with metadata title template
- [x] Created static UI shell pages: `/`, `/companies`, `/questions`, `/dashboard`, `/bookmarks`, `/login`
- [x] Active route highlighting in Navbar (`usePathname` / `aria-current="page"`) and auto-closing mobile toggle

### Day 3
- [x] Installed `mongoose` package (v9.11.2)
- [x] Created database utility `src/lib/db.ts` (`dbConnect()`):
  - Validates `MONGODB_URI` from `process.env` without leaking values
  - Caches connection promise on `globalThis` using strict TypeScript types (`declare global`, zero `any`)
  - Automatically resets cached promise on connection error to allow retries
  - Connected with `{ bufferCommands: false, serverSelectionTimeoutMS: 5000 }`
- [x] Created health check route `src/app/api/health/db/route.ts`

### Day 4
- [x] Created 5 Mongoose models in `src/models/` (`User.ts`, `Company.ts`, `Question.ts`, `Bookmark.ts`, `Progress.ts`)
- [x] Safe model registration pattern `(models.X as Model<IX>) || model<IX>("X", schema)`
- [x] Created dev-only verification route `src/app/api/health/models/route.ts`

### Day 5
- [x] Installed dependencies: `bcryptjs`, `jsonwebtoken` (and devDependencies `@types/bcryptjs`, `@types/jsonwebtoken`).
- [x] Built server-only auth utility `src/lib/auth.ts`:
  - `signToken()` signing payload with `JWT_SECRET` (7-day validity)
  - `verifyToken()` verifying signature and decoding user ID and role
  - Standardized httpOnly cookie configuration (`parakh_token`)
- [x] Built authentication Route Handlers:
  - `POST /api/auth/register`: input validation, email normalization, duplicate email conflict handling (409), password hashing via bcrypt (10 rounds), forced student role, safe user response (201).
  - `POST /api/auth/login`: email lookup, bcrypt verification on `.select("+password")`, JWT signing, setting httpOnly cookie, safe user response, generic 401 error.
  - `GET /api/auth/me`: cookie extraction, JWT verification, user lookup in MongoDB, safe user response (200) or 401 Unauthorized.
  - `POST /api/auth/logout`: clearing httpOnly cookie (`maxAge: 0`) and returning success (200).
- [x] Built & connected interactive authentication UI:
  - `LoginForm.tsx` (`src/components/auth/LoginForm.tsx`) with real API call, loading, and error states.
  - `RegisterForm.tsx` (`src/components/auth/RegisterForm.tsx`) with real API call, loading, and error states.
  - Updated `/login` page and created `/register` page with server metadata.
- [x] Documentation updated: `PROJECT_CONTEXT.md` and `README.md`.

### Day 6
- [x] Installed `zod` (v4.6.7) for request body schema validation.
- [x] Reused authentication utility `src/lib/auth.ts`:
  - Added `getTokenFromRequest(request)` to extract `parakh_token` cookie.
  - Added `requireAdmin(request)` to enforce valid authentication and `role === "admin"`.
- [x] Created Zod validation schemas:
  - `src/lib/validations/company.ts`: `companySchema` and `companyUpdateSchema`.
  - `src/lib/validations/question.ts`: `questionSchema` and `questionUpdateSchema` (with ObjectId regex verification).
- [x] Implemented Company Route Handlers:
  - `GET /api/companies`: Public list of companies sorted by name.
  - `POST /api/companies`: Admin-only creation with Zod validation, unique slug check (409).
  - `GET /api/companies/[slug]`: Public company detail fetch (404 if not found).
  - `PUT /api/companies/[slug]`: Admin-only update with slug collision protection.
  - `DELETE /api/companies/[slug]`: Admin-only deletion with safe referential integrity check (`Question.exists({ companies: company._id })` returns 409 conflict if referenced).
- [x] Implemented Question Route Handlers:
  - `GET /api/questions`: Public list of questions sorted by `createdAt` descending with populated companies.
  - `POST /api/questions`: Admin-only creation verifying all referenced company ObjectIds exist before insertion.
  - `GET /api/questions/[slug]`: Public question detail fetch with populated company details.
  - `PUT /api/questions/[slug]`: Admin-only update with slug collision and company ID checks.
  - `DELETE /api/questions/[slug]`: Admin-only deletion of question.
- [x] UI Integration:
  - Created `CompanyList.tsx` (`src/components/companies/CompanyList.tsx`) fetching `/api/companies` with loading, error, and empty states.
  - Created `QuestionList.tsx` (`src/components/questions/QuestionList.tsx`) fetching `/api/questions` with loading, error, and empty states.
  - Connected `/companies` and `/questions` to real APIs, removing fake placeholder data.
- [x] Documentation updated: `PROJECT_CONTEXT.md`, `README.md`, and `PROJECT_PROGRESS.md`.

## Currently Working On
- Day 6 complete; awaiting user instructions for Day 7.

## Last Completed Step
- Full test and verification of Company and Question route handlers, Zod validation, 401 unauthenticated protection, safe deletion referential integrity checks, lint, and build validation.

## Next Step
- Day 7 — Search and Filtering (Search by title, multi-criteria filtering by company, topic, and difficulty).

## Files Modified
### Source Files
| File | Action | Purpose |
|------|--------|---------|
| `src/lib/auth.ts` | Modified | Added `getTokenFromRequest` and `requireAdmin` helper functions |
| `src/lib/validations/company.ts` | Created | Zod validation schemas for company creation and updates |
| `src/lib/validations/question.ts` | Created | Zod validation schemas for question creation and updates |
| `src/app/api/companies/route.ts` | Created | Public list (`GET`) and admin create (`POST`) handlers |
| `src/app/api/companies/[slug]/route.ts` | Created | Public get (`GET`), admin update (`PUT`), and admin safe delete (`DELETE`) |
| `src/app/api/questions/route.ts` | Created | Public list (`GET`) and admin create (`POST`) handlers |
| `src/app/api/questions/[slug]/route.ts` | Created | Public get (`GET`), admin update (`PUT`), and admin delete (`DELETE`) |
| `src/components/companies/CompanyList.tsx` | Created | Client component fetching `/api/companies` with loading/empty states |
| `src/components/questions/QuestionList.tsx` | Created | Client component fetching `/api/questions` with loading/empty states |
| `src/app/companies/page.tsx` | Modified | Replaced static mock array with dynamic `CompanyList` |
| `src/app/questions/page.tsx` | Modified | Replaced static mock array with dynamic `QuestionList` |
| `package.json` | Modified | Added `zod` dependency |
| `package-lock.json` | Modified | Updated lockfile |

### Documentation & Config Files
| File | Purpose |
|------|---------|
| `PROJECT_CONTEXT.md` | Updated current stage to Day 6, added Company and Question API architecture and safe deletion rules |
| `README.md` | Updated current status to Day 6, documented new API endpoints |
| `PROJECT_PROGRESS.md` | Persistent progress tracking and checkpoint |

## Tests & Verification
- `git status --short`: Passed (clean workspace status, untracked files tracked in Day checkpoint, no secrets or `.env.local` tracked).
- `npm ls mongoose zod`: Passed (`mongoose@9.11.2`, `zod@4.6.7`).
- `npm run lint`: Passed with 0 errors, 0 warnings.
- `npm run build`: Passed with 0 errors. All 4 new route handlers registered as dynamic (`ƒ`):
  - `/api/companies` (`ƒ`)
  - `/api/companies/[slug]` (`ƒ`)
  - `/api/questions` (`ƒ`)
  - `/api/questions/[slug]` (`ƒ`)
- Public Company API: Passed. `GET /api/companies` returned controlled JSON response (safe 500 without leaking stack traces or connection strings when DB unconfigured).
- Public Question API: Passed. `GET /api/questions` returned controlled JSON response (safe 500 when DB unconfigured).
- Missing Resource Handling: Passed. Nonexistent slugs returned controlled, safe responses without leaking internals.
- Unauthenticated Mutation Protection: Passed.
  - `POST /api/companies` without cookie -> HTTP 401 `{"success":false,"error":"Unauthorized"}`
  - `POST /api/questions` without cookie -> HTTP 401 `{"success":false,"error":"Unauthorized"}`
  - `DELETE /api/companies/test` without cookie -> HTTP 401 `{"success":false,"error":"Unauthorized"}`
- Authenticated Non-Admin / Admin Verification: Marked `BLOCKED` (no pre-existing admin account exists in database; per prompt instructions, no admin account was fabricated or backdoor created).
- Safe Deletion & Referential Integrity: Checked in code. `DELETE /api/companies/[slug]` verifies `Question.exists({ companies: company._id })` and rejects with HTTP 409 Conflict if questions reference the company.

## Known Limitations
- Search and filtering UI/logic are intentionally deferred to Day 7.
- Bookmarks and progress tracking features are deferred to Day 8+.
- No git commits were made per prompt instruction (`Do not run git commit`).

## Important Decisions
- **Zod for Request Validation vs Mongoose for Schema**: Zod runs at the HTTP boundary to fail fast on malformed requests before touching MongoDB, returning descriptive HTTP 400 errors. Mongoose validates persistence constraints and types at the database level.
- **ObjectId Referential Integrity**: Questions link to Companies via Mongoose ObjectIds (`ref: "Company"`). When deleting a company, referential integrity is strictly protected by checking `Question.exists({ companies: company._id })` and returning 409 Conflict rather than creating dangling references or cascading deletes.
- **Safe Population**: Populating company references in questions selects only necessary public fields (`name`, `slug`, `logo`), avoiding over-fetching and nested query overhead.

## Resume Instructions
1. Inspect `PROJECT_PROGRESS.md` and `PROJECT_CONTEXT.md`.
2. Do not recreate existing files or reinstall dependencies.
3. Keep the project name as "Parakh".
4. Next day in sequence is Day 7 (Search and Filtering).

