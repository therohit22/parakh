# PROJECT_CONTEXT.md

## Project Name
**Parakh** (परख = evaluation / assessment / testing)

## Project Type
Company-wise Coding & Technical Interview Preparation Platform

## Developer Level
3rd-year CS student — code should be simple, clean, and explainable in an interview.

## Core Purpose
Helps students prepare for technical interviews through:
- Company-wise questions
- Coding practice
- Topic-based preparation
- Difficulty levels
- Bookmarks
- Solved status and progress tracking

## Current Stage
**Deployed to Vercel with MongoDB Atlas Production Database (91/91 Tests Passing)**

## Production Infrastructure
- **GitHub Repository**: `https://github.com/therohit22/parakh.git` (branch: `main`)
- **MongoDB Atlas Cluster**: `ParakhCluster` (database: `parakh`)
- **Atlas Network Access**: Configured (`0.0.0.0/0` for Vercel Serverless Functions)
- **Deployment Platform**: Vercel (Live URL: `https://parakh-cbprulgxz-rohitkumar549nke-4272s-projects.vercel.app/`)



## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | Next.js (App Router), React, TypeScript, Tailwind CSS |
| Backend | Next.js Route Handlers (REST) |
| Database | MongoDB Atlas + Mongoose |
| Validation | Zod |
| Auth | JWT in httpOnly cookies + bcryptjs |
| Email (planned) | Nodemailer |
| Testing | Vitest |
| Deployment | Vercel (Production Ready) |

## Philosophy
- Simple, clean, explainable — no over-engineering.
- No microservices, Redis, Kafka, Docker, or unnecessary abstractions.
- Meaningful variable/function names. Comments only where they add value.
- Basic security. Proper error, loading, and empty states.
- UI: clean, realistic, responsive. Not a flashy SaaS look.

## Development Guidelines
1. Simple, clean, and explainable design first.
2. Ensure changes maintain full backward compatibility with models and endpoints.
3. Keep secrets strictly out of git version control.
4. Do not add unnecessary external technologies or dependencies.
5. All code must pass linting, typechecking, and automated test suites.
6. The project name is always "Parakh".


## Day Log
- **Day 1:** Foundation, landing page, docs.
- **Day 2:** UI foundation, routing, project structure, layout & navigation, UI components, static placeholder pages.
- **Day 3:** MongoDB Atlas + Mongoose database connection, dbConnect utility, health check route handler.
- **Day 4:** Mongoose schemas and models (User, Company, Question, Bookmark, Progress), verification health endpoint.
- **Day 5:** Authentication (registration, login, logout, current user verification, bcrypt password hashing, JWT in httpOnly cookies).
- **Day 6:** Companies and Questions CRUD functionality (public read, admin-only write), Zod validation schemas, admin role verification, safe deletion controls, and UI integration.
- **Day 7:** Search, multi-criteria filtering, safe sorting, page-based pagination, query validation with Zod, database indexes, and interactive UI integration.
- **Day 8:** User-specific persistent bookmarks and solved progress, atomic Mongoose updates, question detail page (`/questions/[slug]`), and bookmarked/solved catalog pages (`/bookmarks`, `/solved`).
- **Day 9:** Preparation Dashboard and real progress statistics (authenticated `/api/dashboard` route handler, non-N+1 aggregations, difficulty breakdown, company-wise preparation readiness, and responsive UI).
- **Day 10:** Admin Panel for Companies and Questions (server-side role verification with `requireAdmin`, admin landing `/admin` with live MongoDB counts, Company Manager `/admin/companies` with search, creation, editing, and 409 reference-protected deletion, Question Manager `/admin/questions` with search, difficulty filtering, pagination, creation with company association, editing, and reference-safe deletion, and Dark Mode/responsive support).
- **Day 11:** Reliable, idempotent CSV/JSON data ingestion system for Companies and Questions into MongoDB, CLI executable via `npm run ingest`, RFC 4180 compliant CSV parser, dry-run simulation mode, referential integrity resolution, detailed failure reporting, and comprehensive validation.
- **Day 12:** Hardening, security audit, standardized input validation & route parameter validation with Zod, CSRF Origin/Referer verification on state-changing endpoints, HTTP security headers, consistent safe error handling, automated testing suite with Vitest (44 tests covering validation, authentication, authorization, CSRF, and ingestion), and full end-to-end smoke verification.
- **Day 13:** Frontend UI polish across all application views: global typography alignment with Geist font, polished sticky navigation bar with real authentication state, user badge, and sign-out action, hero and topic/company discovery enhancements on the landing page, fallback initial avatars and card skeletons for CompanyList and QuestionList, question detail visual polish with bookmark/solved status states, dashboard and bookmark/solved skeleton loading, responsive mobile drawer, and zero-warning ESLint audit.
- **Day 14:** Production deployment preparation and final documentation: Next.js Turbopack production build audit, added `"start": "next start"` script to `package.json`, environment variable audit and template finalization (`.env.example`), `.gitignore` verification, MongoDB Atlas cached connection audit, production cookie security (`secure: true`, `httpOnly`, `sameSite: "lax"`), verification of CLI ingestion isolation from production builds, end-to-end production server smoke verification (all 24 assertions passed), comprehensive `README.md` documentation, and completion of the 14-day master plan.
- **Day 15:** Post-plan hardening, portfolio readiness, and final QA. Baseline automated checks (lint, tests, build) verified with zero errors. Eliminated dead/placeholder UI ("coming soon" in LoginForm). Key engineering decisions documented in README.md for interview explainability. Production server smoke testing executed with 24/24 passing assertions. Dependency audit confirmed zero bloat. Completed the 15-day development cycle.
- **Day 16:** API Documentation, Architecture Documentation & Interview Demo Readiness. Authored comprehensive system architecture guide (`docs/ARCHITECTURE.md`) detailing the full-stack pipeline, stateless authentication with httpOnly cookies, database relationships, and 10 in-depth interview discussion points. Created complete REST API specification (`docs/API.md`) with validation constraints, status codes, and practical curl examples for all endpoints. Built 5–10 minute project evaluation & demo script (`docs/DEMO_FLOW.md`). Enhanced `README.md` with the Project Story (problem, solution, personal engineering contributions) and documentation index. Verified all automated checks (lint, tests, build, DB ping) passed with zero errors.
- **Day 17:** Project Presentation, Resume Material & Interview Preparation. Verified factual feature inventory (all 23 core features confirmed implemented). Created 12-slide structured presentation outline (`docs/PARAKH_PRESENTATION.md`) with Mermaid architecture diagram. Authored defensible engineering resume bullets for general and internship profiles (`docs/RESUME_BULLETS.md`). Formulated 20 core interview Q&As, deep-dive follow-ups, and a 1M user scaling blueprint (`docs/INTERVIEW_QUESTIONS.md`). Wrote a 5-minute verbal walkthrough script for project vivas (`docs/PARAKH_VIVA_SCRIPT.md`). Updated `README.md` documentation index. Verified lint (0 errors), tests (44/44 passed), and build (27/27 routes compiled).
- **Day 18:** Parakh GitHub + Portfolio Release Audit. Verified repository quality, verified `.gitignore` secret isolation (no credentials, `.env*` ignored with `!.env.example` tracked, zero `NEXT_PUBLIC_` secret leaks). Created candidate portfolio profile (`docs/PORTFOLIO.md`). Updated `README.md` documentation index. Audited `package.json` dependencies (zero bloat). Verified all automated checks: lint (0 errors, 0 warnings), tests (44/44 passed), production build (27/27 routes compiled), and live server smoke tests (24/24 assertions passed).
- **Day 19:** Parakh Live Demo + Presentation Readiness. Created comprehensive live demonstration script and presentation guide (`docs/PARAKH_DEMO_SCRIPT.md`) with timestamped walkthrough (0:00–7:00), interview demo talking points, practical failure recovery plan, and screenshot capture plan. Updated `README.md` documentation index. Performed live manual curl and end-to-end user journey validations across companies, questions, search, filters, auth, bookmarks, solved tracking, and dashboard. Verified all automated checks: lint (0 errors), tests (44/44 passed), and build (27/27 routes compiled).
- **Day 20:** Parakh Final Audit + LeetCode Practice Integration + Project Handoff. Conducted final repository audit and verification. Integrated direct LeetCode practice links across Question model, validation schemas, Admin QuestionManager, Question cards, Bookmarks, Solved lists, and Question detail page. Implemented Zod URL validation rejecting unsafe protocols (`javascript:`, `data:`, `file:`) and non-LeetCode domains. Fixed CSV ingestion parser to support case-insensitive `leetcodeurl` header. Audited all existing database question records and executed live idempotent ingestion updating verified problems in MongoDB. Created comprehensive interview preparation guide (`docs/PARAKH_FINAL_INTERVIEW_GUIDE.md`) with 29 technical Q&As across 9 categories and a 15-question mock interview simulation. Updated 21-part university viva script (`docs/PARAKH_FINAL_VIVA.md`), resume defense guide (`docs/PARAKH_RESUME_DEFENSE.md`), and final handoff checklist (`docs/PARAKH_FINAL_HANDOFF.md`). Full verification: ESLint (0 errors, 0 warnings), Vitest (46/46 passed), Turbopack build (27/27 routes compiled), live browser smoke tests, and API health checks. Completed the 20-day master development plan.
- **Dataset Expansion:** Added 4 new companies (Deloitte, Infosys, Flipkart, Zomato) with official brand vector SVG logos, 86 ingested questions (81 brand new + 5 cross-company associations, bringing DB total to 88 questions), 100% verified LeetCode URLs, zero duplicate question documents, and comprehensive interview-source audit in `docs/PARAKH_COMPANY_QUESTION_SOURCES.md`.

## Completed (Day 2)
- Reorganized components: moved `Navbar.tsx` and `Footer.tsx` to `src/components/layout/`
- Implemented client component `Navbar` with active route highlighting using `usePathname` (`aria-current="page"`), link items (Home, Companies, Questions, Dashboard, Bookmarks, Login), and an auto-closing mobile menu on route changes
- Implemented server component `Footer` with site branding, navigation links, and dynamic copyright year
- Created reusable UI primitives in `src/components/ui/`: `Button` (polymorphic link/button with primary/secondary styles), `Card`, and `EmptyState`
- Rebuilt `FeatureCard` using `Card` primitive
- Configured root `layout.tsx` with sticky footer column layout (`min-h-screen flex flex-col`) and metadata title template (`%s | Parakh`)
- Created static UI shell pages (server components with metadata titles):
  - `/` (Home): linked CTA buttons to `/companies` and `/questions`
  - `/companies`: 4 static company cards with "View Questions" links
  - `/questions`: disabled search & filter controls, note, and 4 sample question cards with difficulty badges
  - `/dashboard`: 4 progress metric cards displaying `--` with future connection note
  - `/bookmarks`: `EmptyState` placeholder with action button to browse questions
  - `/login`: email and password inputs with labels, type="button" login button, omitted `<form>` to prevent accidental credential leakage in URLs, and muted "coming soon" helpers

> Note: /dashboard and /bookmarks are public placeholder pages for now and will be protected when authentication is added.

## Completed (Day 3)
- Installed dependency `mongoose`
- Built database utility `src/lib/db.ts` exporting `dbConnect()`:
  - Validates `MONGODB_URI` from `process.env` (throws clear error if undefined without leaking values)
  - Caches the connection promise on `globalThis` using strict TypeScript types (no `any`) to reuse single connection pools across Next.js dev server hot reloads
  - Resets cached promise upon connection failure to allow subsequent retries
  - Configured with `{ bufferCommands: false, serverSelectionTimeoutMS: 5000 }`
  - Connects strictly on demand when awaited, not at module import time
