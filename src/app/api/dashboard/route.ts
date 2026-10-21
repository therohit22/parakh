import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Question from "@/models/Question";
import Company from "@/models/Company";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const auth = requireAuth(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      );
    }

    await dbConnect();

    // Prevent unused import warnings while ensuring model registration
    void Question;
    void Company;

    const user = await User.findById(auth.user.userId)
      .select("name email role bookmarkedQuestions solvedQuestions revisionQuestions activityLog createdAt")
      .lean();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // 1. Total questions count
    const totalQuestions = await Question.countDocuments();

    // 2. Difficulty total counts across all questions in DB
    const difficultyTotalsAgg = await Question.aggregate<{ _id: string; count: number }>([
      {
        $group: {
          _id: "$difficulty",
          count: { $sum: 1 },
        },
      },
    ]);

    const difficultyTotals: Record<string, number> = {
      Easy: 0,
      Medium: 0,
      Hard: 0,
    };
    for (const item of difficultyTotalsAgg) {
      if (item._id && typeof item.count === "number") {
        difficultyTotals[item._id] = item.count;
      }
    }

    // 3. User's valid solved questions (ignoring deleted questions)
    const solvedIds = user.solvedQuestions || [];
    const solvedQuestions =
      solvedIds.length > 0
        ? await Question.find({ _id: { $in: solvedIds } })
            .select("_id difficulty topics companies")
            .lean()
        : [];

    const solvedCount = solvedQuestions.length;

    let easySolved = 0;
    let mediumSolved = 0;
    let hardSolved = 0;
    const companySolvedMap = new Map<string, number>();
    const topicSolvedMap = new Map<string, number>();

    for (const q of solvedQuestions) {
      if (q.difficulty === "Easy") easySolved++;
      else if (q.difficulty === "Medium") mediumSolved++;
      else if (q.difficulty === "Hard") hardSolved++;

      if (Array.isArray(q.companies)) {
        for (const companyId of q.companies) {
          const idStr = companyId.toString();
          companySolvedMap.set(idStr, (companySolvedMap.get(idStr) || 0) + 1);
        }
      }

      if (Array.isArray(q.topics)) {
        for (const topic of q.topics) {
          if (topic && typeof topic === "string") {
            const clean = topic.trim();
            topicSolvedMap.set(clean, (topicSolvedMap.get(clean) || 0) + 1);
          }
        }
      }
    }

    // 4. Topic totals across all questions
    const topicTotalsAgg = await Question.aggregate<{ _id: string; count: number }>([
      { $unwind: "$topics" },
      {
        $group: {
          _id: "$topics",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const topicProgress = topicTotalsAgg
      .filter((item) => item._id && item._id.trim() !== "")
      .map((item) => {
        const topic = item._id.trim();
        const total = item.count;
        const solved = topicSolvedMap.get(topic) || 0;
        const percentage = total > 0 ? Math.min(100, Math.round((solved / total) * 100)) : 0;

        let strength: "strong" | "moderate" | "needs_practice" = "needs_practice";
        if (percentage >= 70) {
          strength = "strong";
        } else if (percentage >= 40) {
          strength = "moderate";
        }

        return {
          topic,
          total,
          solved,
          percentage,
          strength,
        };
      });

    // Identify strongest and weakest topics
    const activeTopics = topicProgress.filter((t) => t.total >= 3);
    const strongestTopic =
      activeTopics.slice().sort((a, b) => b.percentage - a.percentage)[0] || null;
    const weakestTopic =
      activeTopics.slice().sort((a, b) => a.percentage - b.percentage)[0] || null;

    // 5. User's valid bookmarked and revision questions count
    const bookmarkedIds = user.bookmarkedQuestions || [];
    const bookmarkedCount =
      bookmarkedIds.length > 0
        ? await Question.countDocuments({ _id: { $in: bookmarkedIds } })
        : 0;

    const revisionIds = user.revisionQuestions || [];
    const revisionCount =
      revisionIds.length > 0
        ? await Question.countDocuments({ _id: { $in: revisionIds } })
        : 0;

    // 6. Remaining questions and overall solved percentage
    const remainingQuestions = Math.max(0, totalQuestions - solvedCount);
    const solvedPercentage =
      totalQuestions > 0
        ? Math.min(100, Math.max(0, Math.round((solvedCount / totalQuestions) * 100)))
        : 0;

    // 7. Difficulty progress structure
    const difficultyProgress = {
      Easy: {
        solved: easySolved,
        total: difficultyTotals.Easy || 0,
        percentage:
          (difficultyTotals.Easy || 0) > 0
            ? Math.min(100, Math.round((easySolved / difficultyTotals.Easy) * 100))
            : 0,
      },
      Medium: {
        solved: mediumSolved,
        total: difficultyTotals.Medium || 0,
        percentage:
          (difficultyTotals.Medium || 0) > 0
            ? Math.min(100, Math.round((mediumSolved / difficultyTotals.Medium) * 100))
            : 0,
      },
      Hard: {
        solved: hardSolved,
        total: difficultyTotals.Hard || 0,
        percentage:
          (difficultyTotals.Hard || 0) > 0
            ? Math.min(100, Math.round((hardSolved / difficultyTotals.Hard) * 100))
            : 0,
      },
    };

    // 8. Company-wise progress
    const companies = await Company.find().select("_id name slug logo").sort({ name: 1 }).lean();

    const companyTotalsAgg = await Question.aggregate<{ _id: string; count: number }>([
      { $unwind: "$companies" },
      {
        $group: {
          _id: "$companies",
          count: { $sum: 1 },
        },
      },
    ]);

    const companyTotalsMap = new Map<string, number>();
    for (const item of companyTotalsAgg) {
      if (item._id) {
        companyTotalsMap.set(item._id.toString(), item.count);
      }
    }

    const companyProgress = companies.map((c) => {
      const cId = c._id.toString();
      const total = companyTotalsMap.get(cId) || 0;
      const solved = companySolvedMap.get(cId) || 0;
      const remaining = Math.max(0, total - solved);
      const percentage = total > 0 ? Math.min(100, Math.round((solved / total) * 100)) : 0;

      return {
        id: cId,
        name: c.name,
        slug: c.slug,
        logo: c.logo || null,
        total,
        solved,
        remaining,
        percentage,
      };
    });

    // 9. Streak & Activity Calendar calculation
    const activityLog = (user.activityLog || []).slice().sort((a, b) => (a.date > b.date ? 1 : -1));
    const activityMap = new Map<string, number>();
    for (const entry of activityLog) {
      activityMap.set(entry.date, entry.count);
    }

    // Build last 30 days grid
    const calendarDays: { date: string; count: number }[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      calendarDays.push({
        date: key,
        count: activityMap.get(key) || 0,
      });
    }

    // Compute consecutive streak
    let currentStreak = 0;
    let checkDate = new Date();
    const todayKey = checkDate.toISOString().slice(0, 10);

    // If active today, count today; if not active today, check if active yesterday
    if ((activityMap.get(todayKey) || 0) > 0) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterdayKey = checkDate.toISOString().slice(0, 10);
      if ((activityMap.get(yesterdayKey) || 0) > 0) {
        // active yesterday
      } else {
        checkDate = new Date(0); // broken
      }
    }

    while (checkDate.getTime() > 0) {
      const key = checkDate.toISOString().slice(0, 10);
      if ((activityMap.get(key) || 0) > 0) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    const longestStreak = Math.max(
      currentStreak,
      activityLog.length > 0 ? Math.min(activityLog.length, currentStreak + 1) : 0
    );

    // 10. Deterministic Parakh Preparation Score (0–100)
    // Formula components:
    // a. overallCompletion (weight: 35%)
    const dsaCoverage = totalQuestions > 0 ? (solvedCount / totalQuestions) * 100 : 0;

    // b. topicCoverage (weight: 25%) - percentage of topics with >= 1 solved
    const topicsWithSolved = topicProgress.filter((t) => t.solved > 0).length;
    const topicBreadth = topicProgress.length > 0 ? (topicsWithSolved / topicProgress.length) * 100 : 0;

    // c. difficultyBalance (weight: 20%) - weighted across tiers
    const easyRatio = (difficultyTotals.Easy || 0) > 0 ? easySolved / difficultyTotals.Easy : 0;
    const medRatio = (difficultyTotals.Medium || 0) > 0 ? mediumSolved / difficultyTotals.Medium : 0;
    const hardRatio = (difficultyTotals.Hard || 0) > 0 ? hardSolved / difficultyTotals.Hard : 0;
    const difficultyScore = (easyRatio * 0.25 + medRatio * 0.5 + hardRatio * 0.25) * 100;

    // d. revisionRate (weight: 10%)
    const revisionScore =
      revisionCount > 0
        ? Math.min(100, Math.round((solvedCount / revisionCount) * 100))
        : solvedCount > 0
        ? 50
        : 0;

    // e. consistency (weight: 10%)
    const consistencyScore = Math.min(100, currentStreak * 20);

    // Guard: A user with zero solved problems must strictly receive a preparation score of 0
    const rawScore =
      solvedCount === 0
        ? 0
        : 0.35 * dsaCoverage +
          0.25 * topicBreadth +
          0.20 * difficultyScore +
          0.10 * revisionScore +
          0.10 * consistencyScore;

    const preparationScore = Math.min(100, Math.max(0, Math.round(rawScore)));

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
          },
          totalQuestions,
          solvedQuestions: solvedCount,
          bookmarkedQuestions: bookmarkedCount,
          revisionQuestions: revisionCount,
          remainingQuestions,
          solvedPercentage,
          preparationScore: {
            score: preparationScore,
            dsaCoverage: Math.round(dsaCoverage),
            topicBreadth: Math.round(topicBreadth),
            difficultyBalance: Math.round(difficultyScore),
            revisionRate: Math.round(revisionScore),
            consistency: Math.round(consistencyScore),
          },
          difficultyProgress,
          companyProgress,
          topicProgress,
          strengthSummary: {
            strongest: strongestTopic ? strongestTopic.topic : null,
            needsPractice: weakestTopic ? weakestTopic.topic : null,
          },
          streak: {
            current: currentStreak,
            longest: longestStreak,
            calendarDays,
          },
        },
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
      console.error(`[Dashboard GET] ${error.name}: ${error.message}`);
    } else {
      console.error("[Dashboard GET] Unknown error occurred");
    }

    return NextResponse.json(
      { success: false, error: "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}
