import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import ExcelJS from "exceljs";
import { getAllResponses, validateSession } from "@/lib/db";
import { SKILL_ITEMS, FACILITY_ITEMS, VIEW_ITEMS } from "@/lib/survey";

function sanitize(v: unknown): unknown {
  if (typeof v === "string") {
    const trimmed = v.trimStart();
    if (/^[=+\-@]/.test(trimmed)) return "'" + v;
  }
  return v;
}

export async function GET() {
  const store = await cookies();
  const token = store.get("admin_session")?.value;
  if (!token || !(await validateSession(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let responses;
  try {
    responses = await getAllResponses();
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Responses");

  const headers = [
    "id",
    "submittedAt",
    "q1 role",
    "q2 department",
    "q3 years",
    "q4 devices",
    "q5 internet",
    ...SKILL_ITEMS.map((i) => `q6 ${i.key}`),
    "q7 freq",
    "q8 where",
    "q8 other",
    "q9 use for",
    "q10 projector",
    "q11 files",
    "q12 share login",
    "q13 barriers",
    "q13 other",
    ...FACILITY_ITEMS.map((i) => `q14 ${i.key}`),
    ...VIEW_ITEMS.map((i) => `q15 ${i.key}`),
    "q16 records",
    "q16 other",
    "q17 records how",
    "q18 hours",
    "q19 topics",
    "q19 other",
    "q20 when",
    "q21 how learn",
    "q22 champion",
    "q23 biggest problem",
    "q24 recommendation",
    "q25 other",
  ];

  ws.addRow(headers);
  for (const r of responses) {
    const a = r.answers;
    ws.addRow([
      sanitize(r.id),
      sanitize(r.submittedAt),
      sanitize(a.q1 ?? ""),
      sanitize(a.q2 ?? ""),
      sanitize(a.q3 ?? ""),
      sanitize((a.q4 ?? []).join("; ")),
      sanitize(a.q5 ?? ""),
      ...SKILL_ITEMS.map((i) => sanitize(a.q6?.[i.key] ?? "")),
      sanitize(a.q7 ?? ""),
      sanitize((a.q8 ?? []).join("; ")),
      sanitize(a.q8Other ?? ""),
      sanitize((a.q9 ?? []).join("; ")),
      sanitize(a.q10 ?? ""),
      sanitize((a.q11 ?? []).join("; ")),
      sanitize(a.q12 ?? ""),
      sanitize((a.q13 ?? []).join("; ")),
      sanitize(a.q13Other ?? ""),
      ...FACILITY_ITEMS.map((i) => sanitize(a.q14?.[i.key] ?? "")),
      ...VIEW_ITEMS.map((i) => sanitize(a.q15?.[i.key] ?? "")),
      sanitize((a.q16 ?? []).join("; ")),
      sanitize(a.q16Other ?? ""),
      sanitize(a.q17 ?? ""),
      sanitize(a.q18 ?? ""),
      sanitize((a.q19 ?? []).join("; ")),
      sanitize(a.q19Other ?? ""),
      sanitize((a.q20 ?? []).join("; ")),
      sanitize((a.q21 ?? []).join("; ")),
      sanitize(a.q22 ?? ""),
      sanitize(a.q23 ?? ""),
      sanitize(a.q24 ?? ""),
      sanitize(a.q25 ?? ""),
    ]);
  }

  const buffer = await wb.xlsx.writeBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="makss-survey-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}