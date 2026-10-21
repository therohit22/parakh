import type { Metadata } from "next";
import CollectionsView from "@/components/collections/CollectionsView";

export const metadata: Metadata = {
  title: "Curated Interview Collections",
  description: "Curated problem sets targeting core DSA patterns and top hiring employer expectations.",
};

export default function CollectionsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-slate-100">
          Curated Interview Collections
        </h1>
        <p className="mt-3 text-base text-gray-600 dark:text-slate-300">
          Hand-picked problem clusters designed to build muscle memory across classic patterns and top tech interview loops.
        </p>
      </div>

      <CollectionsView />
    </div>
  );
}
