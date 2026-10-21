import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "fs";
import { dbConnect } from "@/lib/db";
import Company from "@/models/Company";
import Question from "@/models/Question";
import { GET as getQuestionsRoute } from "@/app/api/questions/route";

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

afterAll(async () => {
  // Do not drop connection if other tests need it, or cleanly disconnect
});

describe("Company-wise DSA Question Filtering & Separation", () => {
  it("TEST 1: Amazon company filter returns only Amazon-associated questions", async () => {
    const amazon = await Company.findOne({ slug: "amazon" }).lean();
    expect(amazon).toBeTruthy();

    const req = new Request("http://localhost:3000/api/questions?company=amazon&limit=50&page=1");
    const res = await getQuestionsRoute(req);
    const json = await res.json();

    expect(json.success).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
    // Every single returned question must reference Amazon's ObjectId
    for (const q of json.data) {
      const companySlugs = q.companies.map((c: { slug: string }) => c.slug);
      expect(companySlugs).toContain("amazon");
    }
  });

  it("TEST 2: Flipkart company filter returns only Flipkart-associated questions", async () => {
    const flipkart = await Company.findOne({ slug: "flipkart" }).lean();
    expect(flipkart).toBeTruthy();

    const req = new Request("http://localhost:3000/api/questions?company=flipkart&limit=50&page=1");
    const res = await getQuestionsRoute(req);
    const json = await res.json();

    expect(json.success).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
    for (const q of json.data) {
      const companySlugs = q.companies.map((c: { slug: string }) => c.slug);
      expect(companySlugs).toContain("flipkart");
    }
  });

  it("TEST 3: Google company filter returns only Google-associated questions", async () => {
    const google = await Company.findOne({ slug: "google" }).lean();
    expect(google).toBeTruthy();

    const req = new Request("http://localhost:3000/api/questions?company=google&limit=50&page=1");
    const res = await getQuestionsRoute(req);
    const json = await res.json();

    expect(json.success).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
    for (const q of json.data) {
      const companySlugs = q.companies.map((c: { slug: string }) => c.slug);
      expect(companySlugs).toContain("google");
    }
  });

  it("TEST 4: A multi-company question appears under every associated company", async () => {
    // "Two Sum" is associated with multiple companies: amazon, google, flipkart
    const twoSum = await Question.findOne({ slug: "two-sum" }).populate("companies").lean();
    expect(twoSum).toBeTruthy();

    const reqAmazon = new Request("http://localhost:3000/api/questions?company=amazon&search=Two%20Sum");
    const resAmazon = await (await getQuestionsRoute(reqAmazon)).json();
    expect(resAmazon.data.some((q: { slug: string }) => q.slug === "two-sum")).toBe(true);

    const reqGoogle = new Request("http://localhost:3000/api/questions?company=google&search=Two%20Sum");
    const resGoogle = await (await getQuestionsRoute(reqGoogle)).json();
    expect(resGoogle.data.some((q: { slug: string }) => q.slug === "two-sum")).toBe(true);

    const reqFlipkart = new Request("http://localhost:3000/api/questions?company=flipkart&search=Two%20Sum");
    const resFlipkart = await (await getQuestionsRoute(reqFlipkart)).json();
    expect(resFlipkart.data.some((q: { slug: string }) => q.slug === "two-sum")).toBe(true);
  });

  it("TEST 5: The same question is not duplicated in the database", async () => {
    // Ensure Two Sum exists only ONCE in the Question collection
    const count = await Question.countDocuments({ slug: "two-sum" });
    expect(count).toBe(1);

    // Verify all unique question slugs
    const allQuestions = await Question.find({}).select("slug").lean();
    const slugs = allQuestions.map((q) => q.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(slugs.length);
  });

  it("TEST 6: Pagination preserves the company filter", async () => {
    const reqPage1 = new Request("http://localhost:3000/api/questions?company=amazon&limit=10&page=1");
    const resPage1 = await (await getQuestionsRoute(reqPage1)).json();

    const reqPage2 = new Request("http://localhost:3000/api/questions?company=amazon&limit=10&page=2");
    const resPage2 = await (await getQuestionsRoute(reqPage2)).json();

    expect(resPage1.pagination.page).toBe(1);
    expect(resPage2.pagination.page).toBe(2);
    expect(resPage1.pagination.total).toBe(resPage2.pagination.total);

    // Page 2 must still only contain Amazon-associated questions
    for (const q of resPage2.data) {
      const companySlugs = q.companies.map((c: { slug: string }) => c.slug);
      expect(companySlugs).toContain("amazon");
    }
  });

  it("TEST 7: The total count is correct and matches database relationships", async () => {
    const amazon = await Company.findOne({ slug: "amazon" }).lean();
    expect(amazon).toBeTruthy();

    const dbAmazonCount = await Question.countDocuments({ companies: amazon!._id });
    const req = new Request("http://localhost:3000/api/questions?company=amazon&limit=10&page=1");
    const res = await (await getQuestionsRoute(req)).json();

    expect(res.pagination.total).toBe(dbAmazonCount);
    expect(res.pagination.totalPages).toBe(Math.ceil(dbAmazonCount / 10));
  });

  it("TEST 8: Search + company filter works together as an AND filter", async () => {
    const req = new Request("http://localhost:3000/api/questions?company=amazon&search=two");
    const res = await (await getQuestionsRoute(req)).json();

    expect(res.success).toBe(true);
    for (const q of res.data) {
      // Must belong to Amazon
      const companySlugs = q.companies.map((c: { slug: string }) => c.slug);
      expect(companySlugs).toContain("amazon");
      // Must match search query in title or description
      const matchesSearch =
        q.title.toLowerCase().includes("two") ||
        (q.description && q.description.toLowerCase().includes("two"));
      expect(matchesSearch).toBe(true);
    }
  });

  it("TEST 9: Difficulty + company filter works together as an AND filter", async () => {
    const req = new Request("http://localhost:3000/api/questions?company=amazon&difficulty=Easy");
    const res = await (await getQuestionsRoute(req)).json();

    expect(res.success).toBe(true);
    for (const q of res.data) {
      expect(q.difficulty).toBe("Easy");
      const companySlugs = q.companies.map((c: { slug: string }) => c.slug);
      expect(companySlugs).toContain("amazon");
    }
  });

  it("TEST 10: A company with no questions displays a genuine empty state", async () => {
    const netlify = await Company.findOne({ slug: "netlify" }).lean();
    expect(netlify).toBeTruthy();

    const req = new Request("http://localhost:3000/api/questions?company=netlify");
    const res = await (await getQuestionsRoute(req)).json();

    expect(res.success).toBe(true);
    expect(res.data).toEqual([]);
    expect(res.pagination.total).toBe(0);
    expect(res.pagination.totalPages).toBe(0);
  });
});
