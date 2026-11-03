"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import SurveyForm from "@/components/SurveyForm";

export default function SurveyPage() {
  const router = useRouter();
  const [done, setDone] = useState(false);
  const [id, setId] = useState<string | null>(null);

  if (done) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Thank you</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          Your answers have been recorded anonymously. They will help the school plan training and equipment.
        </p>
        {id && <p className="mt-2 text-xs text-zinc-400">Reference: {id}</p>}
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Home
          </button>
          <button
            onClick={() => {
              setDone(false);
              setId(null);
            }}
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Submit another
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Makindye Secondary School — Staff ICT Survey
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Digital version of the staff questionnaire. Anonymous and voluntary.
        </p>
      </header>
      <SurveyForm onSubmitted={(newId) => { setId(newId); setDone(true); }} />
    </main>
  );
}
