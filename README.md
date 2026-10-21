# Parakh (परख)

A company-wise technical interview preparation platform designed to help computer science students prepare for technical assessments and engineering interviews systematically.

---

## Project Story

### The Problem
During campus placement seasons and off-campus hiring, computer science students face severe fragmentation in technical preparation. Problems asked by specific companies are scattered across random discussion threads, community spreadsheets, and LeetCode forums without structure. Students lack a centralized platform where they can target specific employers (e.g., Google, Amazon, Microsoft), track their preparation progress by company and algorithmic topic, and gauge their readiness without getting overwhelmed by thousands of uncategorized questions.

### The Solution: Parakh
**Parakh** (meaning *evaluation* or *assessment* in Hindi) solves this problem by providing a structured, company-wise and topic-wise preparation platform. Students can:
1. Target interview questions frequently asked by specific hiring companies.
2. Filter problems across standard CS topics (Arrays, Trees, Dynamic Programming, Graphs) and difficulty tiers (Easy, Medium, Hard).
3. Track preparation readiness with a real-time analytics dashboard computing company-level and difficulty-level completion percentages.
4. Maintain persistent personal bookmarks and solved question trackers with atomic synchronization.

### What Was Personally Built
- **Full-Stack Monolith**: Co-located React 19 UI and REST Route Handlers using Next.js 16 App Router.
- **Defensive Boundary Validation**: Type-safe input parsing using Zod across bodies, query parameters, and URL slugs, with regex sanitization (`escapeRegex`) to prevent injection attacks.
- **Stateless Authentication & RBAC**: Signed JWTs stored in `httpOnly`, `SameSite=Lax` cookies with bcrypt password hashing and zero-trust server-side role verification (`student` vs. `admin`).
- **High-Performance Database Layer**: Serverless Mongoose connection pool caching on `globalThis` to eliminate connection leaks during dev server HMR and serverless execution.
- **Bulk Data Ingestion Subsystem**: Standalone, idempotent CLI engine supporting RFC 4180 CSV and JSON files with slug-based upserts, company foreign key resolution, and dry-run simulation mode.
- **LeetCode Practice Integration**: Verified official problem links on question cards and detail views, allowing instant one-click transitions into active coding environments.
- **Automated Test Suite**: 91 deterministic tests in Vitest covering input validation, token cryptography, CSRF protection, LeetCode URL safety, CSV parsing, company-wise question separation, and security audit hardening.

---

## Documentation Index

