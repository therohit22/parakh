# Parakh — Live Demo Script & Evaluation Presentation Guide

A concise, high-impact 5–7 minute live demonstration script with timestamped speaking points, interview follow-ups, a failure recovery plan, and screenshot guidelines for academic vivas, recruiter demos, and technical interviews.

---

## 1. 5–7 Minute Live Demo Script (Timestamped)

### **[0:00 – 0:30] Problem Statement**
- **Action**: Open browser at `http://localhost:3000`. Keep the homepage visible.
- **Speaking Points**:
  - *"During placement seasons, computer science students face severe fragmentation. Coding interview questions asked by top tech employers like Google, Amazon, or Microsoft are scattered across random discussion forums, Discord channels, and unorganized spreadsheets."*
  - *"Students spend hours hunting for company-specific problems instead of practicing, and generic platforms rarely track readiness on a per-company basis."*

---

### **[0:30 – 1:00] What Parakh Is**
- **Action**: Highlight the hero badge, headline, and primary call-to-actions.
- **Speaking Points**:
  - *"Parakh (meaning 'evaluation' in Hindi) is a full-stack technical interview preparation platform designed specifically for students."*
  - *"It organizes interview questions company-wise and topic-wise, providing real-time preparation readiness analytics that break down completion percentages by employer and difficulty tier."*
  - *"Built as a clean full-stack monolith using Next.js 16 App Router, React 19, TypeScript, and MongoDB Atlas."*

---

### **[1:00 – 2:00] Company & Question Discovery**
- **Action**: 
  1. Click **"Browse Companies"** (`/companies`).
  2. Type `Google` in the search bar to demonstrate live keyword search.
  3. Click **"View Questions"** on the Google card.
- **Speaking Points**:
  - *"From the Companies directory, students can search target hiring firms. Selecting any company transitions seamlessly to `/questions?company=google`, pre-filtering the question catalog."*
  - *"Toggle the top navigation theme button: notice full Dark Mode support with zero hydration flicker, powered by a blocking script in `<head>` and Tailwind CSS v4."*

---

### **[2:00 – 3:00] Search, Multi-Filter & Question Workflow**
- **Action**:
  1. Reset filters or navigate to `/questions`.
  2. Filter by **Difficulty** (`Medium`) and enter topic tag (`Arrays`).
  3. Demonstrate whitelisted sorting (`Latest`, `Oldest`, `A-Z`) and bounded pagination.
  4. Click on a question (e.g., `/questions/two-sum`).
  5. Show difficulty pill badge, topic pills, company tags, and external LeetCode link.
  6. Click **"Bookmark"** while logged out: observe the clean, non-intrusive sign-in banner.
- **Speaking Points**:
  - *"All filtering, searching, and sorting are executed in-database using MongoDB compound indexes and sanitized regex (`escapeRegex`) to prevent ReDoS and query injection. No entire collections are fetched into Node.js memory."*
  - *"Pagination is strictly bounded ($1 \le \text{limit} \le 50$) to protect server memory."*

---

### **[3:00 – 4:00] Authentication, Bookmarks & Solved Tracking**
- **Action**:
  1. Click **"Sign In"** -> **"Register"** (`/register`).
  2. Register a student account (e.g. `alex@example.com` / `Password123`) or log in with an existing account.
  3. Observe the navbar update immediately to show the user's name, role indicator (`student`), and `Sign Out` action.
  4. Return to a question detail view and click **"Bookmark"** and **"Mark as Solved"**.
  5. Show instant optimistic button state changes (Indigo for Bookmarked, Emerald for Solved).
- **Speaking Points**:
  - *"Authentication uses cryptographically signed JWTs stored strictly in an `httpOnly`, `SameSite=Lax`, `secure` cookie named `parakh_token` with bcrypt password hashing (10 salt rounds). Client JavaScript cannot access the token, preventing XSS token theft."*
  - *"User bookmarks and solved statuses are updated atomically via MongoDB `$addToSet` and `$pull` operators, making interactions completely idempotent and race-condition free."*

