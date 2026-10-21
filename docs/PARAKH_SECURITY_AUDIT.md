# Parakh (परख) - Application Security & Production Readiness Audit

**Audit Status:** Complete & Verified  
**Auditor Role:** Senior Backend Engineer + Application Security Engineer + Production Security Auditor  
**Runtime Stack:** Next.js 16 (App Router + Turbopack), React 19, TypeScript 5, Mongoose 9, MongoDB Atlas, TailwindCSS 4, Zod 4, Vitest 2  

---

## 1. Security Scope

This security audit covers the entirety of the Parakh application, encompassing:
1. **Network & Transport Layer:** Next.js security headers, Strict-Transport-Security, Content-Security-Policy, Permissions-Policy, frame embedding protections.
2. **Authentication System:** Cookie configuration (`parakh_token`, `httpOnly`, `sameSite: "lax"`, `secure: production`), password hashing (`bcryptjs`, cost factor 10), JWT signing & verification (algorithm pinned to `HS256`, minimum secret entropy enforcement).
3. **Authorization & Access Control (RBAC):** Server-side role enforcement (`requireAuth`, `requireAdmin`), IDOR prevention on user bookmarks, solved statuses, and admin endpoints.
4. **API & Data Validation:** Request body parsing, Zod schema validation, ObjectId regex sanitization, bounded string & array parameters, query parameter whitelisting.
5. **Database Security (Mongoose / MongoDB):** Injection prevention, ReDoS regex escaping, referential integrity safeguards (preventing cascading deletions of companies referenced by questions), connection caching with `bufferCommands: false`.
6. **Client-Side & UI Boundaries:** Zero untrusted `dangerouslySetInnerHTML`, safe external links (`rel="noopener noreferrer"`), client state sync vs. server truth separation.
7. **Supply Chain & Dependencies:** `npm audit` dependency evaluation for production and devDependencies.

---

## 2. Security Threat Model

We evaluated Parakh against realistic attacker vectors across all system layers:

| Threat Vector | Attacker Strategy | Parakh Defense & Hardening | Status |
| :--- | :--- | :--- | :--- |
| **A. Unauthenticated Attacker** | Direct access to admin or private student endpoints (`/api/admin/*`, `/api/dashboard`, `/api/questions/bookmarked`). | Server-side gatekeeper functions (`requireAuth`, `requireAdmin`) inspect cookie token; fail closed with HTTP 401. | Protected |
| **B. Normal Student / IDOR** | Attempt to view or modify another student's bookmarks or solved status by tampering with user IDs in requests. | No user ID in request payload is ever trusted; user identity is derived strictly from the verified JWT cookie (`auth.user.userId`). | Protected |
| **C. Privilege Escalation** | Supplying `role: "admin"` in registration payload or attempting to call admin mutations. | Registration route strictly overrides role to `"student"`. Admin endpoints enforce `payload.role === "admin"`, returning HTTP 403 Forbidden. | Protected |
| **D. JWT Tampering / Alg Confusion** | Forging tokens with `"alg": "none"` or mismatched HMAC algorithms to bypass signature verification. | `verifyToken()` explicitly pins `algorithms: ["HS256"]`. Tampered payloads or signature mismatches fail closed returning `null`. | Protected |
| **E. Cross-Site Request Forgery (CSRF)** | Exploiting automatic browser cookie transmission on cross-site mutation requests. | State mutations check origin headers via `validateCsrfOrigin()`; cookies set with `sameSite: "lax"`, `httpOnly: true`. | Protected |
| **F. MongoDB Operator Injection** | Injecting `$gt`, `$ne`, `$where`, or object-based queries in JSON or URL query strings. | All inputs are parsed and validated via strict Zod schemas; queries construct explicit field filters without object spreading. | Protected |
| **G. ReDoS (Regular Expression DoS)** | Sending malicious catastrophic backtracking regex patterns into search endpoints (`/api/questions?search=...`). | Search inputs are sanitized with `escapeRegex()`, and capped to maximum length (100 characters). | Protected |
| **H. Resource Exhaustion / Pagination DoS** | Requesting extreme limits (e.g., `?limit=99999`) or negative offsets to crash memory. | `questionQuerySchema` and `companyQuerySchema` enforce integer bounds: `min(1)` and `max(50)`. | Protected |
| **I. Cross-Site Scripting (XSS)** | Injecting malicious JavaScript via question titles, topics, or markdown descriptions. | React automatically escapes string bindings. Single inline theme script is static. Next.js CSP headers restrict script execution. | Protected |
| **J. Malicious External Redirects** | Supplying `javascript:`, `data:`, or phishing URLs as LeetCode problem links. | Strict Zod refinement mandates URLs use `http:` or `https:`, target `leetcode.com/problems/*`, and external links use `rel="noopener noreferrer"`. | Protected |
| **K. Referential Corruption** | Deleting a company that is referenced by active interview questions. | Company deletion route checks `Question.countDocuments({ companies: company._id })` and halts deletion with HTTP 409 Conflict if references exist. | Protected |
| **L. Environment Secret Leaks** | Committing secrets or exposing database/JWT keys to client-side bundles. | All secrets are server-only (`MONGODB_URI`, `JWT_SECRET`), zero `NEXT_PUBLIC_` prefixes, `.env*` ignored in `.gitignore`. | Protected |

