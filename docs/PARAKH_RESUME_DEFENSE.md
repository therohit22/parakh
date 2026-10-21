# Parakh — Resume Claim Technical Defense Guide

This document provides a line-by-line technical defense for every bullet point on your resume. For every claim, it details exact source code locations, underlying mechanics, likely interviewer interrogation questions, and recommended verbal responses.

---

## Bullet 1: Full-Stack Architecture & Multi-Criteria Discovery

### Resume Claim:
> *"Architected a full-stack technical interview platform using **Next.js 16 App Router**, **TypeScript**, and **MongoDB Atlas**, delivering company-wise and topic-based problem discovery with bounded pagination, multi-criteria filtering, and sub-second catalog queries."*

- **How I Can Prove It**:
  - Point to [`src/app/questions/page.tsx`](file:///c:/Users/rohit/Desktop/parakh/src/app/questions/page.tsx), [`src/components/questions/QuestionList.tsx`](file:///c:/Users/rohit/Desktop/parakh/src/components/questions/QuestionList.tsx), and [`src/app/api/questions/route.ts`](file:///c:/Users/rohit/Desktop/parakh/src/app/api/questions/route.ts).
  - Point to query validation schemas in [`src/lib/validations/query.ts`](file:///c:/Users/rohit/Desktop/parakh/src/lib/validations/query.ts).
- **Technical Implementation**:
  - Filtering and searching are evaluated directly inside MongoDB using `$and`, `$or`, and multikey indexes on `companies` and `topics`.
  - Pagination limits are clamped between 1 and 50 via Zod (`questionQuerySchema`) to prevent unbounded queries from exhausting server memory.
  - Sub-second performance is achieved via B-tree indexes on `difficulty`, `createdAt`, and `name` without in-memory array filtering.
- **Possible Interviewer Follow-Up**:
  > *"How do you prevent a malicious user from passing an arbitrary regex query that causes a Denial of Service (ReDoS)?"*
- **Recommended Answer**:
  > *"We built an `escapeRegex` utility in `src/lib/validations/query.ts` that escapes all special regular expression characters using a standard character-class replacement. When user input is passed to MongoDB's `$regex` operator, it is evaluated strictly as a literal substring match, preventing catastrophic backtracking and query operator injection."*

---

## Bullet 2: Stateless Authentication, Zero-Trust RBAC & Security Boundaries

### Resume Claim:
> *"Implemented stateless authentication and zero-trust RBAC using **JWT** stored in `httpOnly`, `SameSite=Lax` cookies with **bcryptjs** (10 salt rounds) and server-side role verification, complemented by **Zod** boundary validation and CSRF origin checks across all mutation endpoints."*

- **How I Can Prove It**:
  - Point to [`src/lib/auth.ts`](file:///c:/Users/rohit/Desktop/parakh/src/lib/auth.ts) (`AUTH_COOKIE_OPTIONS`, `signToken`, `verifyToken`, `requireAuth`, `requireAdmin`).
  - Point to [`src/lib/security.ts`](file:///c:/Users/rohit/Desktop/parakh/src/lib/security.ts) (`validateCsrfOrigin`).
  - Point to [`src/app/api/auth/register/route.ts`](file:///c:/Users/rohit/Desktop/parakh/src/app/api/auth/register/route.ts) and [`src/app/api/auth/login/route.ts`](file:///c:/Users/rohit/Desktop/parakh/src/app/api/auth/login/route.ts).
- **Technical Implementation**:
  - Passwords hashed with bcrypt (salt rounds = 10) before MongoDB insertion; `password` has `select: false` by default in Mongoose.
  - Signed JWT payload `{ userId, role }` has a 7-day expiration and is attached via an `httpOnly`, `SameSite=Lax`, `secure: production` cookie.
  - Server-side authorization asserts `payload.role === "admin"`. Students attempting mutations receive HTTP 403 Forbidden.
  - Mutation endpoints check `Origin`/`Referer` headers against the host to prevent CSRF.
- **Possible Interviewer Follow-Up**:
  > *"Why did you use httpOnly cookies instead of storing the JWT in localStorage, and how does your app protect against CSRF if cookies are automatically sent?"*
- **Recommended Answer**:
  > *"We avoided `localStorage` because any Cross-Site Scripting (XSS) vulnerability allows malicious JavaScript to read and steal the token. An `httpOnly` cookie is inaccessible to browser scripts. To mitigate the CSRF risk inherent in cookie-based authentication, we implemented two defenses: first, `SameSite=Lax` restricts cookie transmission on third-party cross-site requests; second, our `validateCsrfOrigin` middleware asserts that the request's `Origin` or `Referer` matches our host before allowing mutations."*

---

## Bullet 3: Idempotent CLI Bulk Data Ingestion & Atomic Progress

### Resume Claim:
> *"Engineered an idempotent data ingestion CLI supporting RFC 4180 CSV and JSON datasets with automated company slug-to-ObjectId resolution, dry-run simulation mode, and atomic Mongoose `$addToSet`/`$pull` operators for race-condition-free user progress tracking."*

- **How I Can Prove It**:
  - Point to [`scripts/ingest/ingest.ts`](file:///c:/Users/rohit/Desktop/parakh/scripts/ingest/ingest.ts), [`scripts/ingest/importer.ts`](file:///c:/Users/rohit/Desktop/parakh/scripts/ingest/importer.ts), and [`scripts/ingest/csvParser.ts`](file:///c:/Users/rohit/Desktop/parakh/scripts/ingest/csvParser.ts).
  - Point to atomic updates in [`src/app/api/questions/[slug]/bookmark/route.ts`](file:///c:/Users/rohit/Desktop/parakh/src/app/api/questions/%5Bslug%5D/bookmark/route.ts) and [`src/app/api/questions/[slug]/solved/route.ts`](file:///c:/Users/rohit/Desktop/parakh/src/app/api/questions/%5Bslug%5D/solved/route.ts).
- **Technical Implementation**:
  - RFC 4180 CSV parser handles quoted fields with embedded commas, double-quote escaping (`""`), and multi-line values.
  - Ingestion pre-loads an in-memory `slug -> ObjectId` map of existing companies to resolve question company references in a single query.
  - Upserts match records by unique `slug`: updates existing documents in-place and inserts new ones without changing ObjectIds.
  - User bookmarking and solved tracking use Mongoose `$addToSet` and `$pull` operators on the `User` document.
- **Possible Interviewer Follow-Up**:
  > *"What does idempotency mean in the context of your data pipeline, and why is it important?"*
- **Recommended Answer**:
  > *"Idempotency means that executing the ingestion process multiple times with the same input file produces the exact same database state as running it once. In Parakh, if you re-run `npm run ingest -- fixtures/companies.csv`, the script matches existing companies by unique slug and updates fields in-place rather than inserting duplicate documents. This prevents database bloat and ensures foreign ObjectIds referenced by questions remain stable."*

---

## Bullet 4: React 19 UI, Dashboard Analytics & Zero-Flicker Dark Mode

### Resume Claim:
> *"Built a company-focused coding practice platform with **Next.js 16**, **React 19**, and **Tailwind CSS v4**, integrating personalized progress dashboards, difficulty breakdowns, and dark mode with zero hydration flicker."*

- **How I Can Prove It**:
  - Point to [`src/app/layout.tsx`](file:///c:/Users/rohit/Desktop/parakh/src/app/layout.tsx) (inline blocking script in `<head>`).
  - Point to [`src/components/ui/ThemeToggle.tsx`](file:///c:/Users/rohit/Desktop/parakh/src/components/ui/ThemeToggle.tsx) (using `useSyncExternalStore`).
  - Point to [`src/components/dashboard/DashboardView.tsx`](file:///c:/Users/rohit/Desktop/parakh/src/components/dashboard/DashboardView.tsx) and [`src/app/api/dashboard/route.ts`](file:///c:/Users/rohit/Desktop/parakh/src/app/api/dashboard/route.ts).
- **Technical Implementation**:
  - Flash of unstyled theme on page reload is eliminated via an inline synchronous `<script>` in `<head>` that inspects `localStorage` and `prefers-color-scheme` before the DOM renders.
  - Dashboard executes exactly 4 bulk database queries (`countDocuments`, `$group`, `$in`, `$unwind`) and computes completion ratios in linear $O(N)$ time with division-by-zero protection.
- **Possible Interviewer Follow-Up**:
  > *"Why does dark mode often cause hydration mismatch errors in React, and how did you resolve it?"*
- **Recommended Answer**:
  > *"In server-rendered React, the server doesn't know the client's `localStorage` theme preference, so it renders the default theme. If the client changes the HTML class during hydration using `useEffect`, React triggers a hydration mismatch warning and users see an annoying flash. I solved this by adding an inline blocking script in the document `<head>` that reads `localStorage` and sets `document.documentElement.classList.add('dark')` before React renders, combined with `useSyncExternalStore` for reactive UI toggling without cascading re-renders."*

---

## Bullet 5: Serverless Connection Pooling & Referential Integrity

### Resume Claim:
> *"Designed a secure RESTful API layer and MongoDB schema with **Mongoose ODM**, utilizing cached connection pooling on `globalThis` to eliminate serverless cold-start bottlenecks and enforcing referential integrity against foreign key deletions."*

- **How I Can Prove It**:
  - Point to [`src/lib/db.ts`](file:///c:/Users/rohit/Desktop/parakh/src/lib/db.ts) (`getCache()`, `globalThis.mongooseCache`).
  - Point to [`src/app/api/companies/[slug]/route.ts`](file:///c:/Users/rohit/Desktop/parakh/src/app/api/companies/%5Bslug%5D/route.ts) (lines 198–208: 409 Conflict check).
- **Technical Implementation**:
  - Caches the connection promise on `globalThis.mongooseCache`. Subsequent invocations await the cached promise, preventing redundant connection pool creation across serverless cold starts.
  - `bufferCommands: false` and `serverSelectionTimeoutMS: 5000` ensure queries fail fast during network disruptions rather than hanging indefinitely.
  - `DELETE /api/companies/[slug]` queries `Question.exists({ companies: company._id })` before deletion, rejecting deletions with HTTP 409 Conflict if questions reference the company.
- **Possible Interviewer Follow-Up**:
  > *"Why is connection pooling tricky in serverless environments like Vercel, and why does globalThis solve it?"*
- **Recommended Answer**:
  > *"In traditional servers, a single Node.js process runs continuously and maintains one database connection pool. In serverless environments, functions spin up on-demand to handle requests. If every function call instantiated a new Mongoose connection, high traffic would spawn hundreds of concurrent connection pools, exhausting MongoDB's connection limits. Caching the connection promise on `globalThis` reuses the same connection pool across warm function invocations in the same container instance."*

---

## Bullet 6: Automated Testing Pipeline (Vitest)

### Resume Claim:
> *"Established an automated testing pipeline using **Vitest** with 44 unit and security test cases covering authentication tampering, CSRF origin verification, CSV parsing, and Zod input validation schemas."*

- **How I Can Prove It**:
  - Point to [`vitest.config.ts`](file:///c:/Users/rohit/Desktop/parakh/vitest.config.ts) and [`package.json`](file:///c:/Users/rohit/Desktop/parakh/package.json) (`"test": "vitest run"`).
  - Point to test suites:
    - [`tests/validation.test.ts`](file:///c:/Users/rohit/Desktop/parakh/tests/validation.test.ts) (20 tests)
    - [`tests/auth.test.ts`](file:///c:/Users/rohit/Desktop/parakh/tests/auth.test.ts) (12 tests)
    - [`tests/security.test.ts`](file:///c:/Users/rohit/Desktop/parakh/tests/security.test.ts) (7 tests)
    - [`tests/ingest.test.ts`](file:///c:/Users/rohit/Desktop/parakh/tests/ingest.test.ts) (5 tests)
- **Technical Implementation**:
  - Fast, in-memory execution using Vitest with `@/*` path alias resolution.
  - Tests verify both happy paths (valid registrations, correct CSV parsing) and defensive negative paths (tampered JWT signatures, expired tokens, student 403 access, cross-origin CSRF blocking, invalid pagination limits).
- **Possible Interviewer Follow-Up**:
  > *"Why did you choose Vitest over Jest for this Next.js project?"*
- **Recommended Answer**:
  > *"Vitest shares modern ESM module resolution, requires zero Babel or custom TypeScript transformer configuration, and resolves path aliases (`@/*`) natively. It executes our 44 tests in under 1 second with instant startup and zero configuration bloat."*
