# Parakh (परख) — Engineering Project Summary & Resume Guide

## Project Title
**Parakh (परख)** — Company-Wise Technical Interview Preparation & Progress Tracking Platform

## One-Line Description
A production-grade, full-stack Next.js and MongoDB web application that empowers computer science students to practice verified company-specific coding questions, track preparation readiness, and bookmark key problems with zero infrastructure costs.

---

## Problem Solved
Computer science students preparing for campus placements and technical interviews often face overwhelming, unorganized question catalogs across multiple platforms. Questions frequently lack authentic company tags, duplicate identical algorithms under different company banners without tracking overall mastery, and lack a unified preparation dashboard that reflects cross-company interview readiness. 

Parakh solves this by:
1. Providing authentic, deduplicated question-to-company relational mapping (many-to-many relationship in MongoDB).
2. Linking every question directly to verified official LeetCode problem URLs.
3. Enabling authenticated students to track personal solved progress and bookmarks without data leakage.
4. Calculating live cross-company readiness metrics and difficulty distributions on a personal dashboard.
5. Providing an administrative management portal with reference-protected company and question CRUD.

---

## Key Features
- **Company Preparation Roadmaps:** 3-stage progressive preparation paths (Fundamentals, Core DSA, Advanced Algorithms) dynamically calculated for each employer.
- **Topic-wise Progress & Strength Analysis:** Automated proficiency metrics categorizing topics into Strong ($\ge 70\%$), Moderate ($\ge 40\%$), and Needs Practice ($< 40\%$).
- **Personal Revision Queue:** Dedicated `/revision` queue enabling students to flag and review problems independently of solved status.
- **Parakh Preparation Score:** Deterministic 0–100 integer score evaluating overall completion, topic coverage, company coverage, revision depth, and streak consistency.
- **Daily Practice Engine:** Deterministic 5-problem daily study set (1 Easy, 3 Medium, 1 Hard) powered by bitwise date seeding.
- **Personal Question Notes:** Private, authenticated study scratchpad on question pages with bounded length and XSS protection.
- **DSA Pattern Classification:** Categorization and filtering by algorithmic pattern (Two Pointers, Sliding Window, Monotonic Stack, etc.).
- **Advanced Combined Search:** Multi-factor server-side search combining keywords, company, difficulty, topic, and pattern.
- **Mock Interview Simulation:** 45-minute timed interview mode with countdown timer, randomized question tiers, and completion reporting.
- **Progress History & Activity Tracking:** Lightweight activity logging on `User.activityLog` tracking problems solved over time.
- **Streak & 30-Day Activity Calendar:** Visual activity matrix and streak calculation rewarding consistent daily practice.
- **Curated Interview Collections:** Curated problem sets (FAANG Core, Sliding Window, Binary Search, DP Patterns, Trees/Graphs).
- **User Profile & Account Security:** Detailed progress overview, authenticated password change, and secure cascading account deletion.
- **LeetCode Practice Integration:** Verified official problem links on cards and question detail views with secure external link attributes.
- **Admin Management Portal:** Server-side guarded (`requireAdmin`) interface to create, update, and manage companies and questions, with 409 Conflict safeguards.
- **Idempotent CLI Ingestion Engine:** Node.js data ingestion CLI (`npm run ingest`) supporting RFC 4180 CSV and JSON formats with dry-run mode.

---

## Architecture
- **Framework:** Next.js 16 (App Router with Turbopack, React 19, TypeScript 5).
- **Styling:** TailwindCSS 4 with dark mode and responsive layout down to 360px mobile viewports.
- **Database & ODM:** MongoDB Atlas M0 Free Cluster with Mongoose 9. Connection promise cached on `globalThis` to prevent connection leaks across serverless warm starts.
- **Validation:** Zod 4 runtime schemas applied across all API requests, query parameters, URL slugs, and ingestion records.
- **Authentication:** Stateless JSON Web Tokens (JWT) signed with HMAC-SHA256 and stored in `httpOnly`, `sameSite: "lax"`, `secure` cookies.
- **Authorization:** Role-Based Access Control (RBAC) enforced server-side via `requireAuth` and `requireAdmin` helper gates.

```
Client Browser (Desktop/Mobile)
  │
  ▼
Next.js App Router (Turbopack)
  ├── Server Components (Static prerendering & SSR)
  ├── Client Components (Interactive state, filter/search sync)
  │
  ▼
Route Handlers (/api/*)
  ├── CSRF Origin & Referer Validation
  ├── Authentication Gate (requireAuth / requireAdmin via JWT cookie)
  ├── Zod Schema Parsing & Bounding
  │
  ▼
Mongoose Data Layer
  ├── Cached Connection Pool (globalThis.mongooseCache)
  ├── User Model (Pass: bcrypt cost 10, select: false; revisionQuestions, activityLog)
  ├── Company Model (slug index, logo, description)
  ├── Question Model (slug index, companies ObjectId refs, pattern index, leetcodeUrl)
  └── QuestionNote Model (user + question compound unique index, 2000-char text)
        │
        ▼
  MongoDB Atlas (M0 Free Cluster)
```

---

