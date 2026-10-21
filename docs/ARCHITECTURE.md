# Parakh — System Architecture & Technical Design

## 1. System Overview

**Parakh** (परख) is a full-stack, company-wise technical interview preparation platform designed for computer science students. It enables students to discover, practice, and track coding interview problems categorized by target technology firms, algorithmic topics, and difficulty levels.

The system is architected as a modern monolithic web application using Next.js App Router, React 19, TypeScript, and MongoDB Atlas with Mongoose. It adheres to a clean separation of concerns, defensive security boundaries, and zero-redundancy engineering.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        Client Tier (Browser)                           │
│  - React 19 Server Components (fast initial paint, minimal bundle)     │
│  - Interactive Client Islands ("use client" for filters, modals, auth) │
│  - Tailwind CSS v4 + Dark Mode (zero-flash theme state)                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS (httpOnly Cookie)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Application Tier (Next.js 16)                        │
│  App Router API Route Handlers (/api/*)                                │
│    ├── CSRF Protection: Origin & Referer Verification                  │
│    ├── Schema Validation: Zod (bodies, query params, path slugs)       │
│    ├── Authentication: Stateless JWT in httpOnly Cookie                │
│    └── Authorization: Server-side RBAC (Student vs Admin)              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Cached Mongoose Connection
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      Database Tier (MongoDB Atlas)                     │
│  - Document Models: User, Company, Question, Bookmark, Progress        │
│  - Atomic Updates: $addToSet, $pull for user bookmarks & progress      │
│  - In-Database Aggregations: Pipeline stats without N+1 overhead       │
│  - Compound & Single Indexes on slugs, topics, companies, difficulty   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Major Architecture Layers

### Frontend Layer
- **Framework**: Next.js 16 App Router using React 19.
- **Rendering Strategy**: React Server Components (RSC) are used by default for non-interactive pages (e.g., page layouts, metadata generation, and shell wrappers), maximizing SEO and reducing browser JavaScript payloads.
- **Client Islands (`"use client"`)**: Isolated strictly to interactive surfaces:
  - Authentication forms ([`LoginForm.tsx`](file:///c:/Users/rohit/Desktop/parakh/src/components/auth/LoginForm.tsx), [`RegisterForm.tsx`](file:///c:/Users/rohit/Desktop/parakh/src/components/auth/RegisterForm.tsx)).
  - Catalogs with search, filter, and pagination state ([`QuestionList.tsx`](file:///c:/Users/rohit/Desktop/parakh/src/components/questions/QuestionList.tsx), [`CompanyList.tsx`](file:///c:/Users/rohit/Desktop/parakh/src/components/companies/CompanyList.tsx)).
  - Interactive toggles ([`QuestionDetail.tsx`](file:///c:/Users/rohit/Desktop/parakh/src/components/questions/QuestionDetail.tsx) for bookmark/solved actions, [`ThemeToggle.tsx`](file:///c:/Users/rohit/Desktop/parakh/src/components/ui/ThemeToggle.tsx)).
  - Admin management tables and modal dialogs ([`CompanyManager.tsx`](file:///c:/Users/rohit/Desktop/parakh/src/components/admin/CompanyManager.tsx), [`QuestionManager.tsx`](file:///c:/Users/rohit/Desktop/parakh/src/components/admin/QuestionManager.tsx)).
- **Design & Styling**: Pure Tailwind CSS v4 with custom dark mode variant classes (`dark:bg-slate-950`). Typography uses Next.js Geist Sans font variables. Flash of unstyled theme on page reload is eliminated via an inline `<head>` detection script in [`layout.tsx`](file:///c:/Users/rohit/Desktop/parakh/src/app/layout.tsx).

### API & Route Handler Layer
- **Endpoints**: Next.js Route Handlers located under `src/app/api/**/route.ts` implementing REST conventions.
- **Boundary Validation**: Every incoming payload is validated using Zod schemas (`src/lib/validations/`) before database access.
- **CSRF Defense**: All state-changing methods (`POST`, `PUT`, `DELETE`) pass through `validateCsrfOrigin()` in [`security.ts`](file:///c:/Users/rohit/Desktop/parakh/src/lib/security.ts) to block cross-origin request forgery.
- **Error Handling**: Standardized HTTP responses (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 500 Internal Server Error) with sanitized error messages. Raw stack traces and database connection strings are never exposed to clients.

### Database & ODM Layer
- **Database**: MongoDB Atlas cloud cluster.
- **ODM**: Mongoose with strict TypeScript models (`src/models/`).
- **Connection Caching**: [`dbConnect()`](file:///c:/Users/rohit/Desktop/parakh/src/lib/db.ts) caches the active Mongoose connection promise on `globalThis` to prevent connection exhaustion during Next.js Hot Module Replacement (HMR) and across warm serverless function invocations.

### Ingestion Subsystem
- **CLI Engine**: Located in `scripts/ingest/` and executed independently via `npm run ingest -- <file> [options]`.
- **Isolation**: Completely decoupled from the Next.js runtime bundle and production API routes.
- **Format Support**: RFC 4180-compliant CSV and JSON arrays.
- **Idempotency**: Upserts records by unique `slug`. Re-running imports updates existing documents in-place without generating duplicates or altering ObjectIds.
- **Referential Integrity**: Resolves human-readable company slugs to existing MongoDB ObjectIds before question insertion, immediately rejecting unresolved references.

### Deployment Layer
- **Platform**: Vercel (Edge network routing with serverless Next.js functions).
- **Environment Isolation**: Server-only configuration keys (`MONGODB_URI`, `JWT_SECRET`) without `NEXT_PUBLIC_` prefixes.
- **Security Headers**: Injected at the framework layer in [`next.config.ts`](file:///c:/Users/rohit/Desktop/parakh/next.config.ts) (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`).

