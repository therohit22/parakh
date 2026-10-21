"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface UserProfileData {
  user: {
    name: string;
    email: string;
    role: string;
    createdAt?: string;
  };
  totalQuestions: number;
  solvedQuestions: number;
  bookmarkedQuestions: number;
  revisionQuestions: number;
  preparationScore: {
    score: number;
    dsaCoverage: number;
    topicBreadth: number;
    difficultyBalance: number;
  };
  strengthSummary: {
    strongest: string | null;
    needsPractice: string | null;
  };
  streak: {
    current: number;
    longest: number;
  };
}

export default function ProfileView() {
  const router = useRouter();
  const [data, setData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Change password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwdMsg, setPwdMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pwdLoading, setPwdLoading] = useState(false);

  // Delete account state
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const res = await fetch("/api/dashboard");
        const json = await res.json();
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        if (res.ok && json.success) {
          setData(json.data);
        } else {
          setError(json.error || "Failed to load profile data");
        }
      } catch {
        setError("Network error loading profile.");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [router]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setPwdLoading(true);
      setPwdMsg(null);
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const resJson = await res.json();
      if (res.ok && resJson.success) {
        setPwdMsg({ type: "success", text: "Password changed successfully!" });
        setCurrentPassword("");
        setNewPassword("");
      } else {
        setPwdMsg({ type: "error", text: resJson.error || "Failed to update password" });
      }
    } catch {
      setPwdMsg({ type: "error", text: "Network error occurred." });
    } finally {
      setPwdLoading(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setDeleteLoading(true);
      setDeleteError(null);
      const res = await fetch("/api/auth/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });
      const resJson = await res.json();
      if (res.ok && resJson.success) {
        router.push("/register");
        router.refresh();
      } else {
        setDeleteError(resJson.error || "Failed to delete account");
      }
    } catch {
      setDeleteError("Network error occurred.");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-8 space-y-6 animate-pulse">
        <div className="h-24 rounded-xl bg-gray-100 dark:bg-slate-800" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-48 rounded-xl bg-gray-100 dark:bg-slate-800" />
          <div className="h-48 rounded-xl bg-gray-100 dark:bg-slate-800 md:col-span-2" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mt-8 rounded-lg bg-red-50 p-6 text-center text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
        {error || "Unable to display profile."}
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-8">
      {/* Profile Overview Card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-bold text-white shadow-sm dark:bg-indigo-500">
              {data.user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {data.user.name}
                </h2>
                <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {data.user.role === "admin" ? "Administrator" : "Student"}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                {data.user.email}
              </p>
              {data.user.createdAt && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Member since {new Date(data.user.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6 self-start sm:self-center border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-100 dark:border-slate-800">
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-slate-400">Preparation Score</p>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {data.preparationScore.score}/100
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-slate-400">Current Streak</p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                🔥 {data.streak.current}d
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Preparation Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <p className="text-xs text-gray-500 dark:text-slate-400">Solved Problems</p>
          <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
            {data.solvedQuestions}
          </p>
          <Link href="/solved" className="text-xs text-indigo-600 hover:underline mt-1 block">
            View list &rarr;
          </Link>
        </Card>

        <Card className="p-4 text-center">
          <p className="text-xs text-gray-500 dark:text-slate-400">Bookmarks</p>
          <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
            {data.bookmarkedQuestions}
          </p>
          <Link href="/bookmarks" className="text-xs text-indigo-600 hover:underline mt-1 block">
            View list &rarr;
          </Link>
        </Card>

        <Card className="p-4 text-center">
          <p className="text-xs text-gray-500 dark:text-slate-400">Revision Queue</p>
          <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
            {data.revisionQuestions}
          </p>
          <Link href="/revision" className="text-xs text-indigo-600 hover:underline mt-1 block">
            Review &rarr;
          </Link>
        </Card>

        <Card className="p-4 text-center">
          <p className="text-xs text-gray-500 dark:text-slate-400">Longest Streak</p>
          <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
            {data.streak.longest} days
          </p>
          <span className="text-xs text-gray-400 mt-1 block">Consistency record</span>
        </Card>
      </div>

      {/* Topic Strength Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Algorithmic Strength Analysis
          </h3>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-emerald-50/50 p-3 dark:bg-emerald-950/20">
              <div>
                <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-400">
                  Strongest Focus Area
                </p>
                <p className="text-base font-bold text-emerald-950 dark:text-emerald-200">
                  {data.strengthSummary.strongest || "Practice more problems to identify"}
                </p>
              </div>
              <span className="text-2xl">💪</span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-amber-50/50 p-3 dark:bg-amber-950/20">
              <div>
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-400">
                  Recommended Focus Area
                </p>
                <p className="text-base font-bold text-amber-950 dark:text-amber-200">
                  {data.strengthSummary.needsPractice || "All active topics in good standing"}
                </p>
              </div>
              <span className="text-2xl">🎯</span>
            </div>
          </div>
        </Card>

        {/* Change Password Form */}
        <Card className="p-6">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Account Security — Change Password
          </h3>
          <form onSubmit={handleChangePassword} className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-slate-300">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-slate-300">
                New Password (min 8 characters)
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {pwdMsg && (
              <div
                className={`rounded-lg p-2.5 text-xs font-medium ${
                  pwdMsg.type === "success"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                    : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                }`}
              >
                {pwdMsg.text}
              </div>
            )}

            <Button type="submit" disabled={pwdLoading} className="text-xs">
              {pwdLoading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </Card>
      </div>

      {/* Danger Zone: Account Deletion */}
      <Card className="p-6 border-red-200 dark:border-red-950 bg-red-50/20 dark:bg-red-950/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-red-700 dark:text-red-400">
              Delete Account
            </h3>
            <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
              Permanently remove your account, bookmarks, personal notes, and solved question history. Shared questions and companies remain unaffected.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-900 dark:bg-slate-900 dark:text-red-400"
          >
            Delete Account
          </button>
        </div>

        {showDeleteModal && (
          <form
            onSubmit={handleDeleteAccount}
            className="mt-4 pt-4 border-t border-red-200 dark:border-red-900 space-y-3"
          >
            <p className="text-xs font-medium text-red-800 dark:text-red-300">
              Please enter your password to confirm account deletion:
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                required
                placeholder="Confirm password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-1 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <button
                type="submit"
                disabled={deleteLoading}
                className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleteLoading ? "Deleting..." : "Permanently Delete"}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-lg border border-gray-300 px-3 py-1 text-xs text-gray-700 dark:border-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
            </div>
            {deleteError && (
              <p className="text-xs text-red-600 font-medium">{deleteError}</p>
            )}
          </form>
        )}
      </Card>
    </div>
  );
}
