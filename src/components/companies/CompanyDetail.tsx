"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import QuestionList from "@/components/questions/QuestionList";

interface CompanyData {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  website?: string;
  questionCount?: number;
}

interface RoadmapQuestion {
  _id: string;
  title: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topics: string[];
  pattern?: string | null;
  leetcodeUrl?: string | null;
  isSolved: boolean;
}

interface RoadmapStage {
  stage: number;
  title: string;
  description: string;
  topics: string[];
  total: number;
  solved: number;
  percentage: number;
  questions: RoadmapQuestion[];
}

interface RoadmapData {
  company: {
    name: string;
    slug: string;
    logo?: string | null;
  };
  totalQuestions: number;
  solvedQuestions: number;
  percentage: number;
  stages: RoadmapStage[];
}

interface CompanyDetailProps {
  slug: string;
}

export default function CompanyDetail({ slug }: CompanyDetailProps) {
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"roadmap" | "all">("roadmap");
  const [expandedStage, setExpandedStage] = useState<number | null>(1);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [compRes, roadRes] = await Promise.all([
          fetch(`/api/companies/${encodeURIComponent(slug)}`),
          fetch(`/api/companies/${encodeURIComponent(slug)}/roadmap`),
        ]);

        const compJson = await compRes.json();
        const roadJson = await roadRes.json();

        if (isMounted) {
          if (compJson.success && compJson.data) {
            setCompany(compJson.data);
          } else {
            setError(compJson.error || "Company not found");
          }

          if (roadJson.success && roadJson.stages) {
            setRoadmap(roadJson);
          }
        }
      } catch {
        if (isMounted) {
          setError("Failed to load company details");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="py-24 text-center text-sm text-gray-500 dark:text-slate-400">
        Loading company details and preparation roadmap...
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="py-16 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-slate-100">
          {error || "Company Not Found"}
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
          The requested company &ldquo;{slug}&rdquo; does not exist or has been removed.
        </p>
        <Link
          href="/companies"
          className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          &larr; Back to Companies
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
        <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">
          Home
        </Link>
        <span>/</span>
        <Link href="/companies" className="hover:text-indigo-600 dark:hover:text-indigo-400">
          Companies
        </Link>
        <span>/</span>
        <span className="font-medium text-gray-900 dark:text-slate-200">
          {company.name}
        </span>
      </nav>

      {/* Company Header Card */}
      <div className="rounded-2xl border border-gray-200 bg-gradient-to-b from-gray-50/50 to-white p-6 sm:p-8 dark:border-slate-800 dark:from-slate-900/60 dark:to-slate-950">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            {company.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={company.logo}
                alt={`${company.name} logo`}
                className="h-16 w-16 shrink-0 rounded-xl object-contain bg-white p-2 border border-gray-200 shadow-sm dark:bg-slate-900 dark:border-slate-700"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const next = e.currentTarget.nextElementSibling as HTMLElement | null;
                  if (next) next.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className={`h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-indigo-50 font-bold text-2xl text-indigo-700 border border-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-900/60 ${
                company.logo ? "hidden" : "flex"
              }`}
            >
              {company.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl dark:text-slate-100">
                  {company.name}
                </h1>
                <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">
                  Interview Track
                </span>
                {typeof company.questionCount === "number" && (
                  <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-gray-700 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {company.questionCount} {company.questionCount === 1 ? "Question" : "Questions"}
                  </span>
                )}
              </div>

              {company.description && (
                <p className="mt-2 text-sm leading-relaxed text-gray-600 max-w-2xl dark:text-slate-300">
                  {company.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/mock-interview?company=${company.slug}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-indigo-700"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Start Mock Interview
            </Link>

            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <span>Official Careers</span>
                <span aria-hidden="true">&rarr;</span>
              </a>
            )}
          </div>
        </div>

        {/* Company Progress Bar if authenticated & has roadmap */}
        {roadmap && roadmap.totalQuestions > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-medium mb-1.5 text-gray-600 dark:text-slate-400">
              <span>Your Parakh Track Progress</span>
              <span className="font-bold text-gray-900 dark:text-slate-200">
                {roadmap.solvedQuestions} / {roadmap.totalQuestions} solved ({roadmap.percentage}%)
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${roadmap.percentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Tabs: Roadmap vs All Questions */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("roadmap")}
          className={`pb-3 px-3 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === "roadmap"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          Parakh Preparation Roadmap
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`pb-3 px-3 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === "all"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          All Questions ({company.questionCount ?? 0})
        </button>
      </div>

      {/* Tab 1: Parakh Preparation Roadmap */}
      {activeTab === "roadmap" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 text-xs text-indigo-900 dark:border-indigo-950/60 dark:bg-indigo-950/20 dark:text-indigo-300">
            <span className="font-semibold">Preparation Roadmap Guide:</span> This 3-stage sequence organizes verified {company.name} questions from foundational patterns to advanced data structures. Roadmap progress reflects your real solved questions.
            <span className="block mt-1 text-indigo-700 dark:text-indigo-400 italic">
              * Note: This is an analytical Parakh preparation roadmap based on topic frequencies, not an official company hiring syllabus.
            </span>
          </div>

          {roadmap && roadmap.stages.length > 0 ? (
            <div className="space-y-4">
              {roadmap.stages.map((stg) => {
                const isExpanded = expandedStage === stg.stage;
                return (
                  <div
                    key={stg.stage}
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900/90"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300">
                            {stg.stage}
                          </span>
                          <h3 className="text-base font-bold text-gray-900 dark:text-slate-100">
                            {stg.title}
                          </h3>
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-2xs font-semibold text-gray-600 dark:bg-slate-800 dark:text-slate-400">
                            {stg.solved} / {stg.total} Solved ({stg.percentage}%)
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                          {stg.description}
                        </p>
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {stg.topics.map((t) => (
                            <span
                              key={t}
                              className="rounded-md bg-gray-100 px-2 py-0.5 text-2xs text-gray-600 dark:bg-slate-800 dark:text-slate-300"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="w-24 hidden sm:block">
                          <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all"
                              style={{ width: `${stg.percentage}%` }}
                            />
                          </div>
                        </div>

                        <button
                          onClick={() => setExpandedStage(isExpanded ? null : stg.stage)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          <span>{isExpanded ? "Hide Questions" : `View ${stg.total} Questions`}</span>
                          <svg
                            className={`w-4 h-4 transform transition-transform ${isExpanded ? "rotate-180" : ""}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-5 pt-4 border-t border-gray-100 dark:border-slate-800/80 space-y-2">
                        {stg.questions.length === 0 ? (
                          <p className="text-xs text-gray-400 py-2 italic">
                            No questions cataloged for this stage yet.
                          </p>
                        ) : (
                          stg.questions.map((q) => (
                            <div
                              key={q._id}
                              className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 p-3 hover:bg-gray-100/60 dark:border-slate-800/60 dark:bg-slate-950/40 dark:hover:bg-slate-800/40"
                            >
                              <div className="flex items-center gap-3">
                                {q.isSolved ? (
                                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </span>
                                ) : (
                                  <span className="h-2 w-2 rounded-full bg-gray-300 dark:bg-slate-700 mx-1.5" />
                                )}
                                <div>
                                  <Link
                                    href={`/questions/${q.slug}`}
                                    className="text-xs font-semibold text-gray-900 hover:text-indigo-600 dark:text-slate-200 dark:hover:text-indigo-400"
                                  >
                                    {q.title}
                                  </Link>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span
                                      className={`text-2xs font-semibold ${
                                        q.difficulty === "Easy"
                                          ? "text-emerald-600 dark:text-emerald-400"
                                          : q.difficulty === "Medium"
                                          ? "text-amber-600 dark:text-amber-400"
                                          : "text-rose-600 dark:text-rose-400"
                                      }`}
                                    >
                                      {q.difficulty}
                                    </span>
                                    {q.pattern && (
                                      <span className="text-2xs text-indigo-600 dark:text-indigo-400 font-mono">
                                        • {q.pattern}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {q.leetcodeUrl && (
                                  <a
                                    href={q.leetcodeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-2xs text-gray-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 font-medium"
                                  >
                                    LeetCode &rarr;
                                  </a>
                                )}
                                <Link
                                  href={`/questions/${q.slug}`}
                                  className="rounded-md bg-white px-2.5 py-1 text-2xs font-medium text-gray-700 shadow-xs border border-gray-200 hover:bg-gray-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
                                >
                                  Open
                                </Link>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 p-8 text-center text-xs text-gray-500 dark:border-slate-800 dark:text-slate-400">
              No questions found for roadmap generation.
            </div>
          )}
        </div>
      )}

      {/* Tab 2: All Questions with Full Filters */}
      {activeTab === "all" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl dark:text-slate-100">
                {company.name} Interview Questions
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                Practice verified coding questions commonly asked in technical interviews at {company.name}.
              </p>
            </div>
          </div>

          <QuestionList fixedCompany={company.slug} companyName={company.name} />
        </div>
      )}
    </div>
  );
}