---

### **[4:00 – 5:00] Preparation Dashboard & Progress Analytics**
- **Action**:
  1. Click **"Dashboard"** (`/dashboard`).
  2. Walk through the 4 top metric cards: Total Questions, Solved Questions, Bookmarked Questions, Remaining Questions.
  3. Point out the overall preparation progress bar.
  4. Highlight the **Difficulty Progress** breakdown (Easy, Medium, Hard solved ratios).
  5. Highlight the **Company Preparation** grid showing completion bars per employer.
  6. Click **"Bookmarks"** (`/bookmarks`) and **"Solved"** (`/solved`) in the navbar to show dedicated list views with inline removal actions.
- **Speaking Points**:
  - *"The dashboard computes all completion metrics in exactly 4 bulk database operations without any $N+1$ query loops."*
  - *"If an administrator removes a question, dangling ObjectIds in user arrays are ignored gracefully via `$in` lookups, preventing corrupted statistics or UI crashes."*

---

### **[5:00 – 6:00] Admin Management Capabilities & Referential Integrity**
- **Action**:
  1. Show that students cannot access admin mutations (demonstrated in test suite with HTTP 403 Forbidden).
  2. Log in with an admin account and open `/admin`.
  3. View live MongoDB platform counts: Total Companies, Total Questions, Total Users.
  4. Open **Company Manager** (`/admin/companies`): show search and modal form creation with automatic slug generation.
  5. Highlight referential integrity: attempting to delete a company referenced by existing questions returns a clear `HTTP 409 Conflict` error without deleting the record.
  6. Open **Question Manager** (`/admin/questions`): show multi-company association checkboxes.
- **Speaking Points**:
  - *"Authorization is strictly server-side (`requireAdmin`). Even if a client modifies UI elements in developer tools, all backend mutation handlers reject unauthorized requests with 403 Forbidden."*
  - *"We enforce relational integrity in NoSQL: company deletion is blocked with HTTP 409 if questions still reference its ObjectId."*

---

### **[6:00 – 7:00] Architecture, Ingestion, Testing & Deployment**
- **Action**:
  1. Open terminal and run a dry-run ingestion command:
     ```bash
     npm run ingest -- fixtures/companies.csv --dry-run
     ```
  2. Run the test suite:
     ```bash
     npm test
     ```
  3. Summarize production architecture.
- **Speaking Points**:
  - *"Our standalone data ingestion engine imports RFC 4180 CSV and JSON files using question slugs for idempotent upserts. It resolves company slugs to ObjectIds in a single query and runs cleanly via CLI without web timeout overhead."*
  - *"Our automated test suite in Vitest covers 44 unit, validation, security, and ingestion tests with 100% pass rates."*
  - *"Production-ready for Vercel with MongoDB Atlas, featuring Mongoose connection caching on `globalThis` to prevent connection leaks during serverless execution."*

---

## 2. Interview Demo Talking Points

