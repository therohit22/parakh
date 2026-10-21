import type { Metadata } from "next";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Register",
};

export default function RegisterPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl dark:text-slate-100">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">
          Start practicing interview questions and tracking your progress
        </p>
      </div>

      <RegisterForm />
    </div>
  );
}
