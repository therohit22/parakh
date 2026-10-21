import { describe, it, expect, beforeEach, afterEach } from "vitest";
import jwt from "jsonwebtoken";
import {
  signToken,
  verifyToken,
  getTokenFromRequest,
  requireAuth,
  requireAdmin,
  AUTH_COOKIE_NAME,
} from "@/lib/auth";

describe("Authentication & Authorization Security", () => {
  const originalSecret = process.env.JWT_SECRET;
  const testSecret = "super-secret-test-jwt-key-for-parakh-verification";

  beforeEach(() => {
    process.env.JWT_SECRET = testSecret;
  });

  afterEach(() => {
    process.env.JWT_SECRET = originalSecret;
  });

  describe("Token Generation and Verification", () => {
    it("should sign a valid JWT token with minimal payload", () => {
      const payload = { userId: "507f1f77bcf86cd799439011", role: "student" as const };
      const token = signToken(payload);
      expect(typeof token).toBe("string");

      const decoded = verifyToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded?.userId).toBe(payload.userId);
      expect(decoded?.role).toBe(payload.role);
    });

    it("should reject a token signed with a different secret", () => {
      const fakeToken = jwt.sign(
        { userId: "507f1f77bcf86cd799439011", role: "student" },
        "attacker-compromised-secret"
      );
      const decoded = verifyToken(fakeToken);
      expect(decoded).toBeNull();
    });

    it("should reject a malformed or tampered token", () => {
      expect(verifyToken("invalid.token.string")).toBeNull();
      expect(verifyToken("")).toBeNull();
    });

    it("should reject an expired token", () => {
      const expiredToken = jwt.sign(
        { userId: "507f1f77bcf86cd799439011", role: "student" },
        testSecret,
        { expiresIn: -10 }
      );
      const decoded = verifyToken(expiredToken);
      expect(decoded).toBeNull();
    });
  });

  describe("Request Cookie Extraction", () => {
    it("should extract token from httpOnly parakh_token cookie header", () => {
      const token = signToken({ userId: "123", role: "student" });
      const request = new Request("http://localhost:3000/api/auth/me", {
        headers: {
          cookie: `other_cookie=value; ${AUTH_COOKIE_NAME}=${token}; yet_another=123`,
        },
      });

      const extracted = getTokenFromRequest(request);
      expect(extracted).toBe(token);
    });

    it("should return null if parakh_token cookie is absent", () => {
      const request = new Request("http://localhost:3000/api/auth/me", {
        headers: {
          cookie: "some_other_cookie=xyz",
        },
      });

      expect(getTokenFromRequest(request)).toBeNull();
    });
  });

  describe("requireAuth Guard", () => {
    it("should return 401 Unauthorized when no cookie is provided", () => {
      const request = new Request("http://localhost:3000/api/dashboard");
      const result = requireAuth(request);
      expect(result.authorized).toBe(false);
      if (!result.authorized) {
        expect(result.status).toBe(401);
        expect(result.error).toBe("Unauthorized");
      }
    });

    it("should return 401 Unauthorized when an invalid token is provided", () => {
      const request = new Request("http://localhost:3000/api/dashboard", {
        headers: {
          cookie: `${AUTH_COOKIE_NAME}=forged-token`,
        },
      });
      const result = requireAuth(request);
      expect(result.authorized).toBe(false);
      if (!result.authorized) {
        expect(result.status).toBe(401);
      }
    });

    it("should authorize requests with valid session tokens", () => {
      const token = signToken({ userId: "user-123", role: "student" });
      const request = new Request("http://localhost:3000/api/dashboard", {
        headers: {
          cookie: `${AUTH_COOKIE_NAME}=${token}`,
        },
      });
      const result = requireAuth(request);
      expect(result.authorized).toBe(true);
      if (result.authorized) {
        expect(result.user.userId).toBe("user-123");
        expect(result.user.role).toBe("student");
      }
    });
  });

  describe("requireAdmin Guard (Role-Based Access Control)", () => {
    it("should return 401 Unauthorized if unauthenticated", () => {
      const request = new Request("http://localhost:3000/api/admin/stats");
      const result = requireAdmin(request);
      expect(result.authorized).toBe(false);
      if (!result.authorized) {
        expect(result.status).toBe(401);
      }
    });

    it("should return 403 Forbidden if user is authenticated as student", () => {
      const studentToken = signToken({ userId: "student-1", role: "student" });
      const request = new Request("http://localhost:3000/api/admin/stats", {
        headers: {
          cookie: `${AUTH_COOKIE_NAME}=${studentToken}`,
        },
      });
      const result = requireAdmin(request);
      expect(result.authorized).toBe(false);
      if (!result.authorized) {
        expect(result.status).toBe(403);
        expect(result.error).toMatch(/Forbidden: Admin access required/i);
      }
    });

    it("should authorize administrator accounts", () => {
      const adminToken = signToken({ userId: "admin-1", role: "admin" });
      const request = new Request("http://localhost:3000/api/admin/stats", {
        headers: {
          cookie: `${AUTH_COOKIE_NAME}=${adminToken}`,
        },
      });
      const result = requireAdmin(request);
      expect(result.authorized).toBe(true);
      if (result.authorized) {
        expect(result.user.role).toBe("admin");
      }
    });
  });
});
