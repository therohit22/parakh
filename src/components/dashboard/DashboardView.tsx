"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

interface DifficultyItem {
  solved: number;
  total: number;
  percentage: number;
}

interface CompanyItem {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  total: number;
  solved: number;
  remaining: number;
  percentage: number;
}

interface TopicItem {
  topic: string;
  total: number;
  solved: number;
  percentage: number;
  strength: "strong" | "moderate" | "needs_practice";
}

interface DailyQuestion {
  _id: string;
  title: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topics: string[];
  pattern?: string;
  companies?: { name: string; slug: string }[];
  leetcodeUrl?: string;
  isSolved: boolean;
}

interface DashboardData {
  user: {
    name: string;
    email: string;
    role: string;
  };
  totalQuestions: number;
  solvedQuestions: number;
  bookmarkedQuestions: number;
  revisionQuestions: number;
  remainingQuestions: number;
  solvedPercentage: number;
  preparationScore: {
    score: number;
    dsaCoverage: number;
    topicBreadth: number;
    difficultyBalance: number;
    revisionRate: number;
    consistency: number;
  };
  difficultyProgress: {
    Easy: DifficultyItem;
    Medium: DifficultyItem;
    Hard: DifficultyItem;
  };
  companyProgress: CompanyItem[];
  topicProgress: TopicItem[];
  strengthSummary: {
    strongest: string | null;
    needsPractice: string | null;
  };
  streak: {
    current: number;
    longest: number;
    calendarDays: { date: string; count: number }[];
  };
}

const difficultyBadgeColors: Record<string, string> = {
  Easy: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
  Medium: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
  Hard: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800",
};

