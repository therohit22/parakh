import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Company from "@/models/Company";
import Question from "@/models/Question";
import User from "@/models/User";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { slugParamSchema } from "@/lib/validations/auth";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

const STAGE_TOPICS = {
  1: {
    title: "Stage 1 — Fundamentals",
    description: "Build essential problem-solving instincts with arrays, strings, two pointers, and hash maps.",
    topics: ["Arrays", "Strings", "Hashing", "Two Pointers"],
  },
  2: {
    title: "Stage 2 — Core DSA",
    description: "Master foundational nonlinear structures: binary search, linked lists, stacks, and trees.",
    topics: ["Binary Search", "Linked List", "Stack", "Queue", "Trees", "Binary Tree", "BST", "Recursion"],
  },
  3: {
    title: "Stage 3 — Advanced Algorithms",
    description: "Tackle complex patterns: graph traversals, dynamic programming, backtracking, and greedy strategies.",
    topics: ["Graphs", "BFS", "DFS", "Dynamic Programming", "Greedy", "Backtracking", "Trie"],
  },
};

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const slugValidation = slugParamSchema.safeParse(slug);
    if (!slugValidation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid company slug" },
        { status: 400 }
      );
    }

    await dbConnect();

    const company = await Company.findOne({ slug: slugValidation.data })
      .select("_id name slug logo description")
      .lean();

    if (!company) {
      return NextResponse.json(
        { success: false, error: "Company not found" },
        { status: 404 }
      );
    }

    const token = getTokenFromRequest(request);
    const authUser = token ? verifyToken(token) : null;

    let solvedSet = new Set<string>();
    if (authUser?.userId) {
      const user = await User.findById(authUser.userId).select("solvedQuestions").lean();
      if (user?.solvedQuestions) {
        solvedSet = new Set(user.solvedQuestions.map((id) => id.toString()));
      }
    }

    // Fetch all questions for this company
    const questions = await Question.find({ companies: company._id })
      .select("_id title slug difficulty topics pattern leetcodeUrl")
      .lean();

    const assignStage = (topics: string[]): 1 | 2 | 3 => {
      const lower = topics.map((t) => t.toLowerCase());
      for (const t of STAGE_TOPICS[3].topics) {
        if (lower.includes(t.toLowerCase())) return 3;
      }
      for (const t of STAGE_TOPICS[2].topics) {
        if (lower.includes(t.toLowerCase())) return 2;
      }
      return 1;
    };

    const stages = [1, 2, 3].map((stageNum) => {
      const info = STAGE_TOPICS[stageNum as 1 | 2 | 3];
      const stageQuestions = questions
        .filter((q) => assignStage(q.topics || []) === stageNum)
        .map((q) => ({
          _id: q._id.toString(),
          title: q.title,
          slug: q.slug,
          difficulty: q.difficulty,
          topics: q.topics || [],
          pattern: q.pattern || null,
          leetcodeUrl: q.leetcodeUrl || null,
          isSolved: solvedSet.has(q._id.toString()),
        }));

      const total = stageQuestions.length;
      const solved = stageQuestions.filter((q) => q.isSolved).length;
      const percentage = total > 0 ? Math.round((solved / total) * 100) : 0;

      return {
        stage: stageNum,
        title: info.title,
        description: info.description,
        topics: info.topics,
        total,
        solved,
        percentage,
        questions: stageQuestions,
      };
    });

    const totalCompanyQuestions = questions.length;
    const totalCompanySolved = questions.filter((q) =>
      solvedSet.has(q._id.toString())
    ).length;
    const overallPercentage =
      totalCompanyQuestions > 0
        ? Math.round((totalCompanySolved / totalCompanyQuestions) * 100)
        : 0;

    return NextResponse.json({
      success: true,
      company: {
        name: company.name,
        slug: company.slug,
        logo: company.logo || null,
      },
      totalQuestions: totalCompanyQuestions,
      solvedQuestions: totalCompanySolved,
      percentage: overallPercentage,
      stages,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[Company Roadmap GET] ${error.name}: ${error.message}`);
    }
    return NextResponse.json(
      { success: false, error: "Failed to generate company roadmap" },
      { status: 500 }
    );
  }
}
