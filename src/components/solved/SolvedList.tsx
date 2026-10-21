"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

interface PopulatedCompany {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
}

interface QuestionItem {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topics: string[];
  companies?: PopulatedCompany[];
  leetcodeUrl?: string;
}

const difficultyBadgeColors: Record<QuestionItem["difficulty"], string> = {
  Easy: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
  Medium: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
  Hard: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800",
};

export default function SolvedList() {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUnauthenticated, setIsUnauthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingSlug, setUpdatingSlug] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchSolved() {
      try {
        setLoading(true);
        const res = await fetch("/api/questions/solved");
        const data = await res.json();

        if (!isMounted) return;

        if (res.status === 401) {
          setIsUnauthenticated(true);
          setLoading(false);
          return;
        }

        if (!res.ok || !data.success) {
          setError(data.error || "Failed to load solved questions");
        } else {
          setQuestions(data.questions || []);
        }
      } catch {
        if (isMounted) {
          setError("Network error while loading solved questions.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchSolved();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleMarkUnsolved = async (slug: string) => {
    setUpdatingSlug(slug);
    try {
      const res = await fetch(`/api/questions/${encodeURIComponent(slug)}/solved`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setQuestions((prev) => prev.filter((q) => q.slug !== slug));
      }
    } catch {
      // Silently handle
    } finally {
      setUpdatingSlug(null);
    }
  };

  if (loading) {
    return (
      <div className="mt-8 space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse space-y-3">
            <div className="flex gap-2">
              <div className="h-4 w-16 rounded bg-gray-200 dark:bg-slate-800" />
              <div className="h-4 w-24 rounded bg-gray-200 dark:bg-slate-800" />
            </div>
            <div className="h-5 w-1/3 rounded bg-gray-200 dark:bg-slate-800" />
            <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-slate-800" />
          </Card>
        ))}
      </div>
    );
  }

  if (isUnauthenticated) {
    return (
      <div className="mt-8">
        <EmptyState
          title="Sign in to view your solved questions"
          description="Track your solved interview questions across companies and topics to measure preparation readiness."
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
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

  if (error) {
    return (
      <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="mt-8">
        <EmptyState
          title="No solved questions yet."
          description="Mark questions as solved as you complete them to track your progress and see what you have mastered."
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          action={
            <Button href="/questions" variant="secondary">
              Start Practice
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400 px-1">
        <span>
          {questions.length === 1
            ? "1 solved question"
            : `${questions.length} solved questions`}
        </span>
      </div>

      <div className="space-y-4">
        {questions.map((question) => (
          <Card
            key={question._id || question.slug}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {question.topics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {topic}
                  </span>
                ))}
                {question.companies && question.companies.length > 0 && (
                  <span className="text-xs text-gray-500 dark:text-slate-400">
                    • {question.companies.map((c) => c.name).join(", ")}
                  </span>
                )}
              </div>

              <h3 className="mt-2 text-base font-semibold text-gray-900 dark:text-slate-100">
                <Link
                  href={`/questions/${question.slug}`}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  {question.title}
                </Link>
              </h3>

              {question.description && (
                <p className="mt-1 text-sm text-gray-600 line-clamp-2 dark:text-slate-300">
                  {question.description}
                </p>
              )}

              {question.leetcodeUrl && (
                <div className="mt-1.5">
                  <a
                    href={question.leetcodeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Practice ${question.title} on LeetCode (opens in a new tab)`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 hover:underline dark:text-amber-400 dark:hover:text-amber-300"
                  >
                    <span>LeetCode</span>
                    <span aria-hidden="true">&rarr;</span>
                  </a>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-center">
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                  difficultyBadgeColors[question.difficulty]
                }`}
              >
                {question.difficulty}
              </span>

              <button
                type="button"
                onClick={() => handleMarkUnsolved(question.slug)}
                disabled={updatingSlug === question.slug}
                aria-label={`Mark ${question.title} as unsolved`}
                className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-amber-600 hover:bg-amber-50 hover:border-amber-300 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-amber-400 dark:hover:bg-amber-950/40 disabled:opacity-50"
              >
                {updatingSlug === question.slug ? "Updating..." : "Mark Unsolved"}
              </button>

              <Link
                href={`/questions/${question.slug}`}
                className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700 focus:outline-none"
              >
                Review &rarr;
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
