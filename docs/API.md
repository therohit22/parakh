# Parakh — REST API Reference & Contract Specification

This document details every implemented API route handler in **Parakh**, including HTTP methods, authentication requirements, input validation rules, status codes, and practical request/response examples.

---

## 1. Global API Conventions

### Base URL
```text
http://localhost:3000/api
```

### Authentication Header & Cookies
- Authentication is stateless via a signed JSON Web Token (JWT) transmitted automatically in an `httpOnly`, `SameSite=Lax` cookie named `parakh_token`.
- State-changing mutations (`POST`, `PUT`, `DELETE`) require a valid same-origin request (`Origin` or `Referer` matching the application host) to prevent Cross-Site Request Forgery (CSRF).

### Standard Error Response Format
All error responses return a JSON object with `success: false` and a descriptive message:
```json
{
  "success": false,
  "error": "Descriptive error message"
}
```

### HTTP Status Code Conventions
| Status Code | Meaning | When Returned |
|---|---|---|
| **200 OK** | Success | Request succeeded with payload returned. |
| **201 Created** | Created | Resource successfully created (registration, company/question creation). |
| **400 Bad Request** | Validation Error | Malformed body, missing required fields, or invalid query/path parameters. |
| **401 Unauthorized** | Unauthenticated | Missing or expired JWT cookie on a protected endpoint. |
| **403 Forbidden** | Unauthorized | Insufficient privilege (e.g. student calling admin route) or CSRF origin mismatch. |
| **404 Not Found** | Not Found | Target company, question, or user record does not exist. |
| **409 Conflict** | State Conflict | Duplicate unique field (email, company slug, question slug) or foreign key constraint violation. |
| **500 Internal Error** | Server Error | Unhandled server or database exception (stack traces omitted). |

---

## 2. Authentication Endpoints

### 2.1 Register New Student
- **Method**: `POST`
- **Route**: `/api/auth/register`
- **Auth**: Public
- **Validation**:
  - `name`: string, 2–100 chars
  - `email`: valid email format, lowercased
  - `password`: string, 6–100 chars
  - *Note: `role` is automatically forced to `"student"`.*
- **Status Codes**: `201 Created`, `400 Bad Request`, `409 Conflict` (email already exists).

**Request Example**:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Arjun Sharma",
    "email": "arjun@example.com",
    "password": "Password123"
  }'
```

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "67140f000000000000000001",
      "name": "Arjun Sharma",
      "email": "arjun@example.com",
      "role": "student"
    }
  }
}
```

---

### 2.2 User Login
- **Method**: `POST`
- **Route**: `/api/auth/login`
- **Auth**: Public
- **Validation**: `email` (valid email), `password` (string >= 1 char).
- **Behavior**: Sets `parakh_token` httpOnly cookie (`maxAge: 7 days`).
- **Status Codes**: `200 OK`, `400 Bad Request`, `401 Unauthorized` (generic message prevents user enumeration).

**Request Example**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "arjun@example.com",
    "password": "Password123"
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "67140f000000000000000001",
      "name": "Arjun Sharma",
      "email": "arjun@example.com",
      "role": "student"
    }
  }
}
```

---

### 2.3 Get Current User Session
- **Method**: `GET`
- **Route**: `/api/auth/me`
- **Auth**: Required (`requireAuth`)
- **Response**: User identity, role, and array of bookmarked and solved Question IDs for $O(1)$ client lookup.
- **Status Codes**: `200 OK`, `401 Unauthorized`, `404 Not Found`.

**Request Example**:
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Cookie: parakh_token=<JWT_COOKIE>"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "67140f000000000000000001",
      "name": "Arjun Sharma",
      "email": "arjun@example.com",
      "role": "student",
      "bookmarkedQuestions": ["671410000000000000000010"],
      "solvedQuestions": ["671410000000000000000010"]
    }
  }
}
```

---

