import { Suspense, use } from "react";
import type { Metadata } from "next";
import QuestionDetail from "@/components/questions/QuestionDetail";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const formattedTitle = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    title: `${formattedTitle} | Interview Question`,
  };
}

function QuestionDetailContainer({ params }: PageProps) {
  const { slug } = use(params);
  return <QuestionDetail slug={slug} />;
}

export default function QuestionDetailPage({ params }: PageProps) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Suspense
        fallback={
          <div className="py-24 text-center text-sm text-gray-500 dark:text-slate-400">
            Loading question...
          </div>
        }
      >
        <QuestionDetailContainer params={params} />
      </Suspense>
    </div>
  );
}
