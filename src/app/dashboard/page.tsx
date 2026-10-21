import { Suspense } from "react";
import type { Metadata } from "next";
import DashboardView from "@/components/dashboard/DashboardView";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-slate-100">
          Preparation Dashboard
        </h1>
        <p className="mt-3 text-base text-gray-600 dark:text-slate-300">
          Monitor your interview preparation progress, track solved problems across topics, and view target company readiness.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="py-24 text-center text-sm text-gray-500 dark:text-slate-400">
            Loading preparation dashboard...
          </div>
        }
      >
        <DashboardView />
      </Suspense>
    </div>
  );
}