### 2.4 User Logout
- **Method**: `POST`
- **Route**: `/api/auth/logout`
- **Auth**: Public (clears cookie if present)
- **Behavior**: Sets `parakh_token` cookie with `maxAge: 0` to expire it immediately.
- **Status Codes**: `200 OK`.

**Request Example**:
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Cookie: parakh_token=<JWT_COOKIE>"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

## 3. Companies Endpoints

### 3.1 List Companies (Paginated & Searchable)
- **Method**: `GET`
- **Route**: `/api/companies`
- **Auth**: Public
- **Query Parameters**:
  - `search` (optional string): Case-insensitive keyword matching company `name` or `description`.
  - `page` (optional integer >= 1, default: 1).
  - `limit` (optional integer 1–50, default: 10).
  - `sort` (optional: `"name"` | `"latest"` | `"oldest"`, default: `"name"`).
- **Status Codes**: `200 OK`, `400 Bad Request`.

**Request Example**:
```bash
curl -X GET "http://localhost:3000/api/companies?search=google&limit=5"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "companies": [
      {
        "_id": "671420000000000000000001",
        "name": "Google",
        "slug": "google",
        "logo": "https://example.com/google.png",
        "description": "Technology company specializing in search, cloud, and AI.",
        "website": "https://google.com",
        "createdAt": "2026-10-18T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 5,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

---

### 3.2 Create Company
- **Method**: `POST`
- **Route**: `/api/companies`
- **Auth**: Admin Only (`requireAdmin`)
- **Validation**:
  - `name`: string, 1–100 chars
  - `slug`: kebab-case string (`^[a-z0-9]+(?:-[a-z0-9]+)*$`), 1–100 chars
  - `logo`: optional URL string
  - `description`: optional string <= 500 chars
  - `website`: optional URL string
- **Status Codes**: `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `409 Conflict` (slug exists).

**Request Example**:
```bash
curl -X POST http://localhost:3000/api/companies \
  -H "Content-Type: application/json" \
  -H "Cookie: parakh_token=<ADMIN_JWT_COOKIE>" \
  -H "Origin: http://localhost:3000" \
  -d '{
    "name": "Stripe",
    "slug": "stripe",
    "description": "Financial infrastructure for the internet.",
    "website": "https://stripe.com"
  }'
```

---

### 3.3 Get Single Company by Slug
- **Method**: `GET`
- **Route**: `/api/companies/[slug]`
- **Auth**: Public
- **Path Parameter**: `slug` (validated via `slugParamSchema`).
- **Status Codes**: `200 OK`, `400 Bad Request`, `404 Not Found`.

---

### 3.4 Update Company
- **Method**: `PUT`
- **Route**: `/api/companies/[slug]`
- **Auth**: Admin Only (`requireAdmin`)
- **Status Codes**: `200 OK`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`.

---

### 3.5 Delete Company (Reference Protected)
- **Method**: `DELETE`
- **Route**: `/api/companies/[slug]`
- **Auth**: Admin Only (`requireAdmin`)
- **Referential Integrity**: Queries `Question.exists({ companies: company._id })`. Returns `409 Conflict` if existing questions reference this company.
- **Status Codes**: `200 OK`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`.

---

## 4. Questions Endpoints

### 4.1 List Questions (Filtered, Sorted & Paginated)
- **Method**: `GET`
- **Route**: `/api/questions`
- **Auth**: Public
- **Query Parameters**:
  - `search` (optional string): Keyword matching question `title` or `description`.
  - `difficulty` (optional: `"Easy"` | `"Medium"` | `"Hard"`).
  - `topic` (optional string): Topic tag match (e.g. `"Arrays"`).
  - `company` (optional string): Target company slug (e.g. `"google"`).
  - `page` (optional integer >= 1, default: 1).
  - `limit` (optional integer 1–50, default: 10).
  - `sort` (optional: `"latest"` | `"oldest"` | `"title"`, default: `"latest"`).
