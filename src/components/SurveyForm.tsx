"use client";

import { useEffect, useMemo, useState } from "react";
import type { SurveyAnswers } from "@/lib/survey";
import {
  SKILL_ITEMS,
  FACILITY_ITEMS,
  VIEW_ITEMS,
} from "@/lib/survey";

const DRAFT_KEY = "makss-survey-draft";

type Props = { onSubmitted?: (id: string) => void };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{title}</h2>
      {children}
    </section>
  );
}

function QuestionLabel({ n, text, hint }: { n: number; text: string; hint?: string }) {
  return (
    <div className="mb-2">
      <p className="font-medium text-zinc-900 dark:text-zinc-50">
        {n}. {text}
      </p>
      {hint && <p className="text-sm text-zinc-500 dark:text-zinc-400">{hint}</p>}
    </div>
  );
}

function RadioGroup({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: string[];
  value?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <label
          key={opt}
          className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
            value === opt
              ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200"
              : "border-zinc-300 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          }`}
        >
          <input
            type="radio"
            name={name}
            value={opt}
            checked={value === opt}
            onChange={() => onChange(opt)}
            className="sr-only"
          />
          {opt}
        </label>
      ))}
    </div>
  );
}

function CheckboxGroup({
  options,
  value,
  onChange,
  max,
  otherKey,
  otherValue,
  onOtherChange,
}: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  max?: number;
  otherKey?: string;
  otherValue?: string;
  onOtherChange?: (v: string) => void;
}) {
  const toggle = (opt: string) => {
    if (value.includes(opt)) {
      onChange(value.filter((x) => x !== opt));
    } else {
      if (max && value.length >= max) return;
      onChange([...value, opt]);
    }
  };
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const checked = value.includes(opt);
          const disabled = !checked && !!max && value.length >= max;
          return (
            <label
              key={opt}
              className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                checked
                  ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200"
                  : disabled
                  ? "cursor-not-allowed border-zinc-200 text-zinc-400 dark:border-zinc-800 dark:text-zinc-600"
                  : "border-zinc-300 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={() => toggle(opt)}
                className="sr-only"
              />
              {opt}
            </label>
          );
        })}
      </div>
      {max && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {value.length}/{max} selected
        </p>
      )}
      {otherKey && value.includes("Other") && onOtherChange && (
        <input
          type="text"
          placeholder="Other (please specify)"
          value={otherValue ?? ""}
          onChange={(e) => onOtherChange(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
      )}
    </div>
  );
}

