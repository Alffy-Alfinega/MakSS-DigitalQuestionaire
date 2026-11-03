"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { SurveyResponse } from "@/lib/survey";
import { SKILL_ITEMS, FACILITY_ITEMS, VIEW_ITEMS } from "@/lib/survey";
import { useRouter } from "next/navigation";

function countValues(responses: SurveyResponse[], getter: (r: SurveyResponse) => string | string[] | undefined) {
  const counts: Record<string, number> = {};
  for (const r of responses) {
    const v = getter(r);
    const arr = Array.isArray(v) ? v : v ? [v] : [];
    for (const x of arr) counts[x] = (counts[x] || 0) + 1;
  }
  return counts;
}

function avgRating(responses: SurveyResponse[], items: readonly { key: string; label: string }[], qKey: "q6" | "q15") {
  return items.map((it) => {
    const vals = responses
      .map((r) => r.answers[qKey]?.[it.key])
      .filter((x): x is string => !!x && x !== "NA")
      .map(Number)
      .filter((n) => !isNaN(n));
    const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    return { key: it.key, label: it.label, avg: Number(avg.toFixed(2)), n: vals.length };
  });
}

function avgFacility(responses: SurveyResponse[]) {
  return FACILITY_ITEMS.map((it) => {
    const vals = responses
      .map((r) => r.answers.q14?.[it.key])
      .filter((x): x is string => !!x && x !== "NA")
      .map(Number)
      .filter((n) => !isNaN(n));
    const na = responses.filter((r) => r.answers.q14?.[it.key] === "NA").length;
    const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    return { key: it.key, label: it.label, avg: Number(avg.toFixed(2)), n: vals.length, na };
  });
}


