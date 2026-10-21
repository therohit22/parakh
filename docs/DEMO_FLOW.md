# Parakh — Project Demonstration & Evaluation Script

This document provides a structured, 5–10 minute demonstration sequence designed for college project evaluations, GitHub reviews, and technical interview walk-throughs.

---

## Demo Overview

| Section | Target Duration | Core Objective |
|---|---|---|
| **1. Introduction & Context** | 1 minute | State the real-world problem, the target audience, and the technical scope. |
| **2. Public Exploration** | 2 minutes | Demonstrate company discovery, question search, multi-criteria filtering, and pagination. |
| **3. Student Journey** | 2 minutes | Demonstrate registration, login, bookmarking, marking solved, and the live dashboard. |
| **4. Admin Portal** | 2 minutes | Demonstrate server-side RBAC, platform metrics, and referential integrity protection. |
| **5. CLI Ingestion & Architecture** | 2 minutes | Show idempotent data onboarding and explain the core engineering decisions. |

---

## Step-by-Step Demo Script

### Step 1: Problem Statement & Homepage (1:00)
1. **Navigate to**: `http://localhost:3000`
2. **Talking Points**:
   - *"When computer science students prepare for campus placements and technical interviews, they often struggle with fragmented problem lists spread across LeetCode, company-specific discussion forums, and sheets."*
   - *"Parakh (meaning 'evaluation' in Hindi) is a full-stack platform that organizes technical interview questions company-wise and topic-wise, providing real-time preparation readiness metrics."*
3. **Actions to Show**:
   - Hero section with direct action buttons (`Browse Companies`, `Explore Questions`).
   - Quick topic tags (`Arrays`, `Dynamic Programming`, `Trees`) and company shortcuts (`Google`, `Amazon`, `Microsoft`).
   - Toggle **Dark Mode / Light Mode** in the top navigation bar to demonstrate zero-flicker theme persistence.

---

### Step 2: Company Catalog & Filter Navigation (1:30)
1. **Navigate to**: Click **Companies** in navbar (`/companies`).
2. **Actions to Show**:
   - Type in the search box (e.g., `Google` or `Amazon`) to demonstrate live database search.
   - Click **"View Questions"** on any company card (e.g. Google).
   - Notice the URL automatically transitions to `/questions?company=google`, pre-filtering the questions catalog by that specific employer.

---

### Step 3: Question Catalog, Search & Multi-Criteria Filtering (2:00)
1. **Navigate to**: `/questions`
2. **Actions to Show**:
   - **Keyword Search**: Type `Sum` into the search field.
   - **Difficulty Filter**: Select `Medium` or `Easy` from the dropdown.
   - **Topic Filter**: Enter a topic tag like `Arrays`.
   - **Sorting**: Switch sort order between `Latest`, `Oldest`, and `A-Z`.
   - **Pagination**: Demonstrate moving between pages with bounded pagination ($1 \le \text{limit} \le 50$).
   - Click **"Reset Filters"** to restore default state.
3. **Talking Points**:
   - *"All search, filtering, and sorting happen inside MongoDB using compound indexes and regex escaping (`escapeRegex`) to prevent ReDoS and injection attacks. No entire collections are fetched into Node.js memory."*

---

### Step 4: Question Detail & Unauthenticated Interaction (1:00)
1. **Click on a Question**: (e.g., `/questions/two-sum`).
2. **Actions to Show**:
   - Difficulty pill badge (`Easy` in emerald, `Medium` in amber, `Hard` in rose).
   - Topic tag pills and associated company links.
   - External link opening the verified problem on LeetCode.
   - Click the **"Bookmark"** or **"Mark Solved"** button while logged out.
   - Observe the non-intrusive banner prompting the user to sign in to track their progress.

---

### Step 5: Student Authentication Flow (1:30)
1. **Navigate to**: Click **Sign In** -> **Register** (`/register`).
2. **Actions to Show**:
   - Register a new student account:
     - Name: `Student Demo`
     - Email: `demo.student@example.com`
     - Password: `Password123`
   - Automatically redirects to `/login`.
   - Log in with the registered credentials.
   - Observe the navbar instantly update: displays the user's name (`Student Demo`), a `student` role badge, and a `Sign Out` button.
