"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/Card";

interface PopulatedCompany {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
}

interface QuestionItem {
  _id?: string;
  title: string;
  slug: string;
  description?: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topics: string[];
  companies?: PopulatedCompany[];
  leetcodeUrl?: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const difficultyBadgeColors: Record<QuestionItem["difficulty"], string> = {
  Easy: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
  Medium: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
  Hard: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800",
};

interface QuestionListProps {
  fixedCompany?: string;
  companyName?: string;
}

export default function QuestionList({ fixedCompany, companyName }: QuestionListProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [userBookmarks, setUserBookmarks] = useState<string[]>([]);
  const [userSolved, setUserSolved] = useState<string[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // URL-driven active filters as single source of truth
  const activeSearch = searchParams.get("search") || "";
  const difficulty = searchParams.get("difficulty") || "";
  const activeTopic = searchParams.get("topic") || "";
  const activeCompany = fixedCompany || searchParams.get("company") || "";
  const sort = searchParams.get("sort") || "latest";
  const page = Number(searchParams.get("page")) || 1;

  // Form input states
  const [searchInput, setSearchInput] = useState(activeSearch);
  const [prevSearch, setPrevSearch] = useState(activeSearch);
  if (prevSearch !== activeSearch) {
    setPrevSearch(activeSearch);
    setSearchInput(activeSearch);
  }

  const [topicInput, setTopicInput] = useState(activeTopic);
  const [prevTopic, setPrevTopic] = useState(activeTopic);
  if (prevTopic !== activeTopic) {
    setPrevTopic(activeTopic);
    setTopicInput(activeTopic);
  }

  const currentCompanyParam = fixedCompany || searchParams.get("company") || "";
  const [companyInput, setCompanyInput] = useState(currentCompanyParam);
  const [prevCompany, setPrevCompany] = useState(currentCompanyParam);
  if (prevCompany !== currentCompanyParam) {
    setPrevCompany(currentCompanyParam);
    setCompanyInput(currentCompanyParam);
  }

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper to push URL changes while preserving existing query params
  const updateQuery = (updater: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    updater(params);
    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    let isMounted = true;

    async function loadQuestions() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (activeSearch.trim()) params.set("search", activeSearch.trim());
        if (difficulty) params.set("difficulty", difficulty);
        if (activeTopic.trim()) params.set("topic", activeTopic.trim());
        if (activeCompany.trim()) params.set("company", activeCompany.trim());
        if (sort) params.set("sort", sort);
        params.set("page", String(page));
        params.set("limit", "10");

        const res = await fetch(`/api/questions?${params.toString()}`);
        const json = await res.json();

        if (isMounted) {
          if (json.success && Array.isArray(json.data)) {
            setQuestions(json.data);
            if (json.pagination) {
              setPagination(json.pagination);
            }
          } else {
            setError(json.error || "Failed to load questions");
          }
        }
      } catch {
        if (isMounted) {
          setError("Failed to load questions");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadQuestions();

    return () => {
      isMounted = false;
    };
  }, [activeSearch, difficulty, activeTopic, activeCompany, sort, page]);

  useEffect(() => {
    let isMounted = true;

    async function loadUserStatus() {
      try {
        const res = await fetch("/api/auth/me");
        if (!isMounted) return;
        if (res.ok) {
          const json = await res.json();
          if (json.ok && json.user) {
            setUserBookmarks(json.user.bookmarkedQuestions || []);
            setUserSolved(json.user.solvedQuestions || []);
          }
        }
      } catch {
        // Silently catch - user simply considered unauthenticated in list view
      }
    }

    loadUserStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateQuery((params) => {
      if (searchInput.trim()) {
        params.set("search", searchInput.trim());
      } else {
        params.delete("search");
      }

      if (topicInput.trim()) {
        params.set("topic", topicInput.trim());
      } else {
        params.delete("topic");
      }

      if (!fixedCompany) {
        if (companyInput.trim()) {
          params.set("company", companyInput.trim());
        } else {
          params.delete("company");
        }
      }

      params.set("page", "1");
    });
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setTopicInput("");
    if (!fixedCompany) {
      setCompanyInput("");
    }
    router.push(pathname);
  };

  const hasActiveFilters = Boolean(
    activeSearch ||
      difficulty ||
      activeTopic ||
      (!fixedCompany && activeCompany) ||
      sort !== "latest"
  );

  return (
    <div className="mt-8 space-y-6">
      {/* Search and Filters Bar */}
      <form
        onSubmit={handleFilterSubmit}
        className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-4 dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Keyword Search */}
          <div className="sm:col-span-2">
            <label
              htmlFor="question-search"
              className="block text-xs font-medium text-gray-700 mb-1 dark:text-slate-300"
            >
              Keyword Search
            </label>
            <input
              id="question-search"
              type="text"
              placeholder="Search by title or description..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
            />
          </div>

          {/* Difficulty Filter */}
          <div>
            <label
              htmlFor="difficulty-filter"
              className="block text-xs font-medium text-gray-700 mb-1 dark:text-slate-300"
            >
              Difficulty
            </label>
            <select
              id="difficulty-filter"
              value={difficulty}
              onChange={(e) => {
                updateQuery((params) => {
                  if (e.target.value) {
                    params.set("difficulty", e.target.value);
                  } else {
                    params.delete("difficulty");
                  }
                  params.set("page", "1");
                });
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label
              htmlFor="sort-order"
              className="block text-xs font-medium text-gray-700 mb-1 dark:text-slate-300"
            >
              Sort By
            </label>
            <select
              id="sort-order"
              value={sort}
              onChange={(e) => {
                updateQuery((params) => {
                  if (e.target.value !== "latest") {
                    params.set("sort", e.target.value);
                  } else {
                    params.delete("sort");
                  }
                  params.set("page", "1");
                });
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="latest">Latest</option>
              <option value="oldest">Oldest</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Second Row: Topic, Company, and Action Buttons */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-end">
          <div>
            <label
              htmlFor="topic-filter"
              className="block text-xs font-medium text-gray-700 mb-1 dark:text-slate-300"
            >
              Topic Tag
            </label>
            <input
              id="topic-filter"
              type="text"
              placeholder="e.g. Arrays, Trees..."
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
            />
          </div>

          {fixedCompany ? (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 dark:text-slate-300">
                Company
              </label>
              <div className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/80 px-3 py-2 text-sm font-semibold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">
                <span className="h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                <span>{companyName || fixedCompany}</span>
              </div>
            </div>
          ) : (
            <div>
              <label
                htmlFor="company-filter"
                className="block text-xs font-medium text-gray-700 mb-1 dark:text-slate-300"
              >
                Company Slug
              </label>
              <input
                id="company-filter"
                type="text"
                placeholder="e.g. google, amazon..."
                value={companyInput}
                onChange={(e) => setCompanyInput(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
              />
            </div>
          )}

          <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-2">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
            >
              Apply Filters
            </button>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Results Count & Status */}
      {!loading && !error && (
        <div className="flex items-center justify-between text-xs text-gray-500 px-1 dark:text-slate-400">
          <span>
            {pagination.total === 1
              ? "1 question found"
              : `${pagination.total} questions found`}
            {hasActiveFilters && " (filtered)"}
          </span>
          {pagination.totalPages > 1 && (
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
          )}
        </div>
      )}

      {/* Main Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-4 w-16 rounded bg-gray-200 dark:bg-slate-800" />
                <div className="h-4 w-20 rounded bg-gray-200 dark:bg-slate-800" />
              </div>
              <div className="h-5 w-2/5 rounded bg-gray-200 dark:bg-slate-800" />
              <div className="h-3 w-4/5 rounded bg-gray-200 dark:bg-slate-800" />
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      ) : questions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center dark:border-slate-800">
          <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100">
            No questions found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            {hasActiveFilters
              ? "No questions match your current search and filter criteria. Try adjusting your filters."
              : fixedCompany
              ? `No interview questions found for ${companyName || fixedCompany} yet.`
              : "Questions will appear here once added by an administrator."}
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="mt-4 inline-flex items-center rounded-md border border-gray-300 bg-white px-3.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Clear All Filters
            </button>
          )}
          {!hasActiveFilters && fixedCompany && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <Link
                href="/companies"
                className="inline-flex items-center rounded-md bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 focus:outline-none"
              >
                &larr; Explore Other Companies
              </Link>
              <Link
                href="/questions"
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                Browse All Questions
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => {
            const isBookmarked = Boolean(
              question._id && userBookmarks.includes(question._id)
            );
            const isSolved = Boolean(
              question._id && userSolved.includes(question._id)
            );

            return (
              <Card
                key={question._id || question.slug}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition hover:border-gray-300 dark:hover:border-slate-700"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {question.topics.map((topic) => (
                      <span
                        key={topic}
                        className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-slate-800 dark:text-slate-300"
                      >
                        {topic}
                      </span>
                    ))}
                    {question.companies && question.companies.length > 0 && (
                      <span className="text-xs text-gray-500 dark:text-slate-400">
                        • {question.companies.map((c) => c.name).join(", ")}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100">
                    <Link
                      href={`/questions/${question.slug}`}
                      className="hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      {question.title}
                    </Link>
                  </h3>
                  {question.description && (
                    <p className="line-clamp-2 text-sm text-gray-600 dark:text-slate-300">
                      {question.description}
                    </p>
                  )}
                  {question.leetcodeUrl && (
                    <a
                      href={question.leetcodeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Practice ${question.title} on LeetCode (opens in a new tab)`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 hover:underline dark:text-amber-400 dark:hover:text-amber-300"
                    >
                      <span>LeetCode</span>
                      <span aria-hidden="true">&rarr;</span>
                    </a>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-center">
                  {isSolved && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Solved
                    </span>
                  )}
                  {isBookmarked && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 fill-current"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                      </svg>
                      Bookmarked
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                      difficultyBadgeColors[question.difficulty]
                    }`}
                  >
                    {question.difficulty}
                  </span>
                  <Link
                    href={`/questions/${question.slug}`}
                    aria-label={`View question details for ${question.title}`}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    View &rarr;
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && !error && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-slate-800">
          <button
            type="button"
            disabled={pagination.page <= 1}
            onClick={() => {
              updateQuery((params) => {
                const prev = Math.max(1, pagination.page - 1);
                params.set("page", String(prev));
              });
            }}
            className="rounded-md border border-gray-300 bg-white px-3.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            &larr; Previous
          </button>
          <span className="text-xs text-gray-600 dark:text-slate-400">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            type="button"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => {
              updateQuery((params) => {
                const next = pagination.page + 1;
                params.set("page", String(next));
              });
            }}
            className="rounded-md border border-gray-300 bg-white px-3.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Next &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