- Built health check Route Handler `src/app/api/health/db/route.ts`:
  - GET handler testing active DB connectivity using `mongoose.connection.db.admin().ping()`
  - Returns 200 `{ "ok": true, "database": "connected" }` on success
  - Returns 500 `{ "ok": false, "error": "Database connection failed" }` on failure, logging only `error.name` and `error.message` on server console (no stack, URI, or credentials exposed)
- Environment and Security:
  - Documented placeholder `MONGODB_URI` in `.env.example`
  - Verified `.gitignore` ignores `.env.local` and tracks `.env.example`
  - Verified no DB calls are triggered from normal page loads

> Note: `/api/health/db` is a public diagnostic endpoint for now, to be removed or protected later when authentication is added.

## Completed (Day 4)
- Implemented 5 Mongoose models in `src/models/` using safe registration pattern `(models.X as Model<IX>) || model<IX>("X", schema)` with strict TypeScript interfaces and zero `any`:
  - `User.ts`: user accounts with `select: false` password and role defaults
  - `Company.ts`: target hiring companies with unique slug
  - `Question.ts`: interview questions with unique slug, difficulty enum, topics array, companies reference array, and indexes on `companies` and `topics`
  - `Bookmark.ts`: bookmark join records with unique compound index `{ user: 1, question: 1 }`
  - `Progress.ts`: solved/attempted status join records with unique compound index `{ user: 1, question: 1 }` and explicit collection name `progress`
- Implemented temporary dev-only verification Route Handler `src/app/api/health/models/route.ts`:
  - Returns 404 in production (`NODE_ENV === "production"`)
  - Runs `init()`, `listIndexes()`, and `estimatedDocumentCount()` for all 5 models
  - Returns index names and counts without exposing schema internals or secrets
  - Performs zero data insertions
- Verified that model files do not import `dbConnect` or connect to MongoDB at import time.
- Verified Hot Module Replacement (HMR) does not throw `OverwriteModelError`.

## Completed (Day 5)
- Installed dependencies: `bcryptjs` and `jsonwebtoken` (with `@types/jsonwebtoken` and `@types/bcryptjs` in devDependencies).
- Built server-only authentication utility `src/lib/auth.ts`:
  - Signed token creation (`signToken`) with 7-day expiration.
  - Safe token verification (`verifyToken`) returning user ID and role or `null`.
  - Standardized httpOnly cookie options: `httpOnly: true`, `sameSite: "lax"`, `secure: production`, `maxAge: 7 days`, `path: "/"`.
  - Strictly reads `JWT_SECRET` on server side and fails fast if undefined.
- Implemented core authentication Route Handlers:
  - `POST /api/auth/register`: validates inputs (name, email format, password >= 6 chars), normalizes email, checks for existing accounts (409 conflict), hashes password with bcrypt (10 rounds), forces role to `"student"`, and returns safe user data (201).
  - `POST /api/auth/login`: verifies credentials using `bcrypt.compare` against `.select("+password")`, generates signed JWT, attaches httpOnly `parakh_token` cookie, returns safe user data (200), and emits generic 401 on bad credentials to prevent user enumeration.
  - `GET /api/auth/me`: validates `parakh_token` cookie, verifies JWT signature, queries MongoDB for current user profile, returns safe user data (200) or 401 Unauthorized.
  - `POST /api/auth/logout`: expires `parakh_token` cookie immediately (`maxAge: 0`) and returns success response (200).
- Connected interactive authentication UI:
  - `LoginForm.tsx` (`src/components/auth/LoginForm.tsx`) wired to `/api/auth/login` with loading/error handling.
  - `RegisterForm.tsx` (`src/components/auth/RegisterForm.tsx`) wired to `/api/auth/register` with auto-redirect.
  - Connected `/login` and created `/register` page with server component metadata titles.
- Documented `JWT_SECRET` in `.env.example`.

## Authentication Architecture & Security Decisions
- **Password Hashing**: Passwords hashed with bcrypt (salt rounds = 10) before persistence. Plaintext passwords never stored or logged.
- **Token Storage**: JWT authentication token stored exclusively in an `httpOnly` cookie (`parakh_token`). Never returned in JSON response bodies or stored in `localStorage`, preventing XSS token theft.
- **Timing & Enumeration Resistance**: Login endpoint returns identical generic error messages (`Invalid email or password`) regardless of whether the user does not exist or the password does not match.
- **Role Enforcement**: User `role` is hardcoded to `"student"` during registration; request body properties attempting to define `role` or `admin` status are ignored.
- **Stateless Verification**: Session state verified via cryptographically signed JWTs, avoiding additional database reads on non-user-lookup operations and eliminating external session storage requirements.

## Data Model

### Models Overview
| Model | Role | Key Fields & Constraints |
|-------|------|--------------------------|
| **User** | Registered student and admin profiles | `name`, `email` (unique, lowercase), `password` (`select: false`), `role` ("student" \| "admin", default "student"), timestamps |
| **Company** | Interview question company tags | `name`, `slug` (unique, lowercase), `logo`, `description`, `website`, timestamps |
| **Question** | Coding & interview questions catalog | `title`, `slug` (unique, ETL dedupe key), `description` (optional), `difficulty` ("Easy" \| "Medium" \| "Hard"), `topics` (string array), `companies` (ref Company array), `leetcodeUrl`, timestamps |
| **Bookmark** | Saved questions per user | `user` (ref User), `question` (ref Question), compound unique index `{ user: 1, question: 1 }`, timestamps |
| **Progress** | Solved and attempted question tracking | `user` (ref User), `question` (ref Question), `status` ("attempted" \| "solved"), compound unique index `{ user: 1, question: 1 }`, collection `progress`, timestamps |

### Relationships & Architecture
- **Question <-> Company**: Many-to-many relationship via `Question.companies` containing an array of `Schema.Types.ObjectId` referencing `Company`.
- **User <-> Question Join Tables**: `Bookmark` and `Progress` are decoupled independent collections joining `User` and `Question` via compound unique indexes `{ user: 1, question: 1 }`. This prevents unbound array growth inside `User` documents and ensures atomic updates.
- **Topics**: Stored as an indexed array of trimmed strings on `Question` (no separate `Topic` collection needed).
- **Question Slug**: Unique lowercase slug acts as the primary deduplication key for future dataset ingestion and ETL.

## Completed (Day 6)
- Installed and integrated `zod` for API-level request schema validation.
- Extended server authentication utilities in `src/lib/auth.ts`:
  - `getTokenFromRequest(request)`: extracts the `parakh_token` httpOnly cookie safely from Request headers.
  - `requireAdmin(request)`: verifies token validity and enforces `role === "admin"`, returning 401 for unauthenticated calls and 403 for authenticated non-admin users.
- Created reusable Zod validation schemas:
  - `src/lib/validations/company.ts`: `companySchema` and `companyUpdateSchema` (validates trimmed name, slug format, and optional URLs).
  - `src/lib/validations/question.ts`: `questionSchema` and `questionUpdateSchema` (validates title, slug format, description, difficulty enum ["Easy", "Medium", "Hard"], topics array, 24-character hexadecimal company ObjectIds, and optional LeetCode URL).
- Implemented REST Route Handlers for Companies:
  - `GET /api/companies`: Public list of companies sorted alphabetically by name.
  - `POST /api/companies`: Admin-only company creation with Zod validation and slug conflict detection (409).
  - `GET /api/companies/[slug]`: Public fetch of single company by slug (404 if not found).
  - `PUT /api/companies/[slug]`: Admin-only update with partial validation and collision prevention on slug edits.
  - `DELETE /api/companies/[slug]`: Admin-only safe deletion with referential integrity check (`Question.exists({ companies: company._id })` returns 409 conflict if questions reference the company).
- Implemented REST Route Handlers for Questions:
  - `GET /api/questions`: Public list of questions sorted by `createdAt` descending with populated company data (`name`, `slug`, `logo`).
  - `POST /api/questions`: Admin-only question creation verifying that all referenced company IDs exist before insertion.
  - `GET /api/questions/[slug]`: Public single question fetch with populated company details.
  - `PUT /api/questions/[slug]`: Admin-only update with slug collision check and company ID validation.
  - `DELETE /api/questions/[slug]`: Admin-only deletion of the target question.
- Connected UI to real APIs:
  - Created `CompanyList.tsx` (`src/components/companies/CompanyList.tsx`) fetching `/api/companies` with loading, error, and empty states.
  - Created `QuestionList.tsx` (`src/components/questions/QuestionList.tsx`) fetching `/api/questions` with loading, error, and empty states.
  - Updated `/companies` and `/questions` to render real API-backed components, eliminating hardcoded placeholder cards.

## Completed (Day 7)
- Created query validation schemas in `src/lib/validations/query.ts`:
  - `escapeRegex(text)`: sanitizes regex special characters (`[-[\]{}()*+?.,\\^$|#\s]`) to prevent ReDoS, crashes, and unexpected regex evaluation.
  - `questionQuerySchema`: validates `search`, `difficulty` (Easy|Medium|Hard), `topic`, `company`, `page` (int >= 1, default 1), `limit` (int 1-50, default 10), and `sort` (latest|oldest|title, default latest).
  - `companyQuerySchema`: validates `search`, `page` (int >= 1, default 1), `limit` (int 1-50, default 10), and `sort` (name|latest|oldest, default name).
- Extended `GET /api/companies`:
  - Supports case-insensitive keyword search matching `name` or `description` using `$or`.
  - Whitelisted safe sorting (`name` ascending, `latest`, `oldest`).
  - Server-side pagination using MongoDB `.skip()` and `.limit()` with calculated `total` and `totalPages` metadata.
- Extended `GET /api/questions`:
  - Supports case-insensitive keyword search matching `title` or `description` using `$or`.
  - Multi-criteria filtering using logical AND: `difficulty`, `topics` array matching, and `companies` ObjectId matching.
  - Company slug resolution: queries `Company.findOne({ slug })` to resolve ObjectId; returns controlled empty results `{ total: 0, totalPages: 0 }` if the company slug does not exist.
  - Safe whitelisted sorting (`latest`, `oldest`, `title`).
  - Server-side pagination using `.skip()` and `.limit()` with `countDocuments` and calculated pagination metadata.
- Database Indexing:
  - `Question`: Added index on `{ difficulty: 1 }` and `{ createdAt: -1 }` (in addition to existing `companies` and `topics` indexes).
  - `Company`: Added index on `{ name: 1 }` (in addition to existing unique `slug` index).
- Interactive UI Integration:
  - Updated `CompanyList.tsx` with live keyword search, sorting dropdown, pagination controls, and "View Questions" links with company slug query parameters.
  - Updated `QuestionList.tsx` with keyword search, difficulty dropdown, topic tag input, company slug input, sorting dropdown, pagination controls, and active filter reset.
  - Wrapped `CompanyList` and `QuestionList` in `<Suspense>` on `/companies` and `/questions` pages for Next.js App Router client navigation.

