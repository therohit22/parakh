import { Suspense, use } from "react";
import type { Metadata } from "next";
import CompanyDetail from "@/components/companies/CompanyDetail";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const formattedName = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    title: `${formattedName} Interview Questions | Parakh`,
    description: `Practice verified technical interview questions for ${formattedName} with difficulty ratings, topic tags, and LeetCode links on Parakh.`,
  };
}

function CompanyDetailContainer({ params }: PageProps) {
  const { slug } = use(params);
  return <CompanyDetail slug={slug} />;
}

export default function CompanyDetailPage({ params }: PageProps) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Suspense
        fallback={
          <div className="py-24 text-center text-sm text-gray-500 dark:text-slate-400">
            Loading company questions...
          </div>
        }
      >
        <CompanyDetailContainer params={params} />
      </Suspense>
    </div>
  );
}