export default function AdminPage() {
  const router = useRouter();
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNext, setPwNext] = useState("");
  const [pwMsg, setPwMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then((d) => {
        if (!d.authenticated) router.replace("/admin/login");
        else setAuthChecked(true);
      })
      .catch(() => router.replace("/admin/login"));
  }, [router]);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/responses");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setResponses(data.responses ?? []);
    } catch {
      // fallback localStorage
      try {
        const list = JSON.parse(localStorage.getItem("makss-survey-responses") || "[]");
        setResponses(list);
      } catch {
        setErr("Could not load responses.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (authChecked) load();
  }, [authChecked]);

  const roles = useMemo(() => countValues(responses, (r) => r.answers.q1), [responses]);
  const barriers = useMemo(() => countValues(responses, (r) => r.answers.q13), [responses]);
  const topics = useMemo(() => countValues(responses, (r) => r.answers.q19), [responses]);
  const skills = useMemo(() => avgRating(responses, SKILL_ITEMS, "q6"), [responses]);
  const views = useMemo(() => avgRating(responses, VIEW_ITEMS, "q15"), [responses]);
  const facilities = useMemo(() => avgFacility(responses), [responses]);

  const clearAll = async () => {
    if (!confirm("Delete ALL responses? This cannot be undone.")) return;
    try {
      await fetch("/api/responses", { method: "DELETE" });
    } catch {}
    try {
      localStorage.removeItem("makss-survey-responses");
    } catch {}
    load();
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Makindye Secondary School logo" width={40} height={40} className="rounded-full" />
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Survey results</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {responses.length} response{responses.length === 1 ? "" : "s"} collected.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={async () => {
              const res = await fetch("/api/export");
              if (!res.ok) {
                alert("Export failed");
                return;
              }
              const blob = await res.blob();
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `makss-survey-${new Date().toISOString().slice(0, 10)}.xlsx`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Export XLSX
          </button>
          <button
            onClick={clearAll}
            className="rounded-full border border-red-300 px-4 py-2 text-sm text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950"
          >
            Clear all
          </button>
          <button
            onClick={async () => {
              await fetch("/api/admin/logout", { method: "POST" });
              router.replace("/admin/login");
            }}
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Logout
          </button>
          <Link
            href="/"
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Home
          </Link>
        </div>
      </header>

      {loading && <p className="text-sm text-zinc-500">Loading…</p>}
      {err && <p className="text-sm text-red-600">{err}</p>}

      {!loading && responses.length === 0 && (
        <p className="text-sm text-zinc-500">No responses yet.</p>
      )}

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-3 text-lg font-semibold">Change admin password</h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setPwMsg(null);
            const res = await fetch("/api/admin/password", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ current: pwCurrent, next: pwNext }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) setPwMsg(data.error || "Failed");
            else {
              setPwMsg("Password updated.");
              setPwCurrent("");
              setPwNext("");
            }
          }}
          className="flex flex-wrap items-end gap-3"
        >
          <input
            type="password"
            placeholder="Current password"
            value={pwCurrent}
            onChange={(e) => setPwCurrent(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <input
            type="password"
            placeholder="New password (min 6)"
            value={pwNext}
            onChange={(e) => setPwNext(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <button
            type="submit"
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Update
          </button>
          {pwMsg && <p className="w-full text-sm text-zinc-600 dark:text-zinc-400">{pwMsg}</p>}
        </form>
      </section>

      {responses.length > 0 && (
        <div className="space-y-6">
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-3 text-lg font-semibold">Roles (Q1)</h2>
            <BarList data={roles} total={responses.length} />
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-3 text-lg font-semibold">Skills average (Q6)</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-zinc-500 dark:text-zinc-400">
                  <th className="py-1">Item</th>
                  <th className="py-1 text-right">Average</th>
                  <th className="py-1 text-right">n</th>
                </tr>
              </thead>
              <tbody>
                {skills.map((s) => (
                  <tr key={s.key} className="border-t border-zinc-100 dark:border-zinc-800">
                    <td className="py-1">{s.label}</td>
                    <td className="py-1 text-right">{s.avg}</td>
                    <td className="py-1 text-right">{s.n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-3 text-lg font-semibold">Barriers (Q13)</h2>
            <BarList data={barriers} total={responses.length} />
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-3 text-lg font-semibold">Facilities reliability (Q14)</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-zinc-500 dark:text-zinc-400">
                  <th className="py-1">Item</th>
                  <th className="py-1 text-right">Average</th>
                  <th className="py-1 text-right">n</th>
                  <th className="py-1 text-right">N/A</th>
                </tr>
              </thead>
              <tbody>
                {facilities.map((s) => (
                  <tr key={s.key} className="border-t border-zinc-100 dark:border-zinc-800">
                    <td className="py-1">{s.label}</td>
                    <td className="py-1 text-right">{s.avg}</td>
                    <td className="py-1 text-right">{s.n}</td>
                    <td className="py-1 text-right">{s.na}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-3 text-lg font-semibold">Views average (Q15)</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-zinc-500 dark:text-zinc-400">
                  <th className="py-1">Item</th>
                  <th className="py-1 text-right">Average</th>
                  <th className="py-1 text-right">n</th>
                </tr>
              </thead>
              <tbody>
                {views.map((s) => (
                  <tr key={s.key} className="border-t border-zinc-100 dark:border-zinc-800">
                    <td className="py-1">{s.label}</td>
                    <td className="py-1 text-right">{s.avg}</td>
                    <td className="py-1 text-right">{s.n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-3 text-lg font-semibold">Training topics (Q19)</h2>
            <BarList data={topics} total={responses.length} />
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-3 text-lg font-semibold">Open comments</h2>
            <div className="space-y-3">
              {responses
                .filter((r) => r.answers.q23 || r.answers.q24 || r.answers.q25)
                .map((r) => (
                  <div key={r.id} className="rounded-lg border border-zinc-100 p-3 text-sm dark:border-zinc-800">
                    {r.answers.q23 && <p><span className="font-medium">Q23:</span> {r.answers.q23}</p>}
                    {r.answers.q24 && <p><span className="font-medium">Q24:</span> {r.answers.q24}</p>}
                    {r.answers.q25 && <p><span className="font-medium">Q25:</span> {r.answers.q25}</p>}
                  </div>
                ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function BarList({ data, total }: { data: Record<string, number>; total: number }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  return (
    <div className="space-y-2">
      {entries.map(([label, count]) => (
        <div key={label} className="flex items-center gap-3 text-sm">
          <div className="w-64 shrink-0 text-zinc-700 dark:text-zinc-300">{label}</div>
          <div className="h-2 flex-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-2 rounded-full bg-blue-600"
              style={{ width: `${total ? Math.min(100, (count / total) * 100) : 0}%` }}
            />
          </div>
          <div className="w-12 text-right text-zinc-500 dark:text-zinc-400">
            {count}
          </div>
        </div>
      ))}
    </div>
  );
}
