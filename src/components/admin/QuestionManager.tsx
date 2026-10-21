"use client";

import { useEffect, useState, useTransition } from "react";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { CompanyItem } from "./CompanyManager";

interface QuestionCompany {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
}

export interface QuestionItem {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topics: string[];
  companies: QuestionCompany[];
  leetcodeUrl?: string;
  createdAt?: string;
}

interface PaginationData {
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

export default function QuestionManager() {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Filters
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Available companies for selection in question forms
  const [availableCompanies, setAvailableCompanies] = useState<CompanyItem[]>([]);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    difficulty: "Easy" as "Easy" | "Medium" | "Hard",
    topicsString: "",
    selectedCompanyIds: [] as string[],
    leetcodeUrl: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Delete state
  const [questionToDelete, setQuestionToDelete] = useState<QuestionItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [, startTransition] = useTransition();



  // Load questions
  const fetchQuestions = async (page = 1, searchQuery = "", diff = "") => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "10");
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      if (diff.trim()) params.set("difficulty", diff.trim());

      const res = await fetch(`/api/questions?${params.toString()}`);
      const json = await res.json();

      if (res.ok && json.success) {
        setQuestions(json.data || []);
        if (json.pagination) {
          setPagination(json.pagination);
        }
      } else {
        setError(json.error || "Failed to load questions.");
      }
    } catch {
      setError("Network error fetching questions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        const [companiesRes, questionsRes] = await Promise.all([
          fetch("/api/companies"),
          fetch(`/api/questions?page=${currentPage}&limit=10${difficulty ? `&difficulty=${encodeURIComponent(difficulty)}` : ""}${activeSearch.trim() ? `&search=${encodeURIComponent(activeSearch.trim())}` : ""}`),
        ]);
        const companiesJson = await companiesRes.json();
        const questionsJson = await questionsRes.json();

        if (isMounted) {
          if (companiesRes.ok && companiesJson.success) {
            setAvailableCompanies(companiesJson.data || []);
          }
          if (questionsRes.ok && questionsJson.success) {
            setQuestions(questionsJson.data || []);
            if (questionsJson.pagination) {
              setPagination(questionsJson.pagination);
            }
          } else {
            setError(questionsJson.error || "Failed to load questions.");
          }
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          setError("Network error fetching questions.");
          setLoading(false);
        }
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, [currentPage, difficulty, activeSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setActiveSearch(search);
  };

  const handleClearFilters = () => {
    setSearch("");
    setActiveSearch("");
    setDifficulty("");
    setCurrentPage(1);
  };

  // Open Create Modal
  const openCreateModal = () => {
    setEditingQuestion(null);
    setFormData({
      title: "",
      slug: "",
      description: "",
      difficulty: "Easy",
      topicsString: "",
      selectedCompanyIds: [],
      leetcodeUrl: "",
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (q: QuestionItem) => {
    setEditingQuestion(q);
    setFormData({
      title: q.title || "",
      slug: q.slug || "",
      description: q.description || "",
      difficulty: q.difficulty || "Easy",
      topicsString: (q.topics || []).join(", "),
      selectedCompanyIds: (q.companies || []).map((c) => c._id),
      leetcodeUrl: q.leetcodeUrl || "",
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Auto-slugify from title when creating
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => {
      const updated = { ...prev, title: val };
      if (!editingQuestion) {
        updated.slug = val
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-");
      }
      return updated;
    });
  };

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) {
      errors.title = "Question title is required";
    }
    if (!formData.slug.trim()) {
      errors.slug = "Slug is required";
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.slug.trim())) {
      errors.slug = "Slug must contain only lowercase letters, numbers, and hyphens";
    }
    if (!["Easy", "Medium", "Hard"].includes(formData.difficulty)) {
      errors.difficulty = "Difficulty must be Easy, Medium, or Hard";
    }
    if (formData.leetcodeUrl && formData.leetcodeUrl.trim() !== "") {
      try {
        const parsed = new URL(formData.leetcodeUrl.trim());
        if (
          !(parsed.protocol === "https:" || parsed.protocol === "http:") ||
          !(parsed.hostname === "leetcode.com" || parsed.hostname === "www.leetcode.com") ||
          !parsed.pathname.startsWith("/problems/")
        ) {
          errors.leetcodeUrl = "Must be an official LeetCode problem URL (e.g., https://leetcode.com/problems/two-sum/)";
        }
      } catch {
        errors.leetcodeUrl = "Must be a valid URL (e.g., https://leetcode.com/problems/two-sum/)";
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit form
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setFormErrors({});

      const topics = formData.topicsString
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        title: formData.title.trim(),
        slug: formData.slug.trim().toLowerCase(),
        description: formData.description.trim() || undefined,
        difficulty: formData.difficulty,
        topics,
        companies: formData.selectedCompanyIds,
        leetcodeUrl: formData.leetcodeUrl.trim() || undefined,
      };

      let res: Response;
      if (editingQuestion) {
        res = await fetch(`/api/questions/${editingQuestion.slug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();

      if (res.ok && json.success) {
        setIsModalOpen(false);
        setSuccessMessage(
          editingQuestion
            ? `Question "${formData.title}" updated successfully.`
            : `Question "${formData.title}" created successfully.`
        );
        setTimeout(() => setSuccessMessage(null), 4000);
        startTransition(() => {
          fetchQuestions(currentPage, search, difficulty);
        });
      } else {
        if (json.details && Array.isArray(json.details)) {
          const apiErrors: Record<string, string> = {};
          json.details.forEach((d: { field?: string; message?: string }) => {
            if (d.field) apiErrors[d.field] = d.message || "Invalid value";
          });
          setFormErrors(apiErrors);
        } else {
          setFormErrors({ form: json.error || "Operation failed." });
        }
      }
    } catch {
      setFormErrors({ form: "Network error occurred." });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete question
  const handleDeleteQuestion = async () => {
    if (!questionToDelete) return;

    try {
      setDeleting(true);
      setDeleteError(null);
      const res = await fetch(`/api/questions/${questionToDelete.slug}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setQuestionToDelete(null);
        setSuccessMessage(`Question "${questionToDelete.title}" deleted successfully.`);
        setTimeout(() => setSuccessMessage(null), 4000);
        startTransition(() => {
          fetchQuestions(currentPage, search, difficulty);
        });
      } else {
        setDeleteError(json.error || "Failed to delete question.");
      }
    } catch {
      setDeleteError("Network error deleting question.");
    } finally {
      setDeleting(false);
    }
  };

  const inputClasses =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500";

  return (
    <div>
      {/* Notifications */}
      {successMessage && (
        <div
          role="status"
          className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
        >
          {successMessage}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
        >
          {error}
        </div>
      )}

      {/* Action / Filters Bar */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-wrap items-center gap-2 lg:max-w-xl"
        >
          <input
            id="question-search"
            type="text"
            placeholder="Search questions by title or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
          />

          <select
            aria-label="Filter questions by difficulty"
            value={difficulty}
            onChange={(e) => {
              setDifficulty(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <Button type="submit" variant="secondary" size="md">
            Filter
          </Button>

          {(search || difficulty) && (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleClearFilters}
            >
              Reset
            </Button>
          )}
        </form>

        <Button onClick={openCreateModal} variant="primary" className="shrink-0">
          + Add Question
        </Button>
      </div>

      {/* Table / List */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-500 dark:text-slate-400">
            Loading questions...
          </div>
        ) : questions.length === 0 ? (
          <div className="py-12">
            <EmptyState
              title={
                search || difficulty
                  ? "No matching questions found"
                  : "No questions yet"
              }
              description={
                search || difficulty
                  ? "No questions match the current filters. Try resetting or adjusting your search."
                  : "Get started by adding the first interview question to Parakh."
              }
              action={
                !search && !difficulty ? (
                  <Button onClick={openCreateModal} variant="primary">
                    + Add Question
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm dark:divide-slate-800">
              <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-slate-800/60 dark:text-slate-400">
                <tr>
                  <th scope="col" className="px-6 py-3.5">
                    Question
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Difficulty
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Topics
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Companies
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                {questions.map((q) => (
                  <tr
                    key={q._id}
                    className="hover:bg-gray-50/80 transition-colors dark:hover:bg-slate-800/40"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-slate-100">
                        {q.title}
                      </div>
                      <div className="font-mono text-xs text-gray-500 dark:text-slate-400">
                        {q.slug}
                      </div>
                      {q.leetcodeUrl && (
                        <a
                          href={q.leetcodeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-block text-xs text-indigo-600 hover:underline dark:text-indigo-400"
                        >
                          LeetCode &rarr;
                        </a>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${
                          difficultyBadgeColors[q.difficulty]
                        }`}
                      >
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(q.topics || []).map((t) => (
                          <span
                            key={t}
                            className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(q.companies || []).map((c) => (
                          <span
                            key={c._id}
                            className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-slate-800 dark:text-slate-300"
                          >
                            {c.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(q)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            setQuestionToDelete(q);
                            setDeleteError(null);
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="text-xs text-gray-500 dark:text-slate-400">
              Showing page <span className="font-semibold">{pagination.page}</span> of{" "}
              <span className="font-semibold">{pagination.totalPages}</span> (
              {pagination.total} questions)
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
                }
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
        >
          <div className="relative my-8 w-full max-w-xl rounded-xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
              {editingQuestion ? "Edit Question" : "Create New Question"}
            </h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
              {editingQuestion
                ? `Updating question "${editingQuestion.title}".`
                : "Enter question metadata, difficulty, topics, and associated companies."}
            </p>

            {formErrors.form && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                {formErrors.form}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="q-title"
                  className="block text-xs font-semibold text-gray-700 dark:text-slate-300"
                >
                  Question Title *
                </label>
                <input
                  id="q-title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleTitleChange}
                  placeholder="e.g. Two Sum, LRU Cache, Median of Two Sorted Arrays"
                  className={`${inputClasses} mt-1 ${formErrors.title ? "border-red-500 dark:border-red-500" : ""}`}
                />
                {formErrors.title && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.title}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="q-slug"
                  className="block text-xs font-semibold text-gray-700 dark:text-slate-300"
                >
                  Slug * (lowercase, letters, numbers, hyphens)
                </label>
                <input
                  id="q-slug"
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      slug: e.target.value.toLowerCase(),
                    }))
                  }
                  placeholder="e.g. two-sum"
                  className={`${inputClasses} mt-1 font-mono text-sm ${formErrors.slug ? "border-red-500 dark:border-red-500" : ""}`}
                />
                {formErrors.slug && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.slug}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="q-diff"
                    className="block text-xs font-semibold text-gray-700 dark:text-slate-300"
                  >
                    Difficulty *
                  </label>
                  <select
                    id="q-diff"
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        difficulty: e.target.value as "Easy" | "Medium" | "Hard",
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="q-leetcode"
                    className="block text-xs font-semibold text-gray-700 dark:text-slate-300"
                  >
                    LeetCode Practice URL (optional)
                  </label>
                  <input
                    id="q-leetcode"
                    type="url"
                    value={formData.leetcodeUrl}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        leetcodeUrl: e.target.value,
                      }))
                    }
                    placeholder="https://leetcode.com/problems/two-sum/"
                    className={`${inputClasses} mt-1 ${formErrors.leetcodeUrl ? "border-red-500 dark:border-red-500" : ""}`}
                  />
                  {formErrors.leetcodeUrl && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {formErrors.leetcodeUrl}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="q-topics"
                  className="block text-xs font-semibold text-gray-700 dark:text-slate-300"
                >
                  Topics (comma-separated)
                </label>
                <input
                  id="q-topics"
                  type="text"
                  value={formData.topicsString}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      topicsString: e.target.value,
                    }))
                  }
                  placeholder="Arrays, Hash Table, Dynamic Programming"
                  className={`${inputClasses} mt-1`}
                />
              </div>

              {/* Companies Selection */}
              <div>
                <span className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                  Associated Hiring Companies
                </span>
                <div className="mt-1 max-h-36 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 dark:border-slate-800 dark:bg-slate-800/40">
                  {availableCompanies.length === 0 ? (
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      No companies available. Add a company first under Company Management.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {availableCompanies.map((c) => {
                        const isChecked = formData.selectedCompanyIds.includes(c._id);
                        return (
                          <label
                            key={c._id}
                            className="flex items-center gap-2 text-xs font-medium text-gray-700 hover:text-gray-900 dark:text-slate-300 dark:hover:text-slate-100 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setFormData((prev) => ({
                                  ...prev,
                                  selectedCompanyIds: checked
                                    ? [...prev.selectedCompanyIds, c._id]
                                    : prev.selectedCompanyIds.filter((id) => id !== c._id),
                                }));
                              }}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                            />
                            <span className="truncate">{c.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="q-desc"
                  className="block text-xs font-semibold text-gray-700 dark:text-slate-300"
                >
                  Description / Problem Statement (optional)
                </label>
                <textarea
                  id="q-desc"
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Enter problem statement, input/output constraints, or notes..."
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting
                    ? "Saving..."
                    : editingQuestion
                    ? "Save Changes"
                    : "Create Question"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {questionToDelete && (
        <div
          role="alertdialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">
              Delete Question &ldquo;{questionToDelete.title}&rdquo;?
            </h3>
            <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">
              Are you sure you want to delete this question? This action permanently removes it from the catalog. Existing student bookmarks and solved references safely ignore deleted questions.
            </p>

            {deleteError && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                {deleteError}
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setQuestionToDelete(null);
                  setDeleteError(null);
                }}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteQuestion}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