---

## 3. Authentication & Authorization Architecture

### Authentication Flow (Stateless JWT in HttpOnly Cookie)

```text
User Registration:
  Client POST /api/auth/register (name, email, password)
    ├── Zod validate input (email format, password >= 6 chars)
    ├── Check existing email in MongoDB (409 Conflict if duplicate)
    ├── Hash password with bcryptjs (10 salt rounds)
    ├── Force user.role = "student" (rejects client role injection)
    └── Create User in MongoDB -> return sanitized user (201 Created)

User Login:
  Client POST /api/auth/login (email, password)
    ├── Zod validate input
    ├── Find User by email with .select("+password")
    ├── bcrypt.compare(password, user.password)
    │     └── Return generic 401 on failure (prevents email enumeration)
    ├── Create signed JWT (userId, role) with 7-day expiration
    └── Attach httpOnly cookie ("parakh_token") -> return 200 OK

Protected Request:
  Client Request (Browser automatically includes cookie)
    ├── Extract "parakh_token" from Cookie header
    ├── Verify cryptographic signature using server-only JWT_SECRET
    ├── Decode claims: { userId: string, role: "student" | "admin" }
    └── Pass verified user payload to Route Handler
```

### Authentication vs. Authorization
- **Authentication (`requireAuth`)**: Verifies *identity* — confirming that the caller possesses a valid, unexpired, signed JWT token. Unauthenticated requests return `401 Unauthorized`.
- **Authorization (`requireAdmin`)**: Verifies *permissions* — confirming that the authenticated user possesses the required privilege tier (`role === "admin"`). Authenticated students attempting administrative actions receive `403 Forbidden`.

### Role-Based Access Control (RBAC) Matrix