Detailed engineering, presentation, and interview documentation is available in the [`docs/`](./docs) directory:
- [**Production Deployment Guide (`docs/DEPLOYMENT.md`)**](./docs/DEPLOYMENT.md): Step-by-step instructions for deploying Parakh to Vercel with MongoDB Atlas, environment variables, and post-deployment smoke verification.
- [**Feature Guide & Personal Preparation Architecture (`docs/PARAKH_FEATURE_GUIDE.md`)**](./docs/PARAKH_FEATURE_GUIDE.md): Complete guide to all 15 personal interview preparation features, formulas, endpoints, and data modeling.
- [**Application Security & Production Readiness Audit (`docs/PARAKH_SECURITY_AUDIT.md`)**](./docs/PARAKH_SECURITY_AUDIT.md): Comprehensive security threat model (A–T), JWT algorithm pinning, IDOR defenses, CSP headers, and residual risk assessment.
- [**Resume Project Summary & Interview Guide (`docs/PARAKH_RESUME_PROJECT_SUMMARY.md`)**](./docs/PARAKH_RESUME_PROJECT_SUMMARY.md): Complete candidate-level project summary, architectural highlights, engineering challenges, and 3 defensible resume bullet variations.
- [**Company Question Sources & LeetCode Audit (`docs/PARAKH_COMPANY_QUESTION_SOURCES.md`)**](./docs/PARAKH_COMPANY_QUESTION_SOURCES.md): Complete audit of 80+ interview-reported questions across Deloitte, Infosys, Flipkart, and Zomato mapped to verified LeetCode links.
- [**Final Master Audit & Verification Report (`docs/PARAKH_FINAL_AUDIT.md`)**](./docs/PARAKH_FINAL_AUDIT.md): Comprehensive end-to-end audit, live Chrome browser verification results, security inspection, and viva preparation expansion.
- [**Final Project Handoff & Verification Matrix (`docs/PARAKH_FINAL_HANDOFF.md`)**](./docs/PARAKH_FINAL_HANDOFF.md): Comprehensive production-readiness sign-off checklist across code, database, auth, UI, and deployment.
- [**Master Interview Guide & Compendium (`docs/PARAKH_FINAL_INTERVIEW_GUIDE.md`)**](./docs/PARAKH_FINAL_INTERVIEW_GUIDE.md): Complete interview preparation guide covering 29 technical Q&As (Short & Deep), LeetCode integration, difficult follow-ups, decision rationales, and 15 progressive mock interview questions.
- [**Resume Claim Technical Defense (`docs/PARAKH_RESUME_DEFENSE.md`)**](./docs/PARAKH_RESUME_DEFENSE.md): Line-by-line technical defense, code references, and interrogation response scripts for every resume bullet point.
- [**Final University Viva Script (`docs/PARAKH_FINAL_VIVA.md`)**](./docs/PARAKH_FINAL_VIVA.md): Natural spoken defense script structured across 21 evaluation sections for university project defenses and capstones.
- [**Live Demo & Evaluation Script (`docs/PARAKH_DEMO_SCRIPT.md`)**](./docs/PARAKH_DEMO_SCRIPT.md): Concise 5–7 minute live demonstration script, talking points, and failure recovery checklist.
- [**Portfolio Project Profile (`docs/PORTFOLIO.md`)**](./docs/PORTFOLIO.md): Complete candidate-level portfolio breakdown covering problem statement, architecture, security, and testing.
- [**System Architecture (`docs/ARCHITECTURE.md`)**](./docs/ARCHITECTURE.md): Complete layer-by-layer breakdown, authentication flow, database schemas, referential integrity guards, and 10 detailed interview discussion points.
- [**API Reference (`docs/API.md`)**](./docs/API.md): Comprehensive REST endpoint specification with validation rules, status codes, and practical curl examples for all routes.
- [**Demonstration Script (`docs/DEMO_FLOW.md`)**](./docs/DEMO_FLOW.md): Step-by-step 5–10 minute demonstration sequence for interviewers, project evaluators, and reviewers.
- [**Project Presentation Slide Deck (`docs/PARAKH_PRESENTATION.md`)**](./docs/PARAKH_PRESENTATION.md): 12-slide structured presentation outline with Mermaid architecture diagram.
- [**Resume Bullets & Portfolio (`docs/RESUME_BULLETS.md`)**](./docs/RESUME_BULLETS.md): Technical action bullets for general and internship resumes, plus portfolio descriptions.
- [**Interview Questions & Scaling Guide (`docs/INTERVIEW_QUESTIONS.md`)**](./docs/INTERVIEW_QUESTIONS.md): 28 core viva Q&As, practical dataset engineering insights, and a 1M user scaling roadmap.
- [**Viva & Walkthrough Script (`docs/PARAKH_VIVA_SCRIPT.md`)**](./docs/PARAKH_VIVA_SCRIPT.md): Natural 5-minute spoken walkthrough script for academic presentations and interview screens.

---

## Overview

**Parakh** enables students to discover and practice coding interview questions organized by target hiring companies, core computer science topics, and difficulty levels. Students can track preparation readiness with real-time statistics, maintain persistent bookmarks, and mark problems as solved. The platform also provides an administrative management panel for maintaining company and question catalogs, along with an idempotent bulk data ingestion CLI and direct LeetCode practice integration.

---

## Features

