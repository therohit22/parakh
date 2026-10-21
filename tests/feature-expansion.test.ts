import { describe, it, expect } from "vitest";
import { noteSchema } from "@/lib/validations/question";
import { changePasswordSchema, deleteAccountSchema } from "@/lib/validations/auth";
import { questionQuerySchema } from "@/lib/validations/query";

describe("Parakh Feature Expansion Tests", () => {
  describe("Personal Question Notes Validation", () => {
    it("should accept valid note content within character limits", () => {
      const valid = noteSchema.safeParse({
        content: "Use two pointers starting at opposite ends. Time: O(N), Space: O(1).",
      });
      expect(valid.success).toBe(true);
      if (valid.success) {
        expect(valid.data.content).toContain("two pointers");
      }
    });

    it("should reject empty note content", () => {
      const empty = noteSchema.safeParse({ content: "" });
      expect(empty.success).toBe(false);
    });

    it("should reject notes exceeding maximum character limit (2000 chars)", () => {
      const longContent = "A".repeat(2001);
      const invalid = noteSchema.safeParse({ content: longContent });
      expect(invalid.success).toBe(false);
      if (!invalid.success) {
        expect(invalid.error.issues[0]?.message).toMatch(/cannot exceed 2000 characters/i);
      }
    });
  });

  describe("Account Security Schemas", () => {
    it("should validate change password input correctly", () => {
      const valid = changePasswordSchema.safeParse({
        currentPassword: "OldPassword123",
        newPassword: "NewSecurePassword456!",
      });
      expect(valid.success).toBe(true);

      const tooShort = changePasswordSchema.safeParse({
        currentPassword: "OldPassword123",
        newPassword: "123",
      });
      expect(tooShort.success).toBe(false);
    });

    it("should validate account deletion password requirement", () => {
      const valid = deleteAccountSchema.safeParse({
        password: "MyCurrentPassword123",
      });
      expect(valid.success).toBe(true);

      const empty = deleteAccountSchema.safeParse({
        password: "",
      });
      expect(empty.success).toBe(false);
    });
  });

  describe("DSA Pattern Filter & Advanced Query Validation", () => {
    it("should accept valid pattern queries", () => {
      const query = questionQuerySchema.safeParse({
        pattern: "Sliding Window",
        difficulty: "Medium",
        company: "amazon",
        search: "subarray",
      });
      expect(query.success).toBe(true);
      if (query.success) {
        expect(query.data.pattern).toBe("Sliding Window");
        expect(query.data.difficulty).toBe("Medium");
        expect(query.data.company).toBe("amazon");
        expect(query.data.search).toBe("subarray");
      }
    });

    it("should sanitize and trim search queries", () => {
      const query = questionQuerySchema.safeParse({
        search: "   two sum   ",
      });
      expect(query.success).toBe(true);
      if (query.success) {
        expect(query.data.search).toBe("two sum");
      }
    });
  });

  describe("Preparation Score Deterministic Formula", () => {
    // Formula under test:
    // score = Math.round(overallCoverage * 0.35 + topicCoverage * 0.25 + companyCoverage * 0.15 + revisionMetric * 0.15 + streakScore * 0.10)
    function calculatePreparationScore({
      totalQuestions,
      solvedQuestions,
      topicsCount,
      coveredTopics,
      companiesCount,
      coveredCompanies,
      revisionCount,
      streak,
    }: {
      totalQuestions: number;
      solvedQuestions: number;
      topicsCount: number;
      coveredTopics: number;
      companiesCount: number;
      coveredCompanies: number;
      revisionCount: number;
      streak: number;
    }) {
      const overallCoverage = totalQuestions > 0 ? (solvedQuestions / totalQuestions) * 100 : 0;
      const topicCoverage = topicsCount > 0 ? (coveredTopics / topicsCount) * 100 : 0;
      const companyCoverage = companiesCount > 0 ? (coveredCompanies / companiesCount) * 100 : 0;
      const revisionMetric = Math.min(100, revisionCount * 10);
      const streakScore = Math.min(100, streak * 14.3);

      const finalScore = Math.round(
        overallCoverage * 0.35 +
        topicCoverage * 0.25 +
        companyCoverage * 0.15 +
        revisionMetric * 0.15 +
        streakScore * 0.10
      );

      return Math.min(100, Math.max(0, finalScore));
    }

    it("should return 0 when user has solved zero questions and zero activity", () => {
      const score = calculatePreparationScore({
        totalQuestions: 100,
        solvedQuestions: 0,
        topicsCount: 15,
        coveredTopics: 0,
        companiesCount: 10,
        coveredCompanies: 0,
        revisionCount: 0,
        streak: 0,
      });
      expect(score).toBe(0);
    });

    it("should correctly bound score between 0 and 100", () => {
      const maxScore = calculatePreparationScore({
        totalQuestions: 100,
        solvedQuestions: 100,
        topicsCount: 15,
        coveredTopics: 15,
        companiesCount: 10,
        coveredCompanies: 10,
        revisionCount: 10,
        streak: 7,
      });
      expect(maxScore).toBe(100);
    });

    it("should compute realistic intermediate preparation score", () => {
      const score = calculatePreparationScore({
        totalQuestions: 100,
        solvedQuestions: 50, // 50% * 0.35 = 17.5
        topicsCount: 10,
        coveredTopics: 6, // 60% * 0.25 = 15.0
        companiesCount: 8,
        coveredCompanies: 4, // 50% * 0.15 = 7.5
        revisionCount: 5, // 50 * 0.15 = 7.5
        streak: 3, // 42.9 * 0.10 = 4.29
      });
      // 17.5 + 15 + 7.5 + 7.5 + 4.29 = 51.79 -> 52
      expect(score).toBe(52);
    });
  });

  describe("Topic Strength Analytics Logic", () => {
    function getStrength(percentage: number): "strong" | "moderate" | "needs_practice" {
      if (percentage >= 70) return "strong";
      if (percentage >= 40) return "moderate";
      return "needs_practice";
    }

    it("should categorize topic progress accurately", () => {
      expect(getStrength(85)).toBe("strong");
      expect(getStrength(70)).toBe("strong");
      expect(getStrength(69)).toBe("moderate");
      expect(getStrength(40)).toBe("moderate");
      expect(getStrength(39)).toBe("needs_practice");
      expect(getStrength(0)).toBe("needs_practice");
    });
  });

  describe("Deterministic Daily Practice Selection", () => {
    function getDeterministicSeed(dateStr: string): number {
      let hash = 0;
      for (let i = 0; i < dateStr.length; i++) {
        hash = (hash << 5) - hash + dateStr.charCodeAt(i);
        hash |= 0;
      }
      return Math.abs(hash);
    }

    it("should yield the exact same seed on the same day", () => {
      const date1 = "2026-10-20";
      const date2 = "2026-10-20";
      expect(getDeterministicSeed(date1)).toBe(getDeterministicSeed(date2));
    });

    it("should yield a different seed across different days", () => {
      const date1 = "2026-10-20";
      const date2 = "2026-10-21";
      expect(getDeterministicSeed(date1)).not.toBe(getDeterministicSeed(date2));
    });
  });

  describe("Company Preparation Roadmap Stage Mapping", () => {
    const STAGE_TOPICS = {
      1: ["Arrays", "Strings", "Hashing", "Two Pointers"],
      2: ["Binary Search", "Linked List", "Trees", "BST"],
      3: ["Graphs", "Dynamic Programming", "Greedy", "Backtracking"],
    };

    function assignStage(topics: string[]): 1 | 2 | 3 {
      const lower = topics.map((t) => t.toLowerCase());
      for (const t of STAGE_TOPICS[3]) {
        if (lower.includes(t.toLowerCase())) return 3;
      }
      for (const t of STAGE_TOPICS[2]) {
        if (lower.includes(t.toLowerCase())) return 2;
      }
      return 1;
    }

    it("should map questions to correct progressive stages", () => {
      expect(assignStage(["Arrays", "Hashing"])).toBe(1);
      expect(assignStage(["Trees", "Recursion"])).toBe(2);
      expect(assignStage(["Dynamic Programming", "Arrays"])).toBe(3);
      expect(assignStage(["Graphs", "BFS"])).toBe(3);
    });
  });

  describe("Streak Calculation from Daily Activity Log", () => {
    function computeStreak(activeDates: Set<string>): number {
      let streak = 0;
      const today = new Date();
      // Check today or yesterday as start
      for (let offset = 0; offset < 365; offset++) {
        const d = new Date(today);
        d.setDate(today.getDate() - offset);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const dateStr = `${yyyy}-${mm}-${dd}`;

        if (activeDates.has(dateStr)) {
          streak++;
        } else if (offset === 0) {
          // If today has no activity yet, streak can still continue from yesterday
          continue;
        } else {
          break;
        }
      }
      return streak;
    }

    it("should compute streak of 0 when no activity exists", () => {
      expect(computeStreak(new Set())).toBe(0);
    });

    it("should calculate streak accurately for consecutive days", () => {
      const today = new Date();
      const d1 = new Date(today);
      const d2 = new Date(today);
      d2.setDate(today.getDate() - 1);
      const d3 = new Date(today);
      d3.setDate(today.getDate() - 2);

      const formatDate = (d: Date) => {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
      };

      const set = new Set([formatDate(d1), formatDate(d2), formatDate(d3)]);
      expect(computeStreak(set)).toBe(3);
    });
  });
});