export default function DashboardView() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [dailyData, setDailyData] = useState<{
    totalCount: number;
    completedCount: number;
    percentage: number;
    questions: DailyQuestion[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUnauthenticated, setIsUnauthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchDashboard() {
      try {
        setLoading(true);
        const [dashRes, dailyRes] = await Promise.all([
          fetch("/api/dashboard"),
          fetch("/api/daily-practice"),
        ]);

        const json = await dashRes.json();
        const dailyJson = await dailyRes.json();

        if (!isMounted) return;

        if (dashRes.status === 401) {
          setIsUnauthenticated(true);
          setLoading(false);
          return;
        }

        if (!dashRes.ok || !json.success) {
          setError(json.error || "Failed to load dashboard data");
        } else {
          setData(json.data);
          if (dailyRes.ok && dailyJson.success) {
            setDailyData(dailyJson);
          }
        }
      } catch {
        if (isMounted) {
          setError("Network error while loading dashboard statistics.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="mt-8 space-y-10 animate-pulse">
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-2">
          <div className="h-6 w-48 rounded bg-gray-200 dark:bg-slate-800" />
          <div className="h-4 w-96 rounded bg-gray-200 dark:bg-slate-800" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="space-y-3">
              <div className="flex justify-between">
                <div className="h-3 w-20 rounded bg-gray-200 dark:bg-slate-800" />
                <div className="h-6 w-6 rounded bg-gray-200 dark:bg-slate-800" />
              </div>
              <div className="h-8 w-14 rounded bg-gray-200 dark:bg-slate-800" />
              <div className="h-3 w-28 rounded bg-gray-200 dark:bg-slate-800" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isUnauthenticated) {
    return (
      <div className="mt-8">
        <EmptyState
          title="Sign in to view your dashboard"
          description="Access your personal preparation statistics, solved problem breakdown, and company-wise progress tracking."
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          }
          action={
            <Button href="/login" variant="primary">
              Sign In
            </Button>
          }
        />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
        {error || "Unable to display dashboard at this time."}
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-10">
      {/* Welcome Banner + Quick Actions */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
              Welcome back, {data.user.name || "Student"}!
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
              Track your algorithmic readiness, consistency streaks, and personalized review queue.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/mock-interview"
              className="rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
            >
              Start Mock Interview ⏱️
            </Link>
            <Link
              href="/revision"
              className="rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Revision Queue ({data.revisionQuestions})
            </Link>
          </div>
        </div>
      </div>

      {/* Feature 5: Parakh Preparation Score Card */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6 md:col-span-1 flex flex-col justify-between bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-900 border-indigo-100 dark:border-slate-800">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                Parakh Preparation Score
              </span>
              <span className="text-xl">🎯</span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-5xl font-black text-gray-900 dark:text-white">
                {data.preparationScore.score}
              </span>
              <span className="text-sm font-semibold text-gray-500">/ 100</span>
            </div>
            <p className="mt-2 text-xs text-gray-600 dark:text-slate-400 leading-relaxed">
              Deterministic readiness index evaluating question volume, topic breadth, difficulty balance, and consistency.
            </p>
          </div>

          <div className="mt-6 space-y-2 border-t border-gray-100 pt-4 dark:border-slate-800 text-xs text-gray-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span>DSA Volume (35%)</span>
              <span className="font-semibold text-gray-900 dark:text-white">{data.preparationScore.dsaCoverage}%</span>
            </div>
            <div className="flex justify-between">
              <span>Topic Breadth (25%)</span>
              <span className="font-semibold text-gray-900 dark:text-white">{data.preparationScore.topicBreadth}%</span>
            </div>
            <div className="flex justify-between">
              <span>Difficulty Balance (20%)</span>
              <span className="font-semibold text-gray-900 dark:text-white">{data.preparationScore.difficultyBalance}%</span>
            </div>
            <div className="flex justify-between">
              <span>Revision Depth (10%)</span>
              <span className="font-semibold text-gray-900 dark:text-white">{data.preparationScore.revisionRate}%</span>
            </div>
            <div className="flex justify-between">
              <span>Consistency (10%)</span>
              <span className="font-semibold text-gray-900 dark:text-white">{data.preparationScore.consistency}%</span>
            </div>
          </div>
        </Card>

        {/* Feature 12: Streak & Activity Calendar */}
        <Card className="p-6 md:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Practice Streak & Activity
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Last 30 days of problem solving and revision activity.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs text-gray-400">Current</span>
                  <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                    🔥 {data.streak.current} Days
                  </p>
                </div>
                <div className="text-right border-l border-gray-200 dark:border-slate-800 pl-3">
                  <span className="text-xs text-gray-400">Longest</span>
                  <p className="text-base font-bold text-gray-700 dark:text-slate-300">
                    🏆 {data.streak.longest} Days
                  </p>
                </div>
              </div>
            </div>

            {/* 30-Day Activity Squares */}
            <div className="mt-6">
              <div className="flex flex-wrap gap-1.5 justify-start">
                {data.streak.calendarDays.map((d) => {
                  let bg = "bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700";
                  if (d.count >= 3) {
                    bg = "bg-emerald-600 text-white border-emerald-700";
                  } else if (d.count === 2) {
                    bg = "bg-emerald-400 text-white border-emerald-500";
                  } else if (d.count === 1) {
                    bg = "bg-emerald-200 dark:bg-emerald-800/80 border-emerald-300";
                  }

                  return (
                    <div
                      key={d.date}
                      title={`${d.date}: ${d.count} actions`}
                      className={`h-6 w-6 rounded-md border flex items-center justify-center text-[10px] font-bold transition-transform hover:scale-110 ${bg}`}
                    >
                      {d.count > 0 ? d.count : ""}
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-gray-500 dark:text-slate-400">
                <span>Less</span>
                <span className="h-3 w-3 rounded bg-gray-100 dark:bg-slate-800 border" />
                <span className="h-3 w-3 rounded bg-emerald-200 dark:bg-emerald-800 border" />
                <span className="h-3 w-3 rounded bg-emerald-400 border" />
                <span className="h-3 w-3 rounded bg-emerald-600 border" />
                <span>More Activity</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 flex justify-between text-xs text-gray-500 dark:text-slate-400">
            <span>Solve 1 problem daily to keep your flame active.</span>
            <Link href="/profile" className="text-indigo-600 hover:underline">
              View Detailed Profile &rarr;
            </Link>
          </div>
        </Card>
      </div>

      {/* Feature 6: Daily Practice Widget */}
      {dailyData && dailyData.questions.length > 0 && (
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-4 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  Daily Challenge
                </span>
                <span className="text-xs text-gray-500">
                  {dailyData.completedCount} of {dailyData.totalCount} completed
                </span>
              </div>
              <h3 className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                Today&apos;s 5 Recommended Practice Problems
              </h3>
            </div>
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {dailyData.percentage}% Completed Today
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {dailyData.questions.map((q) => (
              <div
                key={q.slug}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 rounded-lg border border-gray-100 p-3 hover:bg-gray-50/50 dark:border-slate-800 dark:hover:bg-slate-800/40"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      q.isSolved ? "bg-emerald-500" : "bg-gray-300 dark:bg-slate-700"
                    }`}
                  />
                  <div>
                    <Link
                      href={`/questions/${q.slug}`}
                      className="text-sm font-semibold text-gray-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
                    >
                      {q.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.2 text-[10px] font-semibold ${
                          difficultyBadgeColors[q.difficulty]
                        }`}
                      >
                        {q.difficulty}
                      </span>
                      {q.pattern && (
                        <span className="text-[11px] text-purple-600 font-medium">
                          {q.pattern}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  {q.leetcodeUrl && (
                    <a
                      href={q.leetcodeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-amber-600 hover:underline dark:text-amber-400"
                    >
                      LeetCode ↗
                    </a>
                  )}
                  <Link
                    href={`/questions/${q.slug}`}
                    className="rounded bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-indigo-700"
                  >
                    Solve &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Feature 3: Topic-wise Progress & Strength Analysis */}
      {data.topicProgress && data.topicProgress.length > 0 && (
        <Card className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-100 pb-4 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Topic-wise Progress & Strength Analysis
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Identify areas where you are well-prepared vs. algorithms needing additional practice.
              </p>
            </div>
            {data.strengthSummary.strongest && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Top Area: {data.strengthSummary.strongest}
              </span>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.topicProgress.slice(0, 9).map((t) => {
              let badge = "bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300";
              let label = "Needs Practice";
              if (t.strength === "strong") {
                badge = "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300";
                label = "Strong";
              } else if (t.strength === "moderate") {
                badge = "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300";
                label = "Moderate";
              }

              return (
                <div
                  key={t.topic}
                  className="rounded-lg border border-gray-100 p-3.5 space-y-2 dark:border-slate-800"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {t.topic}
                    </span>
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${badge}`}>
                      {label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
                    <span>
                      {t.solved} / {t.total} solved
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">{t.percentage}%</span>
                  </div>

                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        t.strength === "strong"
                          ? "bg-emerald-500"
                          : t.strength === "moderate"
                          ? "bg-amber-500"
                          : "bg-indigo-500"
                      }`}
                      style={{ width: `${t.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Feature 2: Company-wise Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">
              Company Preparation Tracks
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Preparation completeness across target hiring companies.
            </p>
          </div>
          <Link
            href="/companies"
            className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            All Companies &rarr;
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.companyProgress.map((company) => (
            <Card key={company.id} className="flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {company.logo ? (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50 p-1.5 border border-gray-100 dark:bg-slate-800 dark:border-slate-700">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={company.logo}
                          alt={`${company.name} logo`}
                          className="h-6 w-6 object-contain"
                        />
                      </div>
                    ) : (
                      <div className="h-9 w-9 shrink-0 flex items-center justify-center rounded-lg bg-indigo-50 font-bold text-xs text-indigo-700 border border-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300">
                        {company.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <h4 className="font-semibold text-gray-900 dark:text-slate-100 truncate">
                      {company.name}
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {company.percentage}%
                  </span>
                </div>

                <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">
                  {company.solved} solved • {company.remaining} remaining
                </p>

                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-500 dark:bg-indigo-500"
                    style={{ width: `${company.percentage}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-3 dark:border-slate-800 text-xs">
                <Link
                  href={`/companies/${company.slug}`}
                  className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  View Roadmap &rarr;
                </Link>
                <Link
                  href={`/questions?company=${encodeURIComponent(company.slug)}`}
                  className="text-gray-500 hover:text-gray-700 dark:text-slate-400"
                >
                  Practice Questions
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
