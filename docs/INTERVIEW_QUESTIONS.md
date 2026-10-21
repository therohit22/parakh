# Parakh — Technical Viva & Practical Interview Questions Guide

This comprehensive guide is designed for university viva evaluations, capstone project defenses, and technical interview discussions for **Parakh** (परख). Every question and answer is grounded directly in the actual Parakh implementation, citing specific source files, architectural decisions, security boundaries, and database query designs.

---

## 1. Project Understanding & High-Level Architecture

### Q1.1: Why did you build Parakh? What problem does it solve?
- **Code Context**: [`README.md`](file:///c:/Users/rohit/Desktop/parakh/README.md), [`src/app/page.tsx`](file:///c:/Users/rohit/Desktop/parakh/src/app/page.tsx)
- **Technical Answer**: During college campus recruitment seasons, students face acute resource fragmentation. Interview coding problems asked by top hiring firms (Google, Amazon, Microsoft, Netflix) are scattered across unstructured spreadsheets, Discord channels, and unverified blogs. Students waste critical preparation time searching for what companies actually ask instead of practicing. Furthermore, traditional coding platforms focus on generic algorithmic problem counts without providing company-specific readiness tracking. Parakh solves this by providing a unified, curated platform that maps problems to hiring companies, topics, and difficulty tiers, backed by real-time readiness analytics and official practice links.
- **Examiner Intent**: Evaluating motivation, domain problem clarity, and user empathy.

### Q1.2: Who is the target user of Parakh?
- **Code Context**: [`src/models/User.ts`](file:///c:/Users/rohit/Desktop/parakh/src/models/User.ts)
- **Technical Answer**: Parakh serves two primary user personas:
  1. **Students / Job Candidates (`role: "student"`)**: Computer science undergraduates preparing for technical interviews who need curated question sets filtered by target employer, progress tracking, personal bookmarks, and company-wise completion metrics.
  2. **Placement Coordinators / Platform Administrators (`role: "admin"`)**: University placement cell members or curriculum admins who manage the company catalog, curate the question repository, and run bulk data ingestion pipelines from past placement records.
- **Examiner Intent**: Demonstrating clear role-based design and product scope boundaries.

### Q1.3: Explain the complete end-to-end architecture of Parakh.
- **Code Context**: [`docs/ARCHITECTURE.md`](file:///c:/Users/rohit/Desktop/parakh/docs/ARCHITECTURE.md), [`src/app/`](file:///c:/Users/rohit/Desktop/parakh/src/app/), [`src/lib/`](file:///c:/Users/rohit/Desktop/parakh/src/lib/)
- **Technical Answer**: Parakh is engineered as a full-stack monolith using Next.js 16 App Router:
  - **Presentation Layer**: Built with React 19 and Tailwind CSS. Employs React Server Components (RSC) for fast initial rendering with zero JavaScript bundle overhead, and client components (`"use client"`) for interactive islands (search inputs, filters, modals).
  - **API Layer**: Implemented using Next.js Route Handlers (`src/app/api/**/route.ts`). Requests pass through security middleware (`validateCsrfOrigin`, `requireAuth`, `requireAdmin`) and input validation schemas (`src/lib/validations/`) before reaching database controllers.
  - **Data Persistence Layer**: MongoDB Atlas cloud cluster queried via Mongoose ODM models (`User`, `Company`, `Question`). Connection pooling is managed through a cached promise on `globalThis` in `src/lib/db.ts`.
  - **External Integrations**: Official LeetCode problem URLs (`leetcodeUrl`) for direct in-browser practice without storing copyrighted problem descriptions.
- **Examiner Intent**: Assessing systemic understanding from browser click to cloud database.

---

## 2. Frontend Engineering (Next.js & React)

### Q2.1: Why did you choose Next.js instead of a separate React SPA + Express.js backend?
- **Code Context**: [`package.json`](file:///c:/Users/rohit/Desktop/parakh/package.json), [`next.config.ts`](file:///c:/Users/rohit/Desktop/parakh/next.config.ts)
- **Technical Answer**: A separated React SPA + Express architecture requires maintaining two independent git repositories, two deployment pipelines, handling Cross-Origin Resource Sharing (CORS) configurations, and suffering from client-side network waterwalls where the browser must download a large JavaScript bundle before making secondary REST requests. Next.js unified full-stack architecture allows server-side data fetching without CORS, co-located TypeScript interfaces between frontend and backend, single-command zero-configuration deployment on Vercel, and hybrid Server/Client component rendering.
- **Examiner Intent**: Understanding architecture trade-offs and operational simplicity vs. multi-repo overhead.

### Q2.2: Why use Next.js App Router over Pages Router?
- **Code Context**: [`src/app/layout.tsx`](file:///c:/Users/rohit/Desktop/parakh/src/app/layout.tsx), [`src/app/page.tsx`](file:///c:/Users/rohit/Desktop/parakh/src/app/page.tsx)
- **Technical Answer**: App Router utilizes React Server Components by default, enabling streaming SSR, nested layouts, and fine-grained loading/error boundaries (`loading.tsx`, `error.tsx`). In Pages Router, `getServerSideProps` forces the entire page tree to re-render and re-hydrate on every navigation, bloating client bundle sizes. App Router sends pre-rendered HTML and minimal serialized JSON, dramatically reducing First Contentful Paint (FCP) and Time to Interactive (TTI).
- **Examiner Intent**: Evaluating awareness of modern React/Next.js paradigms.

### Q2.3: Explain the difference between Server Components and Client Components in Parakh.
- **Code Context**: [`src/app/questions/page.tsx`](file:///c:/Users/rohit/Desktop/parakh/src/app/questions/page.tsx), [`src/components/questions/QuestionsView.tsx`](file:///c:/Users/rohit/Desktop/parakh/src/components/questions/QuestionsView.tsx)
- **Technical Answer**:
  - **Server Components (Default in App Router)**: Render exclusively on the Node.js server. Their dependencies (database drivers, markdown parsers, heavy utility libraries) never ship to the client. For example, `src/app/layout.tsx` and route shells execute on the server, producing pure HTML.
  - **Client Components (`"use client"`)**: Hydrate on the browser and maintain React state, lifecycle hooks, and event listeners. For instance, `QuestionsView.tsx` is a client component because it manages dynamic search input state, instant filtering dropdowns, and optimistic bookmark toggles.
- **Examiner Intent**: Testing comprehension of the React Server Components boundary.

### Q2.4: Why was a particular component made client-side instead of server-side?
- **Code Context**: [`src/components/questions/QuestionsView.tsx`](file:///c:/Users/rohit/Desktop/parakh/src/components/questions/QuestionsView.tsx), [`src/components/dashboard/DashboardView.tsx`](file:///c:/Users/rohit/Desktop/parakh/src/components/dashboard/DashboardView.tsx)
- **Technical Answer**: `QuestionsView.tsx` was intentionally marked with `"use client"` because:
  1. It attaches browser event listeners (`onChange`, `onClick`) for live search debouncing and dropdown changes.
  2. It accesses the browser URL synchronization APIs (`useRouter`, `useSearchParams`).
  3. It performs optimistic UI updates: clicking the "Bookmark" star immediately toggles the star's visual state before the `POST /api/questions/[slug]/bookmark` HTTP request returns from the server.
- **Examiner Intent**: Confirming intentionality behind component boundary placement rather than blindly adding `"use client"`.

### Q2.5: How does client-side routing and URL state work in Parakh?
- **Code Context**: [`src/components/questions/QuestionsView.tsx`](file:///c:/Users/rohit/Desktop/parakh/src/components/questions/QuestionsView.tsx#L50-L75)
- **Technical Answer**: Instead of storing search keywords, selected difficulty, and active topic in transient in-memory state or Redux, Parakh synchronizes filter state into the URL query string (`/questions?difficulty=Easy&topic=Array&search=Sum`). We use `useRouter()` and `useSearchParams()` from `next/navigation`. This ensures that search states are fully shareable, bookmarkable, and reload-persistent.
- **Examiner Intent**: Understanding URL-driven state architecture vs. volatile component state.

### Q2.6: How are form states, loading states, and error states handled in the UI?
- **Code Context**: [`src/app/login/page.tsx`](file:///c:/Users/rohit/Desktop/parakh/src/app/login/page.tsx), [`src/app/register/page.tsx`](file:///c:/Users/rohit/Desktop/parakh/src/app/register/page.tsx)
- **Technical Answer**:
  - **Form State**: Managed via controlled inputs with standard React `useState`. Submissions disable buttons and display loading spinners (`loading ? "Signing in..." : "Login"`).
  - **Error Handling**: API error responses (e.g. 401 Invalid Credentials, 409 Email in Use) return structured JSON `{ error: string }`, which is displayed in an accessible alert banner (`role="alert"`).
  - **Loading Skeletons**: Pages render lightweight pulse skeletons during asynchronous fetches so layouts do not shift unexpectedly (Cumulative Layout Shift = 0).
- **Examiner Intent**: Assessing frontend user experience, accessibility, and defensive UI design.

---

## 3. Backend & API Engineering (Next.js Route Handlers)

### Q3.1: How do Next.js Route Handlers work?
- **Code Context**: [`src/app/api/questions/route.ts`](file:///c:/Users/rohit/Desktop/parakh/src/app/api/questions/route.ts), [`src/app/api/companies/[slug]/route.ts`](file:///c:/Users/rohit/Desktop/parakh/src/app/api/companies/%5Bslug%5D/route.ts)
- **Technical Answer**: Route Handlers define custom HTTP request handlers for a given route using the web standard `Request` and `Response` APIs. By exporting named functions corresponding to HTTP verbs (`export async function GET(req: Request)`, `POST`, `PUT`, `DELETE`), Next.js routes incoming requests directly to the handler function. Dynamic parameters (e.g. `[slug]`) are passed in the second argument context `{ params: Promise<{ slug: string }> }`.
- **Examiner Intent**: Understanding modern App Router REST handlers and Web Request standards.

### Q3.2: Why did you choose REST APIs instead of GraphQL or tRPC?
- **Code Context**: [`docs/API.md`](file:///c:/Users/rohit/Desktop/parakh/docs/API.md)
- **Technical Answer**:
  1. **Simplicity and Predictability**: Parakh's resource entities (`companies`, `questions`, `bookmarks`, `progress`) have well-defined, predictable relational access patterns. REST endpoints are easy to document, test using standard `curl`/Postman, and explain in college project reviews.
  2. **Zero Extra Tooling**: GraphQL requires schema definition language (SDL), schema stitching, resolvers, and a heavy client library (Apollo/Urql). tRPC requires tightly coupled monorepo setups. REST with native `fetch` keeps the dependency footprint small and performant.
  3. **Standard HTTP Semantics**: Natural caching, browser status codes (`200`, `201`, `400`, `401`, `403`, `404`, `409`, `500`), and standard verb semantics.
- **Examiner Intent**: Demonstrating practical engineering trade-offs over chasing framework trends.

### Q3.3: How are API requests validated?
- **Code Context**: [`src/lib/validations/`](file:///c:/Users/rohit/Desktop/parakh/src/lib/validations/), [`src/lib/validations/auth.ts`](file:///c:/Users/rohit/Desktop/parakh/src/lib/validations/auth.ts), [`src/lib/validations/question.ts`](file:///c:/Users/rohit/Desktop/parakh/src/lib/validations/question.ts)
- **Technical Answer**: We enforce schema-driven boundary validation using **Zod** before any business logic or database query executes:
  - Dynamic URL slugs are validated via `slugParamSchema` (ensuring lowercase alphanumeric with hyphens, preventing path traversal).
  - Query parameters (page, limit, difficulty, search) are validated via `questionQuerySchema`, with `limit` clamped between 1 and 50 to prevent Denial of Service (DoS) memory exhaustion.
  - Request bodies are parsed via `.safeParse()`. If validation fails, the handler immediately aborts and returns `400 Bad Request` with an array of specific field errors.
- **Examiner Intent**: Evaluating defensive coding and API gateway sanitization.

### Q3.4: How are errors handled and HTTP status codes selected?
- **Code Context**: [`src/lib/api-response.ts`](file:///c:/Users/rohit/Desktop/parakh/src/lib/api-response.ts)
- **Technical Answer**: We use standard, semantically accurate HTTP status codes:
  - `200 OK`: Successful read or update.
  - `201 Created`: Resource successfully created (`POST /api/auth/register`, `POST /api/questions`).
  - `400 Bad Request`: Zod validation failure or malformed JSON payload.
  - `401 Unauthorized`: Missing or invalid JWT authentication token.
  - `403 Forbidden`: Authenticated user lacks required permissions (e.g. Student accessing Admin route) or CSRF origin verification mismatch.
  - `404 Not Found`: Resource with requested slug/ID does not exist.
  - `409 Conflict`: Unique constraint violation (duplicate email/slug) or referential deletion conflict.
  - `500 Internal Server Error`: Unhandled runtime exceptions or database connectivity failure.
- **Examiner Intent**: Assessing API maturity and compliance with RFC HTTP standards.

---

## 4. Database Design & Mongoose Modeling

### Q4.1: Why did you choose MongoDB instead of a relational database like PostgreSQL?
- **Code Context**: [`src/models/Question.ts`](file:///c:/Users/rohit/Desktop/parakh/src/models/Question.ts), [`src/models/User.ts`](file:///c:/Users/rohit/Desktop/parakh/src/models/User.ts)
- **Technical Answer**: MongoDB's document model aligns with Parakh's hierarchical problem structure:
  1. Questions naturally contain variable-length embedded arrays of topics (`["Array", "Two Pointers", "Hash Table"]`) and multiple company references without requiring separate junction/bridge tables.
  2. Atomic set operations (`$addToSet`, `$pull`) allow users to bookmark or mark problems as solved in a single atomic database operation without acquiring multi-table row locks.
  3. Schema flexibility allowed rapid iterative refinement of the `Question` and `Company` schemas throughout the development cycle.
- **Examiner Intent**: Justifying NoSQL vs. SQL based on concrete domain data structures.

### Q4.2: Why did you use Mongoose on top of MongoDB?
- **Code Context**: [`src/models/`](file:///c:/Users/rohit/Desktop/parakh/src/models/), [`src/lib/db.ts`](file:///c:/Users/rohit/Desktop/parakh/src/lib/db.ts)
- **Technical Answer**: Raw MongoDB driver operates without schema enforcement. Mongoose provides:
  - Strict TypeScript schema typing and runtime schema validation (`required`, `enum`, `minlength`).
  - Automatic index creation and uniqueness enforcement (`unique: true` on slugs and emails).
  - Field-level query projection control (e.g. `select: false` on `password` to prevent accidental credential leakage).
  - Reference population (`.populate("companies")`) for seamless document joins.
- **Examiner Intent**: Understanding ODM advantages over raw database drivers.

### Q4.3: Explain the User, Company, and Question models and their relationships.
- **Code Context**: [`src/models/User.ts`](file:///c:/Users/rohit/Desktop/parakh/src/models/User.ts), [`src/models/Company.ts`](file:///c:/Users/rohit/Desktop/parakh/src/models/Company.ts), [`src/models/Question.ts`](file:///c:/Users/rohit/Desktop/parakh/src/models/Question.ts)
- **Technical Answer**:
  - **User**: Stores `name`, `email` (indexed unique), `password` (`select: false`), `role` (`"student" | "admin"`), and arrays of ObjectIds: `bookmarkedQuestions: [ObjectId]` and `solvedQuestions: [ObjectId]`.
  - **Company**: Stores `name`, `slug` (indexed unique), `logoUrl`, `description`, `website`.
  - **Question**: Stores `title`, `slug` (indexed unique), `difficulty` (`"Easy" | "Medium" | "Hard"`), `topics: [string]`, `description`, `leetcodeUrl` (optional URL string), and `companies: [{ type: ObjectId, ref: "Company" }]`.
- **Examiner Intent**: Evaluating database schema normalization and domain modeling.

### Q4.4: Why use ObjectId references instead of embedding the entire company document inside each question?
- **Code Context**: [`src/models/Question.ts`](file:///c:/Users/rohit/Desktop/parakh/src/models/Question.ts#L25)
- **Technical Answer**: Normalized referencing is chosen over full embedding to prevent **data anomalies**: If Google changes its logo or company description, updating an embedded structure would require rewriting thousands of question documents across the collection. With ObjectId references (`ref: "Company"`), updating the company document once immediately reflects across all referencing questions via `.populate("companies")`.
- **Examiner Intent**: Demonstrating understanding of normalization vs. denormalization trade-offs.

### Q4.5: How is the MongoDB connection handled in Next.js, and how are connection leaks prevented?
- **Code Context**: [`src/lib/db.ts`](file:///c:/Users/rohit/Desktop/parakh/src/lib/db.ts)
- **Technical Answer**: In Next.js development, Hot Module Replacement (HMR) clears the Node.js require cache on every code change. If `mongoose.connect()` were invoked naively, every file edit would spawn a new MongoDB connection pool, quickly exhausting available database sockets. In `src/lib/db.ts`, we store a cached connection promise on Node's `globalThis` (`global.mongooseCache`). On subsequent reloads and serverless invocations, the application reuses the active connection promise. We also set `bufferCommands: false` to ensure queries fail fast with diagnostic errors if the database is disconnected.
- **Examiner Intent**: Testing knowledge of serverless runtimes, Node.js module caching, and connection pooling.

### Q4.6: How are duplicate records prevented in the database?
- **Code Context**: [`src/models/User.ts`](file:///c:/Users/rohit/Desktop/parakh/src/models/User.ts#L18), [`src/models/Question.ts`](file:///c:/Users/rohit/Desktop/parakh/src/models/Question.ts#L17)
- **Technical Answer**: Duplicate prevention is enforced at three distinct layers:
  1. **Database Indexes**: Unique compound indexes on `{ email: 1 }` in `User` and `{ slug: 1 }` in `Company` and `Question`.
  2. **Controller Pre-Checks**: Handlers query `exists({ email })` or `exists({ slug })` and return a clean `409 Conflict` before attempting database insertion.
  3. **Array Idempotency**: For user bookmarks and solved lists, we use MongoDB `$addToSet` rather than `$push`, ensuring duplicate clicks never insert duplicate ObjectIds into user arrays.
- **Examiner Intent**: Evaluating multi-tier data integrity defenses.

---

## 5. Authentication, Authorization & Security

### Q5.1: Explain the complete authentication flow in Parakh.
- **Code Context**: [`src/app/api/auth/login/route.ts`](file:///c:/Users/rohit/Desktop/parakh/src/app/api/auth/login/route.ts), [`src/lib/auth.ts`](file:///c:/Users/rohit/Desktop/parakh/src/lib/auth.ts)
- **Technical Answer**:
  1. **Submission**: User submits credentials (`email`, `password`) via `POST /api/auth/login`.
  2. **Verification**: Server validates payload via Zod, fetches the user document with `.select("+password")`, and verifies the password hash using `bcrypt.compare()`.
  3. **Token Generation**: If valid, the server signs a stateless JWT containing `{ userId: user._id, role: user.role }` using `JWT_SECRET` with a 7-day expiration.
  4. **Cookie Dispatch**: The server attaches the JWT in an `httpOnly`, `SameSite=Lax`, `secure` (in production) cookie named `parakh_token`.
  5. **Session Verification**: The client subsequently invokes `GET /api/auth/me`. The server reads the cookie via `cookies()`, verifies the signature, and returns the sanitized user profile.
- **Examiner Intent**: Assessing thorough understanding of stateless session management.

### Q5.2: Why use httpOnly cookies instead of storing JWT in localStorage?
- **Code Context**: [`src/lib/auth.ts`](file:///c:/Users/rohit/Desktop/parakh/src/lib/auth.ts#L30-L45)
- **Technical Answer**: Storing JWTs in browser `localStorage` leaves tokens completely vulnerable to Cross-Site Scripting (XSS). Any malicious script, compromised third-party npm package, or injected inline script can execute `localStorage.getItem("token")` and exfiltrate credentials to an attacker's server. An `httpOnly` cookie cannot be read or modified by JavaScript in the browser (`document.cookie` returns empty for that token), eliminating XSS token theft.
- **Examiner Intent**: Demonstrating web application security hygiene.

### Q5.3: Why bcrypt for password hashing, and why not SHA-256 or MD5?
- **Code Context**: [`src/app/api/auth/register/route.ts`](file:///c:/Users/rohit/Desktop/parakh/src/app/api/auth/register/route.ts#L40)
- **Technical Answer**: Cryptographic hash functions like MD5 or SHA-256 are designed for high-speed file checksumming; modern GPUs can compute billions of SHA-256 hashes per second, making them trivial to crack via precomputed rainbow tables or brute-force dictionaries. **bcrypt** is a slow, adaptive cryptographic key derivation algorithm:
  - It incorporates a cryptographically random **salt** (preventing rainbow table attacks).
  - It features an adjustable **work factor / cost factor** (we use 10 salt rounds), deliberately forcing computational delay (~100ms per attempt) to make offline brute-force attacks mathematically unfeasible.
- **Examiner Intent**: Distinguishing between fast hashing algorithms and salted password hashing.

### Q5.4: How is Role-Based Access Control (RBAC) enforced? Why should the frontend never be trusted for authorization?
- **Code Context**: [`src/lib/auth.ts`](file:///c:/Users/rohit/Desktop/parakh/src/lib/auth.ts#L60-L85), [`src/app/api/companies/route.ts`](file:///c:/Users/rohit/Desktop/parakh/src/app/api/companies/route.ts)
- **Technical Answer**:
  - In `src/lib/auth.ts`, `requireAdmin(req)` verifies the JWT signature and inspects `tokenPayload.role`. If `role !== "admin"`, it immediately returns `HTTP 403 Forbidden`.
  - **Client-Side vs. Server-Side**: The frontend only uses role state for user experience (e.g. hiding the "Admin Panel" navbar link for students). However, a malicious client can easily inspect client JavaScript, unhide buttons, or dispatch direct HTTP `POST /api/companies` requests via `curl` or Postman. The server must unconditionally enforce authorization on every request regardless of what the frontend displays.
- **Examiner Intent**: Core security principle: "Never trust the client."

### Q5.5: How are secrets and environment variables protected?
- **Code Context**: [`.env.example`](file:///c:/Users/rohit/Desktop/parakh/.env.example), [`.gitignore`](file:///c:/Users/rohit/Desktop/parakh/.gitignore)
- **Technical Answer**:
  1. `.env.local` is strictly listed in `.gitignore` to prevent committing secrets to version control.
  2. Server secrets (`MONGODB_URI`, `JWT_SECRET`) do not use the `NEXT_PUBLIC_` prefix, ensuring Next.js compiler completely strips them from client JavaScript bundles.
  3. Centralized validation in `src/lib/env.ts` verifies that required secrets exist at startup, throwing descriptive configuration errors rather than failing silently with undefined runtime bugs.
- **Examiner Intent**: Evaluating secrets lifecycle management.

---

## 6. Search, Filtering & Pagination

### Q6.1: How does question search work on the backend?
- **Code Context**: [`src/app/api/questions/route.ts`](file:///c:/Users/rohit/Desktop/parakh/src/app/api/questions/route.ts#L45-L70), [`src/lib/security.ts`](file:///c:/Users/rohit/Desktop/parakh/src/lib/security.ts#L10)
- **Technical Answer**: When a user searches for `"two sum"`, the server sanitizes the query using `escapeRegex(search)` to neutralize regex metacharacters (`.*+?^${}()|[]\`). It then constructs a MongoDB `$or` filter:
  ```typescript
  filter.$or = [
    { title: { $regex: cleanSearch, $options: "i" } },
    { description: { $regex: cleanSearch, $options: "i" } }
  ];
  ```
  The query runs directly inside the database engine, avoiding in-memory array filtering in Node.js.
- **Examiner Intent**: Understanding database-level text querying and injection prevention.

### Q6.2: How are multiple filters (Company, Difficulty, Topic) combined?
- **Code Context**: [`src/app/api/questions/route.ts`](file:///c:/Users/rohit/Desktop/parakh/src/app/api/questions/route.ts#L55-L85)
- **Technical Answer**: Filters are composable. The route handler builds a dynamic Mongoose filter object:
  - If `company` slug is provided, it resolves `Company.findOne({ slug })` and appends `{ companies: company._id }`.
  - If `difficulty` is provided (`Easy`, `Medium`, `Hard`), it appends `{ difficulty }`.
  - If `topic` is provided, it appends `{ topics: topic }`.
  - All conditions are merged into a single Mongoose query: `Question.find(filter).sort(sortOption).skip(skip).limit(limit)`.
- **Examiner Intent**: Evaluating dynamic query composition without SQL/NoSQL injection risks.

### Q6.3: How does pagination work, and how do you prevent abuse?
- **Code Context**: [`src/lib/validations/question.ts`](file:///c:/Users/rohit/Desktop/parakh/src/lib/validations/question.ts#L15), [`src/app/api/questions/route.ts`](file:///c:/Users/rohit/Desktop/parakh/src/app/api/questions/route.ts#L80)
- **Technical Answer**: We implement page-based pagination using `.skip((page - 1) * limit).limit(limit)`.
  - **DoS Protection**: If an attacker requested `limit=1000000`, the server would attempt to serialize millions of records into memory, crashing Node.js with an Out-of-Memory (OOM) error. Zod's `questionQuerySchema` clamps `limit` between 1 and 50 (defaulting to 20).
  - Total document counts and page counts are computed via `Question.countDocuments(filter)` so clients receive `{ pagination: { total, page, totalPages, limit } }`.
- **Examiner Intent**: Demonstrating API bounding and resource exhaustion defense.

---

## 7. User Progress & Dashboard Analytics

### Q7.1: How are bookmarks and solved progress persisted?
- **Code Context**: [`src/app/api/questions/[slug]/bookmark/route.ts`](file:///c:/Users/rohit/Desktop/parakh/src/app/api/questions/%5Bslug%5D/bookmark/route.ts), [`src/app/api/questions/[slug]/solved/route.ts`](file:///c:/Users/rohit/Desktop/parakh/src/app/api/questions/%5Bslug%5D/solved/route.ts)
- **Technical Answer**:
  - Bookmarks and solved items are stored as arrays of `Question` ObjectIds inside the `User` document.
  - Adding a bookmark uses `$addToSet: { bookmarkedQuestions: question._id }` (idempotent addition).
  - Removing a bookmark uses `$pull: { bookmarkedQuestions: question._id }` (idempotent removal).
  - Because `$addToSet` and `$pull` are atomic in MongoDB, concurrent clicks or network retries never corrupt user state or create duplicate array entries.
- **Examiner Intent**: Understanding atomic document operations vs. read-modify-write race conditions.

### Q7.2: How does the dashboard calculate statistics without N+1 queries?
- **Code Context**: [`src/app/api/dashboard/route.ts`](file:///c:/Users/rohit/Desktop/parakh/src/app/api/dashboard/route.ts#L30-L110)
- **Technical Answer**: In naive implementations, developers query each company in a loop to count solved questions (an $N+1$ query pattern). Parakh calculates complete metrics using exactly 4 batched queries:
  1. `User.findById(userId)`: Retrieves the student's solved and bookmarked ObjectId arrays.
  2. `Question.countDocuments()` / `$group`: Gathers total catalog question counts grouped by difficulty (`Easy`, `Medium`, `Hard`).
  3. `Question.find({ _id: { $in: user.solvedQuestions } })`: Fetches solved question details in a single query.
  4. Company aggregation pipeline (`$unwind: "$companies"` and `$group`): Calculates total questions per company.
  All metric cross-referencing and percentage calculations occur in memory in $O(N)$ linear time.
- **Examiner Intent**: Identifying and eliminating the classical N+1 database anti-pattern.

---

## 8. Data Ingestion & CLI Pipeline

### Q8.1: Why did you create a dedicated ingestion script?
- **Code Context**: [`scripts/ingest/`](file:///c:/Users/rohit/Desktop/parakh/scripts/ingest/), [`scripts/ingest/ingest.ts`](file:///c:/Users/rohit/Desktop/parakh/scripts/ingest/ingest.ts)
- **Technical Answer**: Manually entering hundreds of coding interview questions through a web UI is slow and error-prone. Placement coordinators maintain past interview records in CSV spreadsheets or JSON files. The ingestion script provides an automated CLI pipeline to batch-import datasets into MongoDB with rigorous validation, reference resolution, and error reporting.
- **Examiner Intent**: Recognizing operational tooling requirements for real-world platforms.

### Q8.2: What makes the ingestion pipeline idempotent?
- **Code Context**: [`scripts/ingest/ingest.ts`](file:///c:/Users/rohit/Desktop/parakh/scripts/ingest/ingest.ts#L80-L125)
- **Technical Answer**: An operation is **idempotent** if running it multiple times produces the exact same final system state as running it once. The ingestion script uses `slug` as the stable primary identifier:
  - For each question in the CSV, it checks `Question.findOne({ slug })`.
  - If the question already exists, it updates mutable fields (title, difficulty, topics, leetcodeUrl) without creating a duplicate record or altering its `_id`.
  - If it does not exist, it inserts a new document.
  - Running `npm run ingest` 10 times consecutively results in 0 duplicate records and 0 dangling references.
- **Examiner Intent**: Understanding idempotency and reliable data synchronization.

### Q8.3: How are company slugs resolved to ObjectIds during ingestion? What happens if an unknown company is supplied?
- **Code Context**: [`scripts/ingest/ingest.ts`](file:///c:/Users/rohit/Desktop/parakh/scripts/ingest/ingest.ts#L45-L70)
- **Technical Answer**: At startup, the script queries `Company.find({})` and builds an in-memory hash map of `slug -> ObjectId`. When processing a question referencing `companies: "google,amazon"`, it splits the string, normalizes each slug, and retrieves the corresponding `ObjectId`. If a company slug is missing from the database (e.g. `"airbnb"`), the script rejects that record, logs a detailed error with row number and missing slug, and continues processing the rest of the batch without inserting orphan references.
- **Examiner Intent**: Evaluating foreign reference resolution and ETL validation.

---

## 9. Cloud Deployment & Production Operations

### Q9.1: How is Parakh deployed to production? Why Vercel and MongoDB Atlas?
- **Code Context**: [`docs/ARCHITECTURE.md`](file:///c:/Users/rohit/Desktop/parakh/docs/ARCHITECTURE.md), [`README.md`](file:///c:/Users/rohit/Desktop/parakh/README.md)
- **Technical Answer**:
  - **Frontend & API**: Deployed on **Vercel**. Next.js App Router integrates natively with Vercel's global Edge network for static assets and serverless function runtimes for Route Handlers.
  - **Database**: Hosted on **MongoDB Atlas** (M0/M10 managed cluster) across high-availability multi-region replica sets with automated backups, encryption at rest, and IP whitelisting.
- **Examiner Intent**: Assessing production hosting choices and serverless operations.

### Q9.2: How are environment variables and database credentials configured securely in production?
- **Code Context**: [`.env.example`](file:///c:/Users/rohit/Desktop/parakh/.env.example)
- **Technical Answer**: In production, environment variables are injected through Vercel's encrypted project settings console, never committed to git. Database connection strings use secure authentication (`mongodb+srv://<user>:<password>@cluster.mongodb.net/parakh?retryWrites=true&w=majority`), with network access restricted via Atlas IP Access Lists.
- **Examiner Intent**: Verifying production secrets management and operational security.

---

## 10. Scenario-Based Practical Viva Questions

### Q10.1: What happens if MongoDB goes down while users are browsing Parakh?
- **Code Context**: [`src/lib/db.ts`](file:///c:/Users/rohit/Desktop/parakh/src/lib/db.ts#L25), [`src/app/api/health/db/route.ts`](file:///c:/Users/rohit/Desktop/parakh/src/app/api/health/db/route.ts)
- **Technical Answer**: Because `src/lib/db.ts` sets `bufferCommands: false`, Mongoose will not hang waiting for a reconnect. API Route Handlers catch the connection rejection inside standard `try/catch` blocks and return `HTTP 500 Internal Server Error` with JSON `{ error: "Database connection failed" }`. In the UI, error boundaries render clean error messages with retry buttons rather than unhandled white-screen crashes. The `/api/health/db` endpoint reports `{"ok": false, "error": "disconnected"}` for automated uptime monitors.
- **Examiner Intent**: Testing failure mode resilience and graceful degradation.

### Q10.2: What happens if a student attempts to access an admin endpoint directly via curl or Postman?
- **Code Context**: [`src/lib/auth.ts`](file:///c:/Users/rohit/Desktop/parakh/src/lib/auth.ts#L65-L80)
- **Technical Answer**: The request hits `requireAdmin(req)`. The server extracts the `parakh_token` cookie, verifies the JWT signature, and decodes `{ userId, role }`. Because the student's token has `role: "student"`, `requireAdmin` immediately aborts the handler and returns `HTTP 403 Forbidden` with `{ error: "Forbidden: Admin access required" }`. No database query or administrative mutation executes.
- **Examiner Intent**: Testing authorization bypass resistance.

### Q10.3: What happens if an admin attempts to delete a company that currently has questions associated with it?
- **Code Context**: [`src/app/api/companies/[slug]/route.ts`](file:///c:/Users/rohit/Desktop/parakh/src/app/api/companies/%5Bslug%5D/route.ts#L80-L100)
- **Technical Answer**: In relational databases, foreign keys prevent orphan deletions via `ON DELETE RESTRICT`. In MongoDB, Parakh explicitly enforces referential integrity in software: before deleting a company, the handler executes `Question.countDocuments({ companies: company._id })`. If the count is greater than zero, the deletion is rejected with `HTTP 409 Conflict` and message `"Cannot delete company: 4 questions still reference it"`. The admin must reassign or delete the questions first.
- **Examiner Intent**: Testing referential integrity enforcement in NoSQL systems.

### Q10.4: How would you scale question search if the database grew to 1 million questions?
- **Code Context**: [`docs/INTERVIEW_QUESTIONS.md`](file:///c:/Users/rohit/Desktop/parakh/docs/INTERVIEW_QUESTIONS.md#Part-3)
- **Technical Answer**: In MongoDB, `$regex` queries without a leading prefix anchor (`^`) cannot use standard B-Tree indexes and trigger full collection scans ($O(N)$). At 1 million questions, we would:
  1. Add a MongoDB Atlas Search index (based on Apache Lucene) or integrate a dedicated inverted-index search engine like **Typesense** or **Elasticsearch**.
  2. Implement compound B-Tree indexes on `{ "companies": 1, "difficulty": 1, "createdAt": -1 }`.
  3. Introduce a **Redis** caching layer with 5-minute TTL for popular catalog filter combinations.
- **Examiner Intent**: Demonstrating understanding of database index limits and search scaling patterns.

### Q10.5: How would you add Google OAuth or GitHub Social Login to Parakh in the future?
- **Code Context**: [`src/models/User.ts`](file:///c:/Users/rohit/Desktop/parakh/src/models/User.ts), [`src/lib/auth.ts`](file:///c:/Users/rohit/Desktop/parakh/src/lib/auth.ts)
- **Technical Answer**:
  1. In `User.ts`, make `password` optional and add `authProvider: { type: String, enum: ["local", "google", "github"], default: "local" }` and `providerId: { type: String }`.
  2. Integrate an OAuth2 flow: redirect the user to Google/GitHub consent screen, receive the authorization code on callback route `/api/auth/callback/[provider]`, exchange code for profile with Google/GitHub APIs.
  3. Find or create the user document in MongoDB, and issue the same `parakh_token` httpOnly JWT cookie. The rest of Parakh's downstream authorization pipeline remains 100% unchanged.
- **Examiner Intent**: Evaluating architectural extensibility.

### Q10.6: How would you integrate an online code execution sandbox into Parakh?
- **Code Context**: [`src/models/Question.ts`](file:///c:/Users/rohit/Desktop/parakh/src/models/Question.ts)
- **Technical Answer**: Parakh currently links to official LeetCode problems (`leetcodeUrl`) for safe, reliable practice. To add native code execution:
  1. We would integrate with a sandboxed remote code execution API such as **Judge0** or run isolated WebAssembly (Wasm) runtimes in-browser for languages like Python or JavaScript.
  2. Submissions would be queued via Redis BullMQ to prevent server CPU starvation.
  3. Worker containers would execute test cases within strict memory and CPU cgroups, returning stdout/stderr and execution time back to the student.
- **Examiner Intent**: Testing awareness of sandboxing and containerized execution risks.

---

## 11. Practical Dataset Engineering & Company-Question Ingestion Viva Questions

### Q11.1: How does Parakh associate one question with multiple companies?
- **Code Context**: [`src/models/Question.ts`](file:///c:/Users/rohit/Desktop/parakh/src/models/Question.ts), [`src/models/Company.ts`](file:///c:/Users/rohit/Desktop/parakh/src/models/Company.ts)
- **Technical Answer**: In `Question.ts`, the `companies` field is modeled as an array of MongoDB ObjectIds referencing the `Company` collection:
  ```typescript
  companies: [{ type: Schema.Types.ObjectId, ref: 'Company' }]
  ```
  This creates a normalized Many-to-Many ($M:N$) relational association without embedding duplicate question documents. When a question like *Two Sum* is asked by Google, Amazon, Deloitte, and Zomato, the `companies` array contains the four respective ObjectIds. We place a multi-key index on `companies: 1` in MongoDB so queries filtering by company (`Question.find({ companies: companyId })`) execute with logarithmic B-Tree lookups instead of full table scans.
- **Examiner Intent**: Evaluating relational modeling in document databases and indexing on array fields.

### Q11.2: Why should duplicate LeetCode problems not be stored multiple times?
- **Code Context**: [`src/models/Question.ts`](file:///c:/Users/rohit/Desktop/parakh/src/models/Question.ts), [`scripts/ingest/importer.ts`](file:///c:/Users/rohit/Desktop/parakh/scripts/ingest/importer.ts)
- **Technical Answer**: Storing duplicate problem documents across different companies violates database normalization and creates data integrity hazards:
  1. **Split User Progress**: If *LRU Cache* exists twice with different ObjectIds (one for Google and one for Flipkart), marking it solved for Google would leave it marked unsolved for Flipkart, confusing the student.
  2. **Orphan Bookmarks**: Bookmark status would be fragmented across duplicate question IDs.
  3. **Data Drift**: If the LeetCode practice link or description is updated, all duplicate records would have to be synchronized, risking stale data.
  By keeping a single canonical Question document identified by a unique `slug` and linking multiple companies in its `companies` array, user solved status and bookmarks naturally apply across all relevant target companies.
- **Examiner Intent**: Understanding normalization, data anomalies, and unified progress tracking.

### Q11.3: How does company-wise progress get calculated?
- **Code Context**: [`src/app/api/dashboard/route.ts`](file:///c:/Users/rohit/Desktop/parakh/src/app/api/dashboard/route.ts), [`src/components/dashboard/CompanyCard.tsx`](file:///c:/Users/rohit/Desktop/parakh/src/components/dashboard/CompanyCard.tsx)
- **Technical Answer**: Company-wise completion metrics are calculated without running $N+1$ database queries:
  1. The server fetches all companies and all questions in two bulk queries, or aggregates them.
  2. For the logged-in user, the server retrieves their `solvedQuestions` ObjectId set from the `User` document.
  3. For each company, the total question count is the count of questions whose `companies` array includes that company's `_id`.
  4. The solved count is the intersection: questions belonging to that company that also exist in `user.solvedQuestions`.
  5. The percentage is computed in-memory: $\text{Math.round}((\text{solved} / \text{total}) \times 100)$.
  6. If $\text{total} === 0$, it cleanly renders $0\%$ without divide-by-zero errors.
- **Examiner Intent**: Assessing efficiency in calculating aggregated user analytics and avoiding $N+1$ queries.

### Q11.4: How are LeetCode links validated?
- **Code Context**: [`src/lib/validations/question.ts`](file:///c:/Users/rohit/Desktop/parakh/src/lib/validations/question.ts), [`src/models/Question.ts`](file:///c:/Users/rohit/Desktop/parakh/src/models/Question.ts)
- **Technical Answer**: LeetCode URLs are validated at multiple levels:
  1. **Schema Validation (Zod)**: In `question.ts`, the `leetcodeUrl` field is defined using regex validation:
     ```typescript
     leetcodeUrl: z.string().url().regex(/^https:\/\/leetcode\.com\/problems\/[a-z0-9-]+\/?$/, "Must be a valid LeetCode problem URL").optional()
     ```
     This rejects fake search URLs, third-party blog links, or HTTP non-secure protocols.
  2. **Pre-Ingestion Verification**: An automated verification script executes HEAD/GET requests against LeetCode's public endpoint (`https://leetcode.com/problems/<slug>/`) to guarantee HTTP 200 OK before inserting into the ingestion dataset, preventing dead links.
- **Examiner Intent**: Testing API boundary validation, regular expressions, and link integrity verification.

### Q11.5: How would you import 1,000 company-question mappings efficiently?
- **Code Context**: [`scripts/ingest/importer.ts`](file:///c:/Users/rohit/Desktop/parakh/scripts/ingest/importer.ts)
- **Technical Answer**: For large batch sizes (1,000+ records), sequential `findOne` and `create` calls would take minutes due to network round-trips. We optimize the pipeline using:
  1. **Pre-caching Reference Dictionaries**: Load all existing companies into an in-memory `Map<slug, ObjectId>` in 1 single query ($O(1)$ lookup per row).
  2. **Bulk MongoDB Operations**: Use MongoDB's `bulkWrite` API with `updateOne` and `upsert: true`. Instead of 1,000 round-trips, the operations are dispatched in chunks of 500, reducing import time from minutes to under 2 seconds.
  3. **Streaming Parser**: Stream the incoming CSV/JSON rather than reading the entire file into Node.js buffer memory to prevent heap exhaustion.
- **Examiner Intent**: Demonstrating batch processing, `bulkWrite` optimization, and memory-conscious ETL pipelines.

### Q11.6: How do you prevent duplicate questions during ingestion?
- **Code Context**: [`scripts/ingest/importer.ts`](file:///c:/Users/rohit/Desktop/parakh/scripts/ingest/importer.ts), [`src/models/Question.ts`](file:///c:/Users/rohit/Desktop/parakh/src/models/Question.ts)
- **Technical Answer**:
  1. **Database-level Constraint**: A unique index on `slug: 1` (`QuestionSchema.index({ slug: 1 }, { unique: true })`) guarantees that the database engine itself rejects concurrent duplicate inserts.
  2. **Pipeline Upsert**: During ingestion, we check `await Question.findOne({ slug })`. If present, we update the existing record with any new fields or merge new company IDs into `companies` via `$addToSet`, preventing duplicates while enriching associations.
- **Examiner Intent**: Understanding multi-layered deduplication (application logic + unique DB constraints).

### Q11.7: Why is slug-based upsert useful?
- **Code Context**: [`scripts/ingest/importer.ts`](file:///c:/Users/rohit/Desktop/parakh/scripts/ingest/importer.ts), [`src/app/api/questions/[slug]/route.ts`](file:///c:/Users/rohit/Desktop/parakh/src/app/api/questions/%5Bslug%5D/route.ts)
- **Technical Answer**:
  1. **Stable Semantic Identity**: ObjectIds are randomly generated on insert; a test database and a production database have different ObjectIds for the same problem. A human-readable `slug` (e.g. `two-sum`) is deterministic across environments.
  2. **Idempotence**: A slug allows repeat imports to execute without creating duplicate records or mutating foreign keys.
  3. **SEO & Clean URLs**: URLs like `/questions/two-sum` are clean, descriptive, and crawlable compared to opaque 24-character hexadecimal IDs like `/questions/654a1b2c3d4e5f6a7b8c9d0e`.
- **Examiner Intent**: Explaining natural keys vs surrogate keys and operational idempotency.

### Q11.8: How would you handle a question that was reported for multiple companies?
- **Code Context**: [`scripts/ingest/importer.ts`](file:///c:/Users/rohit/Desktop/parakh/scripts/ingest/importer.ts)
- **Technical Answer**: In Parakh's ingestion system:
  1. The question record specifies an array of company slugs, e.g. `["deloitte", "zomato", "google"]`.
  2. The importer resolves all valid slugs to their respective ObjectIds.
  3. When upserting, it merges the company IDs into the question's `companies` field using `$addToSet: { companies: { $each: companyIds } }`.
  4. This preserves existing company associations while appending the new ones, ensuring the problem immediately appears under all relevant company prep tracks without duplicating content or breaking user progress.
- **Examiner Intent**: Assessing many-to-many relationship management during ingestion.
