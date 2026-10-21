import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema, slugParamSchema, objectIdParamSchema } from "@/lib/validations/auth";
import { companySchema } from "@/lib/validations/company";
import { questionSchema } from "@/lib/validations/question";
import { questionQuerySchema, companyQuerySchema, escapeRegex } from "@/lib/validations/query";

describe("Input Validation & Query Hardening", () => {
  describe("Auth Validation Schemas", () => {
    it("should accept valid registration data", () => {
      const result = registerSchema.safeParse({
        name: "Test Student",
        email: "student@example.com",
        password: "Password123!",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Test Student");
        expect(result.data.email).toBe("student@example.com");
      }
    });

    it("should reject registration with invalid email", () => {
      const result = registerSchema.safeParse({
        name: "Test Student",
        email: "not-an-email",
        password: "Password123!",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toMatch(/invalid email/i);
      }
    });

    it("should reject registration with password shorter than 8 characters", () => {
      const result = registerSchema.safeParse({
        name: "Test Student",
        email: "student@example.com",
        password: "123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toMatch(/at least 8 characters/i);
      }
    });

    it("should reject registration with empty name", () => {
      const result = registerSchema.safeParse({
        name: "   ",
        email: "student@example.com",
        password: "Password123!",
      });
      expect(result.success).toBe(false);
    });

    it("should accept valid login data", () => {
      const result = loginSchema.safeParse({
        email: "student@example.com",
        password: "SecretPassword",
      });
      expect(result.success).toBe(true);
    });

    it("should reject login with missing password", () => {
      const result = loginSchema.safeParse({
        email: "student@example.com",
        password: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Company Validation Schema", () => {
    it("should accept valid company input", () => {
      const result = companySchema.safeParse({
        name: "Google LLC",
        slug: "google",
        logo: "https://example.com/logo.png",
        description: "A leading tech company",
        website: "https://about.google",
      });
      expect(result.success).toBe(true);
    });

    it("should accept valid company with local static logo path", () => {
      const result = companySchema.safeParse({
        name: "Google",
        slug: "google",
        logo: "/logos/google.svg",
      });
      expect(result.success).toBe(true);
    });

    it("should reject company slug with spaces or uppercase characters", () => {
      const result = companySchema.safeParse({
        name: "Google",
        slug: "Google With Spaces",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toMatch(/lowercase letters, numbers, and hyphens/i);
      }
    });

    it("should reject invalid website URL", () => {
      const result = companySchema.safeParse({
        name: "Google",
        slug: "google",
        website: "not-a-valid-url",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toMatch(/invalid website url/i);
      }
    });
  });

  describe("Question Validation Schema", () => {
    it("should accept valid question input with valid ObjectIds", () => {
      const result = questionSchema.safeParse({
        title: "Two Sum",
        slug: "two-sum",
        difficulty: "Easy",
        topics: ["Array", "Hash Table"],
        companies: ["507f1f77bcf86cd799439011"],
        leetcodeUrl: "https://leetcode.com/problems/two-sum/",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid difficulty level", () => {
      const result = questionSchema.safeParse({
        title: "Two Sum",
        slug: "two-sum",
        difficulty: "SuperHard",
        topics: ["Array"],
        companies: [],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toMatch(/Easy, Medium, or Hard/i);
      }
    });

    it("should reject non-24-character hexadecimal ObjectId in companies array", () => {
      const result = questionSchema.safeParse({
        title: "Two Sum",
        slug: "two-sum",
        difficulty: "Easy",
        topics: ["Array"],
        companies: ["invalid-company-id"],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toMatch(/Invalid Company ID format/i);
      }
    });

    it("should reject non-LeetCode or unsafe protocol in leetcodeUrl", () => {
      const unsafeResult = questionSchema.safeParse({
        title: "Two Sum",
        slug: "two-sum",
        difficulty: "Easy",
        leetcodeUrl: "javascript:alert(1)",
      });
      expect(unsafeResult.success).toBe(false);

      const nonLeetcodeResult = questionSchema.safeParse({
        title: "Two Sum",
        slug: "two-sum",
        difficulty: "Easy",
        leetcodeUrl: "https://google.com/search?q=two-sum",
      });
      expect(nonLeetcodeResult.success).toBe(false);
    });

    it("should accept empty or valid official leetcodeUrl", () => {
      const emptyResult = questionSchema.safeParse({
        title: "Two Sum",
        slug: "two-sum",
        difficulty: "Easy",
        leetcodeUrl: "",
      });
      expect(emptyResult.success).toBe(true);

      const validResult = questionSchema.safeParse({
        title: "Two Sum",
        slug: "two-sum",
        difficulty: "Easy",
        leetcodeUrl: "https://leetcode.com/problems/two-sum/",
      });
      expect(validResult.success).toBe(true);
    });
  });

  describe("Query Parameters & Bounded Pagination", () => {
    it("should enforce default pagination and safe limit bounds", () => {
      const parsed = questionQuerySchema.parse({});
      expect(parsed.page).toBe(1);
      expect(parsed.limit).toBe(10);
      expect(parsed.sort).toBe("latest");
    });

    it("should reject limit values exceeding 50 to prevent DoS via unbounded queries", () => {
      const result = questionQuerySchema.safeParse({ limit: 100 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toMatch(/cannot exceed 50/i);
      }
    });

    it("should reject page values less than 1", () => {
      const result = questionQuerySchema.safeParse({ page: 0 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toMatch(/greater than or equal to 1/i);
      }
    });

    it("should reject arbitrary sort field injection", () => {
      const result = questionQuerySchema.safeParse({ sort: "dropDatabase" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toMatch(/latest, oldest, or title/i);
      }
    });

    it("should validate company query parameters", () => {
      const parsed = companyQuerySchema.parse({ search: "google", page: 2, limit: 20 });
      expect(parsed.search).toBe("google");
      expect(parsed.page).toBe(2);
      expect(parsed.limit).toBe(20);
      expect(parsed.sort).toBe("name");
    });
  });

  describe("Slug & Param Validation", () => {
    it("should validate clean URL slugs", () => {
      expect(slugParamSchema.safeParse("valid-slug-123").success).toBe(true);
      expect(slugParamSchema.safeParse("Invalid_Slug").success).toBe(false);
      expect(slugParamSchema.safeParse("slug with spaces").success).toBe(false);
      expect(slugParamSchema.safeParse("").success).toBe(false);
    });

    it("should validate 24-character hex ObjectIds", () => {
      expect(objectIdParamSchema.safeParse("507f1f77bcf86cd799439011").success).toBe(true);
      expect(objectIdParamSchema.safeParse("not-an-object-id").success).toBe(false);
    });
  });

  describe("Regex Injection Prevention", () => {
    it("should escape all special regex characters from user input", () => {
      const dangerousInput = ".*+?^${}()|[]\\";
      const escaped = escapeRegex(dangerousInput);
      expect(escaped).toBe("\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\");
      // Verify regex can compile and match literally without ReDoS
      const regex = new RegExp(escaped);
      expect(regex.test(dangerousInput)).toBe(true);
      expect(regex.test("any other text")).toBe(false);
    });
  });
});