function Matrix({
  items,
  columns,
  value,
  onChange,
  allowNA,
  legend,
}: {
  items: readonly { key: string; label: string }[];
  columns: number[];
  value?: Record<string, string>;
  onChange: (v: Record<string, string>) => void;
  allowNA?: boolean;
  legend?: string;
}) {
  const cols = allowNA ? [...columns, 0] : columns; // 0 represents N/A
  const naLabel = "N/A";
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-zinc-500 dark:text-zinc-400">
            <th className="py-1 pr-2 font-normal"></th>
            {columns.map((c) => (
              <th key={c} className="px-1 text-center font-normal">
                {c}
              </th>
            ))}
            {allowNA && <th className="px-1 text-center font-normal">N/A</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.key} className="border-t border-zinc-100 dark:border-zinc-800">
              <td className="py-2 pr-2 text-zinc-800 dark:text-zinc-200">{it.label}</td>
              {columns.map((c) => (
                <td key={c} className="px-1 text-center">
                  <input
                    type="radio"
                    name={`m-${it.key}`}
                    checked={value?.[it.key] === String(c)}
                    onChange={() => onChange({ ...(value ?? {}), [it.key]: String(c) })}
                    className="h-4 w-4 accent-blue-600"
                  />
                </td>
              ))}
              {allowNA && (
                <td className="px-1 text-center">
                  <input
                    type="radio"
                    name={`m-${it.key}`}
                    checked={value?.[it.key] === "NA"}
                    onChange={() => onChange({ ...(value ?? {}), [it.key]: "NA" })}
                    className="h-4 w-4 accent-blue-600"
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        {legend ??
          (allowNA
            ? "1 = very unreliable … 5 = very reliable. Use N/A if you do not use it."
            : "1 = I cannot do this … 5 = very confident, I could teach others.")}
      </p>
    </div>
  );
}

export default function SurveyForm({ onSubmitted }: Props) {
  const [answers, setAnswers] = useState<SurveyAnswers>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) setAnswers(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(answers));
      } catch {}
    }
  }, [answers, loaded]);

  const set = <K extends keyof SurveyAnswers>(k: K, v: SurveyAnswers[K]) =>
    setAnswers((a) => ({ ...a, [k]: v }));

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {}
      onSubmitted?.(data.id);
    } catch (e) {
      // fallback to local storage
      try {
        const key = "makss-survey-responses";
        const list = JSON.parse(localStorage.getItem(key) || "[]");
        const entry = { id: crypto.randomUUID(), submittedAt: new Date().toISOString(), answers };
        list.push(entry);
        localStorage.setItem(key, JSON.stringify(list));
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch {}
        onSubmitted?.(entry.id);
      } catch {
        setError("Could not submit. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const departments = [
    "Sciences",
    "Mathematics",
    "Languages",
    "Humanities",
    "Business and Entrepreneurship",
    "Technical and practical subjects",
    "ICT / Computer Studies",
    "Physical Education",
    "Other",
    "I do not teach",
  ];

  const roles = [
    "Teaching staff",
    "Administration (office, bursary, registry)",
    "Support staff (lab, library, kitchen, security, grounds, etc.)",
    "School leadership",
  ];

  const years = ["Less than 1 year", "1 to 3 years", "4 to 10 years", "More than 10 years"];
  const devices = ["Smartphone", "Laptop", "Tablet", "None"];
  const internet = ["Yes, usually", "Sometimes", "Rarely or never"];
  const freqComp = ["Every day", "A few times a week", "About once a week", "Rarely", "Never"];
  const locations = ["Computer lab", "Staffroom", "Office", "At home", "On my phone", "Other"];
  const uses = [
    "Lesson notes and schemes of work",
    "Marks and records",
    "Setting tests and exams",
    "Presentations",
    "Research and reading",
    "Communication (messages, email)",
    "Showing videos in class",
    "Reports and letters",
    "Other",
  ];
  const projFreq = [
    "Weekly or more",
    "About monthly",
    "Rarely",
    "Never (I could, but do not)",
    "No projector available to me",
  ];
  const fileLocs = [
    "School computer",
    "My own laptop",
    "My phone",
    "Flash drive",
    "Online storage (e.g. Google Drive)",
    "Paper only",
  ];
  const share = ["No", "Sometimes", "Yes, often"];
  const barriers = [
    "Not enough computers",
    "Slow or no internet",
    "Power cuts",
    "I do not know how",
    "No time",
    "No suitable teaching content",
    "No help when something breaks",
    "Fear of breaking or losing something",
    "Equipment is locked away or hard to get",
    "Other",
  ];
  const records = [
    "Student registration",
    "Attendance",
    "Marks and report cards",
    "Fees and receipts",
    "Staff records and payroll",
    "Timetable",
    "Library or stores",
    "Parent communication",
    "Other",
  ];
  const recordHow = ["Paper and books", "Excel or similar", "A software system", "A mix"];
  const recHours = ["Less than 2", "2 to 5", "6 to 10", "More than 10"];
  const trainTopics = [
    "Typing and documents",
    "Spreadsheets for marks",
    "Email and internet",
    "Using the projector",
    "Making presentations",
    "Educational videos and websites",
    "Using AI tools safely",
    "Keeping files safe and backed up",
    "Online safety and data protection",
    "Fixing simple computer problems",
    "Other",
  ];
  const trainWhen = [
    "Weekday after lessons",
    "During free periods",
    "Saturday",
    "School holidays",
    "I am not available",
  ];
  const trainHow = [
    "Group workshop",
    "One-to-one help",
    "Short videos",
    "Printed step-by-step guide",
    "Learning by doing in class, with support",
  ];
  const champion = ["Yes", "Maybe", "No"];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
        <p className="font-semibold">Anonymous survey</p>
        <p>
          Please do not write your name. It is voluntary and takes about 10 minutes. There are no right or wrong answers. Results are reported only as group totals. Your draft is saved automatically on this device.
        </p>
      </div>

      <Section title="Section A: About your work">
        <div>
          <QuestionLabel n={1} text="What is your main role?" />
          <RadioGroup name="q1" options={roles} value={answers.q1} onChange={(v) => set("q1", v)} />
        </div>
        <div>
          <QuestionLabel n={2} text="If you teach, which department are you mainly in? (Skip if you do not teach.)" />
          <RadioGroup name="q2" options={departments} value={answers.q2} onChange={(v) => set("q2", v)} />
        </div>
        <div>
          <QuestionLabel n={3} text="How long have you worked at this school?" />
          <RadioGroup name="q3" options={years} value={answers.q3} onChange={(v) => set("q3", v)} />
        </div>
        <div>
          <QuestionLabel n={4} text="Which devices do you own that you can use for work? (Tick all that apply.)" />
          <CheckboxGroup
            options={devices}
            value={answers.q4 ?? []}
            onChange={(v) => set("q4", v)}
          />
        </div>
        <div>
          <QuestionLabel n={5} text="Can you get internet when you need it for work (at school or with your own data)?" />
          <RadioGroup name="q5" options={internet} value={answers.q5} onChange={(v) => set("q5", v)} />
        </div>
      </Section>

      <Section title="Section B: Your skills">
        <QuestionLabel
          n={6}
          text="How well can you do each of these? Tick one box on each line."
          hint="1 = I cannot do this  2 = only with help  3 = basic, slowly  4 = confident  5 = very confident, I could teach others"
        />
        <Matrix
          items={SKILL_ITEMS}
          columns={[1, 2, 3, 4, 5]}
          value={answers.q6}
          onChange={(v) => set("q6", v)}
          legend="1 = I cannot do this  2 = only with help  3 = basic, slowly  4 = confident  5 = very confident, I could teach others"
        />
      </Section>

      <Section title="Section C: How you use technology now">
        <div>
          <QuestionLabel n={7} text="How often do you use a computer or phone for school work?" />
          <RadioGroup name="q7" options={freqComp} value={answers.q7} onChange={(v) => set("q7", v)} />
        </div>
        <div>
          <QuestionLabel n={8} text="Where do you use technology for school work? (Tick all that apply.)" />
          <CheckboxGroup
            options={locations}
            value={answers.q8 ?? []}
            onChange={(v) => set("q8", v)}
            otherKey="Other"
            otherValue={answers.q8Other}
            onOtherChange={(v) => set("q8Other", v)}
          />
        </div>
        <div>
          <QuestionLabel n={9} text="What do you use it for? (Tick all that apply.)" />
          <CheckboxGroup
            options={uses}
            value={answers.q9 ?? []}
            onChange={(v) => set("q9", v)}
          />
        </div>
        <div>
          <QuestionLabel n={10} text="How often do you use a projector in lessons?" />
          <RadioGroup name="q10" options={projFreq} value={answers.q10} onChange={(v) => set("q10", v)} />
        </div>
        <div>
          <QuestionLabel n={11} text="Where do you keep important school files? (Tick all that apply.)" />
          <CheckboxGroup
            options={fileLocs}
            value={answers.q11 ?? []}
            onChange={(v) => set("q11", v)}
          />
        </div>
        <div>
          <QuestionLabel n={12} text="Do you share a login, password or account with colleagues?" />
          <RadioGroup name="q12" options={share} value={answers.q12} onChange={(v) => set("q12", v)} />
        </div>
      </Section>

      <Section title="Section D: What gets in the way">
        <QuestionLabel n={13} text="What gets in the way of using technology in your work? (Tick up to three.)" />
        <CheckboxGroup
          options={barriers}
          value={answers.q13 ?? []}
          onChange={(v) => set("q13", v)}
          max={3}
          otherKey="Other"
          otherValue={answers.q13Other}
          onOtherChange={(v) => set("q13Other", v)}
        />
      </Section>

      <Section title="Section E: Facilities at school">
        <QuestionLabel
          n={14}
          text="How reliable are these at school? Tick one box on each line. Use N/A if you do not use it."
          hint="1 = very unreliable  2 = unreliable  3 = sometimes  4 = reliable  5 = very reliable"
        />
        <Matrix
          items={FACILITY_ITEMS}
          columns={[1, 2, 3, 4, 5]}
          value={answers.q14}
          onChange={(v) => set("q14", v)}
          allowNA
          legend="1 = very unreliable  2 = unreliable  3 = sometimes  4 = reliable  5 = very reliable. Use N/A if you do not use it."
        />
      </Section>

      <Section title="Section F: Your views">
        <QuestionLabel
          n={15}
          text="How much do you agree with each statement? Tick one box on each line."
          hint="1 = strongly disagree  2 = disagree  3 = not sure  4 = agree  5 = strongly agree"
        />
        <Matrix
          items={VIEW_ITEMS}
          columns={[1, 2, 3, 4, 5]}
          value={answers.q15}
          onChange={(v) => set("q15", v)}
          legend="1 = strongly disagree  2 = disagree  3 = not sure  4 = agree  5 = strongly agree"
        />
      </Section>

      <Section title="Section G: School records (administration staff only; others skip to Section H)">
        <div>
          <QuestionLabel n={16} text="Which records do you handle? (Tick all that apply.)" />
          <CheckboxGroup
            options={records}
            value={answers.q16 ?? []}
            onChange={(v) => set("q16", v)}
            otherKey="Other"
            otherValue={answers.q16Other}
            onOtherChange={(v) => set("q16Other", v)}
          />
        </div>
        <div>
          <QuestionLabel n={17} text="How are these records mainly kept?" />
          <RadioGroup name="q17" options={recordHow} value={answers.q17} onChange={(v) => set("q17", v)} />
        </div>
        <div>
          <QuestionLabel n={18} text="About how many hours a week do you spend on record keeping?" />
          <RadioGroup name="q18" options={recHours} value={answers.q18} onChange={(v) => set("q18", v)} />
        </div>
      </Section>

      <Section title="Section H: Training and support">
        <div>
          <QuestionLabel n={19} text="Which topics would help you most? (Tick up to four.)" />
          <CheckboxGroup
            options={trainTopics}
            value={answers.q19 ?? []}
            onChange={(v) => set("q19", v)}
            max={4}
            otherKey="Other"
            otherValue={answers.q19Other}
            onOtherChange={(v) => set("q19Other", v)}
          />
        </div>
        <div>
          <QuestionLabel n={20} text="When can you attend training? (Tick all that apply.)" />
          <CheckboxGroup
            options={trainWhen}
            value={answers.q20 ?? []}
            onChange={(v) => set("q20", v)}
          />
        </div>
        <div>
          <QuestionLabel n={21} text="How would you like to learn? (Tick all that apply.)" />
          <CheckboxGroup
            options={trainHow}
            value={answers.q21 ?? []}
            onChange={(v) => set("q21", v)}
          />
        </div>
        <div>
          <QuestionLabel n={22} text="Would you help colleagues as an ICT champion if you were trained? (If yes, tell the Digital Manager in person. Do not write your name here.)" />
          <RadioGroup name="q22" options={champion} value={answers.q22} onChange={(v) => set("q22", v)} />
        </div>
      </Section>

      <Section title="Section I: In your own words">
        <div>
          <QuestionLabel n={23} text="What is the biggest ICT problem in your work?" />
          <textarea
            value={answers.q23 ?? ""}
            onChange={(e) => set("q23", e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
        <div>
          <QuestionLabel n={24} text="Which recommendation or suggestion would you put forward to overcome the challenge(s) stated?" />
          <textarea
            value={answers.q24 ?? ""}
            onChange={(e) => set("q24", e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
        <div>
          <QuestionLabel n={25} text="Is there anything else you want to tell us?" />
          <textarea
            value={answers.q25 ?? ""}
            onChange={(e) => set("q25", e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
      </Section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            if (confirm("Clear all answers on this device?")) {
              setAnswers({});
              try {
                localStorage.removeItem(DRAFT_KEY);
              } catch {}
            }
          }}
          className="rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          className="rounded-full bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Submit survey"}
        </button>
      </div>
    </div>
  );
}