- **Populated Fields**: `companies` populated with `name`, `slug`, and `logo`.
- **Status Codes**: `200 OK`, `400 Bad Request`.

**Request Example**:
```bash
curl -X GET "http://localhost:3000/api/questions?company=google&difficulty=Medium&limit=10"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "_id": "671410000000000000000010",
        "title": "Two Sum",
        "slug": "two-sum",
        "description": "Find two indices that sum up to target.",
        "difficulty": "Easy",
        "topics": ["Arrays", "Hash Table"],
        "companies": [
          {
            "_id": "671420000000000000000001",
            "name": "Google",
            "slug": "google"
          }
        ],
        "leetcodeUrl": "https://leetcode.com/problems/two-sum/",
        "createdAt": "2026-10-18T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

---

### 4.2 Create Question
- **Method**: `POST`
- **Route**: `/api/questions`
- **Auth**: Admin Only (`requireAdmin`)
- **Validation**:
  - `title`: string, 1–200 chars
  - `slug`: kebab-case string, 1–200 chars
  - `difficulty`: `"Easy"` | `"Medium"` | `"Hard"`
  - `topics`: array of non-empty strings (or comma/pipe separated string)
  - `companies`: array of valid 24-character hexadecimal MongoDB ObjectIds
  - `leetcodeUrl`: optional valid URL
- **Foreign Key Check**: Verifies that every provided company ObjectId exists in the database.
- **Status Codes**: `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `409 Conflict`.

---

### 4.3 Get Single Question by Slug
- **Method**: `GET`
- **Route**: `/api/questions/[slug]`
- **Auth**: Public
- **Path Parameter**: `slug` (validated via `slugParamSchema`).
- **Populated Fields**: `companies` populated with `name`, `slug`, `logo`.
- **Status Codes**: `200 OK`, `400 Bad Request`, `404 Not Found`.

---

### 4.4 Update Question
- **Method**: `PUT`
- **Route**: `/api/questions/[slug]`
- **Auth**: Admin Only (`requireAdmin`)
- **Status Codes**: `200 OK`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`.

---

### 4.5 Delete Question
- **Method**: `DELETE`
- **Route**: `/api/questions/[slug]`
- **Auth**: Admin Only (`requireAdmin`)
- **Status Codes**: `200 OK`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`.

---

## 5. Bookmarks Endpoints

### 5.1 List Bookmarked Questions
- **Method**: `GET`
- **Route**: `/api/questions/bookmarked`
- **Auth**: Required (`requireAuth`)
- **Response**: Array of populated Question objects bookmarked by the authenticated user.
- **Status Codes**: `200 OK`, `401 Unauthorized`.

---

### 5.2 Check Bookmark Status
- **Method**: `GET`
- **Route**: `/api/questions/[slug]/bookmark`
- **Auth**: Required (`requireAuth`)
- **Status Codes**: `200 OK`, `401 Unauthorized`, `404 Not Found`.

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "bookmarked": true
  }
}
```

---

### 5.3 Add Bookmark (Idempotent)
- **Method**: `POST`
- **Route**: `/api/questions/[slug]/bookmark`
- **Auth**: Required (`requireAuth`)
- **Database Operation**: `$addToSet: { bookmarkedQuestions: question._id }`
- **Status Codes**: `200 OK`, `401 Unauthorized`, `404 Not Found`.

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "bookmarked": true
  }
}
```

---

