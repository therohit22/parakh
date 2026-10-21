"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface CompanyRef {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
}

interface QuestionData {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topics: string[];
  pattern?: string;
  companies?: CompanyRef[];
  leetcodeUrl?: string;
}

interface RelatedQuestionItem {
  _id: string;
  title: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topics: string[];
  pattern?: string;
}

const difficultyBadgeColors: Record<QuestionData["difficulty"], string> = {
  Easy: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
  Medium: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
  Hard: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800",
};

interface QuestionDetailProps {
  slug: string;
}

export default function QuestionDetail({ slug }: QuestionDetailProps) {
  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [relatedQuestions, setRelatedQuestions] = useState<RelatedQuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth & action states
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [needsRevision, setNeedsRevision] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [solvedLoading, setSolvedLoading] = useState(false);
  const [revisionLoading, setRevisionLoading] = useState(false);
  const [authPrompt, setAuthPrompt] = useState<string | null>(null);

  // Personal Notes state
  const [noteContent, setNoteContent] = useState("");
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteFeedback, setNoteFeedback] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);

        // Fetch question details & related questions
        const qRes = await fetch(`/api/questions/${encodeURIComponent(slug)}`);
        const qData = await qRes.json();

        if (!isMounted) return;

        if (!qRes.ok || !qData.success) {
          setError(qData.error || "Question not found");
          setLoading(false);
          return;
        }

        const currentQuestion: QuestionData = qData.data;
        setQuestion(currentQuestion);
        setRelatedQuestions(qData.relatedQuestions || []);

        // Check authentication and current user bookmark/solved/revision/notes status
        const meRes = await fetch("/api/auth/me");
        if (!isMounted) return;

        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.ok && meData.user) {
            setIsLoggedIn(true);
            const userBookmarks: string[] = meData.user.bookmarkedQuestions || [];
            const userSolved: string[] = meData.user.solvedQuestions || [];

            setIsBookmarked(userBookmarks.includes(currentQuestion._id));
            setIsSolved(userSolved.includes(currentQuestion._id));

            // Fetch revision status
            try {
              const revRes = await fetch(`/api/questions/${encodeURIComponent(slug)}/revision`);
              const revData = await revRes.json();
              if (revRes.ok && revData.success) {
                setNeedsRevision(!!revData.needsRevision);
              }
            } catch {
              // Ignore revision fetch failure
            }

            // Fetch user note
            try {
              const noteRes = await fetch(`/api/questions/${encodeURIComponent(slug)}/notes`);
              const noteData = await noteRes.json();
              if (noteRes.ok && noteData.success && noteData.note) {
                setNoteContent(noteData.note.content || "");
                setSavedNote(noteData.note.content || "");
              }
            } catch {
              // Ignore notes fetch failure
            }
          } else {
            setIsLoggedIn(false);
          }
        } else {
          setIsLoggedIn(false);
        }
      } catch {
        if (isMounted) {
          setError("Failed to load question details. Please try again.");
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

  const handleToggleBookmark = async () => {
    if (!isLoggedIn) {
      setAuthPrompt("Please sign in to bookmark questions.");
      return;
    }

    if (bookmarkLoading || !question) return;

    const previousState = isBookmarked;
    setIsBookmarked(!previousState);
    setBookmarkLoading(true);
    setAuthPrompt(null);

    try {
      const res = await fetch(`/api/questions/${encodeURIComponent(slug)}/bookmark`, {
        method: previousState ? "DELETE" : "POST",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setIsBookmarked(previousState);
        setAuthPrompt(data.error || "Failed to update bookmark.");
      } else {
        setIsBookmarked(data.bookmarked);
      }
    } catch {
      setIsBookmarked(previousState);
      setAuthPrompt("Network error while updating bookmark.");
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleToggleSolved = async () => {
    if (!isLoggedIn) {
      setAuthPrompt("Please sign in to mark questions as solved.");
      return;
    }

    if (solvedLoading || !question) return;

    const previousState = isSolved;
    setIsSolved(!previousState);
    setSolvedLoading(true);
    setAuthPrompt(null);

    try {
      const res = await fetch(`/api/questions/${encodeURIComponent(slug)}/solved`, {
        method: previousState ? "DELETE" : "POST",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setIsSolved(previousState);
        setAuthPrompt(data.error || "Failed to update solved status.");
      } else {
        setIsSolved(data.solved);
      }
    } catch {
      setIsSolved(previousState);
      setAuthPrompt("Network error while updating solved status.");
    } finally {
      setSolvedLoading(false);
    }
  };

  const handleToggleRevision = async () => {
    if (!isLoggedIn) {
      setAuthPrompt("Please sign in to manage your revision queue.");
      return;
    }

    if (revisionLoading || !question) return;

    const previousState = needsRevision;
    setNeedsRevision(!previousState);
    setRevisionLoading(true);
    setAuthPrompt(null);

    try {
      const res = await fetch(`/api/questions/${encodeURIComponent(slug)}/revision`, {
        method: previousState ? "DELETE" : "POST",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setNeedsRevision(previousState);
        setAuthPrompt(data.error || "Failed to update revision queue.");
      } else {
        setNeedsRevision(data.needsRevision);
      }
    } catch {
      setNeedsRevision(previousState);
      setAuthPrompt("Network error while updating revision queue.");
    } finally {
      setRevisionLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!isLoggedIn) {
      setAuthPrompt("Please sign in to write personal notes.");
      return;
    }

    if (!noteContent.trim()) {
      setNoteFeedback("Note content cannot be empty.");
      return;
    }

    try {
      setNoteSaving(true);
      setNoteFeedback(null);
      const res = await fetch(`/api/questions/${encodeURIComponent(slug)}/notes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: noteContent }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSavedNote(data.note.content);
        setNoteFeedback("Note saved securely!");
        setTimeout(() => setNoteFeedback(null), 3000);
      } else {
        setNoteFeedback(data.error || "Failed to save note.");
      }
    } catch {
      setNoteFeedback("Network error saving note.");
    } finally {
      setNoteSaving(false);
    }
  };

  const handleDeleteNote = async () => {
    try {
      setNoteSaving(true);
      const res = await fetch(`/api/questions/${encodeURIComponent(slug)}/notes`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setNoteContent("");
        setSavedNote(null);
        setNoteFeedback("Note deleted.");
        setTimeout(() => setNoteFeedback(null), 3000);
      }
    } catch {
      setNoteFeedback("Failed to delete note.");
    } finally {
      setNoteSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-4 w-32 rounded bg-gray-200 dark:bg-slate-800 animate-pulse" />
        <Card className="animate-pulse space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3 w-full sm:w-2/3">
              <div className="flex gap-2">
                <div className="h-5 w-16 rounded-full bg-gray-200 dark:bg-slate-800" />
                <div className="h-5 w-20 rounded bg-gray-200 dark:bg-slate-800" />
              </div>
              <div className="h-8 w-3/4 rounded bg-gray-200 dark:bg-slate-800" />
              <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-slate-800" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="py-16 text-center">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          {error || "Question not found"}
        </div>
        <div className="mt-6">
          <Button href="/questions" variant="secondary">
            &larr; Back to Questions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Navigation link */}
      <div>
        <Link
          href="/questions"
          className="inline-flex items-center text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-100"
        >
          &larr; Back to all questions
        </Link>
      </div>

      {/* Auth prompt if clicked while logged out */}
      {authPrompt && (
        <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
          <span>{authPrompt}</span>
          <Link
            href="/login"
            className="ml-4 font-semibold underline hover:text-amber-950 dark:hover:text-amber-200"
          >
            Sign In &rarr;
          </Link>
        </div>
      )}

      {/* Main Question Card */}
      <Card className="space-y-6 p-6">
        {/* Header & Badges */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                  difficultyBadgeColors[question.difficulty]
                }`}
              >
                {question.difficulty}
              </span>

              {question.pattern && (
                <span className="rounded bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800">
                  Pattern: {question.pattern}
                </span>
              )}

              {question.topics.map((topic) => (
                <span
                  key={topic}
                  className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-slate-800 dark:text-slate-300"
                >
                  {topic}
                </span>
              ))}
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-slate-100 sm:text-3xl">
              {question.title}
            </h1>

            {question.companies && question.companies.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400 pt-1">
                <span className="font-medium">Reported by:</span>
                {question.companies.map((c) => (
                  <Link
                    key={c._id}
                    href={`/companies/${c.slug}`}
                    className="inline-flex items-center gap-1 rounded bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-700 hover:bg-gray-100 hover:text-indigo-600 border border-gray-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
            {/* Bookmark button */}
            <button
              type="button"
              onClick={handleToggleBookmark}
              disabled={bookmarkLoading}
              aria-label={isBookmarked ? "Remove Bookmark" : "Bookmark Question"}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50 ${
                isBookmarked
                  ? "border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <span>{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
            </button>

            {/* Solved button */}
            <button
              type="button"
              onClick={handleToggleSolved}
              disabled={solvedLoading}
              aria-label={isSolved ? "Mark as Unsolved" : "Mark as Solved"}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-50 ${
                isSolved
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <span>{isSolved ? "Solved" : "Mark Solved"}</span>
            </button>

            {/* Revision button */}
            <button
              type="button"
              onClick={handleToggleRevision}
              disabled={revisionLoading}
              aria-label={needsRevision ? "In Revision Queue" : "Needs Revision"}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 disabled:opacity-50 ${
                needsRevision
                  ? "border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950/50 dark:text-purple-300"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <span>{needsRevision ? "In Revision Queue" : "+ Need Revision"}</span>
            </button>

            {/* LeetCode link */}
            {question.leetcodeUrl && (
              <a
                href={question.leetcodeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900 shadow-sm transition-colors hover:bg-amber-100 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-950/70"
              >
                <span>Code on LeetCode ↗</span>
              </a>
            )}
          </div>
        </div>

        {/* Description Body */}
        <div className="border-t border-gray-100 pt-6 dark:border-slate-800">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
            Problem Description
          </h2>
          <div className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-slate-200 whitespace-pre-line">
            {question.description || "No detailed description provided for this problem."}
          </div>
        </div>
      </Card>

      {/* Feature 7: Personal Notes Section */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Personal Notes
            </h2>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Private study scratchpad for your algorithmic takeaways, edge cases, and complexity notes. Only visible to you.
            </p>
          </div>
          {savedNote && (
            <button
              type="button"
              onClick={handleDeleteNote}
              disabled={noteSaving}
              className="text-xs font-medium text-rose-600 hover:underline dark:text-rose-400"
            >
              Delete Note
            </button>
          )}
        </div>

        <div className="space-y-2">
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            maxLength={2000}
            rows={4}
            placeholder="Write your private approach notes, edge cases to watch out for, or time/space complexities..."
            className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>{noteContent.length} / 2000 characters</span>
            {noteFeedback && (
              <span className="font-medium text-indigo-600 dark:text-indigo-400">
                {noteFeedback}
              </span>
            )}
          </div>
          <Button
            onClick={handleSaveNote}
            disabled={noteSaving}
            size="sm"
            className="text-xs"
          >
            {noteSaving ? "Saving..." : "Save Note"}
          </Button>
        </div>
      </Card>

      {/* Feature 19: Real Related Questions Section */}
      {relatedQuestions && relatedQuestions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Related Interview Questions
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {relatedQuestions.map((rq) => (
              <Card key={rq.slug} className="p-4 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.2 text-[10px] font-semibold ${
                        difficultyBadgeColors[rq.difficulty]
                      }`}
                    >
                      {rq.difficulty}
                    </span>
                    {rq.pattern && (
                      <span className="rounded bg-purple-50 px-1.5 py-0.2 text-[10px] font-medium text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
                        {rq.pattern}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                    <Link href={`/questions/${rq.slug}`} className="hover:underline">
                      {rq.title}
                    </Link>
                  </h3>
                </div>

                <Link
                  href={`/questions/${rq.slug}`}
                  className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400 inline-block"
                >
                  Solve Related Problem &rarr;
                </Link>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
