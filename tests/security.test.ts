import { describe, it, expect, afterEach } from "vitest";
import { validateCsrfOrigin } from "@/lib/security";

describe("CSRF & Origin Verification Security", () => {
  const originalEnv = process.env.NODE_ENV;
  const env = process.env as Record<string, string | undefined>;

  afterEach(() => {
    env.NODE_ENV = originalEnv;
  });

  it("should permit safe HTTP read methods without CSRF checks", () => {
    const getReq = new Request("http://localhost:3000/api/companies", { method: "GET" });
    const headReq = new Request("http://localhost:3000/api/companies", { method: "HEAD" });
    const optionsReq = new Request("http://localhost:3000/api/companies", { method: "OPTIONS" });

    expect(validateCsrfOrigin(getReq).valid).toBe(true);
    expect(validateCsrfOrigin(headReq).valid).toBe(true);
    expect(validateCsrfOrigin(optionsReq).valid).toBe(true);
  });

  it("should allow state-changing requests when Origin matches Host header", () => {
    env.NODE_ENV = "production";
    const postReq = new Request("https://parakh.app/api/questions/two-sum/bookmark", {
      method: "POST",
      headers: {
        host: "parakh.app",
        origin: "https://parakh.app",
      },
    });

    const result = validateCsrfOrigin(postReq);
    expect(result.valid).toBe(true);
  });

  it("should block cross-site mutation attempts when Origin does not match Host", () => {
    env.NODE_ENV = "production";
    const postReq = new Request("https://parakh.app/api/questions/two-sum/bookmark", {
      method: "POST",
      headers: {
        host: "parakh.app",
        origin: "https://evil-attacker.com",
      },
    });

    const result = validateCsrfOrigin(postReq);
    expect(result.valid).toBe(false);
    expect(result.status).toBe(403);
    expect(result.error).toMatch(/Cross-site mutation request blocked/i);
  });

  it("should allow state-changing requests when Referer matches Host header", () => {
    env.NODE_ENV = "production";
    const postReq = new Request("https://parakh.app/api/questions/two-sum/bookmark", {
      method: "POST",
      headers: {
        host: "parakh.app",
        referer: "https://parakh.app/questions/two-sum",
      },
    });

    const result = validateCsrfOrigin(postReq);
    expect(result.valid).toBe(true);
  });

  it("should block cross-site mutation attempts when Referer does not match Host", () => {
    env.NODE_ENV = "production";
    const postReq = new Request("https://parakh.app/api/questions/two-sum/bookmark", {
      method: "POST",
      headers: {
        host: "parakh.app",
        referer: "https://evil-attacker.com/malicious-link",
      },
    });

    const result = validateCsrfOrigin(postReq);
    expect(result.valid).toBe(false);
    expect(result.status).toBe(403);
  });

  it("should permit localhost origins in local development", () => {
    env.NODE_ENV = "development";
    const postReq = new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        host: "localhost:3000",
        origin: "http://localhost:3000",
      },
    });

    const result = validateCsrfOrigin(postReq);
    expect(result.valid).toBe(true);
  });

  it("should permit non-browser / CLI requests where neither Origin nor Referer is set", () => {
    const postReq = new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        host: "localhost:3000",
      },
    });

    const result = validateCsrfOrigin(postReq);
    expect(result.valid).toBe(true);
  });
});