3. **Talking Points**:
   - *"Authentication uses cryptographically signed JWTs stored strictly in an `httpOnly`, `SameSite=Lax`, `secure` cookie. Passwords are never stored in plaintext — they are hashed with bcrypt using 10 salt rounds."*

---

### Step 6: Interactive Progress Tracking & Student Dashboard (2:00)
1. **Actions on Question Detail**:
   - Return to a question (e.g. `/questions/two-sum`).
   - Click **"Bookmark"** — badge turns Indigo (`Bookmarked`).
   - Click **"Mark as Solved"** — badge turns Emerald (`Solved`).
2. **Navigate to**: Click **Dashboard** (`/dashboard`).
3. **Actions to Show**:
   - Personalized greeting (`Welcome back, Student Demo`).
   - 4 Top Metric Cards: Total Questions, Solved Questions, Bookmarked Questions, Remaining Questions.
   - Visual Progress Bar displaying overall preparation percentage.
   - Difficulty Breakdown: Solved ratios for Easy, Medium, and Hard.
   - Company Preparation Grid: Real-time completion bars per target employer.
4. **Navigate to**: Click **Bookmarks** (`/bookmarks`) and **Solved** (`/solved`) in the navbar.
   - Show that the saved question appears in both lists with inline removal actions.
5. **Talking Points**:
   - *"Bookmarks and progress are updated atomically using MongoDB `$addToSet` and `$pull` operators, making them race-condition free. The dashboard computes all company and difficulty metrics in exactly 4 bulk database queries without any N+1 query loops."*

---

### Step 7: Admin Panel & Referential Integrity Guard (2:00)
1. **Log in as Admin**:
   - (Or sign out and log in with an administrative account).
2. **Navigate to**: Click **Admin** in navbar (`/admin`).
3. **Actions to Show**:
   - Real MongoDB document counts (Total Companies, Total Questions, Total Registered Users).
   - **Company Manager** (`/admin/companies`):
     - Search companies.
     - Click **"Add Company"** to demonstrate modal form creation with slug auto-generation.
     - Attempt to delete a company that has associated questions:
       - Show the confirmation modal.
       - Click Delete -> Observe the clean error alert: *"Cannot delete company because questions still reference it"* (HTTP 409 Conflict).
   - **Question Manager** (`/admin/questions`):
     - Filter and paginate questions.
     - Click **"Add Question"** to show multi-company association checkboxes.
4. **Talking Points**:
   - *"Admin authorization is enforced strictly on the server (`requireAdmin`). Even if a student inspects their browser to reveal admin UI buttons, all backend mutation endpoints reject non-admin requests with 403 Forbidden."*

---

### Step 8: Bulk Data Ingestion CLI Demo (1:00)
1. **Open Terminal**:
2. **Execute Ingestion Dry-Run**:
   ```bash
   npm run ingest -- fixtures/companies.csv --dry-run
   ```
   - Show terminal summary output: Processed, Created, Updated, Skipped, and 0 Failures.
3. **Execute Ingestion Live Upsert**:
   ```bash
   npm run ingest -- fixtures/companies.csv
   ```
4. **Talking Points**:
   - *"Our standalone ingestion engine supports RFC 4180 CSV and JSON files. It uses slugs for idempotent upserts and resolves human-readable company names to ObjectIds, preventing orphan database references."*

---

### Step 9: Architecture & Security Wrap-Up (1:00)
1. **Summary Points for Evaluator**:
   - **Full-Stack Next.js 16 Monolith**: Co-located React 19 UI and REST API route handlers.
   - **Zero Client Token Exposure**: JWT in httpOnly cookie protects against XSS.
   - **Defensive Input Boundaries**: Centralized Zod validation on every request body, slug, and query parameter.
   - **Serverless Connection Caching**: `globalThis` connection pooling prevents database exhaustion during hot reloads and serverless execution.
   - **Portfolio-Ready**: 44 automated tests in Vitest, zero ESLint warnings, and standard Next.js production builds.
