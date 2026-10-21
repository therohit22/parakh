"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";

interface CompanyItem {
  _id?: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  website?: string;
  questionCount?: number;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function CompanyList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const activeSearch = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "name";
  const page = Number(searchParams.get("page")) || 1;

  const [searchInput, setSearchInput] = useState(activeSearch);
  const [prevSearch, setPrevSearch] = useState(activeSearch);
  if (prevSearch !== activeSearch) {
    setPrevSearch(activeSearch);
    setSearchInput(activeSearch);
  }

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateQuery = (updater: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    updater(params);
    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    let isMounted = true;

    async function loadCompanies() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (activeSearch.trim()) params.set("search", activeSearch.trim());
        if (sort) params.set("sort", sort);
        params.set("page", String(page));
        params.set("limit", "10");

        const res = await fetch(`/api/companies?${params.toString()}`);
        const json = await res.json();

        if (isMounted) {
          if (json.success && Array.isArray(json.data)) {
            setCompanies(json.data);
            if (json.pagination) {
              setPagination(json.pagination);
            }
          } else {
            setError(json.error || "Failed to load companies");
          }
        }
      } catch {
        if (isMounted) {
          setError("Failed to load companies");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadCompanies();

    return () => {
      isMounted = false;
    };
  }, [activeSearch, sort, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateQuery((params) => {
      if (searchInput.trim()) {
        params.set("search", searchInput.trim());
      } else {
        params.delete("search");
      }
      params.set("page", "1");
    });
  };

  const handleClearFilters = () => {
    setSearchInput("");
    router.push(pathname);
  };

  return (
    <div className="mt-8 space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-1 items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              aria-label="Search companies by name or description"
              placeholder="Search companies by name or description..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-3">
          <label htmlFor="company-sort" className="text-xs font-medium text-gray-500 dark:text-slate-400">
            Sort:
          </label>
          <select
            id="company-sort"
            value={sort}
            onChange={(e) => {
              updateQuery((params) => {
                if (e.target.value !== "name") {
                  params.set("sort", e.target.value);
                } else {
                  params.delete("sort");
                }
                params.set("page", "1");
              });
            }}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="name">Name (A-Z)</option>
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
          </select>

          {activeSearch && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs font-medium text-gray-500 underline hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Status Bar */}
      {!loading && !error && (
        <div className="flex items-center justify-between px-1 text-xs text-gray-500 dark:text-slate-400">
          <span>
            {pagination.total === 1
              ? "1 company found"
              : `${pagination.total} companies found`}
            {activeSearch && " (filtered)"}
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
        <div className="grid gap-6 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-gray-200 dark:bg-slate-800" />
                <div className="h-5 w-32 rounded bg-gray-200 dark:bg-slate-800" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-gray-200 dark:bg-slate-800" />
                <div className="h-3 w-4/5 rounded bg-gray-200 dark:bg-slate-800" />
              </div>
              <div className="h-8 w-28 rounded bg-gray-200 dark:bg-slate-800" />
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      ) : companies.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center dark:border-slate-800">
          <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100">
            No companies found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            {activeSearch
              ? `No companies matched "${activeSearch}". Try another search term.`
              : "Companies will appear here once added by an administrator."}
          </p>
          {activeSearch && (
            <button
              onClick={handleClearFilters}
              className="mt-4 inline-flex items-center rounded-md border border-gray-300 bg-white px-3.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {companies.map((company) => (
            <Card
              key={company._id || company.slug}
              className="flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3">
                  {company.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={company.logo}
                      alt={`${company.name} logo`}
                      className="h-9 w-9 rounded-lg object-contain bg-gray-50 p-1 border border-gray-100 dark:bg-slate-800 dark:border-slate-700"
                      onError={(e) => {
                        // Fallback on image load error
                        e.currentTarget.style.display = "none";
                        const next = e.currentTarget.nextElementSibling as HTMLElement | null;
                        if (next) next.style.display = "flex";
                      }}
                    />
                  ) : null}
                  {/* Fallback avatar */}
                  <div
                    className={`h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 font-bold text-indigo-700 border border-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-900/60 ${
                      company.logo ? "hidden" : "flex"
                    }`}
                  >
                    {company.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/companies/${encodeURIComponent(company.slug)}`}
                      className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                    >
                      <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100 break-words">
                        {company.name}
                      </h2>
                    </Link>
                    {typeof company.questionCount === "number" && (
                      <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">
                        {company.questionCount} {company.questionCount === 1 ? "question" : "questions"}
                      </span>
                    )}
                  </div>
                </div>

                {company.description && (
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gray-600 dark:text-slate-300">
                    {company.description}
                  </p>
                )}

                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    <span>Visit website</span>
                    <span aria-hidden="true">&rarr;</span>
                  </a>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800">
                <Button
                  href={`/companies/${encodeURIComponent(company.slug)}`}
                  variant="secondary"
                  className="w-full sm:w-auto"
                  aria-label={`View interview questions for ${company.name}`}
                >
                  View Interview Questions &rarr;
                </Button>
              </div>
            </Card>
          ))}
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
                params.set("page", String(Math.max(1, pagination.page - 1)));
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
                params.set("page", String(pagination.page + 1));
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