### 5.4 Remove Bookmark (Idempotent)
- **Method**: `DELETE`
- **Route**: `/api/questions/[slug]/bookmark`
- **Auth**: Required (`requireAuth`)
- **Database Operation**: `$pull: { bookmarkedQuestions: question._id }`
- **Status Codes**: `200 OK`, `401 Unauthorized`, `404 Not Found`.

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "bookmarked": false
  }
}
```

---

## 6. Solved Progress Endpoints

### 6.1 List Solved Questions
- **Method**: `GET`
- **Route**: `/api/questions/solved`
- **Auth**: Required (`requireAuth`)
- **Response**: Array of populated Question objects marked as solved by the authenticated user.
- **Status Codes**: `200 OK`, `401 Unauthorized`.

---

### 6.2 Check Solved Status
- **Method**: `GET`
- **Route**: `/api/questions/[slug]/solved`
- **Auth**: Required (`requireAuth`)
- **Status Codes**: `200 OK`, `401 Unauthorized`, `404 Not Found`.

---

### 6.3 Mark Question Solved (Idempotent)
- **Method**: `POST`
- **Route**: `/api/questions/[slug]/solved`
- **Auth**: Required (`requireAuth`)
- **Database Operation**: `$addToSet: { solvedQuestions: question._id }`
- **Status Codes**: `200 OK`, `401 Unauthorized`, `404 Not Found`.

---

### 6.4 Unmark Question Solved (Idempotent)
- **Method**: `DELETE`
- **Route**: `/api/questions/[slug]/solved`
- **Auth**: Required (`requireAuth`)
- **Database Operation**: `$pull: { solvedQuestions: question._id }`
- **Status Codes**: `200 OK`, `401 Unauthorized`, `404 Not Found`.

---

## 7. Preparation Dashboard Endpoint

### 7.1 Get User Dashboard Statistics
- **Method**: `GET`
- **Route**: `/api/dashboard`
- **Auth**: Required (`requireAuth`)
- **Response Shape**: Computes overall preparation percentage, difficulty breakdown (Easy, Medium, Hard), and company readiness percentages without N+1 queries.
- **Status Codes**: `200 OK`, `401 Unauthorized`.

**Request Example**:
```bash
curl -X GET http://localhost:3000/api/dashboard \
  -H "Cookie: parakh_token=<JWT_COOKIE>"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "name": "Arjun Sharma",
      "email": "arjun@example.com"
    },
    "stats": {
      "totalQuestions": 25,
      "solvedQuestions": 10,
      "bookmarkedQuestions": 4,
      "remainingQuestions": 15,
      "overallProgress": 40
    },
    "difficultyProgress": [
      {
        "difficulty": "Easy",
        "total": 10,
        "solved": 7,
        "percentage": 70
      },
      {
        "difficulty": "Medium",
        "total": 12,
        "solved": 3,
        "percentage": 25
      },
      {
        "difficulty": "Hard",
        "total": 3,
        "solved": 0,
        "percentage": 0
      }
    ],
    "companyProgress": [
      {
        "companyId": "671420000000000000000001",
        "name": "Google",
        "slug": "google",
        "logo": "https://example.com/google.png",
        "total": 8,
        "solved": 4,
        "percentage": 50
      }
    ]
  }
}
```

---

## 8. Admin Operations Endpoint

### 8.1 Get Platform Administration Statistics
- **Method**: `GET`
- **Route**: `/api/admin/stats`
- **Auth**: Admin Only (`requireAdmin`)
- **Status Codes**: `200 OK`, `401 Unauthorized`, `403 Forbidden`.

**Request Example**:
```bash
curl -X GET http://localhost:3000/api/admin/stats \
  -H "Cookie: parakh_token=<ADMIN_JWT_COOKIE>"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "totalCompanies": 6,
    "totalQuestions": 30,
    "totalUsers": 12
  }
}
```

---

## 9. Health & Diagnostic Endpoints

### 9.1 Database Health Ping
- **Method**: `GET`
- **Route**: `/api/health/db`
- **Auth**: Public diagnostic
- **Status Codes**: `200 OK` (`{ ok: true, database: "connected" }`), `500 Server Error`.

### 9.2 Models & Indexes Verification
- **Method**: `GET`
- **Route**: `/api/health/models`
- **Auth**: Dev Only (returns `404 Not Found` when `NODE_ENV === "production"`).
- **Status Codes**: `200 OK` (development), `404 Not Found` (production).