- **Company Preparation Roadmaps**: 3-stage progressive preparation paths (Fundamentals, Core DSA, Advanced Algorithms) dynamically calculated for each employer.
- **Company-wise Preparation & Tracking**: Target problems frequently asked by top employers and track real solved completion rates.
- **Topic-wise Progress & Strength Analysis**: Topic proficiency metrics automatically classifying areas into Strong, Moderate, and Needs Practice.
- **Personal Revision Queue**: Dedicated `/revision` queue to mark, track, and review challenging problems independently of solved status.
- **Parakh Preparation Score**: Deterministic 0–100 integer score evaluating overall completion, topic coverage, company coverage, revision depth, and streak consistency.
- **Daily Practice Engine**: Deterministic 5-problem daily study set (1 Easy, 3 Medium, 1 Hard) powered by bitwise date seeding.
- **Personal Question Notes**: Private, authenticated study scratchpad on question pages with bounded length and XSS protection.
- **DSA Pattern Classification**: Categorization and filtering by algorithmic pattern (Two Pointers, Sliding Window, Monotonic Stack, etc.).
- **Advanced Combined Search**: Multi-factor server-side search combining keywords, company, difficulty, topic, and pattern.
- **Mock Interview Simulation**: 45-minute timed interview mode with countdown timer, randomized question tiers, and completion reporting.
- **Progress History & Activity Tracking**: Lightweight activity logging on `User.activityLog` tracking problems solved over time.
- **Streak & 30-Day Activity Calendar**: Visual activity matrix and streak calculation rewarding consistent daily practice.
- **Curated Interview Collections**: Curated problem sets (FAANG Core, Sliding Window, Binary Search, DP Patterns, Trees/Graphs).
- **User Profile & Account Security**: Detailed progress overview, authenticated password change, and secure cascading account deletion.
- **Admin Management Panel**: Server-side role-protected portal for administrators (`role: "admin"`) to manage companies and questions.
- **LeetCode Practice Integration**: Verified official problem links on cards and question detail views with secure external link attributes.
- **Idempotent Data Ingestion CLI**: Standalone CLI tool (`npm run ingest`) supporting RFC 4180 CSV and JSON formats with dry-run verification.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router with Turbopack) |
| **Language** | TypeScript 5 |
| **UI & Styling** | React 19, Tailwind CSS v4, Geist Font |
| **Database** | MongoDB Atlas with Mongoose ODM |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`) & `bcryptjs` |
| **Validation** | Zod (schema-driven request & route parameter validation) |
| **Testing** | Vitest (automated unit and security test suite) |
| **Deployment** | Vercel (Serverless / Edge runtime ready) |

---

## Architecture

Parakh uses a streamlined, three-tier monolithic architecture designed for clean separation of concerns, high maintainability, and zero server management overhead:

```text
Browser (React 19 Client & Server Components)
   │
   ▼  [HTTPS / httpOnly Cookie]
Next.js 16 App Router (Vercel Edge / Serverless Handlers)
   │
   ├── Input Validation (Zod schemas & CSRF Origin Verification)
   ├── Authentication & RBAC Guard (`src/lib/auth.ts`)
   │
   ▼  [Mongoose Cached Connection Pool]
MongoDB Atlas (Managed Cloud Database)
   ├── Users, Companies, Questions
   └── Bookmarks & Solved Progress