## Search, Filtering & Pagination Architecture
- **In-Database vs In-Memory**: Filtering, searching, sorting, and pagination happen entirely inside MongoDB queries (`find()`, `sort()`, `skip()`, `limit()`, `countDocuments()`). Entire collections are never fetched into Node.js application memory.
- **Regex Sanitization**: All user-provided search and topic strings are escaped via `escapeRegex()` before constructing MongoDB `$regex` expressions, preventing syntax errors and regex injection.
- **Pagination Safety**: `limit` is capped at a maximum of 50 to prevent denial-of-service / memory exhaustion via unbounded requests (e.g. `limit=1000000`). `page` must be a positive integer (>= 1).
- **Index Usage vs Substring Search**: Exact match fields (`difficulty`) and sort fields (`createdAt`, `name`) utilize B-tree indexes. Substring searches using case-insensitive `$regex` perform collection scans in standard MongoDB; this trade-off is accepted for student-level interview simplicity rather than adding an external search engine (e.g. Elasticsearch/Algolia).

## Completed (Days 1–7 QA Pass & Dark Mode)
- **Comprehensive API & Route Audit**:
  - Tested 25 automated endpoint cases spanning authentication, companies, and questions CRUD/search/filtering/pagination.
  - Verified route security: protected admin mutations (`POST/PUT/DELETE /api/companies`, `POST/PUT/DELETE /api/questions`) and user endpoints (`GET /api/auth/me`) reject unauthenticated requests with `401 Unauthorized`.
  - Verified input validation: invalid pagination (`page=0`, `limit=999`), invalid difficulty, invalid sort options, and invalid auth payloads return `400 Bad Request` with structured error messages.
  - Verified error handling: zero stack traces or credentials leaked across API responses.
- **Bugs Discovered & Fixed**:
  - *Bug 1 (Tailwind v4 Dark Mode Variant)*: Tailwind CSS v4 defaults to `prefers-color-scheme` media queries. In order to support class-based manual toggling (`<html class="dark">`), configured `@custom-variant dark (&:where(.dark, .dark *));` in `src/app/globals.css`.
  - *Bug 2 (React Compiler / ESLint Cascading Render Warning)*: Avoided synchronous `setState` in `useEffect` within `ThemeToggle.tsx` by using React 18/19's `useSyncExternalStore` with a `MutationObserver` on `document.documentElement` attributes. This ensures seamless hydration without cascading renders.
  - *Bug 3 (Theme Flash Prevention)*: Added an inline blocking script in root `<head>` of `src/app/layout.tsx` to read `localStorage.getItem("theme")` and system color scheme before DOM render, completely preventing flash of light theme on dark-mode reloads.
- **Dark Mode Implementation**:
  - Added interactive `ThemeToggle` component with Sun/Moon icons in both desktop and mobile navbar layouts.
  - Full theme coverage across all components:
    - Root background and text: `dark:bg-slate-950 dark:text-slate-100`
    - Navbar & Footer: `dark:bg-slate-900/90 dark:border-slate-800`
    - Cards: `dark:bg-slate-900 dark:border-slate-800`
    - Buttons: primary and secondary variants updated with dark mode styling
    - Inputs & Selects: `dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100`
    - Badges: Difficulty badges (Easy, Medium, Hard) enhanced with dark mode translucent backgrounds and border colors
    - Forms: Login and register cards, field borders, labels, and error alerts
    - Empty states: `EmptyState` component styled for dark mode
  - Theme persistence via `localStorage` with system preference fallback (`prefers-color-scheme: dark`).
- **Responsive Navigation**:
  - Verified mobile layout at 375px width with full hamburger menu toggle and mobile theme toggle.

## Completed (Day 8)
- **Data Model Updates**:
  - Extended `User` model (`src/models/User.ts`) with `bookmarkedQuestions` and `solvedQuestions` arrays of Question ObjectIds (`[{ type: Schema.Types.ObjectId, ref: "Question" }]`).
  - Preserved existing `Bookmark.ts` and `Progress.ts` model registrations to ensure full backward compatibility with diagnostic endpoints.
- **Atomic & Idempotent API Endpoints**:
  - `POST /api/questions/[slug]/bookmark`: Idempotently adds question to user bookmarks via `$addToSet`. Requires authentication (`requireAuth`), rejecting unauthenticated requests with `401 Unauthorized`.
  - `DELETE /api/questions/[slug]/bookmark`: Idempotently removes question from user bookmarks via `$pull`. Requires authentication.
  - `GET /api/questions/[slug]/bookmark`: Checks whether a single question is bookmarked by the current user.
  - `POST /api/questions/[slug]/solved`: Idempotently marks a question as solved for the current user via `$addToSet`.
  - `DELETE /api/questions/[slug]/solved`: Idempotently unmarks question as solved via `$pull`.
  - `GET /api/questions/[slug]/solved`: Checks whether a single question is marked solved by the current user.
  - `GET /api/questions/bookmarked`: Returns all questions bookmarked by the authenticated user, populated with company references (`name`, `slug`, `logo`). Gracefully filters out deleted questions.
  - `GET /api/questions/solved`: Returns all questions marked solved by the authenticated user, populated with company references.
  - `GET /api/auth/me`: Updated to return string arrays of `bookmarkedQuestions` and `solvedQuestions` for O(1) client lookup.
- **Question Detail UI (`/questions/[slug]`)**:
  - Created `src/app/questions/[slug]/page.tsx` and `src/components/questions/QuestionDetail.tsx`.
  - Implemented dynamic metadata title generation (`generateMetadata`).
  - Wrapped dynamic parameters inside `<Suspense>` container to adhere to Next.js 16 Partial Prefetching standards.
  - Added interactive Bookmark and Solved toggle buttons with optimistic UI updates and server synchronization.
  - Graceful handling for logged-out users: displays informative banner with a direct link to `/login` when action is attempted.
- **Question Catalog Enhancements (`/questions`)**:
  - Updated `QuestionList.tsx` to link question titles directly to `/questions/[slug]`.
  - Added visual `Solved` (emerald) and `Bookmarked` (indigo) indicators on question cards.
  - Batch authentication status lookup via `/api/auth/me` on mount to prevent N+1 API requests.
- **User List Views (`/bookmarks` and `/solved`)**:
  - Replaced static placeholder with `BookmarksList.tsx`: shows loading state, sign-in prompt for logged-out users, empty state with browse action, and list of bookmarked questions with inline "Remove" action.
  - Created `/solved` route with `SolvedList.tsx`: shows loading state, sign-in prompt for logged-out users, empty state with practice action, and list of solved questions with inline "Mark Unsolved" action.
- **Navigation**:
  - Updated `Navbar.tsx` with dedicated `Solved` link alongside `Bookmarks`.

## Bookmark & Solved Progress Architecture
- **Source of Truth**: All bookmark and solved progress is persisted strictly in MongoDB against the authenticated user document. Neither localStorage, cookies, nor client memory are treated as authoritative.
- **Idempotency with MongoDB Operators**:
  - `$addToSet` guarantees that repeated bookmark or solve requests do not create duplicate references, even under rapid consecutive clicks or network retries.
  - `$pull` safely removes existing references without error if the item is already absent.
- **Eliminating N+1 API Requests**:
  - Instead of firing individual bookmark/solved checks for every question card in a list of 10–50 items, the user's bookmarked and solved question IDs are retrieved once via `/api/auth/me` and stored in memory as lookup arrays. Card status checks run in O(1) time.

## Completed (Day 9)
- **Authenticated Dashboard API (`/api/dashboard`)**:
  - Implemented secure `GET /api/dashboard` route protected by JWT authentication (`requireAuth`), returning 401 Unauthorized for unauthenticated requests.
  - Efficiently queries MongoDB without N+1 anti-patterns:
    - Counts total questions via `Question.countDocuments()`.
    - Gathers difficulty totals via MongoDB `$group` aggregation pipeline.
    - Resolves valid solved questions via a single indexed `$in` query against `user.solvedQuestions`, automatically filtering out stale or deleted question IDs.
    - Resolves valid bookmarked questions count via indexed `countDocuments({ _id: { $in: user.bookmarkedQuestions } })`.
    - Aggregates company question totals using `$unwind` and `$group` pipeline, joined in-memory with the user's solved question counts per company.
  - Guaranteed mathematical stability: guards against division by zero (e.g. when database has 0 questions) and clamps percentages strictly between 0% and 100%.
  - Zero sensitive data leakage: returns only user display name, email, and computed statistics.
- **Preparation Dashboard UI (`/dashboard`)**:
  - Replaced static placeholder with dynamic `DashboardView.tsx` component wrapped in `<Suspense>`.
  - Personalized welcome greeting with authenticated user name.
  - 4 Key Metric Cards: Total Questions, Solved Questions, Bookmarked Questions, Remaining Questions.
  - Overall Preparation Progress: Visual Tailwind CSS progress bar with percentage and completed/remaining question counts.
  - Difficulty Progress Breakdown: Color-coded cards and progress bars for Easy (emerald), Medium (amber), and Hard (rose) with solved/total ratios.
  - Company-wise Preparation: Responsive grid of target company cards displaying company logo, name, progress bar, completion percentage, and direct practice links (`/questions?company={slug}`).
  - Quick Navigation Strip: Direct links to `/questions`, `/bookmarks`, `/solved`, and `/companies`.
  - Unauthenticated empty state with prominent "Sign In" button routing to `/login`.
  - Full Dark Mode compatibility with high-contrast surfaces and readable text.
  - Fully responsive across desktop, tablet, and mobile viewports.

