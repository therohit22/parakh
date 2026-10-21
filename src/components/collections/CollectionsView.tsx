"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";

interface CollectionItem {
  id: string;
  title: string;
  description: string;
  badge: string;
  difficulty: string;
  count: number;
  questions: {
    _id: string;
    title: string;
    slug: string;
    difficulty: "Easy" | "Medium" | "Hard";
    topics: string[];
    pattern?: string;
    companies?: { name: string; slug: string }[];
    leetcodeUrl?: string;
  }[];
}

const difficultyBadgeColors: Record<string, string> = {
  Easy: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
  Medium: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
  Hard: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800",
  Mixed: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800",
};

export default function CollectionsView() {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCollections() {
      try {
        setLoading(true);
        const res = await fetch("/api/collections");
        const data = await res.json();
        if (res.ok && data.success) {
          setCollections(data.collections || []);
        } else {
          setError(data.error || "Failed to load curated collections");
        }
      } catch {
        setError("Network error while loading collections.");
      } finally {
        setLoading(false);
      }
    }
    loadCollections();
  }, []);

  if (loading) {
    return (
      <div className="mt-8 space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse space-y-4 p-6">
            <div className="h-6 w-1/4 rounded bg-gray-200 dark:bg-slate-800" />
            <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-slate-800" />
            <div className="space-y-2">
              <div className="h-10 rounded bg-gray-100 dark:bg-slate-800/60" />
              <div className="h-10 rounded bg-gray-100 dark:bg-slate-800/60" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 rounded-lg bg-red-50 p-6 text-center text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-8">
      {collections.map((col) => (
        <Card key={col.id} className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-100 pb-4 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {col.badge}
                </span>
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${
                    difficultyBadgeColors[col.difficulty] || difficultyBadgeColors.Mixed
                  }`}
                >
                  {col.difficulty}
                </span>
              </div>
              <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                {col.title}
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-slate-300">
                {col.description}
              </p>
            </div>

            <span className="text-xs font-medium text-gray-500 dark:text-slate-400">
              {col.count} Questions
            </span>
          </div>

          <div className="space-y-3">
            {col.questions.map((q) => (
              <div
                key={q.slug}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50/50 p-3 hover:bg-gray-50 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:bg-slate-800/40"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.2 text-[11px] font-medium ${
                        difficultyBadgeColors[q.difficulty]
                      }`}
                    >
                      {q.difficulty}
                    </span>
                    {q.pattern && (
                      <span className="rounded bg-purple-50 px-1.5 py-0.2 text-[10px] font-medium text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
                        {q.pattern}
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/questions/${q.slug}`}
                    className="mt-1 text-sm font-semibold text-gray-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400 block"
                  >
                    {q.title}
                  </Link>
                </div>

                <div className="flex items-center gap-3">
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
                    Practice
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
