import { Suspense } from "react";
import type { Metadata } from "next";
import RevisionList from "@/components/revision/RevisionList";

export const metadata: Metadata = {
  title: "Revision Queue",
  description: "Targeted problem review list for questions flagged during practice.",
};

export default function RevisionPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-slate-100">
          Revision Queue
        </h1>
        <p className="mt-3 text-base text-gray-600 dark:text-slate-300">
          Targeted problem review list. Questions you flagged during daily practice to revisit before your interviews.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="py-24 text-center text-sm text-gray-500 dark:text-slate-400">
            Loading revision queue...
          </div>
        }
      >
        <RevisionList />
      </Suspense>
    </div>
  );
}