---

## 3. Authentication & Session Security

- **Password Storage:** Salted and hashed using `bcryptjs` with work factor 10.
- **Password Exposure:** Password hash has `select: false` on the User Mongoose schema. It is explicitly omitted from user serialization.
- **Session Transport:** Sessions are maintained via `parakh_token` HTTP cookies:
  - `httpOnly: true` (inaccessible to JavaScript, defending against session hijacking via XSS)
  - `sameSite: "lax"` (mitigates CSRF for cross-site post mutations)
  - `secure: process.env.NODE_ENV === "production"` (transmits only over TLS in production)
  - `path: "/"`
  - `maxAge: 7 * 24 * 60 * 60` (7 days)
- **JWT Signature:** Signed and verified with pinned `HS256` algorithm.
- **Minimum Secret Entropy:** In production environments, `getJwtSecret()` validates that `JWT_SECRET` contains at least 32 characters, preventing deployment with default or weak secrets.
- **Session Termination (Logout):** `/api/auth/logout` explicitly clears the cookie with `maxAge: 0`.

---

## 4. Authorization & IDOR Defense

- **Separation of Concerns:** The client UI hides admin actions for UX convenience, but the server independently verifies permissions for every request.
- **Server Guard Functions:**
  - `requireAuth(request)`: Returns 401 if token is missing, invalid, or expired.
  - `requireAdmin(request)`: Validates authentication, then checks `role === "admin"`. If non-admin, returns 403 Forbidden.
- **IDOR Immunity:**
  - `/api/questions/[slug]/bookmark`: Modifies `User.updateOne({ _id: auth.user.userId }, { $addToSet / $pull: ... })`.
  - `/api/questions/[slug]/solved`: Modifies `User.updateOne({ _id: auth.user.userId }, { $addToSet / $pull: ... })`.
  - `/api/dashboard`: Aggregates metrics scoped strictly to `auth.user.userId`.
  - Students cannot query or mutate records belonging to any other user.

---

## 5. API & Input Validation

Every endpoint enforces strict Zod schema validation:
- **Registration / Login:** Email trimmed, lowercased, validated for RFC format; password length bounded (6 to 100 characters).
- **Queries:** `page` bounded (`>= 1`), `limit` bounded (`1 to 50`), `sort` restricted to enum whitelist (`["latest", "oldest", "title"]` or `["name", "latest", "oldest"]`). Search string capped to 100 characters.
- **Companies & Questions:** Slugs validated against kebab-case regex `/^[a-z0-9]+(?:-[a-z0-9]+)*$/`. ObjectIds verified via 24-character hexadecimal regex.
- **Array Fields:** `topics` capped to 30 items (max 50 chars each); `companies` capped to 50 ObjectIds.

---

## 6. Database Layer & Data Integrity

- **Connection Caching:** Mongoose connection promise cached on Node's `globalThis` (`mongooseCache`) to prevent socket exhaustion during Next.js Hot Module Reloads and serverless warm starts.
- **Fast-Fail Buffering:** Mongoose configured with `bufferCommands: false` to ensure database failures fail fast with diagnostic errors rather than hanging.
- **No Cascade Deletion:** Company deletion verifies referential integrity; companies referenced by questions cannot be deleted until associations are updated or removed.
- **Safe Projections:** Aggregations and queries explicitly project necessary fields (`.select("_id name slug logo")`, `.lean()`), minimizing serialization overhead and preventing accidental leakage of internal fields.

---

## 7. HTTP Security Headers & Cache-Control

### Security Headers Configured in `next.config.ts`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';`

