import { Suspense } from "react";
import type { Metadata } from "next";
import SolvedList from "@/components/solved/SolvedList";

export const metadata: Metadata = {
  title: "Solved Questions",
};

export default function SolvedPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-slate-100">
          Solved Questions
        </h1>
        <p className="mt-3 text-base text-gray-600 dark:text-slate-300">
          Track and review the technical interview problems you have successfully completed.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="py-24 text-center text-sm text-gray-500 dark:text-slate-400">
            Loading solved questions...
          </div>
        }
      >
        <SolvedList />
      </Suspense>
    </div>
  );
}
