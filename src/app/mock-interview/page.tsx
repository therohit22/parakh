import type { Metadata } from "next";
import MockInterviewSession from "@/components/mock/MockInterviewSession";

export const metadata: Metadata = {
  title: "Mock Interview Mode",
  description: "Simulate a real 45-minute technical assessment round with 3 curated algorithmic problems.",
};

export default function MockInterviewPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-slate-100">
          Mock Interview Assessment
        </h1>
        <p className="mt-3 text-base text-gray-600 dark:text-slate-300">
          Practice under realistic interview time limits. Select a target hiring company or test your general DSA readiness in a 45-minute sprint.
        </p>
      </div>

      <MockInterviewSession />
    </div>
  );
}
