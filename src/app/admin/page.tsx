"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminNav from "@/components/admin/AdminNav";
import Button from "@/components/ui/Button";

interface AdminStats {
  totalCompanies: number;
  totalQuestions: number;
  totalUsers: number;
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/admin/stats");
        const json = await res.json();

        if (!isMounted) return;

        if (res.ok && json.success && json.data) {
          setStats(json.data);
        } else {
          setError(json.error || "Failed to load admin statistics.");
        }
      } catch {
        if (isMounted) {
          setError("Network error loading admin stats.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AdminGuard>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <AdminNav
          title="Admin Overview"
          description="Manage platform questions, company profiles, and view real-time system counts."
        />

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <section aria-labelledby="stats-heading" className="mb-10">
          <h2 id="stats-heading" className="sr-only">
            Platform Statistics
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {/* Total Companies */}
            <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
              <dt className="truncate text-sm font-medium text-gray-500 dark:text-slate-400">
                Total Companies
              </dt>
              <dd className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-slate-100">
                {loading ? "..." : stats?.totalCompanies ?? 0}
              </dd>
              <div className="mt-4">
                <Link
                  href="/admin/companies"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                >
                  Manage companies &rarr;
                </Link>
              </div>
            </div>

            {/* Total Questions */}
            <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
              <dt className="truncate text-sm font-medium text-gray-500 dark:text-slate-400">
                Total Questions
              </dt>
              <dd className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-slate-100">
                {loading ? "..." : stats?.totalQuestions ?? 0}
              </dd>
              <div className="mt-4">
                <Link
                  href="/admin/questions"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                >
                  Manage questions &rarr;
                </Link>
              </div>
            </div>

            {/* Total Users */}
            <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
              <dt className="truncate text-sm font-medium text-gray-500 dark:text-slate-400">
                Total Registered Users
              </dt>
              <dd className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-slate-100">
                {loading ? "..." : stats?.totalUsers ?? 0}
              </dd>
              <div className="mt-4">
                <span className="text-xs text-gray-400 dark:text-slate-500">
                  Read-only platform metric
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions / Shortcuts */}
        <section aria-labelledby="quick-actions-heading">
          <h2
            id="quick-actions-heading"
            className="text-lg font-semibold text-gray-900 dark:text-slate-100"
          >
            Management Sections
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100">
                  Company Directory
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                  Create new hiring companies, update logos, descriptions, official websites, and view company slugs.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <Button href="/admin/companies" variant="primary">
                  Open Company Manager
                </Button>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100">
                  Question Repository
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                  Add interview questions, assign difficulty levels, categorize topics, attach company tags, and link LeetCode practice URLs.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <Button href="/admin/questions" variant="primary">
                  Open Question Manager
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </AdminGuard>
  );
}