## Dashboard & Statistics Architecture
- **Non-N+1 Aggregation Strategy**:
  - Instead of querying MongoDB for each company or each difficulty individually, the endpoint executes exactly 4 bulk queries:
    1. `User.findById` (retrieves the user's solved and bookmarked question arrays).
    2. `Question.countDocuments` and `Question.aggregate` (retrieves difficulty-level totals in one pass).
    3. `Question.find({ _id: { $in: solvedIds } })` (retrieves all valid solved questions and company references in one pass).
    4. `Question.aggregate([{ $unwind: "$companies" }, { $group: ... }])` and `Company.find` (retrieves company totals).
  - All company and difficulty mapping is performed in memory in O(N) linear time.
- **Reference Integrity & Stale Data Prevention**:
  - If an administrator deletes a question from the database, its ObjectId in a user's `solvedQuestions` array is simply ignored during `$in` resolution, preventing inaccurate progress statistics.

## Completed (Day 10)
- **Admin Authentication & Authorization Enforcement**:
  - Implemented `GET /api/admin/stats` protected by `requireAdmin(request)`, returning live MongoDB metrics (`totalCompanies`, `totalQuestions`, `totalUsers`) via efficient non-N+1 `countDocuments()` calls.
  - Reused existing Day 6 `requireAdmin(request)` helper on mutation endpoints (`POST/PUT/DELETE /api/companies`, `POST/PUT/DELETE /api/questions`), strictly verifying JWT signatures and claims from the httpOnly session cookie.
  - Built client-side `AdminGuard.tsx` component that queries `/api/auth/me`: displays loading feedback while verifying, an unauthorized empty state with "Sign In" CTA for logged-out visitors, a clear `403 Forbidden — Access Denied` UI for students, and renders admin children only for verified admins.
- **Admin Landing Overview (`/admin`)**:
  - Created `src/app/admin/page.tsx` and `src/components/admin/AdminNav.tsx`.
  - Displays real MongoDB counts: Total Companies, Total Questions, and Total Registered Users.
  - Provides direct navigation cards and sub-navigation links to Company Management (`/admin/companies`) and Question Management (`/admin/questions`). All links point to real routes (no `href="#"`).
- **Company Management (`/admin/companies`)**:
  - Created `src/app/admin/companies/page.tsx` and `src/components/admin/CompanyManager.tsx`.
  - Real database listing with keyword search (`/api/companies?search=...`).
  - Company Creation: modal form supporting `name`, `slug` (with auto-generation helper), `logo`, `description`, and `website`. Validated client-side and server-side with `companySchema`.
  - Company Editing: prefilled modal form submitting to `PUT /api/companies/[slug]`. Refreshes list after successful mutation.
  - Company Deletion: confirmation modal with safety guard. Submits to `DELETE /api/companies/[slug]`. If questions reference the company, the API's existing `409 Conflict` response is captured and displayed clearly without crashing.
- **Question Management (`/admin/questions`)**:
  - Created `src/app/admin/questions/page.tsx` and `src/components/admin/QuestionManager.tsx`.
  - Real database listing with keyword search, difficulty filtering (`Easy`, `Medium`, `Hard`), and page-based pagination.
  - Question Creation: modal form supporting `title`, `slug`, `difficulty`, `leetcodeUrl`, `topics` (comma-separated), and dynamic associated company selection via checkboxes loaded from live MongoDB companies. Validated with `questionSchema`.
  - Question Editing: prefilled modal form submitting to `PUT /api/questions/[slug]`.
  - Question Deletion: confirmation modal submitting to `DELETE /api/questions/[slug]`.
  - Referential Safety: preserves Day 8/9 behavior where deleted questions are safely ignored during user bookmark/solved array resolution (`filter(Boolean)`).
- **Navigation & UI Consistency**:
  - Updated `Navbar.tsx` to conditionally show the `Admin` navigation link when verified as an admin user.
  - Complete Dark Mode styling across all admin tables, modals, badges, inputs, and states.
  - Fully responsive layouts: horizontally scrollable tables and wrapped form grids on mobile screens.

## Admin Panel Security Architecture
- **Server-Side Enforcement as Ground Truth**:
  - Client-side checks and navigation hiding are UX conveniences only. Server-side middleware and route guards (`requireAdmin`) strictly verify the signed JWT stored in the httpOnly `parakh_token` cookie.
  - Request bodies attempting role spoofing (e.g. `{ role: "admin" }`) are completely ignored.
- **Referential Integrity**:
  - Company deletion is blocked with `409 Conflict` if existing questions reference its ObjectId.
  - Question creation and updates validate that all referenced company IDs exist in the database before insertion.
  - Question deletion relies on the existing safe `filter(Boolean)` and `$in` query patterns, preventing corrupted bookmarks or dashboard breakdowns.

## Completed (Day 11)
- **Data Ingestion System (`scripts/ingest/`)**:
  - Implemented standalone Node.js/TypeScript data ingestion CLI executed via `npm run ingest -- <file> [options]`.
  - Built zero-dependency, RFC 4180 compliant CSV parser (`scripts/ingest/csvParser.ts`) supporting quoted fields with embedded commas, double-quote escaping (`""`), embedded newlines, empty field normalization, and 1-indexed row tracking.
  - Built typed JSON ingestion engine supporting JSON arrays of company or question objects.
  - Implemented strict TypeScript typing with zero `any` across all scripts, using type-only imports (`import type`) compatible with Node's native type stripping (`--experimental-strip-types`).
- **Entity Ingestion & Idempotency**:
  - Stable Unique Identifier: Uses `slug` as the stable key for both Companies and Questions.
  - Upsert Semantics: If a record with the slug does not exist, it is created. If it already exists, its mutable fields are updated in-place without duplicating the document or changing its ObjectId.
  - Non-Destructive: Missing records from the input file are never deleted or modified. Existing database records remain completely intact.
  - Duplicate Prevention: Tracks `seenSlugs` within the input file to immediately reject and report duplicate slugs within the same file.
- **Referential Integrity & Company Resolution**:
  - Questions specify associated companies by human-readable company slugs (e.g., `google|amazon` in CSV or `["google", "amazon"]` in JSON).
  - Pre-queries existing companies to build an in-memory `slug -> ObjectId` map.
  - If any referenced company slug is missing from MongoDB, the question record fails validation with a clear diagnostic (`Unknown company slug: "..."`), completely preventing orphan or invalid ObjectIds.
- **Safety & Simulation Controls**:
  - Dry-Run Mode (`--dry-run`): Parses input, validates schemas, checks internal duplicates, resolves company references, and prints the exact report of what would be created/updated with zero database writes.
  - Safe Database Lifecycle: Reuses the existing `src/lib/db.ts` (`dbConnect()`), loads environment variables from `.env.local` or `.env` via `process.loadEnvFile`, and closes the Mongoose connection pool cleanly via `mongoose.disconnect()` on completion or failure.
  - Credential Protection: Suppresses connection URIs and sensitive credentials from terminal logs and failure summaries.
  - Exit Codes: Exits with code 0 on complete success (0 failures); exits with code 1 if any record fails validation or an operational error occurs.
- **Standardized Terminal Reporting (`printReport`)**:
  - Outputs a structured summary after every execution detailing Entity type, File path, Mode (Live vs Dry Run), Processed count, Created count, Updated count, Skipped count, Failed count, and itemized failure diagnostics with row/index, slug, and reason.

## Ingestion Architecture
- **Parser & Execution Engine**:
  - `scripts/ingest/csvParser.ts`: RFC 4180 compliant CSV parser with quote escaping, line tracking, and field trimming.
  - `scripts/ingest/types.ts`: TypeScript contracts for options, raw records, reports, and failures.
  - `scripts/ingest/importer.ts`: Validation engine reusing `companySchema` and `questionSchema`, company slug resolution, duplicate detection, and idempotent MongoDB upserts.
  - `scripts/ingest/ingest.ts`: CLI entrypoint handling arguments (`--type`, `--dry-run`, `--help`), environment loading, DB lifecycle, and exit code routing.
- **Supported Formats**:
  - Company CSV: `name,slug,logo,description,website`
  - Question CSV: `title,slug,description,difficulty,topics,companies,leetcodeUrl` (using `|` as the multi-value delimiter for `topics` and `companies`)
  - Company JSON: Array of objects with `name`, `slug`, optional `logo`, `description`, `website`
  - Question JSON: Array of objects with `title`, `slug`, `difficulty`, `topics` (array or string), `companies` (array or string of slugs), optional `description`, `leetcodeUrl`

## Completed (Day 12)
- **Standardized Input & Parameter Validation**:
  - Auth Validation Schemas (`src/lib/validations/auth.ts`): Built and centralized `registerSchema`, `loginSchema`, `slugParamSchema`, and `objectIdParamSchema` using Zod.
  - Safe Route Parameter Parsing: Integrated `slugParamSchema` across all dynamic slug route handlers (`/api/companies/[slug]`, `/api/questions/[slug]`, `/api/questions/[slug]/bookmark`, `/api/questions/[slug]/solved`) to reject invalid/malicious path characters with HTTP 400.
  - Bounded Query Validation: Preserved strict limits on pagination (`page >= 1`, `1 <= limit <= 50`), sorting whitelists, and regex search escaping using `escapeRegex` to prevent ReDoS or query injection.
- **CSRF & Mutation Protection**:
  - Implemented lightweight, student-level Origin/Referer verification helper `src/lib/security.ts` (`validateCsrfOrigin`).
  - Protects all state-changing endpoints (`POST`, `PUT`, `DELETE`) from cross-origin forged requests using cookie authentication without requiring heavy external dependencies.
  - Allows same-origin requests, validates `Origin` and fallback `Referer`, and permits local development origins (`localhost`, `127.0.0.1`).
- **HTTP Security Headers**:
  - Configured standard security headers in `next.config.ts`:
    - `X-Content-Type-Options: nosniff` (MIME sniffing prevention)
    - `X-Frame-Options: DENY` (Clickjacking protection)
    - `Referrer-Policy: strict-origin-when-cross-origin` (Leakage protection)
    - `X-DNS-Prefetch-Control: on`
- **Authentication & Authorization Hardening**:
  - Validated that `JWT_SECRET` is strictly server-only with no `NEXT_PUBLIC_` prefix.
  - Verified `parakh_token` cookie options: `httpOnly: true`, `sameSite: "lax"`, `secure: process.env.NODE_ENV === "production"`, `path: "/"`.
  - Ensured client-provided roles or user IDs are never trusted (registration forces `role: "student"`, all operations use `auth.user.userId`).
  - Verified passwords and JWTs are never returned in JSON bodies or logged.
- **Consistent Error Handling**:
  - Standardized HTTP status codes (400 for validation/bad request, 401 for unauthenticated, 403 for unauthorized/CSRF mismatch, 404 for missing resources, 409 for conflicts, 500 for unexpected errors).
  - Ensured stack traces, connection strings, and raw database errors are suppressed from client responses while logging clean diagnostic messages on the server.
- **Automated Test Suite (Vitest)**:
  - Added `vitest` devDependency and configured `vitest.config.ts` with Node environment and `@/*` path aliases.
  - Added `"test": "vitest run"` script to `package.json`.
  - Created 4 comprehensive test suites with 44 deterministic tests, all passing:
    1. `tests/validation.test.ts` (20 tests): Registration, login, company schema, question schema, bounded pagination, slug regex, regex escaping.
    2. `tests/auth.test.ts` (12 tests): Token signing and verification, secret validation, signature tampering rejection, expired token rejection, cookie extraction, `requireAuth`, and `requireAdmin` (401/403/allowed).
    3. `tests/security.test.ts` (7 tests): CSRF validation for safe GET methods, same-origin mutation allowance, cross-origin blocking (403), referer fallbacks, and local development allowances.
    4. `tests/ingest.test.ts` (5 tests): RFC 4180 CSV parsing, quoted fields with commas and newlines, escaped quotes, and empty line handling.

## Completed (Day 13)
- **Global Typography & Design Consistency**:
  - Configured `font-family` in `src/app/globals.css` to use `var(--font-geist-sans)` with system font fallbacks, ensuring consistent typography across all pages.
  - Added subtle custom selection colors and uniform focus rings (`focus-visible:ring-2 focus-visible:ring-indigo-500`).
- **Navigation & Authenticated Header State (`Navbar.tsx`)**:
  - Implemented dynamic user session detection via `/api/auth/me`.
  - When authenticated: Displays the user's name, role indicator (student/admin), and an accessible "Sign Out" button that hits `POST /api/auth/logout` and resets state without dead links.
  - When unauthenticated: Displays "Sign In" and "Register" actions.
  - Preserved admin-only navigation visibility (`/admin` shown strictly to users with `role: "admin"`).
  - Polished mobile navigation drawer with auto-close on route changes and responsive action buttons.
- **Homepage Polish (`src/app/page.tsx`)**:
  - Improved visual hierarchy with clean badge styling, distinct hero heading, and primary/secondary call-to-actions.
  - Added direct discovery modules for target companies (`/questions?company=google`, etc.) and popular topics (`/questions?topic=Arrays`, etc.).
  - Avoided fabricated numbers or misleading marketing claims.
- **Company & Question UI Polish**:
  - Company Cards: Added graceful fallback letter avatars when company logos are missing or fail to load, protected long company names from overflowing, and added secure external website links.
  - Question Cards: Formatted topic tags to wrap cleanly (`flex flex-wrap gap-1.5`), added distinct pill badges for difficulty levels (`Easy` in emerald, `Medium` in amber, `Hard` in rose), and verified clear bookmark/solved indicator badges.
  - Animated Skeletons: Replaced plain text loading indicators in `CompanyList`, `QuestionList`, `QuestionDetail`, `DashboardView`, `BookmarksList`, and `SolvedList` with clean animated skeleton cards.
- **Accessibility & Interaction Quality**:
  - Ensured all form controls, search bars, and dropdown selects have explicit labels or `aria-label` bindings.
  - Verified keyboard focus visibility and sufficient text-to-background contrast in both light and dark themes.
  - Eliminated all dead links or `href="#"`.
- **Code Quality & Linter Compliance**:
  - Refactored `QuestionManager.tsx` with `activeSearch` state, completely resolving the React Hook `useEffect` missing dependency warning.
  - Verified 0 errors and 0 warnings on `npm run lint`.

## Completed (Day 14)
- **Production Build Audit**:
  - Configured `"start": "next start"` script in `package.json` for running local production builds.
  - Successfully compiled the application with `next build` (Turbopack) across all 27 App Router routes with zero TypeScript errors or lint issues.
- **Environment & Secrets Audit**:
  - Audited environment variables: verified `MONGODB_URI` and `JWT_SECRET` are strictly server-only with no `NEXT_PUBLIC_` prefixes.
  - Finalized `.env.example` with clear, safe placeholders and instructions for MongoDB Atlas and Vercel.
  - Verified `.gitignore` ignores `.env*` files while retaining `.env.example`.
- **Database & Serverless Readiness**:
  - Audited `src/lib/db.ts` to confirm connection caching on `globalThis`, `bufferCommands: false`, and safe error recovery.
  - Confirmed compatibility with MongoDB Atlas network access and serverless cold-start dynamics on Vercel.
- **Authentication & Security Production Verification**:
  - Verified `AUTH_COOKIE_OPTIONS` dynamically enforces `secure: process.env.NODE_ENV === "production"`, `httpOnly: true`, and `sameSite: "lax"`.
  - Confirmed server-side role verification prevents client role spoofing.
- **Ingestion Boundary Enforcement**:
  - Confirmed `scripts/ingest` is strictly invoked via `npm run ingest` and is completely excluded from the Next.js production build bundle and runtime API routes.
- **Production Server Smoke Testing**:
  - Executed `npm run start` and ran an automated end-to-end smoke test suite against `http://localhost:3000`.
  - Verified 24 assertions covering static page rendering, security headers, user registration/login, JWT cookie attributes, `/api/auth/me`, student RBAC protection, company and question listing/search/filtering, dynamic slug routing, bookmark/solved toggle, dashboard statistics, and cookie clearance on logout. All 24 assertions passed with 0 failures.
- **Documentation Finalization**:
  - Updated `README.md` into a complete, professional, project-level guide covering overview, tech stack, architecture, project structure, setup, environment variables, full API overview, ingestion CLI, admin functionality, Vercel deployment, testing, and security.
## Completed (Day 15)
- **Baseline Automated Verification**:
  - `npm run lint`: Passed with 0 errors and 0 warnings.
  - `npm test`: Passed with 44/44 tests across 4 test suites (`tests/validation.test.ts`, `tests/auth.test.ts`, `tests/security.test.ts`, `tests/ingest.test.ts`).
  - `npm run build`: Compiled all 27 App Router routes successfully with Turbopack.
- **Dead UI & Incomplete Patterns Cleaned**:
  - Removed placeholder `"Forgot password? (coming soon)"` text from `src/components/auth/LoginForm.tsx`.
  - Repository-wide audit confirmed 0 instances of `href="#"`, `TODO`, `FIXME`, or unhandled click handlers across active application code.
- **Portfolio Readiness & Interview Documentation**:
  - Enhanced `README.md` with a structured "Key Engineering Decisions" section covering 6 core architectural decisions (Next.js App Router, stateless JWT in httpOnly cookies, Mongoose serverless connection caching, Zod validation, idempotent data ingestion, zero-trust server-side RBAC) in an interview-friendly manner.
- **Dependency & Script Audit**:
  - Confirmed all dependencies in `package.json` are actively utilized with zero bloat or unnecessary dependencies.
  - Verified `"start": "next start"` script for production server execution.
- **Production Server & Smoke Testing**:
  - Executed automated smoke test suite against `http://localhost:3000` under production server mode (`next start`).
  - Verified 24 assertions covering static page rendering, security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`), user registration, JWT authentication, RBAC enforcement (403 for students accessing admin endpoints), company & question search/filtering, slug validation (400 for malformed kebab-case), bookmarks/solved tracking, dashboard aggregations, and logout cookie expiration. All 24 assertions passed.

## Completed (Day 16)
- **Comprehensive Architecture Documentation (`docs/ARCHITECTURE.md`)**:
  - Detailed real 3-tier monolithic architecture: Browser -> Next.js App Router -> React UI -> Next.js Route Handlers -> Zod Validation / JWT Auth -> Mongoose -> MongoDB Atlas.
  - Layer-by-layer breakdown of Frontend (Server Components with isolated `"use client"` islands), API (REST route handlers, CSRF origin check, Zod boundary validation), Database (Mongoose models, connection caching on `globalThis`, compound indexes), Ingestion CLI, and Vercel serverless deployment.
  - Documented complete authentication flow (bcrypt 10 rounds, stateless JWT in `httpOnly`, `SameSite=Lax`, `secure` cookies) and distinguished Authentication (`requireAuth`) from Authorization (`requireAdmin`).
  - Documented relational data model, many-to-many question-to-company linkages, and referential integrity protection (blocking company deletion with HTTP 409 Conflict if questions reference it).
  - Documented the 10 core interview discussion points answering common architectural questions with 2–5 sentence, interview-friendly rationales.
- **Complete REST API Specification (`docs/API.md`)**:
  - Full contract reference for all 20+ implemented endpoints categorized into: Authentication, Companies, Questions, Bookmarks, Solved Progress, Dashboard, Admin, and Health Diagnostics.
  - Documented HTTP methods, URL routes, authentication requirements, Zod validation rules, response shapes, and all standard HTTP status codes.
  - Provided clean, safe curl examples using placeholder values (`example@email.com`, `example-slug`, `<JWT_COOKIE>`) without exposing real credentials.
- **5–10 Minute Demo & Evaluation Script (`docs/DEMO_FLOW.md`)**:
  - Created a structured walkthrough covering 5 core phases: Problem Statement & Discovery, Public Exploration (search, multi-filter, pagination), Student Journey (registration, login, bookmarking, marking solved, live dashboard metrics), Admin Portal (server-side RBAC, live stats, 409 conflict protection), and CLI Ingestion & Architecture defense.
- **Project Story & Portfolio Documentation (`README.md`)**:
  - Added "Project Story" defining the real-world problem (fragmented interview prep across random sheets/forums), the solution (Parakh's company-wise, topic-wise, difficulty-graded catalog), and what was personally built.
  - Linked the new documentation suite directly in the README header.
- **Targeted Code Comments**:
  - Added architectural comments to `src/lib/db.ts` (connection caching on `globalThis` for HMR/serverless), `src/lib/auth.ts` (cookie security options), `scripts/ingest/importer.ts` (company slug-to-ObjectId lookup and referential integrity enforcement), and `src/app/api/companies/[slug]/route.ts` (409 Conflict deletion guard).
- **Automated Verification**:
  - `npm run lint`: 0 errors, 0 warnings.
  - `npm test`: 44/44 passed across 4 test suites.
  - `npm run build`: All 27 App Router routes compiled successfully with Turbopack.
  - Live Database Health Ping: Responding `{"ok": true, "database": "connected"}`.

## Completed (Day 17)
- **Factual Feature Inventory Verification**:
  - Audited and verified all 23 core platform capabilities as fully implemented: company browsing, company details, question browsing, question details, search, multi-criteria filtering, bounded pagination, authentication (register/login/me/logout), JWT in httpOnly cookie, bcrypt password hashing (10 rounds), student/admin RBAC, bookmarks, solved questions, preparation dashboard with non-N+1 aggregations, admin panel with reference protection, RFC 4180 CSV/JSON ingestion, idempotent upsert by slug, Zod validation, Vitest automated tests (44 tests), dark mode with zero-flicker blocking script, responsive mobile layouts, Vercel deployment preparation, and MongoDB Atlas cached connection pooling.
- **Project Presentation Slide Deck (`docs/PARAKH_PRESENTATION.md`)**:
  - Created a 12-slide structured presentation deck covering: Title, Problem Statement, Proposed Solution, Verified Key Features, Technology Stack, System Architecture (with Mermaid flowchart), Database Design & Referential Safety, Authentication & Security Architecture, Important Engineering Decisions, Testing & Verification, Deployment Readiness, and Honest Limitations & Future Roadmap.
- **Resume Bullets & Portfolio Descriptions (`docs/RESUME_BULLETS.md`)**:
  - Authored a one-line project description.
  - Formulated 3 technical action bullets for standard software engineering resumes (Next.js 16 App Router, stateless JWT/RBAC with Zod and CSRF defense, idempotent CLI ingestion with atomic Mongoose operations).
  - Formulated 3 internship-optimized resume bullets emphasizing practical full-stack contributions, testing, and connection caching.
  - Created a concise 3–5 sentence portfolio and LinkedIn project description.
- **Interview Preparation & Scaling Guide (`docs/INTERVIEW_QUESTIONS.md`)**:
  - Prepared 20 core interview questions with concise, defensible answers matching the actual code across Architecture, Backend/API, Database, Authentication/Security, and Testing/Deployment.
  - Authored Deep-Dive follow-up sections on token expiration, role tampering prevention, foreign slug resolution, and dangling question references.
  - Documented a realistic 1M user scaling blueprint (read replicas, compound indexes, Redis caching, dedicated search engine, background workers, rate limiting) distinguishing current vs. future architecture.
  - Documented 6 honest architectural limitations and future mitigation plans.
- **5-Minute Verbal Viva & Walkthrough Script (`docs/PARAKH_VIVA_SCRIPT.md`)**:
  - Authored a conversational, natural spoken walkthrough covering Introduction, Problem, Solution, Features, Architecture, Database, Authentication, Engineering Decisions, Testing, Deployment, and Future Roadmap.
- **README Documentation Index Update**:
  - Updated `README.md` to reference all 7 documents in the `docs/` suite.
- **Automated Verification**:
  - `npm run lint`: 0 errors, 0 warnings.
  - `npm test`: 44/44 passed across 4 test suites.
  - `npm run build`: All 27 App Router routes compiled successfully with Turbopack.
  - Database health ping: Responding `{"ok": true, "database": "connected"}`.

## Completed (Day 18)
- **Repository Quality & Release Audit**:
  - Audited root directory structure: clean, conventional, and free from stray debug scripts or untracked clutter.
  - Audited `.gitignore`: `.env*` strictly ignored while tracking `.env.example`, `.next/`, `node_modules/`, `coverage/`, and `*.tsbuildinfo` excluded.
  - Audited secrets: zero occurrences of hardcoded passwords, JWT secrets, MongoDB URIs, or `NEXT_PUBLIC_` sensitive environment variables.
  - Audited naming: verified 100% consistent project naming (**Parakh**) across all code, tests, configs, and documentation. Zero occurrences of stale placeholder names (`FARAKT`, `InterviewPrep`).
  - Audited code quality: zero `TODO` or `FIXME` comments in active code; zero `console.log` statements in `src/`; all `console.error` logs sanitize output to `error.name` and `error.message`.
- **Portfolio-Ready Project Profile (`docs/PORTFOLIO.md`)**:
  - Authored student-level, interview-ready portfolio document detailing: one-line summary, short description, real-world problem statement, verified key features, technology stack, architecture summary, defensive security highlights, Vitest testing approach, Vercel/MongoDB Atlas deployment, and honest limitations with future scaling roadmap.
- **Dependency & Script Audit**:
  - Inspected `package.json`: all dependencies (`bcryptjs`, `jsonwebtoken`, `mongoose`, `next`, `react`, `react-dom`, `zod`) and devDependencies (`@tailwindcss/turbopack`, `tailwindcss`, `eslint`, `vitest`, `typescript`) are actively utilized with zero bloat or extraneous packages.
  - Confirmed all scripts (`dev`, `build`, `start`, `lint`, `ingest`, `test`) function cleanly.
- **Documentation Suite Consistency**:
  - Cross-checked `README.md`, `docs/PORTFOLIO.md`, `docs/ARCHITECTURE.md`, `docs/API.md`, `docs/DEMO_FLOW.md`, `docs/PARAKH_PRESENTATION.md`, `docs/RESUME_BULLETS.md`, `docs/INTERVIEW_QUESTIONS.md`, and `docs/PARAKH_VIVA_SCRIPT.md`. All 8 documents agree on tech stack, routes, architecture, security, and limitations.
- **Automated Verification & Product Sanity Testing**:
  - `npm run lint`: 0 errors, 0 warnings.
  - `npm test`: 44/44 tests passed across 4 test suites.
  - `npm run build`: All 27 App Router routes compiled successfully with Turbopack.
  - End-to-end smoke test suite: 24/24 assertions passed against running application (static routes, security headers, auth lifecycle, student 403 RBAC, companies/questions APIs, dynamic slug validation, bookmarks/solved tracking, dashboard statistics, logout).
  - Live Database Health Ping: Responding `{"ok": true, "database": "connected"}`.

## Completed (Day 19)
- **Live Demo & Evaluation Script (`docs/PARAKH_DEMO_SCRIPT.md`)**:
  - Authored a high-impact, 5–7 minute live demonstration script with timestamped blocks:
    - 0:00–0:30: Real-world problem statement (fragmented resources, no readiness metrics).
    - 0:30–1:00: Platform overview (company/topic-wise full-stack monolith).
    - 1:00–2:00: Company & question discovery with live keyword search and zero-flicker Dark Mode.
    - 2:00–3:00: Multi-criteria filtering, difficulty tiers, bounded pagination, and unauthenticated action guard.
    - 3:00–4:00: Student authentication lifecycle and atomic bookmark/solved toggling with optimistic UI.
    - 4:00–5:00: Real-time dashboard progress metrics and company preparation completion bars without N+1 queries.
    - 5:00–6:00: Admin portal with live counts, Company/Question CRUD, and 409 Conflict reference safety.
    - 6:00–7:00: Ingestion CLI dry-run simulation, Vitest test suite, and production deployment overview.
- **Interview Demo Talking Points**:
  - Documented concise, technically sound answers to top evaluation questions: Why MongoDB, Why Mongoose, Why Next.js App Router, JWT/httpOnly cookie security, server-side RBAC enforcement, bcrypt password salting, atomic progress persistence, search/filtering query safety, ingestion idempotency, and 1M user scaling.
- **Demo Failure Recovery Plan**:
  - Created a 5-step fallback recovery checklist for live presentations: server process inspection, database ping `/api/health/db`, environment variable check, cookie/session inspection, direct curl API fallback, and honest verbal fallback statements.
- **Screenshot Capture Plan**:
  - Defined 6 recommended high-resolution viewport screenshots for GitHub and portfolio releases.
- **Live API & Product Sanity Testing**:
  - Executed manual curl requests against running server on port 3000:
    - `curl -i http://localhost:3000/api/companies`: HTTP 200 with real companies and pagination metadata.
    - `curl -i http://localhost:3000/api/questions`: HTTP 200 with populated company details and difficulty pills.
    - `curl -s http://localhost:3000/api/questions?topic=Array`: Correctly filtered questions matching topic.
    - `curl -s http://localhost:3000/api/questions?search=Two`: Keyword search matching titles.
    - `curl -s http://localhost:3000/api/health/db`: Responding `{"ok": true, "database": "connected"}`.
- **Automated Verification**:
  - `npm run lint`: 0 errors, 0 warnings.
  - `npm test`: 44/44 tests passed across 4 test suites.
  - `npm run build`: All 27 App Router routes compiled successfully with Turbopack.

## Completed (Day 20)
- **Final Project Audit**:
  - Audited full repository for dead buttons, `href="#"`, broken links, fake statistics, exposed secrets, or outdated names.
  - Verified `package.json` dependencies: zero unneeded or duplicate dependencies.
  - Verified routing, authentication, role-based access control, Mongoose models, indexes, search/filtering, bookmarks, solved tracking, dashboard calculations, admin panel, and ingestion CLI.
- **LeetCode Practice Integration**:
  - Reused existing optional `leetcodeUrl` field on `Question` model without creating duplicate fields.
  - Enhanced Zod validation in `src/lib/validations/question.ts` and admin `QuestionManager.tsx` to reject unsafe protocols (`javascript:`, `data:`, `file:`) and non-LeetCode hostnames, ensuring only official `https://leetcode.com/problems/<slug>/` links are accepted.
  - Added compact, visually polished `LeetCode →` action on question cards across `/questions`, `/bookmarks`, and `/solved` for problems with active mappings.
  - Updated question detail page (`QuestionDetail.tsx`) with a primary `Practice on LeetCode` action in the header action bar and a dedicated LeetCode banner with `target="_blank"` and `rel="noopener noreferrer"`.
  - Implemented graceful fallback text `LeetCode practice link unavailable for this question` when `leetcodeUrl` is absent, preventing broken buttons or fake `href="#"` links.
  - Fixed CSV ingestion in `scripts/ingest/importer.ts` to support case-insensitive `leetcodeurl` extracted from RFC 4180 CSV parser.
- **Question Data Audit & Live Database Update**:
  - Audited 7 database question records:
    - `two-sum`: Verified exact match (`https://leetcode.com/problems/two-sum/`)
    - `lru-cache`: Verified exact match (`https://leetcode.com/problems/lru-cache/`)
    - `median-of-two-sorted-arrays`: Verified exact match (`https://leetcode.com/problems/median-of-two-sorted-arrays/`)
    - `valid-palindrome`: Verified exact match (`https://leetcode.com/problems/valid-palindrome/`)
    - `coin-change`: Verified exact match (`https://leetcode.com/problems/coin-change/`)
    - `duplicate-slug-test` & `valid-question`: Correctly left without LeetCode links (test fixtures without public equivalents).
  - Executed live idempotent CLI ingestion (`npm run ingest -- fixtures/questions_valid.csv --type=questions`), updating 2 records in MongoDB without duplicate creation.
- **Final Interview Guide (`docs/PARAKH_FINAL_INTERVIEW_GUIDE.md`)**:
  - Authored natural 30-second internship introduction, 2-minute spoken project explanation, and 5-minute deep-dive through the Next.js -> Route Handler -> Zod -> Auth/RBAC -> Mongoose -> MongoDB pipeline.
  - Formulated 29 technical interview questions across 9 architectural categories (including Category 9: LeetCode Practice Integration covering optional modeling, XSS prevention, missing link handling, large-scale mapping, and link rot defense), each with a 20–30 second short answer and a thorough deep-dive answer.
  - Authored difficult follow-up questions with clear distinction between CURRENT PARAKH IMPLEMENTATION and FUTURE SCALING / IMPROVEMENTS.
  - Documented "Why Did You Build It This Way?" decision analysis (Next.js, TypeScript, Tailwind CSS, MongoDB, Mongoose, Zod, bcrypt, JWT, httpOnly cookies, REST, Vercel, Atlas) with alternatives and trade-off rationales.
  - Documented honest current limitations and concrete future improvements.
  - Formulated a 15-question progressive mock interview simulation in exact specified order (including Q13 on LeetCode integration) with expected answers, interviewer signals, and follow-ups.
- **Resume Defense Guide (`docs/PARAKH_RESUME_DEFENSE.md`)**:
  - Line-by-line verification and defensibility breakdown for all 6 resume bullets from `docs/RESUME_BULLETS.md`.
  - Linked each claim to exact file paths and line ranges in the repository.
  - Outlined the exact technical implementation, anticipated interviewer challenge, and recommended defensible verbal response for each claim.
- **Final Academic Viva Script (`docs/PARAKH_FINAL_VIVA.md`)**:
  - Prepared a 21-section spoken walkthrough structured for university project evaluations and external examiner defense, including dedicated sections for Authorization (#9) and LeetCode Practice Integration (#15).
  - Kept tone conversational, structured, and free of marketing fluff.
- **Final Project Handoff Checklist (`docs/PARAKH_FINAL_HANDOFF.md`)**:
  - Compiled a complete audit checklist across Code, Database, Questions (with LeetCode practice actions and fallback handling), Authentication, Product, Documentation, and Deployment.
  - Confirmed and verified all items with real test executions.
- **Documentation Suite & README Update**:
  - Updated `README.md` Documentation Index, Feature list, and project overview.
- **Final Automated Verification**:
  - `npm run lint`: 0 errors, 0 warnings.
  - `npm test`: 46/46 tests passed across 4 test suites (added 2 unit tests for LeetCode URL validation).
  - `npm run build`: All 27 App Router routes compiled cleanly with Turbopack.
  - Live browser smoke testing: Verified question cards, question detail action bar, external LeetCode opening in new tab with `noopener noreferrer`, and graceful fallback on questions without links.
  - Live server sanity checks (`/api/health/db`, `/api/companies`, `/api/questions`, `/api/questions/[slug]`): HTTP 200 OK.

## Completed (Final End-to-End Code + Live Browser + Practical Review)
- **Comprehensive Codebase & Architecture Audit**:
  - Full inspection of Next.js 16 App Router monolith, React Server Components vs. Client Component boundaries, Route Handlers, Mongoose models, and Zod validation schemas.
  - Verified server-side RBAC enforcement: `requireAdmin()` strictly guards administrative operations and returns HTTP 403 Forbidden for student accounts.
  - Verified Mongoose connection caching on `globalThis` in `src/lib/db.ts` with `bufferCommands: false` to ensure zero socket leaks during HMR and serverless restarts.
  - Verified referential integrity protection: company deletion blocked with `409 Conflict` if existing questions reference its ObjectId.
  - Verified atomic progress and bookmark persistence with `$addToSet` and `$pull`.
- **Live Chrome Browser Verification (Student & Admin Journeys)**:
  - Executed full **Student Journey** in live Chrome browser with recorded evidence (`student_journey_review_1792357740397.webp`):
    - Account registration (`student_audit@parakh.local`), login, session detection in navbar (`student` badge).
    - Company catalog browsing, Google pre-filtered view (`/questions?company=google`).
    - Multi-criteria question filtering (Search: "Sum", Difficulty: "Easy", Topic: "Array").
    - Question detail page (`/questions/two-sum`), company pills, official LeetCode practice link (`https://leetcode.com/problems/two-sum/`).
    - Bookmarking `two-sum` and `coin-change`, marking `two-sum` as solved.
    - User list views: `/bookmarks` and `/solved`.
    - Preparation dashboard (`/dashboard`): verified real-time calculation of completion percentage (14%), difficulty breakdown, and company readiness bars without N+1 queries.
    - User sign out and session termination.
  - Executed full **Admin Journey** in live Chrome browser with recorded evidence (`admin_journey_review_1792358350253.webp`):
    - Authenticated as platform administrator (`admin@parakh.local`).
    - Verified `/admin` dashboard metrics (4 Companies, 7 Questions, 7 Users).
    - Navigated `/admin/companies` directory (Amazon, Google, Microsoft, Netflix).
    - Navigated `/admin/questions` directory and opened `+ Add Question` modal.
    - Verified `LeetCode Practice URL (optional)` form field with official placeholder.
    - Tested direct URL navigation and header sign out.
- **LeetCode Practice Integration Audit**:
  - Audited all question records for reliable LeetCode problem mappings.
  - Verified official LeetCode URLs on question catalog cards, question detail action bar, bookmarks, and solved lists.
  - Verified graceful fallback handling for problems without external links.
- **Practical Viva Section Expansion (`docs/INTERVIEW_QUESTIONS.md`)**:
  - Expanded practical viva manual across 10 architectural categories with exact codebase references (`src/app/`, `src/lib/`, `src/models/`, `scripts/ingest/`):
    1. Project Understanding & High-Level Architecture
    2. Frontend Engineering (Next.js & React)
    3. Backend & API Engineering (Route Handlers & REST)
    4. Database Design & Mongoose Modeling
    5. Authentication, Authorization & Security
    6. Search, Filtering & Pagination
    7. User Progress & Dashboard Analytics
    8. Data Ingestion & CLI Pipeline
    9. Cloud Deployment & Production Operations
    10. Scenario-Based Practical Viva Questions (failovers, attack defense, 1M user scaling roadmap)
- **Official Company Logo Assets & Data Quality Fix**:
  - Replaced broken/placeholder `example.com` image URLs in MongoDB and fixture CSVs with official local vector SVG brand assets in `public/logos/` (`google.svg`, `amazon.svg`, `microsoft.svg`, `netflix.svg`).
  - Updated Zod validation (`companySchema`) and admin form (`CompanyManager.tsx`) to accept local static asset paths (starting with `/`) alongside full URLs.
  - Implemented visually balanced, high-contrast 36x36px logo containers with proportional `object-contain` across `DashboardView.tsx` ("Company-wise Preparation"), `CompanyList.tsx`, and `CompanyManager.tsx`.
  - Added graceful `onError` fallback handling that automatically swaps broken or missing images to clean letter avatars, preventing broken-image placeholder icons.
  - Executed idempotent bulk ingestion updating MongoDB without creating duplicate records.
- **Master Audit Report (`docs/PARAKH_FINAL_AUDIT.md`)**:
  - Authored comprehensive final audit report documenting project status, code quality, backend, database, security, frontend, LeetCode audit, practical improvements, live browser results, test results, and final readiness assessment.

## Completed (Company Expansion: 4 Companies + 80+ Verified LeetCode Questions + Official Logos)
- **4 New Companies Added**:
  - **Deloitte** (`slug: "deloitte"`): Global management & tech consulting leader. Official vector SVG logo with signature green dot (`public/logos/deloitte.svg`).
  - **Infosys** (`slug: "infosys"`): Global digital services & consulting powerhouse. Official vector SVG logo in brand blue (`public/logos/infosys.svg`).
  - **Flipkart** (`slug: "flipkart"`): India's premier e-commerce ecosystem. Official vector SVG shopping icon in brand blue (`public/logos/flipkart.svg`).
  - **Zomato** (`slug: "zomato"`): Leading food delivery & restaurant discovery tech firm. Official vector SVG brand emblem in crimson red (`public/logos/zomato.svg`).
- **Official Brand SVG Assets**:
  - Stored in `public/logos/` as scalable, lightweight, high-contrast SVG assets.
  - Render with pixel-perfect aspect ratio (`object-contain`) in both light and dark modes across Company Cards, Dashboard, Company Directory, and Admin Panel.
  - Zero broken-image icons or external host failure risks.
- **86 Ingested Questions (81 Brand New + 5 Cross-Company Associations)**:
  - Total database questions: 88 (exceeds the 80 minimum new question requirement).
  - Question distribution per company:
    - **Deloitte**: 22 questions (Arrays, Strings, Two Pointers, Linked Lists, Stack, Trees, Greedy, DP)
    - **Infosys**: 22 questions (Arrays, Math, Two Pointers, Strings, DP, Trees, Bit Manipulation)
    - **Flipkart**: 22 questions (Two Pointers, Sliding Window, Monotonic Stack, Heap, Trees, Graphs, DP)
    - **Zomato**: 21 questions (Arrays, Hashing, Intervals, Matrix, Backtracking, Sliding Window, Graphs)
  - Balanced difficulty distribution across Easy, Medium, and Hard tiers.
- **Strict LeetCode URL Verification**:
  - 100% of questions across all 4 companies have verified official LeetCode practice links (`https://leetcode.com/problems/<slug>/`).
  - Slugs verified via automated HTTP requests; zero placeholder, search-result, or fake URLs.
- **Data Normalization & Deduplication**:
  - Cross-company questions (e.g. *Two Sum*, *Valid Palindrome*, *Coin Change*, *LRU Cache*, *Median of Two Sorted Arrays*) use many-to-many references in the `companies` array, avoiding duplicate Question documents.
- **Practical Viva Section Expansion (`docs/INTERVIEW_QUESTIONS.md`)**:
  - Added Section 11 covering Many-to-Many associations, deduplication rationale, dynamic progress calculation, LeetCode link validation, batch ingestion scaling (1,000+ items), slug-based idempotency, and multi-company upserts.
- **Interview Source Mapping (`docs/PARAKH_COMPANY_QUESTION_SOURCES.md`)**:
  - Complete audit file documenting question title, difficulty, topics, reported interview sources (GeeksforGeeks, LeetCode Discuss, InterviewBit), and verified LeetCode links.

## Known Limitations
- Social OAuth (Google/GitHub), email verification, and password reset flows are deferred for future milestones.
- In-database search utilizes MongoDB `$regex` matching; an inverted-index search engine (Typesense/Elasticsearch) is recommended for datasets exceeding 100,000 records.
- Questions currently link externally to LeetCode rather than embedding an in-browser containerized code execution sandbox.
- Ingestion is executed via the backend CLI; a web-based upload interface is deferred.

## Completed (Final Complete Audit, Security Hardening & Verification)
- **Comprehensive Security & Architecture Audit**:
  - Validated authentication, password hashing (`bcryptjs` cost 10), and strict credential isolation (password hashes are never selected by default, never logged, and never returned in API responses).
  - Audited cookie security: `httpOnly: true`, `sameSite: "lax"`, `secure` in production, `path: "/"`, with token expiry enforced.
  - Verified authorization & IDOR defense: `/api/dashboard`, `/api/questions/bookmarked`, `/api/questions/solved`, and question bookmark/solved actions derive user identity strictly from the verified JWT payload (`auth.user.userId`). Client-side overrides are rejected.
  - Validated admin security: all admin mutation endpoints and `/api/admin/stats` enforce `requireAdmin(request)` server-side. Direct URL access to `/admin` is guarded by `AdminGuard`.
  - Audited MongoDB query safety: input is sanitized and validated with Zod, regex search escapes all metacharacters (`escapeRegex`), pagination is capped at 50, and operator injection is prevented.
  - Referential integrity guard: deleting a company referenced by questions is strictly blocked with HTTP 409 Conflict.
  - Hardened HTTP security headers in [`next.config.ts`](file:///c:/Users/rohit/Desktop/parakh/next.config.ts): added `Strict-Transport-Security` and `Permissions-Policy` alongside `X-Content-Type-Options: nosniff` and `X-Frame-Options: DENY`.
  - Added [`tests/security-audit.test.ts`](file:///c:/Users/rohit/Desktop/parakh/tests/security-audit.test.ts) covering 16 critical security, auth, authz, IDOR, and injection test cases.
  - Verified test suite: **73 / 73 tests passing** across 6 test files.
  - Production build: `npm run build` compiled **28 / 28 routes** with 0 errors.
  - Linter: `npm run lint` passed with **0 errors and 0 warnings**.

## Completed (Final Frontend + Product Integrity Review)
- **Product & Frontend Integrity Review**:
  - Conducted end-to-end frontend review across all routes: `/`, `/companies`, `/companies/[slug]`, `/questions`, `/questions/[slug]`, `/dashboard`, `/bookmarks`, `/solved`, `/login`, `/register`, `/admin`, `/admin/companies`, `/admin/questions`.
  - Resolved `CompanyList.tsx` URL query synchronization: wired filters, search, and pagination directly to `useRouter` and `useSearchParams`, ensuring page refreshes and browser back/forward buttons maintain state.
  - Aggregated real question counts in `GET /api/companies` and `GET /api/companies/[slug]` via non-N+1 MongoDB `$group` aggregation; displayed exact question count badges on company directory cards and dedicated company track headers.
  - Removed redundant `?company=...` query param appending during pagination in `QuestionList.tsx` when viewing dedicated `/companies/[slug]` pages.
  - Implemented React 19 render-time prop synchronization pattern in `QuestionList.tsx` and `CompanyList.tsx` for input states, replacing cascading render effects and complying with zero-warning linter standards.
  - Fixed HTML5 input type in `CompanyManager.tsx` modal: changed Logo input from `type="url"` to `type="text"`, allowing local vector SVG asset paths (e.g. `/logos/google.svg`) without browser form validation blocking.
  - Added guided new-student onboarding card on `/dashboard` when zero problems are solved and zero are bookmarked, eliminating blank empty-dashboard confusion.
  - Enhanced empty states for companies with no problems (e.g. Netlify) with direct action CTAs to explore other companies or browse all questions.
  - Added accessible `aria-label` tags across question cards, LeetCode external links, and action buttons.
  - Verified all automated quality gates:
    - `npm test`: **73 / 73 tests passing** across 6 test suites.
    - `npm run lint`: **0 errors, 0 warnings**.
    - `npm run build`: **28 / 28 App Router routes compiled cleanly** with Next.js Turbopack.
    - Real browser verification: full session executed and recorded (`parakh_full_review_1792512852567.webp`).

## Completed (Senior Backend & Production Security Audit)
- **Comprehensive Backend, API, Database, and Production Readiness Audit**:
  - **Audit Scope & Threat Modeling**: Audited threat vectors A through T (unauthenticated attackers, IDOR, privilege escalation, token algorithm confusion, ReDoS, MongoDB operator injection, malicious external URLs, secret exposure, supply chain vulnerabilities).
  - **JWT Algorithm Pinning & Secret Entropy**: Hardened `verifyToken()` in `src/lib/auth.ts` to strictly pin `algorithms: ["HS256"]`, defending against algorithm confusion attacks (e.g. `alg: none` bypasses). Hardened `getJwtSecret()` to enforce minimum 32-character secret length in production.
  - **Private Cache Control**: Added `Cache-Control: private, no-store, max-age=0` to all private authenticated routes (`/api/dashboard`, `/api/auth/me`, `/api/questions/bookmarked`, `/api/questions/solved`, `/api/admin/stats`), safeguarding user progress and admin telemetry from intermediate HTTP proxy/browser cache snooping.
  - **Input & Query Bounding**: Enhanced `src/lib/validations/query.ts` and `src/lib/validations/question.ts` to bound search queries (max 100 chars), topic filters (max 50 chars), company filters (max 100 chars), and array lengths (topics capped at 30, company IDs capped at 50), preventing memory exhaustion vectors.
  - **Content-Security-Policy**: Added comprehensive CSP header in `next.config.ts` enforcing `default-src 'self'`, bounded script/style/img/connect sources, and `frame-ancestors 'none'`.
  - **Supply-Chain Audit**: Verified `npm audit --omit=dev`: **0 vulnerabilities** across all production runtime dependencies.
  - **Comprehensive Security Regression Tests**: Added tests in `tests/security-audit.test.ts` for algorithm pinning, unsigned token rejection, and Cache-Control header enforcement. All **75 / 75 tests passing** across 6 suites.
  - **Live Attack Request Verification**: Executed live requests against local Next.js server testing unauthenticated admin mutations (401), unauthenticated private dashboard requests (401), malformed JSON payloads (400), oversized pagination limits (400), negative page numbers (400), invalid sort options (400), and invalid difficulty values (400).
  - **Documentation & Reporting**: Authored `docs/PARAKH_SECURITY_AUDIT.md` detailing the security threat model, authentication lifecycle, authorization architecture, injection defenses, realistic residual risks, and deployment checklist.

## Completed (Personal Preparation Feature Expansion)
- **15-Feature Personal Interview Preparation Upgrade**:
  - **Company Preparation Roadmaps**: 3-stage progressive preparation roadmaps (Fundamentals, Core DSA, Advanced Algorithms) dynamically generated from real question data on `GET /api/companies/[slug]/roadmap` and rendered with progress indicators in `CompanyDetail.tsx`.
  - **Company-wise Progress**: Real company solved tracking and completion percentages integrated across dashboard and profile views.
  - **Topic-wise Progress & Strength Analysis**: Aggregated completion per topic with automatic strength badges (`Strong` >= 70%, `Moderate` >= 40%, `Needs Practice` < 40%) in `DashboardView.tsx` and `ProfileView.tsx`.
  - **Revision System**: Added `User.revisionQuestions` array, idempotent `POST`/`DELETE`/`GET /api/questions/[slug]/revision` endpoints, dedicated `/revision` queue view with remove/reviewed actions, and question detail toggle.
  - **Parakh Preparation Score**: Deterministic 0–100 integer score combining overall completion (35%), topic coverage (25%), company coverage (15%), revision queue depth (15%), and streak consistency (10%).
  - **Daily Practice**: Deterministic 5-problem daily question picker on `GET /api/daily-practice` (1 Easy, 3 Medium, 1 Hard) powered by bitwise hash seeding of `YYYY-MM-DD`.
  - **Personal Notes on Questions**: Created `QuestionNote` model with compound unique index `{ user: 1, question: 1 }`, 2000-char bounded plain-text storage, and full CRUD endpoints on `/api/questions/[slug]/notes`.
  - **DSA Pattern Recognition**: Extended `Question` model and indexing with `pattern` field; enhanced search and question detail badge displays.
  - **Advanced Combined Search**: Combined server-side multi-parameter filtering (company, difficulty, topic, pattern, and text search) with strict AND semantics and bounded pagination.
  - **Mock Interview Mode**: 45-minute timed interview simulator at `/mock-interview` with target company selection, real question set (Easy, Medium, Hard), live countdown timer, and session completion summary.
  - **Progress History**: Compact user activity log tracking (`User.activityLog`) incremented upon question solve events.
  - **Streak & Activity Calendar**: 30-day GitHub-style practice activity grid and consecutive active days calculation.
  - **Curated Interview Collections**: Curated sets at `/collections` (FAANG Core, Two Pointers/Sliding Window, Binary Search, DP Patterns, Trees/Graphs) reusing existing Question documents.
  - **Improved User Profile**: Enriched `/profile` with preparation score, topic strengths, streak, company progress, and account security controls.
  - **Account Security**: Authenticated password change (`POST /api/auth/change-password`) and secure cascading account deletion (`DELETE /api/auth/account`).
## Completed (Final Comprehensive E2E Production Verification Audit)
- **Live Runtime & Automated System Verification**:
  - **Live Server Execution**: Executed production server on `http://localhost:3000` against active MongoDB Atlas database (`{"ok":true,"database":"connected"}`).
  - **Full Student Lifecycle Automation**: Executed [`scripts/test_live_audit.js`](file:///c:/Users/rohit/Desktop/parakh/scripts/test_live_audit.js) covering 14 live user operations:
    1. Database health verification.
    2. Student registration (`POST /api/auth/register`).
    3. Session establishment with `httpOnly` `parakh_token` cookie (`POST /api/auth/login`).
    4. Session authentication verification (`GET /api/auth/me`).
    5. Initial zero-progress dashboard inspection (`GET /api/dashboard`).
    6. Problem bookmarking (`POST /api/questions/two-sum/bookmark`).
    7. Solved tracking and automatic daily activity log increment (`POST /api/questions/two-sum/solved`).
    8. Revision queue insertion (`POST /api/questions/two-sum/revision`).
    9. Personal notes upsert and read-back (`PUT` & `GET /api/questions/two-sum/notes`).
    10. Populated revision list retrieval (`GET /api/questions/revision`).
    11. Post-solve dashboard synchronization (solved count: 1, preparation score: 14, active streak: 1).
    12. Authenticated password change (`POST /api/auth/change-password`) and re-login verification.
    13. Personal notes deletion (`DELETE /api/questions/two-sum/notes`).
    14. Secure account deletion (`DELETE /api/auth/account`) with cascading cleanup and subsequent login rejection (HTTP 401).
  - **Admin RBAC Verification**: Executed [`scripts/test_admin_auth.js`](file:///c:/Users/rohit/Desktop/parakh/scripts/test_admin_auth.js), verifying that unauthenticated requests return 401 Unauthorized and student accounts receive strict 403 Forbidden on `/api/admin/stats`.
  - **Company Deletion Protection**: Verified referential integrity guards returning HTTP 409 Conflict if attempting to delete companies with active question references.
  - **Browser Automation Verification**: Executed Chrome browser walkthrough (`parakh_e2e_verify_1792518507710.webp`) across Homepage, Company Roadmap, Mock Interview countdown, Collections catalog, and Question Detail with verified LeetCode link.
  - **Mongoose 9 Modernization**: Eliminated deprecated `{ new: true }` in `findOneAndUpdate` calls across `api/questions/[slug]`, `api/questions/[slug]/notes`, and `api/companies/[slug]`, adopting `{ returnDocument: "after" }`.
  - **Quality Gates**:
    - `npm test`: **91 / 91 unit and integration tests passing** across 7 test suites.
    - `npm run lint`: **0 errors, 0 warnings** with strict ESLint 9 configuration.
    - `npm run build`: **40 / 40 App Router routes compiled cleanly** with Next.js Turbopack.
    - Status: **READY FOR PRODUCTION** (100% Free-Tier Compatible).

## Completed (Final Principal Full-Stack & Deployment Readiness Audit)
- **Deep Codebase Inspection & Verification**:
  - Validated all 40 Next.js routes, 23 APIs, 6 Mongoose models, and frontend client/server components.
  - Zero unused dependencies or bloated external infrastructure (no Redis, Kafka, Docker, GraphQL, or paid cloud APIs).
- **Issues Discovered & Fixed**:
  - *Issue 1 (Preparation Score Edge-Case)*: In `src/app/api/dashboard/route.ts`, when `revisionCount === 0`, `revisionScore` defaulted to 80, causing a brand-new student with 0 solved questions to receive an unearned Preparation Score of 8/100. Furthermore, adding an item to revision dropped the score back to 0. Fixed by enforcing a strict guard: when `solvedQuestions === 0`, preparation score evaluates to exactly 0, and revision score correctly rewards active review progress without penalizing initial state.
  - *Issue 2 (Preparation Score UI Breakdown Mismatch)*: In `DashboardView.tsx`, the visual percentage breakdown only totaled 90% (omitted the 10% Revision Depth weight). Added `Revision Depth (10%)` displaying `data.preparationScore.revisionRate%` so sub-metrics transparently sum to 100%.
  - *Issue 3 (Navbar Responsive Breakpoint on Tablets)*: The desktop navigation row contained up to 10 items. At `md` breakpoint (768px), horizontal spacing was too cramped, causing potential link wrapping. Upgraded the desktop breakpoint to `lg` (1024px) so 768px tablet viewports cleanly render the mobile hamburger drawer and avoid layout clipping.
  - *Issue 4 (Password Policy Hardening)*: Upgraded minimum password length policy across backend Zod validation (`registerSchema`, `changePasswordSchema`), frontend UI inputs (`RegisterForm.tsx`, `ProfileView.tsx`), and automated test suites from 6 characters to 8 characters. All existing test and admin passwords satisfy this $\ge 8$ character requirement.
- **Verification Status**:
  - `npm test`: **91 / 91 tests passing** across 7 test suites.
  - `npm run lint`: **0 errors, 0 warnings** (ESLint 9).
  - `npx tsc --noEmit`: **0 type errors**.
  - `npm run build`: **40 / 40 App Router routes compiled cleanly** (Next.js Turbopack).
  - Live server E2E student lifecycle: **14 / 14 assertions passed** (`scripts/test_live_audit.js`).
  - Admin RBAC & protection: **HTTP 401 unauthenticated & HTTP 403 student access confirmed** (`scripts/test_admin_auth.js`).
  - Multi-company question filtering & non-duplication: **10 / 10 assertions passed** (`tests/company-questions.test.ts`).
  - Browser E2E user & admin journey: Recorded session (`parakh_e2e_student_admin_journey_1792596635085.webp`).
- **Deployment Status**:
  - **READY FOR VERCEL DEPLOYMENT — PRODUCTION ACCESS BLOCKED**: Code, build, database layer, authentication, and security headers are 100% production-ready. Vercel deployment credentials are not authenticated in this CLI environment (`npx vercel whoami` prompts for interactive device code login). Authored comprehensive deployment guide in [`docs/DEPLOYMENT.md`](file:///c:/Users/rohit/Desktop/parakh/docs/DEPLOYMENT.md).

## Completed (GitHub Repository Setup & Upload)
- **Repository Configuration**:
  - Configured remote origin to `https://github.com/therohit22/parakh.git`.
  - Maintained default development branch as `main`.
  - Audited secrets: `.env.local` strictly untracked, zero credentials committed.
  - Successfully pushed `main` branch to remote (`git push -u origin main`).
  - Remote tracking confirmed (`origin/main`).

## Completed (MongoDB Atlas Migration & Production Database Preparation)
- **Database Architecture & Migration**:
  - Maintained complete isolation between local development database (`127.0.0.1:27017/parakh`) and production MongoDB Atlas cluster (`ParakhCluster`/`parakh`).
  - Audited local database: 9 companies and 115 unique verified interview questions.
  - Verified idempotent bulk ingestion pipeline for Atlas deployment:
    1. `npm run ingest -- fixtures/companies_valid.csv --type=companies` (9 companies with official vector SVG logos)
    2. `npm run ingest -- fixtures/questions_apna_college.json --type=questions` (84 questions)
    3. `npm run ingest -- fixtures/questions_expansion.json --type=questions` (86 questions, cross-company references merged via slug upserts)
  - Zero duplicates guaranteed via Mongoose unique `slug` indexes and atomic upsert operations.
  - User accounts and credentials excluded from migration to maintain clean production registration boundaries.
  - Verified baseline automated quality gates: ESLint (0 errors, 0 warnings), TypeScript (0 errors), Vitest (91/91 tests passing), and Turbopack production build (40/40 routes).







