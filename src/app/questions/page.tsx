import { Suspense } from "react";
import type { Metadata } from "next";
import QuestionList from "@/components/questions/QuestionList";

export const metadata: Metadata = {
  title: "Interview Questions",
};

export default function QuestionsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-slate-100">
          Interview Questions
        </h1>
        <p className="mt-3 text-base text-gray-600 dark:text-slate-300">
          Browse and practice technical interview problems categorized by company, topic, and difficulty.
        </p>
      </div>

      <Suspense fallback={<div className="mt-8 py-12 text-center text-sm text-gray-500 dark:text-slate-400">Loading questions...</div>}>
        <QuestionList />
      </Suspense>
    </div>
  );
}