```

---

## Key Engineering Decisions

1. **Next.js App Router & Server Components**: Employs React Server Components (RSC) by default for fast initial render and minimal client bundle sizes. Client components (`"use client"`) are isolated to interactive islands (search inputs, filter bars, theme toggles, modal dialogs).
2. **Stateless Authentication with HttpOnly Cookies**: Uses cryptographically signed JSON Web Tokens (JWT) stored in `httpOnly`, `SameSite=Lax`, `secure` cookies. This prevents JavaScript token extraction (XSS mitigation) while avoiding server-side session stores like Redis.
3. **Mongoose Serverless Connection Caching**: Reuses a single connection pool across warm serverless function invocations by caching the connection promise on `globalThis`. Disables command buffering (`bufferCommands: false`) and sets timeouts to prevent cold-start bottlenecks.
4. **Schema-Driven Request Validation (Zod)**: Enforces strict boundary validation on all request bodies, route slugs, and query parameters. Bounded pagination ($1 \le \text{limit} \le 50$) and regex sanitization (`escapeRegex`) protect against Denial of Service (ReDoS) and query injection.
5. **Idempotent Bulk Data Ingestion**: Uses `slug` as the stable unique key with upsert semantics for Companies and Questions. Ensures import operations are non-destructive and re-runnable without generating duplicate documents.
6. **Zero-Trust Server-Side RBAC**: Role-based access control is evaluated strictly on the server by decoding verified JWT claims. Client-supplied role flags or user IDs are never trusted as sources of truth.

---

## Project Structure

```text
parakh/
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules (secrets strictly excluded)
├── next.config.ts            # Next.js configuration & HTTP security headers
├── package.json              # Project scripts and dependencies
├── tsconfig.json             # TypeScript configuration with path aliases
├── vitest.config.ts          # Vitest testing configuration
├── fixtures/                 # Sample CSV/JSON files for ingestion testing
├── scripts/
│   └── ingest/               # Standalone data ingestion CLI engine
│       ├── ingest.ts         # CLI entrypoint
│       ├── importer.ts       # Idempotent upsert & referential integrity engine
│       ├── csvParser.ts      # RFC 4180 compliant CSV parser
│       └── types.ts          # Ingestion TypeScript contracts
├── src/
│   ├── app/                  # App Router pages and API route handlers
│   │   ├── api/              # RESTful API route handlers
│   │   │   ├── admin/        # Admin platform stats (`GET /api/admin/stats`)
│   │   │   ├── auth/         # Register, Login, Me, Logout
│   │   │   ├── companies/    # Company CRUD & search
│   │   │   ├── dashboard/    # User preparation statistics
│   │   │   ├── health/       # Database & model health check endpoints
│   │   │   └── questions/    # Question CRUD, detail, bookmark, and solved
│   │   ├── admin/            # Admin management pages
│   │   ├── bookmarks/        # Bookmarked questions view
│   │   ├── companies/        # Companies directory
│   │   ├── dashboard/        # Preparation dashboard view
│   │   ├── login/            # Sign-in page
│   │   ├── questions/        # Question catalog & [slug] detail view
│   │   ├── register/         # Account registration page
│   │   ├── solved/           # Solved questions view
│   │   ├── globals.css       # Global styles & design tokens
│   │   ├── layout.tsx        # Root layout with Navbar and Footer
│   │   └── page.tsx          # Landing page with hero & topic discovery
│   ├── components/           # Reusable UI & domain components
│   │   ├── admin/            # AdminGuard, AdminNav, Company & Question Managers
│   │   ├── auth/             # LoginForm, RegisterForm
│   │   ├── bookmarks/        # BookmarksList
│   │   ├── companies/        # CompanyList
│   │   ├── dashboard/        # DashboardView
│   │   ├── layout/           # Navbar, Footer
│   │   ├── questions/        # QuestionList, QuestionDetail
│   │   ├── solved/           # SolvedList
│   │   └── ui/               # Button, Card, EmptyState, ThemeToggle
│   ├── lib/                  # Server-side utilities
│   │   ├── auth.ts           # JWT signing/verification & cookie extraction
│   │   ├── db.ts             # Mongoose connection pooling & caching
│   │   ├── security.ts       # CSRF Origin/Referer mutation validation
│   │   └── validations/      # Zod validation schemas
│   └── models/               # Mongoose schema definitions
│       ├── User.ts           # User accounts & roles
│       ├── Company.ts        # Target hiring companies
│       ├── Question.ts       # Interview questions
│       ├── Bookmark.ts       # User-question bookmark relations
│       └── Progress.ts       # User-question solved status relations
└── tests/                    # Vitest automated test suites
    ├── auth.test.ts          # JWT lifecycle & RBAC authorization tests
    ├── ingest.test.ts        # CSV parsing & escaping tests
    ├── security.test.ts      # CSRF validation tests
    └── validation.test.ts    # Zod schemas & boundary tests
```

---

## Prerequisites

- **Node.js**: `v20.x` or higher (tested with Node 20 / 22 / 24).
- **npm**: `v10.x` or higher.
- **MongoDB**: Access to a MongoDB Atlas cluster (free M0 tier is sufficient) or a local MongoDB instance.

---

## Local Setup

### 1. Installation

Install all required dependencies:

```bash
npm install
```

### 2. Configure Environment Variables

Copy the template file to create your local environment file:

```bash
cp .env.example .env.local
```

Open `.env.local` and define the required configuration:

```env
# MongoDB connection URI (Atlas or local)
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/parakh?retryWrites=true&w=majority

