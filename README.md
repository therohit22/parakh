# Parakh

A company-wise technical interview preparation platform for practicing DSA questions and tracking interview preparation.

Live Demo: [Parakh](https://parakh-beige.vercel.app)
GitHub Repository: [GitHub](https://github.com/therohit22/parakh)

---

## Overview

During campus placements and technical job searches, computer science students often face fragmented interview preparation. Practice problems asked by specific hiring companies are typically scattered across discussion forums, spreadsheets, and community threads without centralized tracking.

**Parakh** solves this problem by providing a structured, company-wise and topic-wise preparation platform. Students can practice coding interview questions targeted to specific employers, filter problems by algorithmic topic and difficulty level, track solved questions, and monitor their preparation readiness through a dedicated dashboard.

---

## Features

- **Company-wise Question Preparation**: Practice DSA questions organized by target hiring companies (e.g., Google, Amazon, Microsoft, Flipkart).
- **Topic and Difficulty Filtering**: Filter questions by core computer science topics (Arrays, Strings, Trees, Dynamic Programming, Graphs) and difficulty levels (Easy, Medium, Hard).
- **Search**: Search questions and companies by title, topic, or keyword with server-side query sanitization.
- **Bookmarks**: Save important or challenging questions to a personal bookmarks list for quick access.
- **Solved-Question Tracking**: Mark completed problems as solved to record progress across topics and companies.
- **Preparation Dashboard**: View completion rates, difficulty distributions, and company readiness metrics.
- **LeetCode Practice Links**: Direct links to official LeetCode problems for immediate hands-on coding practice.
- **User Authentication**: Student registration and sign-in with secure session management.
- **Admin Management**: Dedicated administrator portal to create, update, and manage company and question catalogs.
- **Progress Tracking**: Track solved counts, recent practice activity, and review items.

---

## What I Built

- **Full-Stack Next.js Application**: Built using Next.js App Router with server-rendered pages and API route handlers for co-located frontend and backend functionality.
- **MongoDB & Mongoose Data Layer**: Designed schemas for users, companies, and questions, with connection pooling cached on `globalThis` to prevent connection leaks during serverless execution.
- **Stateless Cookie Authentication**: Implemented authentication using JSON Web Tokens (JWT) stored in `httpOnly`, `SameSite=Lax` cookies with password hashing via bcryptjs.
- **Boundary Validation**: Validated request bodies, query parameters, and URL slugs using Zod schemas to reject invalid or malformed data before database execution.
- **Server-Side Authorization**: Enforced role-based access control (`student` vs. `admin`) strictly on the server by decoding verified JWT claims.
- **Idempotent Data Ingestion**: Built a standalone CLI tool to import company and question datasets from CSV and JSON files using slug-based upserts to prevent duplicate records.
- **Automated Testing**: Wrote automated unit and integration tests with Vitest covering validation, authentication, route logic, and data ingestion.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js (App Router) |
| **Language** | TypeScript |
| **UI** | React, Tailwind CSS |
| **Database** | MongoDB Atlas, Mongoose |
| **Authentication** | JWT (`jsonwebtoken`), `bcryptjs` |
| **Validation** | Zod |
| **Testing** | Vitest |
| **Deployment** | Vercel |

---

## Architecture

```text
Browser → Next.js App Router / API Route Handlers → Mongoose → MongoDB Atlas
```

Parakh uses a monolithic full-stack architecture where Next.js App Router handles page rendering and RESTful route handlers. Client requests pass through server-side JWT verification and Zod schema validation before executing database queries. Mongoose manages interactions with MongoDB Atlas using a cached connection pool optimized for serverless execution.

---

## Getting Started

### Prerequisites

- **Node.js**: `v20.x` or higher
- **MongoDB**: Access to a MongoDB Atlas cluster or a local MongoDB instance (`mongodb://127.0.0.1:27017/parakh`)

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/therohit22/parakh.git
cd parakh
npm install
```

### Environment Variables

Create a local environment file by copying the template:

```bash
cp .env.example .env.local
```

Configure the following variables in `.env.local`:

```env
# MongoDB connection URI (Atlas or local instance)
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/parakh?retryWrites=true&w=majority

# Secret key for signing authentication JWT cookies (32+ characters)
JWT_SECRET=your-random-jwt-secret-key-at-least-32-chars
```

> Refer to `.env.example` as the source of truth for environment variable configuration.

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Create an optimized production build:

```bash
npm run build
```

### Test

Run the automated test suite:

```bash
npm test
```

---

## Security

- **Password Hashing**: User passwords are safe and hashed with `bcryptjs` (salt rounds: 10) before database storage.
- **HttpOnly Cookies**: Session tokens are stored in `httpOnly`, `SameSite=Lax` cookies (`secure: true` in production) to mitigate XSS token theft.
- **Server-Side Authorization**: Protected endpoints verify authentication status and user roles on the server rather than trusting client state.
- **Input Validation**: All request bodies, query parameters, and URL slugs are validated using strict Zod schemas.
- **CSRF Protection**: Origin and referer headers are validated for state-changing HTTP requests.
- **Query Sanitization**: Search inputs are sanitized to protect against NoSQL regex injection.
- **Secret Isolation**: Database credentials and JWT secrets are kept in environment variables and never exposed to client-side code.

---

## Data Ingestion

Parakh includes a standalone, idempotent CLI tool for importing companies and questions from CSV and JSON files into MongoDB:

```bash
# Ingest companies from CSV
npm run ingest -- fixtures/companies_valid.csv --type=companies

# Ingest questions from JSON
npm run ingest -- fixtures/questions_apna_college.json --type=questions

# Run in dry-run mode (validates without writing to database)
npm run ingest -- fixtures/companies_valid.csv --type=companies --dry-run
```

Records are matched by unique `slug` identifiers, updating existing entries in place without generating duplicates.

---

## Admin Management

Platform administrators (`role: "admin"`) have access to dedicated management interfaces:

- **Company Management**: Create, update, and manage company profiles and logos.
- **Question Management**: Create, update, and categorize interview questions with associated companies.
- **Referential Integrity**: Company deletion guards prevent deleting employers that have active associated questions.

---

## Known Limitations

- **OAuth Authentication**: Third-party OAuth (Google, GitHub) is not implemented; authentication is email and password based.
- **Email Verification & Password Reset**: Automated email verification and password reset workflows are not currently implemented.

---

## Future Improvements

- Automated email notifications and practice reminders.
- Company-specific interview experience notes and round breakdowns.
- Expanded question coverage for additional hiring companies.
- Advanced preparation analytics and topic mastery insights.
