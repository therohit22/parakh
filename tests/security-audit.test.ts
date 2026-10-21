import { describe, it, expect, beforeAll } from "vitest";
import fs from "fs";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { signToken, verifyToken, AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from "@/lib/auth";
import { validateCsrfOrigin } from "@/lib/security";
import { POST as registerRoute } from "@/app/api/auth/register/route";
import { POST as loginRoute } from "@/app/api/auth/login/route";
import { GET as adminStatsRoute } from "@/app/api/admin/stats/route";
import { GET as dashboardRoute } from "@/app/api/dashboard/route";
import { GET as bookmarkedRoute } from "@/app/api/questions/bookmarked/route";
import { GET as solvedRoute } from "@/app/api/questions/solved/route";
import { DELETE as deleteCompanyRoute } from "@/app/api/companies/[slug]/route";
import { GET as questionsRoute } from "@/app/api/questions/route";

interface ProcessWithEnvFile {
  loadEnvFile?: (path: string) => void;
}

beforeAll(async () => {
  const proc = process as unknown as ProcessWithEnvFile;
  if (typeof proc.loadEnvFile === "function") {
    if (fs.existsSync(".env.local")) {
      proc.loadEnvFile(".env.local");
    } else if (fs.existsSync(".env")) {
      proc.loadEnvFile(".env");
    }
  }
  await dbConnect();
});

describe("Comprehensive Security & Authorization Audit Suite", () => {
  describe("Authentication & Password Isolation", () => {
    it("should never expose password hash in User schema query by default", async () => {
      const user = await User.findOne({}).lean();
      if (user) {
        expect(user.password).toBeUndefined();
      }
    });

    it("should reject login with non-existent email with generic error without user enumeration", async () => {
      const req = new Request("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "nonexistent_security_audit_user@example.com",
          password: "AnyPassword123!",
        }),
      });
      const res = await loginRoute(req);
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.ok).toBe(false);
      expect(json.error).toBe("Invalid email or password");
    });

    it("should reject registration with duplicate email with 409 Conflict", async () => {
      // Find an existing user email
      const existing = await User.findOne({}).lean();
      if (!existing) return;

      const req = new Request("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Duplicate Tester",
          email: existing.email,
          password: "SecurePassword123!",
        }),
      });
      const res = await registerRoute(req);
      const json = await res.json();

      expect(res.status).toBe(409);
      expect(json.ok).toBe(false);
      expect(json.error).toMatch(/already exists/i);
    });

    it("should strictly enforce student role on registration regardless of body payload", async () => {
      const testEmail = `attacker_role_test_${Date.now()}@example.com`;
      const req = new Request("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Role Attacker",
          email: testEmail,
          password: "SecurePassword123!",
          role: "admin", // Malicious client attempt to elevate privilege
        }),
      });
      const res = await registerRoute(req);
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.user.role).toBe("student");

      const createdInDb = await User.findOne({ email: testEmail }).lean();
      expect(createdInDb?.role).toBe("student");

      // Cleanup
      await User.deleteOne({ email: testEmail });
    });
  });

  describe("JWT & Cookie Security", () => {
    it("should safely reject forged tokens signed with wrong secret", () => {
      const forgedToken = signToken({ userId: "mock_id", role: "admin" });
      // Tamper with payload portion
      const parts = forgedToken.split(".");
      parts[1] = Buffer.from(JSON.stringify({ userId: "mock_id", role: "admin" })).toString("base64url");
      const tampered = parts.join(".");

      const result = verifyToken(tampered);
      expect(result).toBeNull();
    });

    it("should safely reject malformed tokens without throwing unhandled exceptions", () => {
      expect(verifyToken("invalid.token.payload")).toBeNull();
      expect(verifyToken("")).toBeNull();
      expect(verifyToken("random-string-not-a-jwt")).toBeNull();
    });

    it("should enforce strict httpOnly, SameSite lax, and path / on auth cookies", () => {
      expect(AUTH_COOKIE_OPTIONS.httpOnly).toBe(true);
      expect(AUTH_COOKIE_OPTIONS.sameSite).toBe("lax");
      expect(AUTH_COOKIE_OPTIONS.path).toBe("/");
      expect(AUTH_COOKIE_OPTIONS.maxAge).toBeGreaterThan(0);
    });

    it("should reject tokens with 'none' algorithm or unsigned tokens", () => {
      // Craft an unsigned token with 'none' alg
      const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
      const payload = Buffer.from(JSON.stringify({ userId: "mock_attacker", role: "admin" })).toString("base64url");
      const noneToken = `${header}.${payload}.`;

      expect(verifyToken(noneToken)).toBeNull();
    });
  });

  describe("Sensitive Endpoint Cache-Control Headers", () => {
    it("should enforce Cache-Control: private, no-store on sensitive authenticated routes", async () => {
      const adminToken = signToken({ userId: "mock_admin_id", role: "admin" });

      const adminReq = new Request("http://localhost:3000/api/admin/stats", {
        headers: { cookie: `${AUTH_COOKIE_NAME}=${adminToken}` },
      });
      const adminRes = await adminStatsRoute(adminReq);
      expect(adminRes.headers.get("Cache-Control")).toBe("private, no-store, max-age=0");
    });
  });

  describe("Authorization & IDOR Defense", () => {
    it("should reject unauthenticated access to /api/dashboard with 401 Unauthorized", async () => {
      const req = new Request("http://localhost:3000/api/dashboard");
      const res = await dashboardRoute(req);
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.success).toBe(false);
      expect(json.error).toBe("Unauthorized");
    });

    it("should reject unauthenticated access to /api/questions/bookmarked with 401 Unauthorized", async () => {
      const req = new Request("http://localhost:3000/api/questions/bookmarked");
      const res = await bookmarkedRoute(req);
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.success).toBe(false);
      expect(json.error).toBe("Unauthorized");
    });

    it("should reject unauthenticated access to /api/questions/solved with 401 Unauthorized", async () => {
      const req = new Request("http://localhost:3000/api/questions/solved");
      const res = await solvedRoute(req);
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.success).toBe(false);
      expect(json.error).toBe("Unauthorized");
    });

    it("should reject student access to /api/admin/stats with 403 Forbidden", async () => {
      const studentToken = signToken({ userId: "mock_student_id", role: "student" });
      const req = new Request("http://localhost:3000/api/admin/stats", {
        headers: {
          cookie: `${AUTH_COOKIE_NAME}=${studentToken}`,
        },
      });
      const res = await adminStatsRoute(req);
      const json = await res.json();

      expect(res.status).toBe(403);
      expect(json.success).toBe(false);
      expect(json.error).toMatch(/admin/i);
    });
  });

  describe("CSRF Defense (Origin & Referer Validation)", () => {
    it("should block cross-site mutation with untrusted foreign origin in production", () => {
      const prevEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const req = new Request("http://localhost:3000/api/auth/logout", {
        method: "POST",
        headers: {
          host: "parakh.vercel.app",
          origin: "https://malicious-phishing-site.com",
        },
      });

      const check = validateCsrfOrigin(req);
      process.env.NODE_ENV = prevEnv;

      expect(check.valid).toBe(false);
      expect(check.status).toBe(403);
    });

    it("should allow safe read requests (GET) without CSRF check", () => {
      const req = new Request("http://localhost:3000/api/questions", {
        method: "GET",
        headers: {
          origin: "https://external-search-site.com",
        },
      });
      const check = validateCsrfOrigin(req);
      expect(check.valid).toBe(true);
    });
  });

  describe("MongoDB Query Safety & Injection Hardening", () => {
    it("should safely handle malicious regex metacharacters in search query without throwing", async () => {
      const maliciousPatterns = [
        ".*",
        "a{100000}",
        "(.*)+",
        "[a-z]+",
        "\\",
        "^^$$$$",
        "||||||",
        "????????",
      ];

      for (const pattern of maliciousPatterns) {
        const req = new Request(`http://localhost:3000/api/questions?search=${encodeURIComponent(pattern)}`);
        const res = await questionsRoute(req);
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.success).toBe(true);
        expect(Array.isArray(json.data)).toBe(true);
      }
    });

    it("should bound pagination limit and safely handle extreme parameters", async () => {
      // Limit capped at 50 per validation schema
      const reqOverLimit = new Request("http://localhost:3000/api/questions?limit=99999");
      const resOverLimit = await questionsRoute(reqOverLimit);
      expect(resOverLimit.status).toBe(400); // Zod validation catches limit > 50

      const reqNegativePage = new Request("http://localhost:3000/api/questions?page=-5");
      const resNegativePage = await questionsRoute(reqNegativePage);
      expect(resNegativePage.status).toBe(400); // Zod validation catches page < 1
    });

    it("should block company deletion with 409 Conflict if questions reference it", async () => {
      // Amazon has 83 questions referencing it
      const adminToken = signToken({ userId: "mock_admin_id", role: "admin" });
      const req = new Request("http://localhost:3000/api/companies/amazon", {
        method: "DELETE",
        headers: {
          cookie: `${AUTH_COOKIE_NAME}=${adminToken}`,
        },
      });
      const res = await deleteCompanyRoute(req, {
        params: Promise.resolve({ slug: "amazon" }),
      });
      const json = await res.json();

      expect(res.status).toBe(409);
      expect(json.success).toBe(false);
      expect(json.error).toMatch(/reference/i);
    });
  });
});