| Endpoint Group | Public | Student (`role: student`) | Admin (`role: admin`) |
|---|---|---|---|
| Browse Companies & Questions | Allowed | Allowed | Allowed |
| Search, Filter, Sort, Paginate | Allowed | Allowed | Allowed |
| View Question Detail | Allowed | Allowed | Allowed |
| Toggle Bookmarks & Solved | Rejected (401) | Allowed | Allowed |
| View Preparation Dashboard | Rejected (401) | Allowed | Allowed |
| View Bookmarked / Solved Pages | Rejected (401) | Allowed | Allowed |
| Admin Platform Stats (`/api/admin/stats`) | Rejected (401) | Rejected (403) | Allowed |
| Company Mutations (`POST/PUT/DELETE`) | Rejected (401) | Rejected (403) | Allowed |
| Question Mutations (`POST/PUT/DELETE`) | Rejected (401) | Rejected (403) | Allowed |

---

## 4. Database Schema & Relational Design

Parakh uses a normalized document structure optimized for high read throughput, atomic status toggling, and referential safety:

```text
┌─────────────────────────┐               ┌─────────────────────────┐
│          User           │               │         Company         │
├─────────────────────────┤               ├─────────────────────────┤
│ _id: ObjectId           │               │ _id: ObjectId           │
│ name: string            │               │ name: string            │
│ email: string (unique)  │               │ slug: string (unique)   │
│ password: string (hash) │               │ logo: string (URL)      │
│ role: "student"|"admin" │               │ description: string     │
│ bookmarkedQuestions: [] ├───────┐       │ website: string (URL)   │
│ solvedQuestions: []     ├─────┐ │       │ createdAt, updatedAt    │
│ createdAt, updatedAt    │     │ │       └────────────▲────────────┘
└─────────────────────────┘     │ │                    │
                                │ │                    │ references
                                │ │                    │ (Array of ObjectIds)
                                ▼ ▼                    │
                    ┌─────────────────────────┐        │
                    │        Question         │        │
                    ├─────────────────────────┤        │
                    │ _id: ObjectId           │        │
                    │ title: string           │        │
                    │ slug: string (unique)   │        │
                    │ description: string     │        │
                    │ difficulty: Enum        │        │
                    │ topics: string[]        │        │
                    │ companies: ObjectId[]   ├────────┘
                    │ leetcodeUrl: string     │
                    │ createdAt, updatedAt    │
                    └─────────────────────────┘
```

### Referential Integrity & Protection Rules
1. **Company Reference Protection**:
   - When an administrator attempts to delete a company (`DELETE /api/companies/[slug]`), the handler queries `Question.exists({ companies: company._id })`.
   - If one or more questions reference the company, the deletion is rejected with `HTTP 409 Conflict`.
2. **Atomic Bookmark & Solved Mutations**:
   - Bookmarking and solving utilize MongoDB `$addToSet` (for adding) and `$pull` (for removing) against the user document.
   - These operations are idempotent: rapid consecutive clicks or network retries will never produce duplicate IDs in the array.
3. **Graceful Handling of Deleted Questions**:
   - If an admin deletes a question, any dangling ObjectId remaining in a student's `bookmarkedQuestions` or `solvedQuestions` array is handled gracefully.
   - Bulk lookups (`$in`) automatically ignore missing IDs, and client list views use `.filter(Boolean)` to prevent UI crashes.

---

## 5. Ingestion Subsystem

