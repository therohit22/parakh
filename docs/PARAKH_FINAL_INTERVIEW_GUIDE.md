# Parakh — Final Master Interview Guide & Technical Compendium

This master guide provides complete, technically accurate interview preparation materials for **Parakh** (परख). It includes introductory pitches, deep-dive architecture explanations, 26 core technical questions with two-tier answers (Short & Deep), difficult follow-ups, decision rationales, limitations, and a progressive 15-question mock interview simulation.

---

## A. 30-Second Project Introduction

> *"Parakh (meaning 'evaluation' in Hindi) is a full-stack, company-wise technical interview preparation web platform designed to help computer science students prepare for technical recruitment drives systematically. Built using Next.js 16 App Router, TypeScript, Tailwind CSS, and MongoDB Atlas with Mongoose, it organizes coding interview problems by target hiring companies, algorithmic topics, and difficulty tiers. It provides students with real-time preparation readiness metrics and persistent progress tracking, backed by stateless JWT authentication in httpOnly cookies, defensive Zod boundary validation, and an idempotent CLI data ingestion pipeline."*

---

## B. 2-Minute Project Explanation

> *"During campus placement season, students face severe resource fragmentation. Coding questions asked by top tech employers like Google, Amazon, or Microsoft are scattered across unorganized spreadsheets, discussion forums, and Discord channels. Students spend hours searching for company-specific problems instead of practicing, and traditional platforms don't offer company-wise readiness tracking.*
>
> *I built Parakh as a clean, full-stack monolith to solve this problem:*
> - *On the frontend, it uses Next.js 16 and React 19 Server Components for fast initial page loads and zero client-side JavaScript overhead for static pages, while interactive islands—like multi-criteria filters, search bars, and theme toggles—are designated with `"use client"`.*
> - *On the backend, Next.js Route Handlers provide RESTful APIs. Every request passes through centralized Zod schema validation and a CSRF origin check before touching our models.*
> - *For persistence, we connect to MongoDB Atlas using Mongoose. To prevent connection pool exhaustion during dev-server hot reloads and serverless cold starts, we cache the connection promise on `globalThis`.*
> - *For authentication, we use stateless JSON Web Tokens stored in `httpOnly`, `SameSite=Lax`, `secure` cookies with bcrypt password hashing (10 salt rounds), eliminating token theft via Cross-Site Scripting (XSS).*
> - *Key features include real-time dashboard analytics that calculate completion percentages without $N+1$ query loops, atomic bookmark and solved status tracking, an admin management panel with foreign key deletion protection (HTTP 409 Conflict), and an idempotent data ingestion CLI for onboarding datasets from RFC 4180 CSV and JSON files.*
> - *The entire platform is verified with 44 automated tests in Vitest and is production-ready for deployment on Vercel."*

---

## C. 5-Minute Architectural Deep-Dive

### The End-to-End Request Pipeline
```text
Browser User Action (Filter, Bookmark, Login)
   │
   ▼  [HTTPS Request + httpOnly Cookie]
Next.js 16 App Router
   │
   ├── 1. CSRF Origin Verification: Inspects 'Origin' / 'Referer' headers against host on mutations
   ├── 2. Input & Param Validation: Validates bodies, slugs, and queries with Zod schemas
   ├── 3. Authentication & RBAC: Extracts 'parakh_token' cookie, verifies JWT signature, enforces roles
   │
   ▼  [Mongoose Cached Connection on globalThis]
MongoDB Atlas Collections (Users, Companies, Questions, Bookmarks, Progress)
   │
   ├── Atomic Operations: $addToSet / $pull for user bookmarks & progress
   └── Aggregation Pipelines: $unwind / $group for non-N+1 dashboard calculations
   │
   ▼  [Sanitized JSON Response Envelope]
Client Island Component (Optimistic state update + UI re-render)
```

### Core Workflow Executions
1. **Catalog Search & Filtering Workflow**:
   - The user inputs keywords, selects difficulty (`Medium`), or clicks a topic pill (`Arrays`).
   - The client serializes state into URL search parameters (`/questions?difficulty=Medium&topic=Arrays`).
   - The Route Handler validates parameters with `questionQuerySchema` (capping `limit` at 50 to prevent DoS) and sanitizes search strings using `escapeRegex()`.
   - MongoDB executes an indexed `$or` and `$and` query with `.skip()` and `.limit()`. The populated question cards render on the client.
2. **Atomic User Progress Workflow**:
   - When an authenticated student clicks "Mark as Solved" on `/questions/two-sum`, an optimistic update immediately turns the badge emerald.
   - A `POST /api/questions/two-sum/solved` request is dispatched.
   - The server verifies the `parakh_token` cookie via `requireAuth()`, validates the slug via `slugParamSchema`, and runs an atomic `$addToSet: { solvedQuestions: question._id }` update on the `User` document.
   - Rapid consecutive clicks never produce duplicate references.
3. **Preparation Dashboard Calculation Workflow**:
   - When the student visits `/dashboard`, the server executes exactly 4 bulk database operations: user lookup, total question count with difficulty `$group`, solved question resolution via `$in`, and company-level question distribution via an `$unwind`/`$group` pipeline.
   - All mapping and completion percentages are calculated in-memory in linear $O(N)$ time, completely avoiding $N+1$ database loops.

---

## D. 26 Core Technical Interview Questions & Model Answers

### Category 1: Project Architecture

