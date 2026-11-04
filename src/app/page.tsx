import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-4 py-16">
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 flex items-center gap-3">
          <Image src="/logo.png" alt="Makindye Secondary School logo" width={56} height={56} className="rounded-full" />
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Makindye Secondary School
          </h1>
        </div>
        <p className="mt-1 text-lg text-zinc-600 dark:text-zinc-400">ICT and Digital Survey for Staff</p>
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          Makindye Secondary School is improving how it uses computers, the internet and other technology. This survey helps us
          understand what you already use, what gets in your way, and what help you would like.
        </p>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
          <li>It is anonymous: please do not write your name.</li>
          <li>It is voluntary and takes about 10 minutes.</li>
          <li>There are no right or wrong answers, and this is not a test of you.</li>
          <li>Results will be reported only as group totals.</li>
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/survey"
            className="rounded-full bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Start survey
          </Link>
            View results
          </Link>
        </div>
      </div>
    </main>
  );
}
