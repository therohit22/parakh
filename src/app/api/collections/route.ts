import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Question from "@/models/Question";
import Company from "@/models/Company";

interface CollectionDefinition {
  id: string;
  title: string;
  description: string;
  badge: string;
  difficulty: "Mixed" | "Medium" | "Hard";
  filter: Record<string, unknown>;
}

const COLLECTIONS: CollectionDefinition[] = [
  {
    id: "faang-essentials",
    title: "FAANG Core Essentials",
    description: "High-frequency algorithmic problems reported across Amazon, Google, Microsoft, and Flipkart.",
    badge: "Most Popular",
    difficulty: "Mixed",
    filter: {},
  },
  {
    id: "two-pointers-sliding-window",
    title: "Two Pointers & Sliding Window",
    description: "Crucial linear-time patterns for sub-array, sub-string, and sorted array problems.",
    badge: "Core Pattern",
    difficulty: "Mixed",
    filter: { topics: { $in: ["Two Pointers", "Sliding Window", "Arrays", "Strings"] } },
  },
  {
    id: "binary-search-mastery",
    title: "Binary Search Mastery",
    description: "From classic logarithmic lookup to search-on-answer optimization paradigms.",
    badge: "Essential",
    difficulty: "Medium",
    filter: { topics: { $in: ["Binary Search"] } },
  },
  {
    id: "dynamic-programming-patterns",
    title: "Dynamic Programming Patterns",
    description: "Memoization, tabulation, state transitions, and optimal substructure challenges.",
    badge: "High Yield",
    difficulty: "Hard",
    filter: { topics: { $in: ["Dynamic Programming", "DP"] } },
  },
  {
    id: "graphs-and-trees",
    title: "Trees & Graph Traversals",
    description: "BFS, DFS, topological sorting, and recursive tree decomposition favorites.",
    badge: "Data Structures",
    difficulty: "Medium",
    filter: { topics: { $in: ["Trees", "Binary Tree", "Graphs", "BFS", "DFS"] } },
  },
];

export async function GET() {
  try {
    await dbConnect();
    void Company;

    const allQuestions = await Question.find()
      .populate("companies", "name slug logo")
      .select("_id title slug difficulty topics pattern companies leetcodeUrl")
      .lean();

    const collectionsWithQuestions = COLLECTIONS.map((c) => {
      let matched = allQuestions;

      if (c.id === "faang-essentials") {
        // Pick questions that belong to at least 1 company
        matched = allQuestions
          .filter((q) => Array.isArray(q.companies) && q.companies.length > 0)
          .slice(0, 15);
      } else if (c.filter.topics && typeof c.filter.topics === "object" && "$in" in c.filter.topics) {
        const allowed = (c.filter.topics as { $in: string[] }).$in.map((t) => t.toLowerCase());
        matched = allQuestions.filter((q) =>
          (q.topics || []).some((t) => allowed.includes(t.toLowerCase()))
        );
      }

      return {
        id: c.id,
        title: c.title,
        description: c.description,
        badge: c.badge,
        difficulty: c.difficulty,
        count: matched.length,
        questions: matched.slice(0, 10).map((q) => ({
          _id: q._id.toString(),
          title: q.title,
          slug: q.slug,
          difficulty: q.difficulty,
          topics: q.topics || [],
          pattern: q.pattern || null,
          companies: q.companies || [],
          leetcodeUrl: q.leetcodeUrl || null,
        })),
      };
    });

    return NextResponse.json({
      success: true,
      collections: collectionsWithQuestions,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[Collections GET] ${error.name}: ${error.message}`);
    }
    return NextResponse.json(
      { success: false, error: "Failed to fetch curated collections" },
      { status: 500 }
    );
  }
}
