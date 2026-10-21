import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Question from "@/models/Question";
import Company from "@/models/Company";
import User from "@/models/User";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";

function getSeedFromDate(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

interface QuestionItem {
  _id: { toString(): string };
  title: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topics?: string[];
  pattern?: string | null;
  companies?: unknown[];
  leetcodeUrl?: string | null;
}

export async function GET(request: Request) {
  try {
    await dbConnect();
    void Company;

    const token = getTokenFromRequest(request);
    const authUser = token ? verifyToken(token) : null;

    let solvedSet = new Set<string>();
    if (authUser?.userId) {
      const user = await User.findById(authUser.userId).select("solvedQuestions").lean();
      if (user?.solvedQuestions) {
        solvedSet = new Set(user.solvedQuestions.map((id) => id.toString()));
      }
    }

    const today = new Date().toISOString().slice(0, 10);
    const seed = getSeedFromDate(today);

    // Fetch questions by difficulty
    const [easyQuestions, mediumQuestions, hardQuestions] = await Promise.all([
      Question.find({ difficulty: "Easy" })
        .populate("companies", "name slug logo")
        .lean(),
      Question.find({ difficulty: "Medium" })
        .populate("companies", "name slug logo")
        .lean(),
      Question.find({ difficulty: "Hard" })
        .populate("companies", "name slug logo")
        .lean(),
    ]);

    const dailyQuestions: QuestionItem[] = [];

    // Pick 1 Easy
    if (easyQuestions.length > 0) {
      const idx = seed % easyQuestions.length;
      dailyQuestions.push(easyQuestions[idx] as unknown as QuestionItem);
    }

    // Pick 3 Medium
    if (mediumQuestions.length > 0) {
      for (let i = 0; i < Math.min(3, mediumQuestions.length); i++) {
        const idx = (seed + i * 7 + 3) % mediumQuestions.length;
        dailyQuestions.push(mediumQuestions[idx] as unknown as QuestionItem);
      }
    }

    // Pick 1 Hard
    if (hardQuestions.length > 0) {
      const idx = (seed + 13) % hardQuestions.length;
      dailyQuestions.push(hardQuestions[idx] as unknown as QuestionItem);
    }

    // If total picked is less than 5, supplement from medium/easy
    const existingIds = new Set(
      dailyQuestions.map((q) => q._id.toString())
    );
    for (const q of mediumQuestions) {
      if (dailyQuestions.length >= 5) break;
      if (!existingIds.has(q._id.toString())) {
        dailyQuestions.push(q as unknown as QuestionItem);
        existingIds.add(q._id.toString());
      }
    }

    const questionsWithStatus = dailyQuestions.map((q) => ({
      _id: q._id.toString(),
      title: q.title,
      slug: q.slug,
      difficulty: q.difficulty,
      topics: q.topics || [],
      pattern: q.pattern || null,
      companies: q.companies || [],
      leetcodeUrl: q.leetcodeUrl || null,
      isSolved: solvedSet.has(q._id.toString()),
    }));

    const completedCount = questionsWithStatus.filter((q) => q.isSolved).length;

    return NextResponse.json(
      {
        success: true,
        date: today,
        totalCount: questionsWithStatus.length,
        completedCount,
        percentage:
          questionsWithStatus.length > 0
            ? Math.round((completedCount / questionsWithStatus.length) * 100)
            : 0,
        questions: questionsWithStatus,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[Daily Practice GET] ${error.name}: ${error.message}`);
    }
    return NextResponse.json(
      { success: false, error: "Failed to generate daily practice" },
      { status: 500 }
    );
  }
}
