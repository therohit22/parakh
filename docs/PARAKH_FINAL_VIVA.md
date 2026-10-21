# Parakh — Final University Viva & Project Defense Script

A comprehensive, natural spoken explanation structured across 19 evaluation sections for university project vivas, external academic reviews, and capstone project defenses.

---

## 1. Introduction
> *"Respected examiners, good morning. Today, I am presenting my final-year engineering project titled **Parakh** (परख = evaluation or testing). Parakh is a full-stack, company-wise technical interview preparation platform designed specifically for computer science undergraduate students."*

---

## 2. Problem Statement
> *"During placement seasons, engineering students face a major challenge: resource fragmentation. Interview questions asked by target hiring firms like Google, Amazon, Microsoft, and Netflix are scattered across unorganized spreadsheets, Discord groups, and random discussion forums. Students spend valuable preparation time searching for questions rather than practicing them. Furthermore, existing platforms do not offer company-specific readiness analytics."*

---

## 3. Project Objective
> *"The primary objective of Parakh is to provide a structured, centralized web platform where students can:
> 1. Target questions categorized by hiring companies and core computer science topics.
> 2. Filter problems by difficulty tiers (Easy, Medium, Hard).
> 3. Track preparation readiness in real time through an analytics dashboard.
> 4. Maintain persistent personal bookmarks and solved progress."*

---

## 4. Key Implemented Features
> *"The platform includes:
> - A searchable company catalog with direct filtering links.
> - A multi-criteria question catalog with keyword searching, difficulty tiers, topic pills, safe sorting, and bounded pagination.
> - Full student authentication with session inspection.
> - An interactive question detail page with bookmarks, solved status toggles, and external problem links.
> - A live student preparation dashboard.
> - Dedicated user lists for Bookmarks and Solved questions with inline removal.
> - An admin management panel for Company and Question CRUD with referential conflict safety.
> - An idempotent CLI tool for bulk data ingestion from CSV and JSON files.
> - Full system-detected Dark Mode with zero hydration flicker and responsive mobile layouts."*

---

## 5. Technology Stack
> *"The project is built using:
> - **Frontend**: Next.js 16 App Router, React 19, Tailwind CSS v4, and Geist typography.
> - **Backend**: Next.js Route Handlers implementing a RESTful API layer.
> - **Database**: MongoDB Atlas cloud cluster with Mongoose ODM.
> - **Validation**: Zod schema validation.
> - **Authentication**: Stateless JSON Web Tokens (`jsonwebtoken`) and `bcryptjs`.
> - **Testing**: Vitest automated test runner.
> - **Deployment**: Production-ready on Vercel."*

---

## 6. System Architecture
> *"Architecturally, Parakh is structured as a three-tier monolith:
> - **Client Tier**: Uses React Server Components (RSC) by default for fast initial paints and minimal client JavaScript. Client components (`"use client"`) are isolated to interactive islands like search inputs, filter bars, and modal dialogs.
> - **Application Tier**: Co-located Next.js Route Handlers serve as the API layer. Every request passes through centralized Zod schema validation and a CSRF origin verification check before touching models.
> - **Database Tier**: Connects to MongoDB Atlas using Mongoose. To avoid connection pool exhaustion during dev-server hot reloads and serverless cold starts, the connection promise is cached on `globalThis`."*

---

## 7. Database Design
> *"Our data model uses normalized Mongoose schemas:
> - **User**: Profile info, hashed password (`select: false`), role (`student` or `admin`), and arrays of `bookmarkedQuestions` and `solvedQuestions` ObjectIds.
> - **Company**: Unique slug, name, logo URL, description, and website.
> - **Question**: Unique slug, title, difficulty enum, topics array, external URL, and an array of ObjectIds referencing the Company collection.
> - **Referential Integrity**: When deleting a company, the API verifies if questions still reference that company's ObjectId. If references exist, the deletion is rejected with an HTTP 409 Conflict."*

---

## 8. Authentication
> *"For security, we implement stateless authentication using JSON Web Tokens. Passwords are encrypted with `bcryptjs` using 10 salt rounds and are never stored or logged in plaintext (`password` has `select: false` by default). Upon successful login, the server generates a signed JWT containing the user ID and role with a 7-day expiration, and attaches it as an `httpOnly`, `SameSite=Lax`, `secure` cookie named `parakh_token`. This ensures client-side JavaScript cannot read the token, completely neutralizing XSS token theft."*

---

## 9. Authorization
> *"Authorization is enforced strictly on the server using role-based access control (RBAC). In `src/lib/auth.ts`, we provide `requireAuth()` for student actions like toggling bookmarks or solved status, and `requireAdmin()` for administrative operations. The server cryptographically validates the token signature against `JWT_SECRET` and checks `payload.role === 'admin'`. Even if a client modifies local UI state or crafts manual curl requests, unauthorized actions are rejected with HTTP 403 Forbidden."*

---

## 10. Search & Filtering Mechanics
> *"Search and filtering are performed entirely inside MongoDB:
> - Keyword search uses sanitized case-insensitive `$regex` matching against title or description.
> - To prevent Regular Expression Denial of Service (ReDoS) or query injection, all user strings pass through an `escapeRegex` utility before query execution.
> - Filtering applies exact matches on indexed fields (`difficulty`, `topics`, `companies`).
> - Pagination uses `.skip()` and `.limit()`, strictly clamped between 1 and 50 to prevent memory exhaustion."*