The data ingestion pipeline ([`scripts/ingest/`](file:///c:/Users/rohit/Desktop/parakh/scripts/ingest/)) allows bulk onboarding of companies and interview questions from CSV and JSON sources without web server overhead.

```text
Data File (.csv or .json)
   │
   ▼
1. Format Parser (RFC 4180 CSV parser or JSON validator)
   │
   ▼
2. Schema Validation (companySchema / questionSchema via Zod)
   │
   ▼
3. Reference Resolution (Company slugs -> MongoDB ObjectIds lookup)
   │
   ▼
4. Duplicate Detection (In-file duplicate slug rejection)
   │
   ▼
5. Idempotent Upsert (Find by slug -> update existing or insert new)
   │
   ▼
Summary Report (Processed, Created, Updated, Skipped, Failed diagnostics)
```

- **Execution Command**:
  ```bash
  npm run ingest -- <file-path> [--type=companies|questions] [--dry-run]
  ```
- **CLI-Only Architecture**: The ingestion pipeline runs as a standalone Node.js process using native TypeScript execution (`--experimental-strip-types`). It is intentionally not exposed as a public HTTP API to prevent denial-of-service risks, timeouts, and arbitrary file upload vulnerabilities.

---

## 6. Interview Discussion Points

### 1. Why Next.js App Router?
Next.js App Router allows us to build the entire full-stack application within a unified codebase using React Server Components by default. Server Components fetch data on the server with zero client bundle overhead, while Client Components (`"use client"`) are used strictly for interactive islands like filters and modals. Route Handlers provide a clean, standardized RESTful API layer co-located with the frontend.

### 2. Why MongoDB + Mongoose?
MongoDB is well-suited for hierarchical document models like interview questions that naturally contain arrays of topics and multiple company references. Mongoose provides strong schema enforcement, lifecycle validations, and population helpers while preserving schema flexibility. It also allows atomic set operations (`$addToSet`, `$pull`) that make bookmarking and progress tracking race-condition free.

### 3. Why JWT in an httpOnly cookie?
Storing JWTs in `httpOnly`, `SameSite=Lax`, `secure` cookies ensures that client-side JavaScript cannot read the token, effectively neutralizing token theft via Cross-Site Scripting (XSS). At the same time, cryptographic verification makes authentication completely stateless, eliminating the need to query a centralized session store (such as Redis) on every incoming request.

### 4. Why bcrypt password hashing?
Bcrypt incorporates an adaptive work factor (salt rounds = 10) and an automatically generated salt per hash, protecting passwords against rainbow table attacks and high-speed GPU-accelerated cracking. It ensures that even if database storage were compromised, plaintext credentials cannot be extracted.

### 5. Why Zod validation?
Zod provides TypeScript-first runtime schema validation that guarantees data entering our application matches our expectations before reaching business logic or database queries. We use it to sanitize request bodies, enforce bounded pagination ranges, validate route parameter slugs, and escape regex strings to defend against ReDoS and query injection attacks.

### 6. How admin authorization works?
Admin authorization is enforced strictly on the server in [`src/lib/auth.ts`](file:///c:/Users/rohit/Desktop/parakh/src/lib/auth.ts) using `requireAdmin()`. It extracts the signed JWT from the httpOnly cookie, cryptographically verifies its signature against `JWT_SECRET`, and asserts that `role === "admin"`. Client-supplied role flags or headers are completely ignored, and student users attempting admin mutations are rejected with `403 Forbidden`.

### 7. How bookmark/solved progress is persisted?
Bookmark and solved statuses are persisted directly on the `User` document as arrays of `Question` ObjectIds. We update these arrays atomically using Mongoose's `$addToSet` and `$pull` operators, which guarantees idempotency even under rapid user clicks. Card status lookups run in $O(1)$ time on the client by retrieving the user's active IDs once via `/api/auth/me`.

### 8. How search/filtering works?
Search, multi-criteria filtering, sorting, and pagination are performed entirely inside the database using MongoDB query operators (`$or`, `$in`, `$regex`, `.sort()`, `.skip()`, `.limit()`). Search terms are sanitized via `escapeRegex()` before query execution to prevent regex injection, and pagination limits are bounded between 1 and 50 to prevent unbounded memory consumption.

### 9. How ingestion remains idempotent?
The ingestion script uses `slug` as the immutable unique key for both companies and questions. When ingesting a record, the script checks if a document with that slug already exists: if found, it updates mutable fields in-place; if not found, it inserts a new document. Running the same dataset multiple times results in 0 duplicate records and 0 changed ObjectIds.

### 10. How the application avoids duplicate Mongoose connections during Next.js development?
In development, Next.js clears the Node.js module cache on Hot Module Replacement (HMR), which would ordinarily instantiate new Mongoose connection pools on every code edit and exhaust database connections. In [`src/lib/db.ts`](file:///c:/Users/rohit/Desktop/parakh/src/lib/db.ts), we store the connection promise on `globalThis`, which survives module reloads and ensures all requests reuse a single shared connection pool.