## Technical Highlights
1. **Zero-N+1 Dashboard Aggregation:** Computed complex user metrics, difficulty totals, and company-wise readiness percentages using two MongoDB `$group` pipelines combined with lean in-memory maps, rather than firing loops of independent database queries.
2. **Deterministic Daily Practice:** Bitwise date hashing of `YYYY-MM-DD` guarantees stable 5-question daily practice sets across page refreshes without requiring persistent daily collection records.
3. **Compound-Indexed Private Study Notes:** Created normalized `QuestionNote` collection with compound unique index `{ user: 1, question: 1 }` preventing user document bloat and eliminating IDOR vulnerabilities.
4. **Turbopack & Partial Prefetching:** Configured Next.js 16 compiler features (`cacheComponents: true`, `partialPrefetching: true`) achieving sub-800ms cold builds and instant client-side route transitions.
5. **Mongoose Connection Reuse in Serverless:** Eliminated socket exhaustion in serverless function environments by caching the active Mongoose connection promise on Node's `globalThis`, paired with `bufferCommands: false` to ensure fast-fail diagnostic errors.

---

## Security Highlights
- **Algorithm-Pinned JWT:** Enforced `{ algorithms: ["HS256"] }` in `jwt.verify()` to eliminate algorithm-confusion attacks (e.g., `alg: none`).
- **No Client-Supplied User IDs:** Personal state mutations (bookmarks, solved questions, notes, revision queue) strictly derive identity from verified server-side JWT cookie, preventing Insecure Direct Object References (IDOR).
- **Credential Protection:** Passwords salted and hashed with `bcryptjs` (cost 10); schema enforces `select: false` so password hashes never appear in database queries or API JSON responses.
- **NoSQL Injection & ReDoS Defense:** Regex search inputs sanitized with `escapeRegex()`, search strings bounded to 100 characters, and pagination strictly capped at 50 to prevent memory exhaustion.
- **Private Cache-Control:** Sensitive authenticated endpoints explicitly return `Cache-Control: private, no-store, max-age=0` to block intermediate proxy caching.
- **HTTP Security Headers:** Configured Content-Security-Policy (CSP), Strict-Transport-Security (HSTS), X-Content-Type-Options: nosniff, and X-Frame-Options: DENY.

---

## Deployment & Free-Tier Strategy ($0/Month)
- **Host:** Vercel Hobby Tier ($0/month). Seamless Next.js App Router integration, automatic SSL, edge header routing, and zero maintenance.
- **Database:** MongoDB Atlas M0 Sandbox ($0/month). 512 MB storage, shared RAM, connection pooling, and automated backups.
- **Zero Hidden Costs:** No paid SMTP or Nodemailer requirements, no external Redis/caching infrastructure dependencies, and no paid third-party APIs.

---

## Testing & Quality Gates
- **Automated Tests:** 91 automated unit and integration tests passing across 7 suites in Vitest 2.
- **Static Analysis:** ESLint 9 + typescript-eslint running with **0 errors and 0 warnings**.
- **Production Compilation:** Next.js Turbopack build compiles all 40 App Router routes cleanly with 0 TypeScript errors.
- **Live Smoke Testing:** Verified live endpoints and attack scenarios including unauthenticated mutation rejections, malformed JSON inputs, and pagination limit tampering.

---

## Engineering Challenges Overcome
1. **Deterministic Pseudo-Random Selection:** Designed a stable hash seeding function over calendar date strings (`YYYY-MM-DD`) to deliver consistent 5-question daily practice sets across page reloads without requiring separate database collections or background cron jobs.
2. **Normalized User State vs. Document Bloat:** Isolated personal question notes into a distinct `QuestionNote` collection with compound indexing (`{ user: 1, question: 1 }`), keeping user documents lightweight and preventing MongoDB document size limit bottlenecks.
3. **Multi-Factor Server-Side Search Filtering:** Architected combined search querying across titles, descriptions, difficulty tiers, topics, patterns, and company associations with strict AND semantics and bounded pagination, preventing memory exhaustion attacks.

---

## Resume Bullet Versions (Factual & Interview-Defensible)

### Version A: Software Engineer Focused
> Developed **Parakh**, a full-stack technical interview preparation platform using **Next.js 16 (App Router)**, **TypeScript**, **React 19**, and **MongoDB Atlas**, enabling students to practice company-curated questions with verified LeetCode links, deterministic daily practice sets, and timed mock interviews. Built 20+ RESTful API endpoints with Zod runtime validation, implemented stateless authentication using bcrypt and algorithm-pinned JWTs in httpOnly cookies, and architected an idempotent CLI ingestion pipeline for bulk dataset imports. Maintained 100% test pass rate across 91 Vitest automated test cases with zero production vulnerabilities.

### Version B: Backend Focused
> Architected the backend and data tier for **Parakh**, a high-performance interview preparation system powered by **Node.js**, **Next.js Route Handlers**, and **Mongoose 9**. Designed a deduplicated many-to-many question-to-company schema, optimized dashboard analytics using non-N+1 MongoDB `$group` aggregation pipelines, and implemented connection pooling cached on `globalThis` to prevent socket exhaustion in serverless environments. Hardened system security with strict RBAC, CSRF origin verification, ReDoS input escaping, and private cache-control headers, achieving zero runtime vulnerabilities across 40 compiled App Router routes.

### Version C: Full-Stack Focused
> Engineered **Parakh**, an end-to-end web platform for company-specific coding interview preparation built with **Next.js 16**, **React 19**, **TailwindCSS 4**, and **MongoDB Atlas**. Crafted responsive UI flows across 8 company tracks with dark mode, 3-stage preparation roadmaps, personal revision queues, private study notes, and synchronized URL state management. Integrated secure student authentication, personal progress dashboards, and an admin management portal guarded by server-side authorization. Automated quality verification across 91 unit/integration tests, achieving a clean zero-warning ESLint audit and 40-route Turbopack production compilation.