---

## 11. Bookmark & Solved Functionality
> *"Bookmarks and solved statuses are stored directly on the `User` document as arrays of `Question` ObjectIds. We update these arrays atomically using MongoDB's `$addToSet` and `$pull` operators. This guarantees idempotency: rapid clicks or network retries will never produce duplicate IDs in the array. Card status lookups run in $O(1)$ time on the client by retrieving the user's active IDs once on mount via `/api/auth/me`."*

---

## 12. Preparation Dashboard Analytics
> *"The student dashboard computes overall preparation progress, difficulty breakdown ratios (Easy, Medium, Hard), and company-wise completion bars. It executes exactly 4 bulk database operations: user retrieval, question count by difficulty, solved question lookup via `$in`, and company question totals via an `$unwind`/`$group` pipeline. All calculations happen in-memory with division-by-zero protection, completely avoiding $N+1$ query loops."*

---

## 13. Admin Management Panel
> *"The admin panel is accessible at `/admin` strictly to users with `role: "admin"`. It displays live database document counts and provides full CRUD management for Companies and Questions. When an admin attempts to delete a company, the backend verifies if questions still reference that company; if active references exist, deletion is blocked with an HTTP 409 Conflict to preserve data integrity."*

---

## 14. CSV/JSON Bulk Data Ingestion
> *"We built an independent CLI tool (`scripts/ingest/`) executed via `npm run ingest -- <file>`. It parses RFC 4180 CSV and JSON files and uses `slug` as the stable unique key for idempotent upserts: existing records are updated in-place, and new records are inserted without changing ObjectIds. It pre-loads an in-memory company slug map to resolve foreign references in a single query and supports a safe `--dry-run` simulation mode."*

---

## 15. LeetCode Practice Integration
> *"Every coding question in Parakh supports a direct, official LeetCode practice link (`leetcodeUrl`). The field is optional to accommodate company-specific and system design problems that lack public LeetCode equivalents. The URL is strictly validated on both client and server to reject unsafe pseudoprotocols (`javascript:`, `data:`) and non-LeetCode domains. In the UI, cards feature a compact `LeetCode →` action, while the detail page provides a prominent `Practice on LeetCode` button with `target="_blank"` and `rel="noopener noreferrer"`. Questions without links display a clean unavailable notice without broken buttons or fake `href="#"` links."*

---

## 16. Testing Strategy
> *"Our automated test suite in **Vitest** includes 46 tests across 4 test suites:
> 1. `validation.test.ts`: Tests Zod schemas against valid and invalid inputs, pagination limits, LeetCode URL safety, and regex escaping.
> 2. `auth.test.ts`: Tests token signing, expiration, signature tampering rejection, and RBAC authorization (401/403/allowed).
> 3. `security.test.ts`: Tests CSRF origin verification on mutations.
> 4. `ingest.test.ts`: Tests RFC 4180 CSV parsing, quotes, commas, and newlines.
> All tests pass deterministically alongside a zero-warning ESLint audit."*

---

## 17. Deployment Architecture
> *"Parakh is configured for deployment on **Vercel** connected to **MongoDB Atlas**. Pre-rendered static pages and assets are distributed globally via Vercel's Edge CDN, while dynamic route handlers run as serverless functions. Environment variables (`MONGODB_URI`, `JWT_SECRET`) are configured in Vercel project settings and are never exposed to browser bundles."*

---

## 18. Security Measures
> *"Security is applied at every layer:
> 1. XSS mitigation via `httpOnly` session cookies and `noopener noreferrer` on external links.
> 2. CSRF mitigation via `Origin` and `Referer` header verification.
> 3. ReDoS and NoSQL injection defense via `escapeRegex` and Zod boundary validation.
> 4. Clickjacking and MIME sniffing prevention via HTTP security headers (`nosniff`, `DENY`).
> 5. Credential protection via bcrypt password hashing (10 rounds) and `select: false` projections."*

---

## 19. Honest Limitations
> *"As a focused student engineering project, Parakh has honest technical boundaries:
> 1. Keyword search uses MongoDB `$regex`, which performs collection scans on large datasets.
> 2. Authentication supports email/password only; social OAuth is not yet integrated.
> 3. Bulk ingestion runs via CLI rather than an admin web file upload.
> 4. Coding practice links externally to LeetCode rather than executing code inside an in-browser sandbox."*

---

## 20. Future Scope
> *"For future work, the platform can evolve by:
> 1. Integrating an inverted-index search engine like Typesense or Elasticsearch for sub-millisecond search across millions of questions.
> 2. Adding Google and GitHub OAuth2 single sign-on.
> 3. Implementing asynchronous background queue workers (BullMQ/Redis) for admin web uploads.
> 4. Embedding an in-browser code editor and runner (Judge0 / WebAssembly)."*

---

## 21. Conclusion
> *"In conclusion, Parakh successfully demonstrates how a monolithic full-stack application can solve real-world student preparation challenges with clean architecture, defensive security, type safety, real-time analytics, and direct LeetCode practice integration. Thank you, and I am now ready for your questions."*
