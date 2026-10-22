# Parakh

A company-wise technical interview preparation platform that helps students practice DSA questions asked by specific companies.

Live Demo: [https://parakh-beige.vercel.app/](https://parakh-beige.vercel.app/)  
GitHub: [https://github.com/therohit22/parakh](https://github.com/therohit22/parakh)

---

## Why I Built Parakh

When preparing for campus placements and technical internships, I noticed that practice questions were scattered everywhere—in random Google Sheets, Telegram groups, LeetCode discussion posts, and discussion forums. 

It was frustrating to figure out which Data Structures & Algorithms problems were actually asked by specific companies like Google, Amazon, Microsoft, or Flipkart, and there was no clean way to track what I had already practiced for each company.

I built **Parakh** to solve this problem for myself and other students by organizing interview questions company-wise and topic-wise in one place. It lets you browse target companies, filter problems by algorithmic topic and difficulty, solve them directly on LeetCode, and track your preparation progress on a personal dashboard.

*(Note: Parakh helps organize your practice; it does not guarantee specific interview questions or placement outcomes.)*

---

## What Parakh Does

- **Company-wise Question Browsing**: Explore coding questions categorized by target hiring companies (e.g., Google, Amazon, Microsoft, Flipkart, Deloitte, Infosys, Zomato).
- **Search & Multi-Filter**: Search questions and companies by keyword, and filter questions by difficulty (`Easy`, `Medium`, `Hard`) and DSA topics (Arrays, Strings, Trees, Dynamic Programming, Graphs).
- **Direct LeetCode Practice Links**: Each question links directly to its official LeetCode problem page so students can write and submit code immediately.
- **Bookmarks**: Save difficult or frequently asked problems to a personal bookmark list for quick revision.
- **Solved-Question Tracking**: Mark completed problems as solved to maintain an accurate record of your progress.
- **Student Dashboard**: Track preparation readiness with solved vs. total counts, difficulty breakdowns, and company-specific completion progress.
- **Authentication**: Student registration and login with secure session management.
- **Admin Management**: Dedicated administrator portal to add and update companies and questions with referential integrity checks.
- **Data Ingestion**: Standalone CLI script to validate and import companies and questions from CSV and JSON datasets.

---

## Tech Stack

- **Frontend & Backend**: Next.js (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB Atlas with Mongoose
- **Validation**: Zod
- **Authentication**: JWT (`jsonwebtoken`) in `httpOnly` cookies, password hashing with `bcryptjs`
- **Testing**: Vitest
- **Deployment**: Vercel

---

## How It Works

At a high level, the application follows a straightforward full-stack flow:

```text
User (Browser)
   ↓
Next.js App Router (Pages & UI Components)
   ↓
API Route Handlers (`/api/...`)
   ↓
Authentication Check (JWT in httpOnly cookie) & Zod Validation
   ↓
Mongoose Models (User, Company, Question, Bookmark, Progress)
   ↓
MongoDB Atlas
```

1. **Browsing**: The frontend requests data from Next.js Route Handlers. Public endpoints return company lists and question catalogs populated with company metadata.
2. **Filtering & Search**: Keyword searches and filters (difficulty, topic, company) are executed directly in MongoDB queries with bounded pagination (`limit` capped at 50) rather than filtering in Node.js memory.
3. **Tracking Progress**: When an authenticated student bookmarks or solves a problem, the server updates their record in MongoDB using atomic operators (`$addToSet` and `$pull`), ensuring state persists across sessions.
4. **Dashboard**: The dashboard aggregates question counts and the user's solved questions across difficulties and target companies to display live progress bars.

---

## Some Technical Decisions I Made

Here are a few practical engineering decisions I made while building Parakh:

### 1. Storing JWT in an httpOnly Cookie Instead of localStorage
Instead of keeping the authentication token in browser `localStorage` where any third-party script or XSS vulnerability could read it, I store the signed JWT in an `httpOnly`, `SameSite=Lax` cookie (`secure: true` in production). This ensures JavaScript running in the browser cannot access the session token directly.

### 2. Password Hashing with bcryptjs
User passwords are never stored in plain text. During registration, passwords are hashed using `bcryptjs` with 10 salt rounds before saving to MongoDB. In the Mongoose schema, the password field is marked with `select: false` so that query results do not accidentally leak password hashes into API responses.

### 3. Boundary Validation with Zod
I used Zod schemas to validate all incoming inputs—request bodies for login and question creation, query parameters for search and pagination (`page >= 1`, `1 <= limit <= 50`), and dynamic URL slugs. This catches invalid data, malformed payloads, and unexpected types before they reach database logic.

### 4. Server-Side Role-Based Authorization
The admin panel lets administrators add or edit companies and questions. Rather than relying on frontend flags or trusting user input, authorization is verified entirely on the server (`requireAdmin`). The helper decodes the signed JWT from the cookie and strictly checks `role === "admin"`. If a regular student tries to access admin mutation routes, the server immediately returns `403 Forbidden`.

### 5. Cached MongoDB Connection on `globalThis`
In Next.js development (with Hot Module Replacement) and serverless environments, each module re-evaluation can open a new database connection, quickly exhausting MongoDB Atlas connection limits. I implemented a cached connection utility in `src/lib/db.ts` that attaches the Mongoose connection promise to `globalThis`, reusing the single pool across requests.

### 6. Atomic Operations for Bookmarks and Solved Status
To track bookmarks and solved status, I used MongoDB's `$addToSet` and `$pull` operators. Using `$addToSet` makes the solve and bookmark actions idempotent—clicking "Mark Solved" multiple times or experiencing a network retry will never create duplicate entries for the same problem.

---

## Data Ingestion

To populate the platform with realistic interview questions, I built a standalone CLI ingestion tool (`scripts/ingest/`):

- **Data Formats**: Supports importing from RFC 4180-compliant CSV files or structured JSON arrays.
- **Schema Validation**: Every row or object is validated against Zod schemas (`companySchema` or `questionSchema`) before insertion.
- **Company Slug Resolution**: Questions reference companies by human-readable slugs (e.g., `google`, `amazon`). The importer resolves these slugs to existing MongoDB `_id`s in memory. If a company does not exist in the database, the question fails with a clear diagnostic error, preventing broken foreign references.
- **Idempotent Upserts**: The ingestion script uses `slug` as the unique key. If a record already exists, its fields are updated in-place; if not, a new document is inserted. Running the script multiple times produces zero duplicate records.
- **Dry-Run Mode**: Running with `--dry-run` performs full parsing, validation, and slug resolution, printing a summary report without writing anything to MongoDB.

Example commands:

```bash
# Ingest companies from CSV
npm run ingest -- fixtures/companies_valid.csv --type=companies

# Ingest questions from JSON
npm run ingest -- fixtures/questions_apna_college.json --type=questions

# Validate without writing to the database
npm run ingest -- fixtures/companies_valid.csv --type=companies --dry-run
```

---

## Testing

Vitest is used for automated API, validation, security, and utility testing. 

The test suite covers:
- Input validation (registration, login, query pagination limits, search regex escaping)
- Authentication and token lifecycle (signing, verification, expiration, role checks)
- Security & authorization (CSRF origin checks, admin RBAC rejection for students)
- Data ingestion (CSV parsing, quoted fields, duplicate slug detection)
- Company-wise question filtering and non-duplication

The project currently has **91 passing tests across 7 test suites**.

To run tests:

```bash
npm test
```

---

## Local Setup

### Prerequisites
- Node.js (v20 or higher recommended)
- MongoDB instance (local or MongoDB Atlas)

### Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/therohit22/parakh.git
   cd parakh
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
   Add your MongoDB connection string and a secret key:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/parakh?retryWrites=true&w=majority
   JWT_SECRET=your-random-jwt-secret-key-at-least-32-chars
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **(Optional) Ingest initial dataset:**
   ```bash
   npm run ingest -- fixtures/companies_valid.csv --type=companies
   npm run ingest -- fixtures/questions_apna_college.json --type=questions
   ```

---

## Environment Variables

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas or local connection string |
| `JWT_SECRET` | Secret key used to sign and verify authentication JWT cookies (at least 32 characters) |

> Keep secrets out of version control. The `.env.local` file is excluded in `.gitignore`.

---

## Project Structure

```text
parakh/
├── src/
│   ├── app/            # Next.js App Router (pages and API route handlers)
│   ├── components/     # React components (auth, companies, questions, dashboard, admin)
│   ├── lib/            # Server utilities (db connection, auth helpers, Zod validation schemas)
│   └── models/         # Mongoose models (User, Company, Question, Bookmark, Progress, QuestionNote)
├── scripts/
│   └── ingest/         # Standalone CLI ingestion pipeline (CSV parser, importer, CLI runner)
├── fixtures/           # Sample CSV and JSON datasets for companies and questions
├── tests/              # Vitest test suites (auth, validation, security, filtering, ingestion)
└── public/             # Static assets and official company brand vector logos
```

---

## What I Learned

Building Parakh helped me gain hands-on experience across the entire web stack:
- **Designing APIs around real UI needs**: I learned to structure REST Route Handlers to return exactly what the frontend requires (such as pre-aggregating solved counts) to avoid N+1 network requests from client components.
- **Handling authentication with cookies**: Understanding how to properly configure `httpOnly`, `SameSite=Lax`, and `secure` cookies helped me appreciate how real session management works beyond simply tossing tokens into `localStorage`.
- **Database modeling & connection lifecycle**: Managing Mongoose connections across serverless functions taught me why connection caching is critical to prevent socket leaks.
- **Data sanitization & validation**: Using Zod at every endpoint and escaping search regex input showed me how to protect backend queries from malformed payloads and ReDoS attacks.
- **Building idempotent scripts**: Designing the ingestion tool taught me the importance of unique slugs and upsert operations so data pipelines can be safely re-run without creating mess or duplicates.
- **Writing maintainable tests**: Setting up Vitest to test boundary conditions, token expiration, and authorization helped catch subtle bugs before deployment.

---

## Limitations / Future Improvements

- **No Third-Party OAuth**: The app currently uses email and password authentication. Adding Google or GitHub OAuth would make sign-in faster for students.
- **No Automated Password Reset**: Password resets via email are not yet implemented; accounts currently support password changes while logged in.
- **Regex-Based Search**: Search currently uses case-insensitive MongoDB `$regex` matching. For datasets with tens of thousands of questions, integrating an inverted index or a dedicated search tool (like Typesense or Elasticsearch) would be more efficient.
- **External Coding Practice**: Parakh links out to official LeetCode problems rather than running code inside an embedded browser sandbox. Adding an integrated code editor and test-case runner is a natural next step.

---

## Author

**Rohit Kumar**  
SRM Institute of Science and Technology, Delhi-NCR  
GitHub: [https://github.com/therohit22](https://github.com/therohit22)
