import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Question from "@/models/Question";
import Company from "@/models/Company";
import User from "@/models/User";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";

interface MockQuestionItem {
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
    const { searchParams } = new URL(request.url);
    const companySlug = searchParams.get("company")?.toLowerCase().trim();

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

    let companyFilter: Record<string, unknown> = {};
    let targetCompany: { _id: unknown; name: string; slug: string } | null = null;

    if (companySlug) {
      const comp = await Company.findOne({ slug: companySlug }).select("_id name slug").lean();
      if (comp) {
        targetCompany = comp;
        companyFilter = { companies: comp._id };
      }
    }

    // Query questions
    const [easyQuestions, mediumQuestions, hardQuestions] = await Promise.all([
      Question.find({ ...companyFilter, difficulty: "Easy" })
        .populate("companies", "name slug logo")
        .lean(),
      Question.find({ ...companyFilter, difficulty: "Medium" })
        .populate("companies", "name slug logo")
        .lean(),
      Question.find({ ...companyFilter, difficulty: "Hard" })
        .populate("companies", "name slug logo")
        .lean(),
    ]);

    const sessionQuestions: MockQuestionItem[] = [];

    // Helper random pick from array
    const getRandom = <T>(arr: T[]): T | null =>
      arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;

    // Pick 1 Easy
    const pickedEasy = getRandom(easyQuestions);
    if (pickedEasy) sessionQuestions.push(pickedEasy as unknown as MockQuestionItem);

    // Pick 1 Medium
    const pickedMedium = getRandom(mediumQuestions);
    if (pickedMedium) sessionQuestions.push(pickedMedium as unknown as MockQuestionItem);

    // Pick 1 Hard (or 2nd Medium if no Hard)
    const pickedHard = getRandom(hardQuestions) || getRandom(mediumQuestions.filter((q) => q !== pickedMedium));
    if (pickedHard && pickedHard !== pickedMedium) sessionQuestions.push(pickedHard as unknown as MockQuestionItem);

    const questionsWithStatus = sessionQuestions.map((q) => ({
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

    return NextResponse.json(
      {
        success: true,
        targetCompany: targetCompany
          ? { name: targetCompany.name, slug: targetCompany.slug }
          : { name: "General DSA", slug: "general" },
        durationMinutes: 45,
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
      console.error(`[Mock Interview GET] ${error.name}: ${error.message}`);
    }
    return NextResponse.json(
      { success: false, error: "Failed to generate mock interview session" },
      { status: 500 }
    );
  }
}