# Strong random secret key for signing JWT cookies (32+ characters)
JWT_SECRET=replace-with-a-long-random-secret
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
```

### 5. Run Production Server Locally

```bash
npm run start
```

---

## Environment Variables

| Variable | Description | Required | Scope |
|---|---|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string including credentials and database name. | Yes | Server-only |
| `JWT_SECRET` | Secret key used for signing and verifying authentication JWT tokens. | Yes | Server-only |
| `NODE_ENV` | Runtime environment (`development`, `test`, or `production`). In production, cookies enforce `secure: true`. | Auto | System |

> **Security Note:** Neither variable is prefixed with `NEXT_PUBLIC_`. They are never sent to or visible in client browser JavaScript.

---

## API Overview

### Authentication (`/api/auth`)
- `POST /api/auth/register`: Create a new student account. Validates credentials and forces role `"student"`.
- `POST /api/auth/login`: Authenticate with email/password; issues signed `parakh_token` httpOnly cookie.
- `GET /api/auth/me`: Get current authenticated user profile (`id`, `name`, `email`, `role`, bookmarked and solved IDs).
- `POST /api/auth/logout`: Clear authentication cookie and terminate session.

### Companies (`/api/companies`)
- `GET /api/companies`: Public endpoint to list, search, sort, and paginate companies.
- `POST /api/companies`: Admin-only endpoint to create a new hiring company.
- `GET /api/companies/[slug]`: Public endpoint to retrieve details for a specific company.
- `PUT /api/companies/[slug]`: Admin-only endpoint to update company information.
- `DELETE /api/companies/[slug]`: Admin-only endpoint to safely delete a company (protected against deletion if referenced by active questions).

### Questions (`/api/questions`)
- `GET /api/questions`: Public endpoint to search, filter (by difficulty, topic, company), sort, and paginate questions.
- `POST /api/questions`: Admin-only endpoint to create a new interview question with associated companies.
- `GET /api/questions/[slug]`: Public endpoint to retrieve details and company references for a question.
- `PUT /api/questions/[slug]`: Admin-only endpoint to update question details.
- `DELETE /api/questions/[slug]`: Admin-only endpoint to delete a question and clean up associated bookmarks/progress.

### Bookmarks & Solved Progress (`/api/questions/[slug]/*`)
- `POST /api/questions/[slug]/bookmark`: Toggle bookmark status for authenticated user.
- `GET /api/questions/bookmarked`: Retrieve the authenticated user's list of bookmarked questions.
- `POST /api/questions/[slug]/solved`: Toggle solved status for authenticated user.
- `GET /api/questions/solved`: Retrieve the authenticated user's list of solved questions.

### Dashboard (`/api/dashboard`)
- `GET /api/dashboard`: Retrieve authenticated user's preparation statistics, overall percentage, difficulty progress, and company readiness breakdown.

### Administrator Platform Stats (`/api/admin`)
- `GET /api/admin/stats`: Admin-only endpoint returning live platform document counts (total companies, questions, users).

---

## Data Ingestion CLI

Parakh includes a standalone, idempotent data ingestion tool for importing Companies and Questions from CSV or JSON files into MongoDB.

### Command Usage

```bash
npm run ingest -- <file> [options]
```

### Options

| Flag | Description |
|---|---|
| `--type=<companies\|questions>` | Explicitly define entity type. Optional if inferred from file headers. |
| `--dry-run` | Validates records, syntax, and referential integrity without writing to MongoDB. |
| `--help` | Display usage instructions and examples. |

### Ingestion Guarantees

1. **Idempotency**: Existing records matched by `slug` are updated in-place. Running the same file multiple times never creates duplicate documents or changes ObjectIds.
2. **Referential Integrity**: Referenced companies in questions are resolved by slug against existing MongoDB Company documents. Unknown company slugs safely halt the record with a clear diagnostic.
3. **Non-Destructive**: Missing records from import files are never deleted from MongoDB.
4. **Isolated Lifecycle**: The script connects via `src/lib/db.ts` and cleanly disconnects upon completion. Ingestion is never executed during production builds.

---

## Admin Functionality

Administrative management is strictly protected via server-side authorization:
- **Server-Side Verification**: Route handlers check `auth.authorized && auth.user.role === "admin"`. Client role attributes are never trusted.
- **Dedicated Portals**:
  - `/admin`: Platform overview with live database counts.
  - `/admin/companies`: Search, create, edit, and safely delete companies.
  - `/admin/questions`: Search, filter, paginate, create with company association, edit, and delete questions.
- **Reference Protection**: Deleting a company referenced by existing questions returns `409 Conflict`, preventing broken relations.

---

## Production Deployment (Vercel + MongoDB Atlas)

Parakh is designed for zero-config deployment on Vercel with a managed MongoDB Atlas database.

### 1. Configure MongoDB Atlas

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/).
2. In **Network Access**, ensure Vercel's serverless functions can connect to your cluster:
   - For hobby/serverless deployments, add `0.0.0.0/0` (Allow Access from Anywhere) or use the official Vercel MongoDB Atlas integration.
3. In **Database Access**, create a database user with read and write permissions to the `parakh` database.
4. Copy the connection string (e.g. `mongodb+srv://<username>:<password>@cluster0.mongodb.net/parakh?retryWrites=true&w=majority`).

### 2. Deploy to Vercel

1. Push your Parakh repository to GitHub, GitLab, or Bitbucket.
2. Go to [Vercel](https://vercel.com/) and click **Add New > Project**.
3. Import your Parakh repository.
4. In **Build and Output Settings**:
   - Framework Preset: **Next.js** (automatically detected).
   - Build Command: `npm run build` (or leave default).
   - Install Command: `npm install` (or leave default).
5. In **Environment Variables**, add:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A secure random 32+ character string (e.g. generated via `openssl rand -base64 32`).
6. Click **Deploy**.

---

## Testing

Parakh includes automated unit, authorization, validation, and security test suites using **Vitest**:

```bash
# Run test suite
npm test
```

### Test Coverage Highlights
- **Input Validation**: Tests `registerSchema`, `loginSchema`, `slugParamSchema`, `objectIdParamSchema`, query pagination limits, and regex escaping.
- **Authentication**: Tests token generation, signature tampering rejection, expired tokens, and `parakh_token` cookie extraction.
- **Authorization**: Tests `requireAuth` (401) and `requireAdmin` (401 unauthenticated, 403 student, allowed for admin).
- **CSRF Protection**: Tests safe read methods, same-origin mutation allowances, and cross-origin blocking (403).
- **Data Ingestion**: Tests RFC 4180 CSV parsing, quoted commas, escaped quotes (`""`), and multi-line fields.

---

## Security Notes

1. **HttpOnly Cookies**: Session tokens are stored in `parakh_token` cookies with `httpOnly: true`, `sameSite: "lax"`, and `secure: true` in production, protecting against XSS token theft.
2. **CSRF Mitigation**: State-changing endpoints (`POST`, `PUT`, `DELETE`) enforce Origin/Referer verification against the host to prevent cross-site request forgery.
3. **NoSQL Injection & ReDoS Protection**: All query parameters are validated with Zod, and search keywords are sanitized through `escapeRegex` before Mongoose queries.
4. **Credentials Protection**: Passwords are encrypted with `bcryptjs` (salt factor 10) and excluded by default (`select: false`). Connection URIs and tokens are never returned in client responses or logged to the console.
5. **HTTP Security Headers**: Injected via `next.config.ts`:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `X-DNS-Prefetch-Control: on`

---

## Known Limitations

- **OAuth & Social Login**: Third-party authentication (Google, GitHub) is not implemented.
- **Email Verification & Password Reset**: SMTP/Nodemailer flows are deferred for future milestones.
- **In-Memory Ingestion**: The ingestion CLI loads batches in memory; streaming support for multi-gigabyte datasets is deferred.
- **Admin Ingestion UI**: Ingestion remains a controlled CLI script rather than a browser upload interface per security constraints.

---

## Future Improvements

- Automated weekly email digest with recommended questions based on target companies.
- Real-time in-browser code runner / sandboxed evaluation environment.
- Company-specific interview experience and round breakdown notes.
- Granular topic mastery tracking with spaced repetition reminders.