#### Q1: Why did you build Parakh as a monolith using Next.js App Router instead of separating frontend and backend?
- **Short Answer**: A monolith co-locates React 19 UI with REST Route Handlers in a single repository. It avoids cross-repository coordination, eliminates network serialization latency between frontend and backend services, simplifies deployment to Vercel, and shares TypeScript types end-to-end.
- **Deep Answer**: For a student platform, separating services introduces operational complexity (CORS configuration, distributed tracing, separate CI/CD pipelines, and duplicated validation schemas) with zero architectural payoff. Next.js App Router gives us the best of both worlds: React Server Components (RSC) fetch data directly on the server with zero client bundle overhead, while Route Handlers under `src/app/api/**` act as a standardized RESTful API layer.

#### Q2: How does Parakh distinguish between Server Components and Client Components?
- **Short Answer**: In Next.js App Router, components are React Server Components (RSC) by default. We explicitly designate components as Client Components using `"use client"` only when they require browser APIs, React state (`useState`, `useEffect`), or user event listeners.
- **Deep Answer**: Our layout wrappers, static page shells (`/`, `/companies`, `/questions`), and SEO metadata generators (`generateMetadata`) run purely on the server, streaming pre-rendered HTML to the browser. Interactive client islands—such as [`QuestionList.tsx`](file:///c:/Users/rohit/Desktop/parakh/src/components/questions/QuestionList.tsx) (for search filters), [`LoginForm.tsx`](file:///c:/Users/rohit/Desktop/parakh/src/components/auth/LoginForm.tsx), and [`ThemeToggle.tsx`](file:///c:/Users/rohit/Desktop/parakh/src/components/ui/ThemeToggle.tsx)—are isolated client components. This keeps the initial JavaScript bundle sent to the client minimal.

#### Q3: How do you prevent Hot Module Replacement (HMR) from exhausting MongoDB connections in development?
- **Short Answer**: We cache the Mongoose connection promise on `globalThis` in [`src/lib/db.ts`](file:///c:/Users/rohit/Desktop/parakh/src/lib/db.ts).
- **Deep Answer**: In development, Next.js clears the Node.js module cache on every code change to reload modules. If connection creation were module-scoped, every file save would instantiate a new Mongoose connection pool, quickly hitting MongoDB's socket connection limits. `globalThis` is not cleared during module reloads, ensuring that all subsequent API calls reuse the existing connection pool.

---

### Category 2: Database & Mongoose

#### Q4: Why MongoDB instead of a relational database like PostgreSQL?
- **Short Answer**: Interview questions naturally fit a hierarchical document model with variable-length topic arrays and multiple company tags. MongoDB allows atomic set operations (`$addToSet`, `$pull`) directly on user documents, making progress tracking race-condition free without complex relational join tables.
- **Deep Answer**: In a relational database, modeling a question with 5 topics and 3 companies requires multiple junction tables (`question_topics`, `question_companies`). While PostgreSQL handles this easily, MongoDB's BSON structure allows us to store topics as native string arrays and companies as an array of ObjectIds directly on the `Question` document. Furthermore, updating bookmarks with `$addToSet` is an atomic, single-document operation that requires no row-level locking or multi-table transaction overhead.

#### Q5: What database indexes did you create, and why?
- **Short Answer**: We created unique indexes on `User.email`, `Company.slug`, and `Question.slug`, single indexes on `Question.difficulty`, `Question.createdAt`, and `Company.name`, and multikey indexes on `Question.companies` and `Question.topics`.
- **Deep Answer**: Unique indexes on slugs and emails enforce data integrity at the database engine level, preventing duplicate registrations or collision during bulk ingestion. Multikey indexes on `companies` and `topics` allow MongoDB to perform efficient index scans when students filter questions by company slug or algorithm topic. The index on `difficulty` and `createdAt` accelerates sorting and filtering without in-memory sorting.

#### Q6: How do you handle referential integrity when an administrator deletes a company?
- **Short Answer**: Before deleting a company, our API checks `Question.exists({ companies: company._id })`. If any question references the company, the deletion is rejected with `HTTP 409 Conflict`.
- **Deep Answer**: MongoDB does not natively support SQL-style `ON DELETE RESTRICT` foreign key constraints. We enforced this constraint at the application level in [`src/app/api/companies/[slug]/route.ts`](file:///c:/Users/rohit/Desktop/parakh/src/app/api/companies/%5Bslug%5D/route.ts). If an admin attempts deletion, the handler verifies whether existing questions reference that company's ObjectId. If references exist, it aborts the deletion and returns a descriptive 409 Conflict error, preventing orphan ObjectIds in the catalog.

#### Q7: What happens if an administrator deletes a question that students have bookmarked?
- **Short Answer**: Student queries fetch questions using indexed `$in` queries. Missing or deleted question IDs are simply not returned by MongoDB, and client lists use `.filter(Boolean)` to prevent UI crashes.
- **Deep Answer**: Because bookmarks and solved progress are stored as arrays of ObjectIds on the `User` document, deleting a question document from the `questions` collection leaves a dangling ObjectId in user arrays. In [`src/app/api/dashboard/route.ts`](file:///c:/Users/rohit/Desktop/parakh/src/app/api/dashboard/route.ts) and `/api/questions/bookmarked`, we resolve valid questions using `Question.find({ _id: { $in: user.bookmarkedQuestions } })`. MongoDB ignores ObjectIds that no longer exist. This design guarantees eventual consistency without requiring expensive cascading delete operations across every registered user.

---

### Category 3: Authentication & Security

#### Q8: How does authentication work in Parakh, and where is the token stored?
- **Short Answer**: We use stateless JSON Web Tokens (JWT) signed with a server-only secret and stored inside an `httpOnly`, `SameSite=Lax`, `secure` cookie named `parakh_token`. Passwords are encrypted using `bcryptjs` with 10 salt rounds.
- **Deep Answer**: When a user logs in, the server validates their credentials against the bcrypt hash in MongoDB. Upon verification, the server generates a signed JWT containing `{ userId, role }` with a 7-day expiration and attaches it to the response as an `httpOnly` cookie. Because `httpOnly` prevents client-side JavaScript from reading the cookie, token theft via Cross-Site Scripting (XSS) is neutralized. `SameSite=Lax` ensures the cookie is sent only on same-site requests and top-level navigations, providing baseline CSRF defense.

#### Q9: How do you enforce role-based access control (RBAC), and what prevents student role tampering?
- **Short Answer**: RBAC is enforced strictly on the server by decoding verified JWT claims. In registration, `role` is hardcoded to `"student"`. Student requests calling admin endpoints fail `requireAdmin()` with `HTTP 403 Forbidden`.
- **Deep Answer**: Client-supplied role flags, request body properties, or headers are never trusted. In [`src/lib/auth.ts`](file:///c:/Users/rohit/Desktop/parakh/src/lib/auth.ts), `requireAdmin()` extracts the JWT from the cookie, cryptographically verifies its signature against `JWT_SECRET`, and inspects `payload.role`. If a student tampers with the JWT string in their browser, signature verification fails and emits a 401 Unauthorized. If an authenticated student attempts an admin mutation, `payload.role !== "admin"` evaluates to true, immediately returning `403 Forbidden`.

#### Q10: How do you protect against Cross-Site Request Forgery (CSRF)?
- **Short Answer**: We implement `validateCsrfOrigin()` in [`src/lib/security.ts`](file:///c:/Users/rohit/Desktop/parakh/src/lib/security.ts), which inspects the `Origin` or `Referer` headers on all state-changing methods (`POST`, `PUT`, `DELETE`) and verifies they match the application host.
- **Deep Answer**: Since authentication cookies are attached automatically by the browser, a malicious third-party site could attempt to forge a mutation request on behalf of a logged-in user. By asserting that the request's `Origin` or `Referer` header strictly matches the server host (or localhost during development), cross-origin forged mutations are blocked with `HTTP 403 Forbidden` before any business logic executes.

#### Q11: Why are passwords excluded by default in the User model?
- **Short Answer**: In the Mongoose schema, the `password` field is defined with `select: false`. It is never returned in queries unless explicitly requested using `.select("+password")`.
- **Deep Answer**: Accidental leakage of password hashes in API responses is a common security vulnerability. Setting `select: false` ensures that standard queries—such as fetching a user profile or inspecting session state via `/api/auth/me`—never return password hashes in the resulting JSON payload, even if a developer forgets to sanitize the document.

---

### Category 4: Search & Filtering

#### Q12: How does search work, and how do you prevent Regular Expression Denial of Service (ReDoS)?
- **Short Answer**: Keyword searches use case-insensitive MongoDB `$regex` queries across `title` and `description`. To prevent ReDoS and query injection, all user input is sanitized using `escapeRegex()`.
- **Deep Answer**: If user-provided search text containing special characters (e.g. `.*`, `(a+)+`) is passed directly to MongoDB's `$regex` operator, an attacker could trigger exponential backtracking (ReDoS) or alter query logic. Our `escapeRegex()` helper in [`src/lib/validations/query.ts`](file:///c:/Users/rohit/Desktop/parakh/src/lib/validations/query.ts) escapes all regex metacharacters (`[-[\]{}()*+?.,\\^$|#\s]`) before constructing the query, ensuring the input is treated strictly as a literal substring.

#### Q13: How does bounded pagination work?
- **Short Answer**: We use MongoDB `.skip((page - 1) * limit)` and `.limit(limit)`. Zod clamps `limit` between 1 and 50 and requires `page >= 1`.
- **Deep Answer**: Unbounded pagination allows attackers to pass extreme query parameters (e.g. `limit=500000`), forcing the database to allocate large memory buffers and serialize massive JSON payloads. Our Zod query schemas validate and bound these values, returning `HTTP 400 Bad Request` if invalid parameters are supplied. Total document counts are obtained using indexed `countDocuments()` queries.

---

### Category 5: User Progress & Dashboard

#### Q14: How does Parakh persist bookmarks and solved status atomically?
- **Short Answer**: Bookmarked and solved question IDs are stored directly on the `User` document as arrays of ObjectIds and modified atomically using MongoDB `$addToSet` (to add) and `$pull` (to remove).
- **Deep Answer**: Storing progress directly on the user document avoids the overhead of managing millions of individual join records in separate collections for simple toggling actions. Mongoose's `$addToSet` operator guarantees that duplicate IDs are never inserted, even if the user double-clicks rapidly or retries a request on a slow connection. `$pull` removes existing IDs cleanly.

#### Q15: How does the preparation dashboard calculate statistics without N+1 query loops?
- **Short Answer**: The `/api/dashboard` route handler executes exactly 4 bulk database operations, performing all company and difficulty mappings in Node.js memory in $O(N)$ linear time.
- **Deep Answer**: An $N+1$ query anti-pattern would involve querying MongoDB for each company and each difficulty tier in a loop. Instead, our endpoint runs:
  1. `User.findById` (retrieves the user's solved question IDs).
  2. `Question.countDocuments()` and a `$group` aggregation to get total questions by difficulty in one pass.
  3. `Question.find({ _id: { $in: solvedIds } })` to resolve all valid solved questions in one pass.
  4. An `$unwind` and `$group` pipeline on `Question` to calculate company-level question distribution.
  All completion percentages are calculated in-memory with division-by-zero guards, returning sub-100ms responses.

---

### Category 6: Admin Management

#### Q16: How does the admin panel ensure students cannot perform mutations?
- **Short Answer**: Every admin Route Handler (`POST`, `PUT`, `DELETE` on companies and questions) calls `requireAdmin()`. Non-admin callers receive `HTTP 403 Forbidden`.
- **Deep Answer**: Client-side UI guards (like hiding admin navigation links) are convenience features only. The actual security boundary is enforced at the HTTP handler level. Even if an attacker uses Postman or browser developer tools to send a `DELETE /api/companies/google` request, the server decodes the JWT from the cookie, observes `role: "student"`, and immediately rejects the request with a 403 Forbidden before opening a database transaction.

---

### Category 7: Data Ingestion Subsystem

#### Q17: How does bulk data ingestion work, and what makes it idempotent?
- **Short Answer**: The CLI script in [`scripts/ingest/`](file:///c:/Users/rohit/Desktop/parakh/scripts/ingest/) parses RFC 4180 CSV or JSON files and uses `slug` as the unique key. If a record with that slug exists, it updates fields in-place; if not, it inserts a new document. Running the script repeatedly produces 0 duplicate records.
- **Deep Answer**: Idempotency means multiple identical executions yield the exact same database state. In `importer.ts`, each record is validated with Zod. The script queries MongoDB by unique `slug`: if found, it updates mutable fields (name, description, difficulty, topics); if not found, it creates the document. ObjectIds never change on subsequent runs, and duplicate records within the input file are detected and rejected via an in-memory `seenSlugs` set.

#### Q18: How does question ingestion resolve company references without orphan ObjectIds?
- **Short Answer**: Before processing questions, the script pre-loads an in-memory `slug -> ObjectId` map of all existing companies in a single query. Questions referencing unmapped company slugs fail validation immediately.
- **Deep Answer**: Questions specify associated companies by human-readable slugs (e.g., `google|amazon`). Rather than executing repeated database lookups per question, the importer queries `Company.find({}, { slug: 1, _id: 1 })` once. When parsing a question, it maps each company slug to its 24-character ObjectId. If any company slug is missing from the database, validation halts for that record with a diagnostic message (`Unknown company slug: "..."`). This completely prevents corrupted or orphan ObjectIds from being inserted into question documents.

#### Q19: Why is ingestion implemented as a CLI tool rather than an admin web upload interface?
- **Short Answer**: Running ingestion via the CLI prevents serverless HTTP request timeouts, eliminates file-upload security attack vectors (such as malicious file execution), and allows developers to run safe `--dry-run` simulations before committing changes.
- **Deep Answer**: Web-based file uploads in serverless environments face strict payload size limits (e.g. 4.5MB on Vercel) and function execution timeouts (10–15 seconds). Bulk onboarding of thousands of questions could trigger gateway timeouts mid-batch. A standalone CLI (`npm run ingest`) runs in a dedicated Node.js process with zero timeout constraints, supports `--dry-run` validation, and avoids exposing multi-part upload attack surfaces on public web endpoints.

---

### Category 8: Testing & Deployment

#### Q20: What automated test suites did you write, and what do they verify?
- **Short Answer**: We wrote 4 test suites using Vitest with 44 deterministic tests covering Zod input validation, token cryptography, RBAC authorization, CSRF origin defense, and RFC 4180 CSV parsing.
- **Deep Answer**:
  1. `validation.test.ts`: Verifies registration/login schemas, company/question constraints, pagination limits, and regex escaping.
  2. `auth.test.ts`: Verifies token signing, expiration, signature tampering rejection, and `requireAuth`/`requireAdmin` role enforcement (401/403/allowed).
  3. `security.test.ts`: Verifies CSRF origin checks for same-origin allowances, safe GET methods, and cross-origin blocking (403).
  4. `ingest.test.ts`: Verifies CSV parsing of quoted commas, escaped double-quotes (`""`), empty lines, and multi-line fields.

#### Q21: How is Parakh configured for deployment on Vercel and MongoDB Atlas?
- **Short Answer**: Parakh is configured as a serverless Next.js deployment on Vercel. Static assets are served via Vercel's global Edge CDN, while Route Handlers execute as on-demand serverless functions connected to a MongoDB Atlas cluster.
- **Deep Answer**: To adapt Mongoose for serverless runtimes, we disabled command buffering (`bufferCommands: false`), set a 5000ms fail-fast server selection timeout, and cached connection promises on `globalThis`. Security headers (`nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`) are configured at the framework layer in `next.config.ts`. Environment secrets (`MONGODB_URI`, `JWT_SECRET`) are configured in Vercel project settings, ensuring they are never exposed to browser bundles.

---

### Category 9: LeetCode Practice Integration

#### Q22: Why is the `leetcodeUrl` field optional in the Question model?
- **Short Answer**: Because technical interviews include proprietary company questions, system design problems, and conceptual questions that do not have a public LeetCode equivalent. Making it mandatory would block valid questions from being added.
- **Deep Answer**: In real-world software engineering, modeling external references requires accommodating incomplete external coverage. Interview questions encompass object-oriented design, concurrency puzzles, and company-specific coding assessments that may not exist on LeetCode. In `src/models/Question.ts`, `leetcodeUrl` is defined as optional with `default: undefined`. This allows the platform to support diverse interview question types without forcing synthetic data or artificial links.

#### Q23: Why should the `leetcodeUrl` be validated on both client and server, and how is it validated?
- **Short Answer**: Unvalidated URLs can introduce stored Cross-Site Scripting (XSS) via `javascript:` or `data:` pseudoprotocols. We validate that non-empty values use `http:` or `https:`, target the `leetcode.com` hostname, and point to `/problems/<slug>/`.
- **Deep Answer**: If an attacker submits a malicious question containing `javascript:stealToken()` as the `leetcodeUrl`, any user clicking "Practice on LeetCode" could execute unauthorized code. In `src/lib/validations/question.ts`, we validate the field with Zod: parsing the URL, ensuring the protocol is strictly `http:` or `https:`, asserting the hostname is `leetcode.com` or `www.leetcode.com`, and requiring the pathname to begin with `/problems/`. The admin UI in `QuestionManager.tsx` mirrors this check for immediate user feedback.

#### Q24: Why not force every question in Parakh to have a LeetCode link?
- **Short Answer**: Forcing every question to have a link leads to data corruption, where administrators or automated scripts guess links or attach unrelated problems just to satisfy schema requirements.
- **Deep Answer**: Quality technical preparation depends on precision. If a student prepares for an Amazon interview question on "Linux File System Traversal" and the platform forces a LeetCode link, the author might attach a loosely related tree problem. This misleads the student and ruins platform credibility. By allowing `leetcodeUrl` to be omitted, Parakh maintains 100% data fidelity: questions have LeetCode links only when an authentic, verified match exists.

#### Q25: How does the UI handle questions where the LeetCode link is missing?
- **Short Answer**: The UI never displays broken buttons, `href="#"`, or disabled dead links. In lists, the link is omitted; on the detail page, a subtle, accessible fallback note states "LeetCode practice link unavailable for this question."
- **Deep Answer**: In `QuestionList.tsx`, `BookmarksList.tsx`, and `SolvedList.tsx`, the compact `LeetCode →` badge renders conditionally `{question.leetcodeUrl && ...}`. On the detail page (`QuestionDetail.tsx`), the primary header action only renders when `leetcodeUrl` exists. In the dedicated practice banner, if `leetcodeUrl` is absent, the UI gracefully renders a subtle message: `<span className="text-xs text-gray-400 dark:text-slate-500 italic">LeetCode practice link unavailable for this question</span>`, ensuring no broken interactions or dead clicks.

#### Q26: How does the ingestion pipeline preserve and update `leetcodeUrl` idempotently?
- **Short Answer**: The ingestion CLI extracts `leetcodeUrl` from JSON and case-insensitively from CSV (`leetcodeurl`), validates it through `questionSchema`, and updates existing records in-place during slug-based upserts.
- **Deep Answer**: In `scripts/ingest/importer.ts`, `rawLeetcodeUrl` handles both camelCase (JSON) and lowercase (CSV header parsed per RFC 4180). The value is validated through `questionSchema`. During upsert, if `Question.findOne({ slug })` matches an existing question, `existing.leetcodeUrl = validQuestionData.leetcodeUrl || ""` is saved in-place. If the question is new, it is created with the validated URL. Re-running the ingestion with updated URLs seamlessly refreshes links without creating duplicate question records.

#### Q27: Why use a direct official LeetCode problem URL rather than a search query link?
- **Short Answer**: Direct URLs (`https://leetcode.com/problems/two-sum/`) take students straight into the active coding workspace in one click, whereas search query URLs add friction and can surface incorrect problem variants.
- **Deep Answer**: A preparation platform's core UX metric is time-to-practice. Linking to a search query (e.g. `https://leetcode.com/problemset/all/?search=two-sum`) forces the user to sift through sponsored results, community discussions, and multiple similar problem names. Direct canonical problem URLs guarantee that the student lands directly inside the code editor for the exact problem asked by the hiring company.

#### Q28: How would you handle thousands of question-to-LeetCode mappings at scale?
- **Short Answer**: We would use an automated ingestion pipeline with a two-phase verification process: an initial algorithmic match by normalized title and slug, followed by an administrative review queue with a `--dry-run` validation audit before committing.
- **Deep Answer**: For large datasets (10,000+ questions), manual curation does not scale. We would build an ingestion script that queries LeetCode's public GraphQL API to fetch official problem slugs. An algorithm would match questions based on normalized alphanumeric titles and problem tags. Matches with high confidence (>95%) are staged automatically; ambiguous matches are flagged for admin review. The pipeline runs in `--dry-run` mode to generate a diff report of new, modified, and unmapped questions before database persistence.

#### Q29: How would you prevent incorrect mappings or link rot in a large question dataset?
- **Short Answer**: By implementing automated background URL health checks that test for HTTP 200 responses, verifying canonical problem slugs, and flagging redirected or deprecated problems.
- **Deep Answer**: Problem URLs can occasionally change or become paywalled (LeetCode Premium). In a production environment, we would run a weekly scheduled background worker (via cron or queue) that sends `HEAD` requests to all stored `leetcodeUrl` values. If an endpoint returns 404, redirects to a different slug, or requires premium authentication, the system records the anomaly in an audit log and alerts administrators on the admin dashboard for one-click remediation.

---

## E. Difficult Follow-Up Questions

### Architecture & Scale Trade-Offs

#### 1. Why Next.js instead of a separate React frontend and Express backend?
- **Current Parakh Implementation**: Next.js App Router allows full-stack TypeScript co-location in a single codebase. Server Components render directly on the server with zero client bundle overhead, and Route Handlers provide standardized REST endpoints with zero deployment friction on Vercel.
- **Future Scaling / Improvement**: If the backend logic grew to require long-lived TCP websockets, background task workers, or multi-client consumption (e.g. a native mobile app), we could extract the Route Handlers into a dedicated Node.js/Express or Go microservice.

#### 2. What happens if the JWT token expires while the user is practicing a question?
- **Current Parakh Implementation**: When the 7-day token expires, `jwt.verify()` throws a `TokenExpiredError`. The server catches this, clears the session, and returns `HTTP 401 Unauthorized`. If the student attempts to bookmark or solve a question, the client receives 401 and displays a non-intrusive banner prompting them to sign in.
- **Future Scaling / Improvement**: We could implement silent refresh token rotation using a short-lived access token (15 minutes) paired with a persistent refresh token stored in an encrypted database table.

#### 3. What happens if the MongoDB database goes down or experiences network latency?
- **Current Parakh Implementation**: Mongoose is configured with `serverSelectionTimeoutMS: 5000` and `bufferCommands: false`. If MongoDB is unreachable, queries fail fast after 5 seconds rather than hanging indefinitely. Handlers catch the database error, log `error.name` and `error.message` on the server, and return a clean `HTTP 500 Server Error` without leaking database connection URIs.
- **Future Scaling / Improvement**: We would configure multi-region replica sets with automated failover in MongoDB Atlas, paired with an in-memory circuit breaker to serve cached question catalogs during transient database outages.

#### 4. How would you scale Parakh to 1 million registered users?
- **Current Parakh Implementation**: Uses a single MongoDB Atlas database cluster with serverless Mongoose connection caching on `globalThis` and in-database aggregation pipelines.
- **Future Scaling / Improvement**:
  1. **Read Replicas**: Route all catalog browsing queries to read replicas and write mutations to the primary node.
  2. **Distributed Caching (Redis)**: Cache popular question lists, company catalogs, and user session profiles in Redis with a 5-minute TTL to reduce database reads by 80%.
  3. **Dedicated Search Engine**: Replace `$regex` collection scans with an inverted-index search engine (Typesense or Elasticsearch) for sub-10ms search across millions of problems.
  4. **Asynchronous Message Queues**: Process bulk data imports and notifications using background worker queues (BullMQ or AWS SQS).

#### 5. How would you handle concurrent bookmark updates if a user opens multiple browser tabs?
- **Current Parakh Implementation**: Updates are executed using MongoDB atomic array operators (`$addToSet` and `$pull`). Because `$addToSet` is atomic at the document level, concurrent requests in multiple tabs serialize cleanly at the database engine without race conditions or duplicate entries.
- **Future Scaling / Improvement**: If we tracked timestamps for every individual bookmark modification, we would implement optimistic concurrency control using document version keys (`__v`).

#### 6. How would you implement OAuth (Google / GitHub) without breaking the existing architecture?
- **Current Parakh Implementation**: Authentication is email/password with bcrypt hashing and JWT cookie issuance.
- **Future Scaling / Improvement**: We would add OAuth2 exchange endpoints (`/api/auth/oauth/google`). Upon successful Google authentication, the server looks up the user by email: if found, it issues our standard `parakh_token` JWT cookie; if not found, it creates a new student user and issues the cookie. The downstream application continues verifying the same signed JWT without changes.

---

## F. "Why Did You Build It This Way?" (Decision Rationales)

| Technology / Pattern | Why We Chose It | Alternative Considered | Why Alternative Was Rejected |
|---|---|---|---|
| **Next.js App Router** | Full-stack co-location, React Server Components by default, zero-config Vercel deployment. | React (Vite) + Express Backend | Requires maintaining two separate repos, configuring CORS, and managing two deployment pipelines. |
| **TypeScript 5** | Strict type safety across database models, validation schemas, and UI components. | Plain JavaScript | Prone to runtime type errors, undefined property crashes, and undocumented API payload shapes. |
| **Tailwind CSS v4** | Rapid utility-first styling, native dark mode variant support, minimal CSS bundle size. | CSS Modules / Styled Components | Higher boilerplate, runtime CSS-in-JS performance penalty, and cumbersome dark mode toggling. |
| **MongoDB Atlas** | Native document hierarchy for nested topics and company references; atomic `$addToSet`/`$pull`. | PostgreSQL | Relational join tables (`question_topics`, `question_companies`) add query complexity for simple arrays. |
| **Mongoose ODM** | Schema enforcement, lifecycle validation, TypeScript interfaces, and reference population. | Native MongoDB Driver | Native driver lacks schema enforcement, requiring manual validation boilerplate on every query. |
| **Zod Validation** | TypeScript-first schema validation at the API boundary; protects against injection and ReDoS. | Joi / Yup | Zod infers TypeScript types directly from schemas, avoiding duplicated type definitions. |
| **Bcryptjs (10 rounds)** | Adaptive work factor and unique per-hash salting protects against rainbow tables and GPU cracking. | SHA-256 / MD5 | SHA-256 is unsalted and fast, making it vulnerable to brute-force dictionary attacks. |
| **JWT in HttpOnly Cookie** | Stateless authentication that cannot be read by client-side JavaScript, neutralizing XSS token theft. | `localStorage` Token Storage | Any XSS vulnerability allows malicious scripts to extract tokens stored in `localStorage`. |
| **REST API Route Handlers** | Simple, standard HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`) with predictable status codes. | GraphQL | GraphQL adds query complexity, caching hurdles, and unnecessary library overhead for our CRUD endpoints. |
| **CLI Ingestion Engine** | Prevents serverless HTTP timeouts, eliminates web file upload attack vectors, and allows dry-runs. | Admin Web Upload Form | Serverless request timeouts (10-15s) and multi-part upload vulnerabilities create reliability risks. |

---

## G. Current Limitations vs. Future Improvements

### Current Limitations (Discovered in Codebase)
1. **Substring Regex Search**: Keyword search uses MongoDB `$regex`, performing collection scans on un-indexed text fields.
2. **Email/Password Only**: No third-party OAuth2 (Google/GitHub) authentication is currently implemented.
3. **CLI-Only Ingestion**: Data ingestion requires running terminal commands rather than an admin web dashboard.
4. **In-Memory Batch Ingestion**: The CSV/JSON parser loads records into memory before upserting, which is bounded by Node process memory limits.
5. **External Code Links**: Questions link externally to LeetCode rather than supporting an embedded in-browser code editor.

### Future Improvements Roadmap
1. **Typesense / Elasticsearch Integration**: Implement an external inverted-index search engine for typo-tolerant, sub-millisecond search across millions of questions.
2. **OAuth2 Single Sign-On**: Integrate Google and GitHub authentication providers.
3. **Asynchronous Background Ingestion**: Build an admin web drag-and-drop file upload interface backed by BullMQ workers and Redis.
4. **Streaming CSV Parser**: Implement Node.js stream transforms to ingest multi-gigabyte datasets with constant memory usage.
5. **In-Browser Code Execution Sandbox**: Integrate Judge0 or a WebAssembly-based code execution sandbox for practicing solutions directly on Parakh.

---

## H. Mock Technical Interview (15 Progressive Questions)

### Q1: What is Parakh?
- **Expected Answer**: Parakh is a full-stack, company-wise technical interview preparation platform designed for computer science students. Built with Next.js 16 App Router, TypeScript, Tailwind CSS, and MongoDB Atlas with Mongoose, it organizes coding and technical interview problems by target hiring companies, core computer science topics, and difficulty tiers, providing persistent progress tracking and real-time readiness analytics.
- **Key Points Looking For**: Clear definition, audience, technology stack, and core value proposition.
- **Follow-up**: *"What motivated you to build this platform?"*

### Q2: Why did you build Parakh?
- **Expected Answer**: During campus placement preparation, students face severe resource fragmentation. Coding questions asked by top tech firms like Google, Amazon, and Microsoft are scattered across unorganized spreadsheets, Discord channels, and discussion boards. Students spend hours searching for company-specific problems instead of practicing, and generic platforms do not track company-specific preparation readiness. I built Parakh as a clean, centralized monolith to solve this problem.
- **Key Points Looking For**: Real-world user problem, motivation, gap in existing solutions.
- **Follow-up**: *"What technologies did you choose and why?"*

### Q3: What technologies did you use?
- **Expected Answer**: For the frontend, I used Next.js 16 App Router with React 19 Server Components and Tailwind CSS v4. For the backend, I used co-located Next.js Route Handlers delivering RESTful APIs. For data persistence, I chose MongoDB Atlas with Mongoose ODM. For validation, I used Zod across all boundaries. For authentication, I implemented stateless JWTs stored in `httpOnly`, `SameSite=Lax` cookies with bcryptjs password hashing. For testing, I used Vitest.
- **Key Points Looking For**: Coherent full-stack justification, modern toolchain, deliberate technology choices.
- **Follow-up**: *"How are these technologies organized architecturally?"*

### Q4: Explain the architecture.
- **Expected Answer**: Parakh is a modular three-tier monolith. The presentation tier leverages React Server Components by default for fast initial paints and zero client bundle size, with interactive client islands (`"use client"`) isolated to filters, search inputs, and modal dialogs. The API tier uses Route Handlers where requests pass through CSRF origin checks, Zod input validation, and JWT authorization before invoking Mongoose models. The database tier connects to MongoDB Atlas using a cached connection on `globalThis` with disabled command buffering.
- **Key Points Looking For**: Server vs. client component boundaries, request pipeline, connection management.
- **Follow-up**: *"How does authentication work from login to protected requests?"*

### Q5: Explain authentication.
- **Expected Answer**: Authentication is stateless and cookie-based. When a user registers or logs in, their password is encrypted using bcrypt with 10 salt rounds and stored in MongoDB (`password` field has `select: false`). Upon validation, the server signs a JWT containing `userId` and `role` with a 7-day expiration, and sends it back in an `httpOnly`, `SameSite=Lax`, `secure: production` cookie named `parakh_token`. On subsequent requests, the server extracts and cryptographically verifies the token.
- **Key Points Looking For**: Password salting/hashing, stateless JWT mechanics, cookie security attributes (`httpOnly`, `SameSite`, `secure`).
- **Follow-up**: *"How do you differentiate between student and admin privileges?"*

### Q6: Explain authorization.
- **Expected Answer**: Authorization is enforced strictly on the server using role-based access control (RBAC). In `src/lib/auth.ts`, we provide `requireAuth()` for student actions (bookmarks, solved tracking) and `requireAdmin()` for administrative mutations (creating, updating, or deleting companies and questions). The middleware inspects the verified JWT payload's `role` property (`student` vs. `admin`). If a student attempts an admin route, the server returns HTTP 403 Forbidden, regardless of client UI state.
- **Key Points Looking For**: Server-side vs. client-side authorization, zero-trust role verification, HTTP 403 responses.
- **Follow-up**: *"How did you design the database schemas and relationships?"*

### Q7: Explain MongoDB schema design.
- **Expected Answer**: We use 3 primary collections: `User`, `Company`, and `Question`. Questions reference Companies through an array of `Schema.Types.ObjectId` referencing the `Company` collection. Users store user progress directly as arrays of Question ObjectIds (`bookmarkedQuestions` and `solvedQuestions`). Slugs on Companies and Questions are indexed and unique. We also maintain multikey indexes on `Question.companies`, `Question.topics`, and `Question.difficulty` for fast filtering.
- **Key Points Looking For**: Document referencing vs. embedding, indexing strategy, data normalization.
- **Follow-up**: *"How does the search and filtering pipeline query this data?"*

### Q8: Explain search and filtering.
- **Expected Answer**: Search and multi-criteria filtering execute entirely in the database engine. In `GET /api/questions`, query parameters (`search`, `difficulty`, `topic`, `company`, `sort`, `page`, `limit`) are validated via Zod. The search string is sanitized using an `escapeRegex()` utility to prevent ReDoS, and queries use `$regex` with `$options: "i"` across title and description. Filtering applies indexed `$in` matches. Pagination is strictly bounded between 1 and 50 using `.skip()` and `.limit()`.
- **Key Points Looking For**: In-database query construction, avoiding in-memory filtering, regex sanitization, pagination bounds.
- **Follow-up**: *"How do bookmarks and solved progress remain consistent under concurrent usage?"*

### Q9: Explain bookmarks and solved progress.
- **Expected Answer**: When an authenticated user toggles a bookmark or solved status, the client applies an optimistic UI update while sending a POST request to `/api/questions/[slug]/bookmark` or `/solved`. The server executes atomic Mongoose array updates: `$addToSet` to add the question's ObjectId and `$pull` to remove it. Because `$addToSet` is atomic at the document level, rapid consecutive clicks or network retries are completely idempotent and cannot produce duplicate entries.
- **Key Points Looking For**: Idempotent operations, atomic array modifiers (`$addToSet`, `$pull`), optimistic UI with server consistency.
- **Follow-up**: *"How does the dashboard compute progress metrics without performance degradation?"*

### Q10: Explain dashboard statistics.
- **Expected Answer**: The preparation dashboard computes overall completion percentage, difficulty ratios (Easy/Medium/Hard), and company-wise readiness bars. To prevent $N+1$ query degradation, it executes exactly 4 bulk database operations: fetching the user's solved IDs, grouping total questions by difficulty via `$group`, retrieving solved question details via `$in`, and calculating company distributions via an `$unwind`/`$group` aggregation. All ratio mathematics run in-memory in linear $O(N)$ time with division-by-zero guards.
- **Key Points Looking For**: Eliminating N+1 query loops, MongoDB aggregation pipelines, defensive numeric calculations.
- **Follow-up**: *"How do you import large volumes of questions and companies reliably?"*

### Q11: Explain ingestion and idempotency.
- **Expected Answer**: Ingestion is implemented as an isolated CLI command (`npm run ingest -- <file>`) supporting RFC 4180 CSV and JSON formats. It enforces idempotency using `slug` as the stable unique key: existing records are updated in-place and new records are created without altering ObjectIds. It pre-loads an in-memory company slug map to resolve foreign references in a single query, validates all rows with Zod schemas, and supports a `--dry-run` simulation flag to inspect imports before committing to the database.
- **Key Points Looking For**: ETL design, idempotency by slug, CLI isolation from web request timeouts, reference resolution.
- **Follow-up**: *"What security risks did you prioritize and defend against?"*

### Q12: Explain security decisions.
- **Expected Answer**: We implemented defense-in-depth:
  1. **XSS Mitigation**: Session tokens are stored in `httpOnly` cookies inaccessible to client JavaScript.
  2. **CSRF Defense**: `validateCsrfOrigin()` verifies `Origin` and `Referer` headers against the application host on state-changing requests, complemented by `SameSite=Lax`.
  3. **Injection & ReDoS Prevention**: Zod boundary validation on all inputs and `escapeRegex()` on search queries.
  4. **HTTP Security Headers**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and strict referrer policies.
  5. **Credential Security**: bcrypt password hashing with 10 salt rounds and `select: false` on password fields.
- **Key Points Looking For**: Broad security awareness across OWASP top vulnerabilities, concrete implementation details.
- **Follow-up**: *"How are external practice links integrated, and why is LeetCode practice integration designed this way?"*

### Q13: Explain LeetCode integration.
- **Expected Answer**: Every coding question supports an optional `leetcodeUrl` field linking directly to the official problem on LeetCode (`https://leetcode.com/problems/<slug>/`). The field is optional because interview assessments include company-specific and system design questions that do not have a LeetCode counterpart. URLs are validated on both client and server to reject unsafe pseudoprotocols (`javascript:`, `data:`) and non-LeetCode hosts. On the UI, question cards show a compact `LeetCode →` link, while the detail page displays a prominent `Practice on LeetCode` action with `target="_blank"` and `rel="noopener noreferrer"`. Questions without links display a subtle unavailable notice without broken buttons or fake `href="#"` links.
- **Key Points Looking For**: Optional field modeling, stored XSS prevention via URL validation, no fake links, tab nabbing prevention (`noopener noreferrer`).
- **Follow-up**: *"How would you scale Parakh if traffic increased to 1 million active users?"*

### Q14: How would you scale Parakh?
- **Expected Answer**: At 1 million users, we would evolve the architecture in four areas:
  1. **Search**: Replace in-database `$regex` scans with an inverted-index search engine (Typesense or Elasticsearch) for sub-10ms queries.
  2. **Caching**: Introduce a Redis caching layer for top company problem sets, question details, and active user profiles with a 5-minute TTL.
  3. **Database Replicas**: Distribute catalog read queries across MongoDB Atlas read replicas while reserving the primary node for user mutations.
  4. **Background Jobs**: Offload bulk ingestion and notification tasks to asynchronous queues (BullMQ/Redis or AWS SQS).
- **Key Points Looking For**: Identifying realistic bottlenecks, caching strategies, horizontal read replication, asynchronous queuing.
- **Follow-up**: *"What would you improve if you had more time?"*

### Q15: What would you improve?
- **Expected Answer**: Given more development time, I would focus on:
  1. **OAuth2 Single Sign-On**: Integrating Google and GitHub authentication for faster student onboarding.
  2. **Email Verification & Password Reset**: Adding transactional email delivery via Nodemailer/SendGrid with secure token expiry.
  3. **In-Browser Code Execution**: Embedding Monaco Editor with a sandboxed WebAssembly or Judge0 runner so students can execute code directly on the platform.
  4. **Automated URL Health Auditing**: Running a scheduled background health-check service to verify `leetcodeUrl` endpoints and flag deprecated or paywalled problems.
- **Key Points Looking For**: Realistic product roadmap, self-awareness of current project scope, practical engineering enhancements.
