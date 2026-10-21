"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface MockQuestion {
  _id: string;
  title: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topics: string[];
  pattern?: string;
  leetcodeUrl?: string;
  isSolved: boolean;
}

const difficultyBadgeColors: Record<MockQuestion["difficulty"], string> = {
  Easy: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
  Medium: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
  Hard: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800",
};

const TARGET_COMPANIES = [
  { name: "General DSA", slug: "" },
  { name: "Amazon", slug: "amazon" },
  { name: "Google", slug: "google" },
  { name: "Microsoft", slug: "microsoft" },
  { name: "Flipkart", slug: "flipkart" },
  { name: "Deloitte", slug: "deloitte" },
  { name: "Infosys", slug: "infosys" },
  { name: "Zomato", slug: "zomato" },
];

export default function MockInterviewSession() {
  const [selectedCompany, setSelectedCompany] = useState("");
  const [sessionActive, setSessionActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<MockQuestion[]>([]);
  const [completedSlugs, setCompletedSlugs] = useState<Set<string>>(new Set());
  const [secondsRemaining, setSecondsRemaining] = useState(45 * 60);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Timer countdown
  useEffect(() => {
    if (!sessionActive || sessionFinished) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setSessionFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionActive, sessionFinished]);

  const handleStartSession = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = selectedCompany
        ? `/api/mock-interview?company=${encodeURIComponent(selectedCompany)}`
        : "/api/mock-interview";
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to start mock session");
        return;
      }

      setQuestions(data.questions || []);
      setCompletedSlugs(
        new Set(
          (data.questions || [])
            .filter((q: MockQuestion) => q.isSolved)
            .map((q: MockQuestion) => q.slug)
        )
      );
      setSecondsRemaining(45 * 60);
      setSessionActive(true);
      setSessionFinished(false);
    } catch {
      setError("Network error while starting mock interview.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (slug: string) => {
    const isNowCompleted = !completedSlugs.has(slug);
    setCompletedSlugs((prev) => {
      const next = new Set(prev);
      if (isNowCompleted) next.add(slug);
      else next.delete(slug);
      return next;
    });

    // Sync to user's real solved state in background
    try {
      await fetch(`/api/questions/${encodeURIComponent(slug)}/solved`, {
        method: isNowCompleted ? "POST" : "DELETE",
      });
    } catch {
      // Ignore background sync errors
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (!sessionActive && !sessionFinished) {
    return (
      <div className="mt-8 max-w-xl mx-auto space-y-6">
        <Card className="p-8 text-center space-y-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Setup Your Mock Session
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">
              Simulate a standard 45-minute technical assessment round with 3 algorithmic problems (1 Easy, 1 Medium, 1 Medium/Hard).
            </p>
          </div>

          <div className="text-left space-y-2">
            <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
              Target Company Track (Optional)
            </label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              {TARGET_COMPANIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400">
              {error}
            </div>
          )}

          <Button
            onClick={handleStartSession}
            disabled={loading}
            className="w-full justify-center"
          >
            {loading ? "Preparing Interview..." : "Start 45-Minute Assessment"}
          </Button>
        </Card>
      </div>
    );
  }

  if (sessionFinished) {
    const completedCount = completedSlugs.size;
    const totalCount = questions.length;
    const allTopics = [
      ...new Set(questions.flatMap((q) => q.topics || [])),
    ];

    return (
      <div className="mt-8 max-w-2xl mx-auto space-y-6">
        <Card className="p-8 text-center space-y-6">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Mock Interview Complete!
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">
              Here is your performance summary for this assessment session.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400">Problems Completed</p>
              <p className="mt-1 text-2xl font-extrabold text-gray-900 dark:text-white">
                {completedCount} / {totalCount}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400">Topics Evaluated</p>
              <p className="mt-1 text-base font-semibold text-gray-700 dark:text-slate-200">
                {allTopics.slice(0, 3).join(", ") || "General DSA"}
              </p>
            </div>
          </div>

          <div className="space-y-3 text-left">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Questions in this Round:
            </h3>
            {questions.map((q) => (
              <div
                key={q.slug}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-slate-800"
              >
                <div>
                  <Link
                    href={`/questions/${q.slug}`}
                    className="text-sm font-medium text-gray-900 hover:underline dark:text-white"
                  >
                    {q.title}
                  </Link>
                  <span className="ml-2 text-xs text-gray-500">
                    ({q.difficulty})
                  </span>
                </div>
                <span
                  className={`text-xs font-semibold ${
                    completedSlugs.has(q.slug)
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-gray-400"
                  }`}
                >
                  {completedSlugs.has(q.slug) ? "Completed" : "Incomplete"}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-3 pt-4">
            <Button
              onClick={() => {
                setSessionActive(false);
                setSessionFinished(false);
              }}
              variant="primary"
            >
              Start Another Round
            </Button>
            <Button href="/dashboard" variant="secondary">
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Active Session View
  return (
    <div className="mt-6 space-y-6">
      {/* Header with Sticky Timer */}
      <div className="sticky top-16 z-30 flex items-center justify-between rounded-xl border border-gray-200 bg-white/95 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Active Mock Assessment
          </span>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {selectedCompany
              ? `${selectedCompany.toUpperCase()} Simulation`
              : "General DSA Round"}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 font-mono text-base font-bold text-gray-900 dark:bg-slate-800 dark:text-white">
            <svg
              className="h-4 w-4 text-indigo-600 dark:text-indigo-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{formatTime(secondsRemaining)}</span>
          </div>

          <Button
            onClick={() => setSessionFinished(true)}
            variant="secondary"
            className="text-xs"
          >
            End Interview
          </Button>
        </div>
      </div>

      {/* Question Cards */}
      <div className="space-y-4">
        {questions.map((question, index) => {
          const isDone = completedSlugs.has(question.slug);

          return (
            <Card
              key={question.slug}
              className={`p-6 transition-all ${
                isDone
                  ? "border-emerald-200 bg-emerald-50/30 dark:border-emerald-900/40 dark:bg-emerald-950/10"
                  : ""
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      Problem {index + 1}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        difficultyBadgeColors[question.difficulty]
                      }`}
                    >
                      {question.difficulty}
                    </span>
                    {question.pattern && (
                      <span className="rounded bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800">
                        {question.pattern}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-2 text-base font-bold text-gray-900 dark:text-white">
                    <Link
                      href={`/questions/${question.slug}`}
                      target="_blank"
                      className="hover:underline"
                    >
                      {question.title} ↗
                    </Link>
                  </h3>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {question.topics.map((t) => (
                      <span
                        key={t}
                        className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-slate-800 dark:text-slate-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {question.leetcodeUrl && (
                    <a
                      href={question.leetcodeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-100 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300"
                    >
                      Code on LeetCode ↗
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => handleToggleComplete(question.slug)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      isDone
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    }`}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                    <span>{isDone ? "Completed" : "Mark Solved"}</span>
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
