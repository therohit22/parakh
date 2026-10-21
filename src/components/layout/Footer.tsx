import Link from "next/link";

const currentYear = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white transition-colors dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-lg font-bold text-gray-900 dark:text-slate-100">Parakh</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              Company-wise Interview Preparation Platform
            </p>
          </div>
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap gap-6 text-sm text-gray-600 dark:text-slate-400">
              <li>
                <Link
                  href="/"
                  className="hover:text-gray-900 dark:hover:text-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 rounded"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/companies"
                  className="hover:text-gray-900 dark:hover:text-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 rounded"
                >
                  Companies
                </Link>
              </li>
              <li>
                <Link
                  href="/questions"
                  className="hover:text-gray-900 dark:hover:text-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 rounded"
                >
                  Questions
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <p className="mt-6 border-t border-gray-100 dark:border-slate-800 pt-6 text-xs text-gray-400 dark:text-slate-500">
          &copy; {currentYear} Parakh. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