| Question | Concise Answer (2–3 Sentences) |
|---|---|
| **Why MongoDB?** | Coding interview questions naturally embed variable-length topic arrays and multiple company references. MongoDB's document model fits this structure seamlessly and supports atomic set operators (`$addToSet`, `$pull`) for race-condition-free user progress tracking. |
| **Why Mongoose?** | Mongoose provides schema validation, strict TypeScript typing, lifecycle hooks, and index compilation on top of raw MongoDB. It ensures application-level data integrity while retaining document flexibility. |
| **Why Next.js App Router?** | Next.js App Router enables a unified full-stack monolith using React Server Components by default for fast initial paints and minimal client JavaScript bundles. Route Handlers co-locate REST API endpoints with the frontend, simplifying deployment on Vercel. |
| **How does authentication work?** | Registration hashes passwords with `bcryptjs` (10 rounds) and forces `role: "student"`. Login verifies credentials and issues a signed JWT containing `{ userId, role }` stored in an `httpOnly`, `SameSite=Lax`, `secure` cookie named `parakh_token`. |
| **How is authorization enforced?** | Authorization is evaluated strictly on the server using `requireAdmin()`. It decodes verified claims from the signed JWT cookie; client-supplied role flags or headers are completely ignored, and students calling admin routes receive `HTTP 403 Forbidden`. |
| **How are passwords protected?** | Passwords are salted and hashed with bcrypt (10 rounds) before persistence. Password fields have `select: false` by default in Mongoose and are never returned in JSON bodies or logged to the console. |
| **How do bookmarks and solved states persist?** | Bookmarked and solved question ObjectIds are stored directly on the `User` document. They are updated atomically via `$addToSet` (add) and `$pull` (remove) and fetched once on mount via `/api/auth/me` for $O(1)$ client lookup. |
| **How does search and filtering work?** | Filtering, searching, sorting, and pagination happen entirely in MongoDB. Search queries sanitize keywords with `escapeRegex()` before `$regex` matching; sorting is whitelisted; and pagination limits are clamped ($1 \le \text{limit} \le 50$) to prevent memory exhaustion. |
| **How does ingestion remain idempotent?** | Ingestion uses `slug` as the unique immutable key for companies and questions. If a document with the slug exists, it updates fields in-place; if not, it inserts a new document. Running the same dataset multiple times creates zero duplicate documents. |
| **What would you improve at 1M user scale?** | I would route read queries to MongoDB Atlas read replicas, cache hot catalogs and sessions in Redis, replace regex searches with an inverted-index search engine (Typesense or Elasticsearch), and move bulk ingestion to asynchronous background queues (BullMQ/SQS). |

---

## 3. Demo Failure Plan ("If the Demo Breaks")

If an unexpected glitch occurs during a live presentation, remain calm and follow this systematic recovery checklist:

```text
Glitch Encountered
       │
       ▼
1. Check Terminal Output & Logs
   ├── Did the development server crash? ──► Run: npm run dev
   └── Is there a port collision? ──────────► Check port 3000
       │
       ▼
2. Check MongoDB Connectivity
   ├── Ping: curl -s http://localhost:3000/api/health/db
   └── If {"ok": false}: Ensure local mongod is running or check internet for Atlas
       │
       ▼
3. Check Environment Variables
   └── Verify .env.local exists and contains MONGODB_URI and JWT_SECRET
       │
       ▼
4. Check Authentication Session
   ├── Clear browser cookies and log in fresh at /login
   └── Inspect Application > Cookies > parakh_token in DevTools
       │
       ▼
5. Direct API Fallback
   └── If UI has a render issue, demonstrate the feature via curl in terminal:
       curl -s http://localhost:3000/api/companies
       curl -s http://localhost:3000/api/questions
```

### Verbal Fallback Statement for Evaluators:
> *"In a live demonstration environment, transient local network disruptions can occasionally affect the cloud database connection pool. Let me run our quick health ping endpoint `/api/health/db` to verify connectivity, or run our automated test suite in Vitest (`npm test`) which verifies our 44 core validation, auth, and security contracts deterministically."*

---

## 4. Recommended Screenshot Capture Plan

For GitHub repositories and portfolio showcases, capture these 6 high-resolution screens:

1. **`homepage_desktop.png`**: Hero section with company shortcuts, topic discovery tags, and Dark Mode enabled.
2. **`question_catalog_filtered.png`**: Questions catalog showing keyword search active, `Medium` difficulty selected, `Arrays` topic pill, and bounded pagination controls.
3. **`question_detail_active.png`**: Question detail page (`/questions/two-sum`) showing active Indigo `Bookmarked` and Emerald `Solved` badges.
4. **`student_dashboard_progress.png`**: Dashboard showing personalized greeting, 4 metric cards, overall preparation progress bar, difficulty breakdown, and company readiness grid.
5. **`admin_company_manager.png`**: Admin portal at `/admin/companies` showing document counts, searchable company table, and the modal creation dialog.
6. **`terminal_ingest_and_test.png`**: Clean terminal view showing `npm run ingest -- fixtures/companies.csv --dry-run` summary output and `npm test` with 44 passing tests.
