# Parakh — Project Viva & Interview Walkthrough Script

A natural, 5-minute verbal walkthrough script designed for academic project presentations, final-year vivas, and technical interview screens.

---

## Verbal Walkthrough (Spoken Transcript)

### 1. Introduction (0:00 – 0:30)
> *"Good morning / afternoon. Today, I'd like to present **Parakh** (meaning 'evaluation' or 'assessment' in Hindi), a full-stack technical interview preparation platform designed specifically for computer science students. I built Parakh as a monolithic web application using Next.js 16 App Router, TypeScript, MongoDB Atlas with Mongoose, and Tailwind CSS."*

---

### 2. The Problem (0:30 – 1:00)
> *"When students prepare for campus recruitment and off-campus placements, one of the biggest challenges they face is resource fragmentation. Questions frequently asked by target companies like Google, Amazon, or Microsoft are scattered across random discussion forums, community sheets, and personal notes. Students often spend more time trying to figure out which problems belong to which company than actually practicing them. Furthermore, existing platforms don't offer clear, company-wise readiness metrics to show how prepared you actually are for a specific interview."*

---

### 3. The Solution (1:00 – 1:30)
> *"Parakh solves this by providing a centralized, company-wise and topic-wise preparation hub. On Parakh, students can target specific hiring companies, filter coding problems across core algorithmic topics like Dynamic Programming, Trees, or Graphs, and track their progress through real-time readiness analytics that break down completion percentages by company and difficulty."*

---

### 4. Key Implemented Features (1:30 – 2:15)
> *"In terms of functionality, the platform includes:
> - A searchable company catalog where selecting a company immediately pre-filters relevant coding questions.
> - A multi-criteria question catalog with keyword searching, difficulty tiers—Easy, Medium, and Hard—topic pills, safe sorting, and bounded pagination.
> - Full student authentication with persistent bookmarks and a solved status tracker.
> - A live preparation dashboard that computes overall progress, difficulty ratios, and company readiness bars.
> - A role-protected admin panel with real-time database counts and reference-protected CRUD operations.
> - A standalone CLI ingestion engine that allows bulk onboarding of companies and questions from CSV and JSON files.
> - And finally, full Dark Mode support with zero hydration flicker and responsive mobile layouts."*

---

### 5. System Architecture (2:15 – 3:00)
> *"Architecturally, Parakh is structured as a three-tier monolith:
> - On the client tier, we use React 19 Server Components by default for fast initial page load and minimal JavaScript bundle sizes. Interactive islands like filters, search inputs, and modal forms are explicitly designated with `"use client"`.
> - On the application tier, Next.js Route Handlers serve as our RESTful API layer. Every incoming request passes through centralized Zod schema validation and a CSRF origin verification check before reaching database models.
> - On the database tier, we connect to MongoDB Atlas using Mongoose. To prevent connection exhaustion in serverless environments and during development hot-reloads, we cache the Mongoose connection pool on `globalThis`."*

---

### 6. Database Design & Referential Safety (3:00 – 3:30)
> *"Our data model consists of Users, Companies, Questions, and join records. Questions hold an array of ObjectIds referencing the Company collection, while the User document directly stores arrays of Question ObjectIds for bookmarks and solved questions. We update these arrays atomically using MongoDB `$addToSet` and `$pull` operators, which guarantees idempotency and eliminates race conditions. We also enforce referential integrity: if an administrator tries to delete a company that is still referenced by questions, our API blocks the deletion with an HTTP 409 Conflict."*

---

### 7. Authentication & Security (3:30 – 4:00)
> *"For security, we use stateless authentication with JSON Web Tokens. Passwords are encrypted with `bcryptjs` using 10 salt rounds and are never stored or returned in plaintext. Upon login, the server issues a signed JWT containing the user ID and role, stored inside an `httpOnly`, `SameSite=Lax`, `secure` cookie. This completely eliminates token theft via Cross-Site Scripting (XSS). Role-based authorization is enforced strictly on the server: even if a student inspects the browser UI, our backend mutation routes reject unauthorized calls with a 403 Forbidden."*

---

### 8. Engineering Decisions, Ingestion & Testing (4:00 – 4:30)
> *"One key engineering decision was building our data ingestion engine as an independent CLI tool rather than an admin web upload. This avoids web request timeouts, prevents file-upload vulnerabilities, and allows safe dry-run simulations. Ingestion uses the question slug as an idempotent unique key, resolving human-readable company slugs to ObjectIds in a single query.
>
> To ensure reliability, I built an automated test suite using **Vitest** with 44 tests covering Zod schemas, JWT signature tampering, CSRF protection, and RFC 4180 CSV parsing, all passing with zero errors alongside a clean ESLint audit."*

---

### 9. Deployment & Future Roadmap (4:30 – 5:00)
> *"The application is production-ready for deployment on Vercel with MongoDB Atlas, complete with framework-level security headers like `nosniff` and `X-Frame-Options: DENY`.
>
> Looking ahead, potential future improvements include:
> 1. Adding transactional email digests using Nodemailer to send weekly preparation reminders.
> 2. Integrating an in-browser code editor and runner.
> 3. Replacing MongoDB regex searches with a dedicated search engine like Typesense for sub-millisecond query performance at scale.
>
> Thank you, and I am happy to answer any technical questions."*