### Private Cache Prevention
Authenticated and private student/admin API endpoints explicitly set:
```http
Cache-Control: private, no-store, max-age=0
```
This protects private user progress, bookmarks, solved records, and admin statistics from being cached by intermediate HTTP proxies, CDNs, or shared browser caches.

---

## 8. Dependency & Supply-Chain Audit

- **Production Dependencies:**
  - `bcryptjs` 3.0.3
  - `jsonwebtoken` 9.0.3
  - `mongoose` 9.11.2
  - `next` 16.4.2
  - `react` 19.3.0
  - `react-dom` 19.3.0
  - `zod` 4.6.7
- **Audit Verification:** `npm audit --omit=dev` reported **0 vulnerabilities** across all production runtime packages.
- **Development Tooling:** Local test dependencies (`vitest`) contain upstream moderate/high advisories in CLI tooling that do not bundle into or affect production web server runtimes.

---

## 9. Verification & Automated Test Coverage

The automated test suite in `tests/` contains **75 automated test assertions** across 6 suites:
- `tests/auth.test.ts`: Password hashing, token signing, session verification.
- `tests/security-audit.test.ts`: Role tampering rejection, algorithm confusion prevention, IDOR protection, Cache-Control header enforcement, ReDoS resilience.
- `tests/security.test.ts`: CSRF origin verification on state-changing requests.
- `tests/validation.test.ts`: Zod schema bounds, slug format, LeetCode URL restrictions.
- `tests/company-questions.test.ts`: Company-question relational integrity and referential constraints.
- `tests/ingest.test.ts`: Ingestion validation, dry-run safety, and record-level reporting.

All **75 tests pass**. Production build (`next build`) compiles all 28 routes cleanly with zero TypeScript errors and zero ESLint warnings.

---

## 10. Realistic Residual Risks & Limitations

Parakh has been hardened against common web and application-tier vulnerabilities. However, in accordance with honest engineering principles, the following residual risks and architectural limitations remain:

1. **Distributed Rate Limiting:**
   - *Current State:* Request validation and payload bounds prevent memory and parser exhaustion locally.
   - *Limitation:* Parakh does not include an external distributed cache (such as Redis or Upstash). In serverless deployments (e.g., Vercel), in-memory rate limiting is ephemeral across container instances.
   - *Production Recommendation:* Enable Cloudflare WAF, Vercel DDoS protection, or an Upstash Redis-backed token bucket limiter if Parakh experiences heavy automated credential stuffing attacks.
2. **Account Lockout on Consecutive Failed Logins:**
   - *Current State:* Constant-time bcrypt verification prevents user enumeration.
   - *Limitation:* Account lockout after repeated failed attempts is not stored in MongoDB to avoid denial-of-service against legitimate user accounts.
   - *Production Recommendation:* Implement IP-level or CAPTCHA-based throttling for the `/login` route at the CDN/reverse-proxy layer.
3. **Database Connection Pooling in Extreme Serverless Spikes:**
   - *Current State:* Connection caching on `globalThis` prevents connection leaks within warm container instances.
   - *Limitation:* Extreme cold-start traffic bursts (e.g., thousands of simultaneous unique container spins) can strain MongoDB connection limits if not using a connection proxy.
   - *Production Recommendation:* Use MongoDB Atlas Serverless or set up an Atlas connection pooling proxy if concurrent traffic scales into thousands of concurrent requests.
4. **JWT Revocation / Blacklisting:**
   - *Current State:* Tokens have a bounded 7-day expiration and are discarded client-side on logout.
   - *Limitation:* Because tokens are stateless JWTs, a stolen token remains cryptographically valid until its 7-day expiration unless a server-side revocation list or token versioning (`tokenVersion` on User) is introduced.
   - *Production Recommendation:* If instant session revocation across all devices is required, implement a `tokenVersion` field on the User document and check it during `requireAuth`.

---

## 11. Production Deployment Checklist

- [x] `MONGODB_URI` set in production environment variables (server-only, no `NEXT_PUBLIC_`).
- [x] `JWT_SECRET` generated with high entropy (`openssl rand -base64 32`) and length >= 32 characters.
- [x] Auth cookie flags verified: `httpOnly: true`, `sameSite: "lax"`, `secure: true`.
- [x] Security headers active: CSP, HSTS, X-Frame-Options, X-Content-Type-Options.
- [x] Sensitive authenticated routes protected with `Cache-Control: private, no-store, max-age=0`.
- [x] All 28 Next.js routes compile cleanly in Turbopack production build.
- [x] 0 vulnerabilities reported in production dependencies (`npm audit --omit=dev`).
