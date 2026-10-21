import type { Metadata } from "next";
import ProfileView from "@/components/profile/ProfileView";

export const metadata: Metadata = {
  title: "User Profile & Progress Summary",
  description: "View your personal interview preparation score, activity streaks, topic strength, and manage account security.",
};

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-slate-100">
          Personal Profile & Progress
        </h1>
        <p className="mt-3 text-base text-gray-600 dark:text-slate-300">
          Monitor your preparation score, practice streaks, and manage account security.
        </p>
      </div>

      <ProfileView />
    </div>
  );
}
