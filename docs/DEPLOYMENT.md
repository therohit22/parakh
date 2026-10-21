# Parakh — Production Deployment Guide (Vercel + MongoDB Atlas)

This guide documents the exact configuration, steps, and verification procedures to deploy **Parakh** to Vercel connected to a free-tier MongoDB Atlas cluster.

---

## 1. Architecture & Free-Tier Compatibility

Parakh is engineered specifically for zero-cost, serverless deployment:
- **Framework**: Next.js 16 (App Router) on Vercel Serverless Functions.
- **Database**: MongoDB Atlas M0 Free Tier (512MB storage, shared RAM, free forever).
- **Authentication**: Stateless HMAC-SHA256 JWTs stored in `httpOnly` session cookies (no external session store like Redis required).
- **Static Assets**: SVG company logos and favicon served directly via Vercel Edge Network.

---

## 2. MongoDB Atlas Configuration

### Step A: Create Cluster & Database
1. Create a free **M0 Sandbox** cluster in MongoDB Atlas (recommended region: closest to your Vercel deployment region, e.g., `us-east-1` or `ap-south-1`).
2. Set cluster name or use the default. The database name is `parakh`.

### Step B: Configure Database User
1. Navigate to **Security > Database Access**.
2. Click **Add New Database User**.
3. Authentication Method: **Password**.
4. Set a strong username (e.g., `parakh_app`) and generate a secure password.
5. User Privileges: `readWrite` on the `parakh` database (least-privilege principle).

### Step C: Configure Network Access (IP Access List)
1. Navigate to **Security > Network Access**.
2. Click **Add IP Address**.
3. For Vercel Serverless Functions, dynamic outgoing IPs are utilized. Add `0.0.0.0/0` (Allow Access from Anywhere) with a description: `Vercel Serverless Functions`.
4. *Security Tradeoff Note*: Because Vercel functions scale dynamically and do not have fixed static IPs on the free tier, `0.0.0.0/0` is the standard serverless pattern. Defense in depth is maintained by:
   - Strong database password authentication.
   - TLS/SSL encryption on all wire traffic (`mongodb+srv://`).
   - Strict database user privilege isolation (`readWrite` only on `parakh`).
   - Connection strings kept strictly in server-side environment variables.

### Step D: Retrieve Connection String
1. Click **Connect > Drivers > Node.js**.
2. Copy the SRV URI:
   ```text
   mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/parakh?retryWrites=true&w=majority
   ```
3. Replace `<username>` and `<password>` with your database user credentials.

---

## 3. Environment Variables

Configure these two required variables in **Vercel Project Settings > Environment Variables**:

| Variable Name | Environment | Description | Example / Format |
|---|---|---|---|
| `MONGODB_URI` | Production, Preview | Full MongoDB Atlas connection string | `mongodb+srv://parakh_app:SECRET@cluster0.mongodb.net/parakh?retryWrites=true&w=majority` |
| `JWT_SECRET` | Production, Preview | Random HMAC key ($\ge 32$ characters) | Generate via `openssl rand -base64 32` |

> **IMPORTANT**:
> In `NODE_ENV === "production"`, `src/lib/auth.ts` enforces a strict minimum length of **32 characters** for `JWT_SECRET`. Deployments will throw an initialization error if a short or trivial secret is provided.

---

## 4. Deploying to Vercel

### Option 1: Vercel Web Dashboard (Recommended)
1. Push your Git repository to GitHub or GitLab.
2. Log in to [vercel.com](https://vercel.com).
3. Click **Add New > Project** and import the `parakh` repository.
4. Framework Preset: **Next.js** (detected automatically).
5. Root Directory: `./` (default).
6. Build Command: `next build` (default).
7. Output Directory: `.next` (default).
8. Under **Environment Variables**, add `MONGODB_URI` and `JWT_SECRET`.
9. Click **Deploy**.

### Option 2: Vercel CLI
1. Log in to the CLI:
   ```bash
   npx vercel login
   ```
2. Link project:
   ```bash
   npx vercel link
   ```
3. Add environment variables:
   ```bash
   npx vercel env add MONGODB_URI production
   npx vercel env add JWT_SECRET production
   ```
4. Deploy to production:
   ```bash
   npx vercel --prod
   ```

---

## 5. Post-Deployment Smoke Verification

Once Vercel assigns your production URL (e.g. `https://parakh.vercel.app`), verify the live deployment:

1. **Database Health**:
   Visit `https://parakh.vercel.app/api/health/db`.
   Expected: `HTTP 200 {"ok":true,"database":"connected"}`.
2. **Homepage**:
   Visit `https://parakh.vercel.app`. Verify hero header, target companies, and popular topics load without hydration errors.
3. **Company & Questions Catalogs**:
   Visit `/companies` and `/questions`. Verify MongoDB data renders.
4. **Authentication Flow**:
   - Register a new student account at `/register` (minimum 8 characters for password).
   - Verify automatic redirection to `/dashboard`.
   - Verify `parakh_token` cookie is set with `Secure`, `HttpOnly`, `SameSite=Lax`.
5. **Personalized State**:
   - Navigate to `/questions/two-sum`.
   - Toggle **Bookmark** and **Mark Solved**.
   - Add a personal note in the notes scratchpad.
   - Return to `/dashboard` and verify: Solved = 1, Bookmarked = 1, Preparation Score updated.
6. **Admin Protection**:
   - Verify visiting `/admin` as a student displays `403 Forbidden — Access Denied`.
   - Verify direct `curl` to `/api/admin/stats` returns `HTTP 403`.

---

## 6. Serverless Connection Management

In Next.js serverless environments, each incoming request may run in a newly spun-up lambda container or reuse a warm container.
- Parakh caches the Mongoose connection promise on `globalThis.mongooseCache` ([`src/lib/db.ts`](file:///c:/Users/rohit/Desktop/parakh/src/lib/db.ts)).
- When a warm container handles subsequent requests, it reuses the existing MongoDB connection pool instead of establishing a new TCP handshake.
- Timeout is configured with `serverSelectionTimeoutMS: 5000` and `bufferCommands: false` to fail fast rather than hanging serverless execution if database connectivity is disrupted.
