import FeatureCard from "@/components/FeatureCard";
import Button from "@/components/ui/Button";
import Link from "next/link";

const features = [
  {
    title: "Company-wise Preparation",
    description:
      "Practice questions asked in real technical interviews at top engineering teams. Focus your preparation on the companies you target.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
  },
  {
    title: "Topic-based Practice",
    description:
      "Filter by core computer science topics — Arrays, Hash Tables, Trees, Dynamic Programming, and more. Master patterns step by step.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
  },
  {
    title: "Track Your Progress",
    description:
      "Mark questions as solved and monitor your readiness with completion metrics broken down by difficulty and company.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
  {
    title: "Personal Bookmarks",
    description:
      "Save challenging questions to your personal shortlist. Revisit them before upcoming interviews to reinforce concepts.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
    ),
  },
];

const targetCompanies = [
  { name: "Amazon", slug: "amazon", logo: "/logos/amazon.svg" },
  { name: "Microsoft", slug: "microsoft", logo: "/logos/microsoft.svg" },
  { name: "Google", slug: "google", logo: "/logos/google.svg" },
  { name: "Flipkart", slug: "flipkart", logo: "/logos/flipkart.svg" },
  { name: "Deloitte", slug: "deloitte", logo: "/logos/deloitte.svg" },
  { name: "Netlify", slug: "netlify", logo: "/logos/netlify.svg" },
  { name: "Infosys", slug: "infosys", logo: "/logos/infosys.svg" },
  { name: "Zomato", slug: "zomato", logo: "/logos/zomato.svg" },
];

const popularTopics = [
  "Array",
  "Hash Table",
  "String",
  "Two Pointers",
  "Dynamic Programming",
  "Trees",
  "Binary Search",
  "Stack",
];

export default function Home() {
  return (
    <div className="space-y-16 py-8 sm:py-12">
      {/* Hero section */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-gradient-to-b from-gray-50/50 to-white p-8 sm:p-12 lg:p-16 dark:border-slate-800 dark:from-slate-900/60 dark:to-slate-950">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">
            <span className="h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
            Interview Preparation Platform
          </div>

          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl dark:text-slate-100">
            Master the coding interviews that matter.
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg dark:text-slate-300">
            Company-wise questions, curated topics, persistent bookmarks, and
            structured progress tracking — built to help engineering students
            walk into technical interviews with genuine preparation.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/companies" variant="primary" size="lg">
              Explore Target Companies &rarr;
            </Button>
            <Button href="/questions" variant="secondary" size="lg">
              Browse Questions
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Discovery: Companies & Topics */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Company Quick-access */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900 dark:text-slate-100">
                Company-wise DSA Questions
              </h2>
              <Link
                href="/companies"
                className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
              >
                View all &rarr;
              </Link>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
              Practice verified coding questions curated for each hiring team.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {targetCompanies.map((c) => (
                <Link
                  key={c.slug}
                  href={`/companies/${c.slug}`}
                  className="flex items-center justify-between rounded-lg border border-gray-200 px-3.5 py-2 text-sm font-medium text-gray-700 transition hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-700 dark:border-slate-800 dark:text-slate-300 dark:hover:border-indigo-600 dark:hover:bg-slate-800"
                >
                  <div className="flex items-center gap-2">
                    {c.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.logo}
                        alt=""
                        className="h-4 w-4 object-contain"
                        aria-hidden="true"
                      />
                    ) : null}
                    <span>{c.name}</span>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-slate-500">&rarr;</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Topics Quick-access */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900 dark:text-slate-100">
                Practice by Topic
              </h2>
              <Link
                href="/questions"
                className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
              >
                All questions &rarr;
              </Link>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
              Focus practice on foundational data structures and algorithms.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {popularTopics.map((topic) => (
                <Link
                  key={topic}
                  href={`/questions?topic=${encodeURIComponent(topic)}`}
                  className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-indigo-400 hover:bg-white hover:text-indigo-700 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:border-indigo-600 dark:hover:text-indigo-300"
                >
                  {topic}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-slate-100">
            How Parakh helps you prepare
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Systematic tools built for technical interview workflows.
          </p>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
