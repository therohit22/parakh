import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl dark:text-slate-100">
          Sign in to Parakh
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">
          Access your preparation dashboard and saved questions
        </p>
      </div>

      <LoginForm />
    </div>
  );
}
