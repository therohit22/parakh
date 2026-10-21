# Parakh (परख) — Portfolio Project Profile

---

## 1. One-Line Project Description
**Parakh** is a full-stack, company-wise technical interview preparation web platform built with Next.js 16, TypeScript, MongoDB Atlas, and Tailwind CSS, featuring real-time readiness analytics, atomic bookmarking, and an idempotent bulk data ingestion CLI.

---

## 2. Short Portfolio Description
Parakh helps computer science students prepare systematically for technical hiring assessments by categorizing coding problems by target companies (e.g., Google, Amazon, Microsoft), algorithmic topics, and difficulty levels. Built as a unified full-stack monolith using Next.js App Router and React 19 Server Components, the platform features stateless authentication using JWT in httpOnly cookies, a live preparation dashboard computing completion metrics without $N+1$ queries, an admin portal with referential integrity protection, and an idempotent CLI tool for importing CSV and JSON datasets.

---

## 3. Problem Statement
During placement seasons, engineering students struggle with fragmented technical interview preparation. Coding questions asked by target hiring firms are scattered across discussion forums, Discord groups, and community spreadsheets. Existing platforms rarely organize questions by employer or provide company-level readiness metrics. Students spend valuable preparation time hunting for company-specific problems instead of practicing them, making it difficult to gauge their true interview readiness.

---

## 4. Key Verified Features
- **Company Catalog**: Searchable company directory with metadata and one-click filtering to view all problems asked by that company.
- **Question Catalog**: Multi-criteria problem catalog supporting keyword search, difficulty filtering (`Easy`, `Medium`, `Hard`), topic tag filtering, company filtering, safe sorting, and bounded pagination.
- **Question Detail Pages**: Dedicated views with external problem links (e.g. LeetCode), associated companies, topic pills, and interactive bookmark/solved toggles.
- **Stateless Authentication**: Student registration, login, session inspection (`/api/auth/me`), and logout backed by bcrypt password hashing (10 salt rounds).
- **Personalized Tracking**: Persistent bookmarks and solved question trackers with dedicated user views (`/bookmarks`, `/solved`) and inline removal actions.
- **Preparation Dashboard**: Real-time progress analytics showing total solved/remaining questions, difficulty distribution ratios, and company-specific preparation completion bars.
- **Admin Management Panel**: Server-protected administrative portal (`/admin`) for platform metrics and Company/Question CRUD with foreign key conflict protection.
- **Bulk Data Ingestion Subsystem**: Standalone CLI (`npm run ingest`) supporting RFC 4180 CSV and JSON files with dry-run simulation mode and slug-based idempotent upserts.
- **Design & Usability**: Responsive mobile navigation drawer, animated skeleton loading states, and zero-flicker Dark Mode.

---

## 5. Technology Stack
- **Framework**: Next.js 16 (App Router with Turbopack)
- **Language**: TypeScript 5 (Strict type checking, zero `any`)
- **Frontend**: React 19, Tailwind CSS v4, Geist typography
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: Stateless JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
- **Validation**: Zod (schema-driven runtime input validation)
- **Testing**: Vitest (44 automated unit, security, and validation tests)
- **Deployment**: Vercel (Edge network routing with serverless functions)

---

## 6. Architecture Summary
Parakh uses a three-tier monolithic architecture designed for simplicity and zero server-management overhead:
1. **Client Tier**: React Server Components (RSC) render on the server by default for fast initial paints and minimal client JavaScript. Client islands (`"use client"`) are isolated to interactive controls (search inputs, filter bars, modals, theme toggles).
2. **Application Tier**: Co-located Next.js Route Handlers (`src/app/api/**`) handle RESTful API requests. Every incoming request passes through centralized Zod schema validation and a CSRF origin verification check before touching models.
3. **Database Tier**: MongoDB Atlas stores documents. Mongoose manages schemas and compound indexes. The connection pool is cached on `globalThis` to eliminate connection leaks during development hot-reloads and warm serverless invocations.

---

## 7. Security Highlights
- **HttpOnly Cookie Storage**: JWT session tokens are stored in `parakh_token` cookies with `httpOnly: true`, `SameSite: "lax"`, and `secure: true` in production, eliminating XSS token theft.
- **Bcrypt Password Encryption**: Passwords are salted and hashed with 10 rounds; plaintext passwords and hashes are never returned to clients or logged to the console.
- **Zero-Trust Server-Side RBAC**: Role-based access control (`student` vs. `admin`) is verified strictly by decoding signed JWT claims on the server; client-provided roles or user IDs are completely ignored.
- **NoSQL Injection & ReDoS Defense**: Search keywords are escaped via `escapeRegex()` before `$regex` queries, query parameters are strictly validated with Zod, and pagination limits are capped ($1 \le \text{limit} \le 50$).
- **CSRF Origin Verification**: State-changing mutations (`POST`, `PUT`, `DELETE`) require same-origin headers (`Origin` or `Referer`).
- **HTTP Security Headers**: Injected at the framework layer (`nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`).

---

## 8. Testing Approach
The platform is validated using **Vitest** with 44 automated tests across 4 test suites:
- **`tests/validation.test.ts`**: Verifies registration/login Zod schemas, company/question schemas, bounded pagination, and regex escaping.
- **`tests/auth.test.ts`**: Verifies token generation, signature tampering rejection, expired tokens, and role enforcement (`requireAuth` and `requireAdmin`).
- **`tests/security.test.ts`**: Verifies CSRF origin checks for safe reads, same-origin allowances, and cross-origin blocking (403).
- **`tests/ingest.test.ts`**: Verifies RFC 4180 CSV parsing, quoted fields, double-quote escaping (`""`), and multi-line fields.
- **Production Smoke Test**: 24 end-to-end assertions against a local production build verifying all public and protected routes.

---

## 9. Deployment Approach
Parakh is built for deployment on **Vercel** connected to **MongoDB Atlas**:
- Pre-rendered static pages and assets are distributed globally via Vercel's Edge CDN.
- Dynamic route handlers execute as lightweight serverless functions.
- Environment variables (`MONGODB_URI`, `JWT_SECRET`) are configured in Vercel's project settings and are never exposed to browser bundles.
- Mongoose is configured with `bufferCommands: false` and `serverSelectionTimeoutMS: 5000` to prevent cold-start bottlenecks.

---

## 10. Honest Limitations & Future Improvements
- **Search Scale**: Current search uses MongoDB `$regex` collection scans. *Future improvement*: Integrate a dedicated inverted-index search engine (Typesense or Elasticsearch) for sub-millisecond query performance on millions of questions.
- **OAuth Providers**: Authentication supports email/password only. *Future improvement*: Add Google/GitHub OAuth2 single sign-on.
- **CLI Ingestion**: Ingestion is executed via the terminal CLI to prevent web upload vulnerabilities. *Future improvement*: Build an admin file upload interface backed by an asynchronous background worker queue (BullMQ).
- **In-Browser Code Execution**: Questions currently link externally to LeetCode. *Future improvement*: Integrate a sandboxed execution runtime (Judge0 / WebAssembly) for practicing solutions directly on Parakh.
