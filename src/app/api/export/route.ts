import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import ExcelJS from "exceljs";
import { getAllResponses, validateSession } from "@/lib/db";
import { SKILL_ITEMS, FACILITY_ITEMS, VIEW_ITEMS } from "@/lib/survey";

export async function GET() {
  const store = await cookies();
  const token = store.get("admin_session")?.value;
  if (!token || !(await validateSession(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const responses = await getAllResponses();

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
    "q9 use for",
    "q10 projector",
    "q11 files",
    "q12 share login",
    "q13 barriers",
    "q13 other",
    ...FACILITY_ITEMS.map((i) => `q14 ${i.key}`),
    ...VIEW_ITEMS.map((i) => `q15 ${i.key}`),
    "q16 records",
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
      r.id,
      r.submittedAt,
      a.q1 ?? "",
      a.q2 ?? "",
      a.q3 ?? "",
      (a.q4 ?? []).join("; "),
      a.q5 ?? "",
      ...SKILL_ITEMS.map((i) => a.q6?.[i.key] ?? ""),
      a.q7 ?? "",
      (a.q8 ?? []).join("; "),
      (a.q9 ?? []).join("; "),
      a.q10 ?? "",
      (a.q11 ?? []).join("; "),
      a.q12 ?? "",
      (a.q13 ?? []).join("; "),
      a.q13Other ?? "",
      ...FACILITY_ITEMS.map((i) => a.q14?.[i.key] ?? ""),
      ...VIEW_ITEMS.map((i) => a.q15?.[i.key] ?? ""),
      (a.q16 ?? []).join("; "),
      a.q17 ?? "",
      a.q18 ?? "",
      (a.q19 ?? []).join("; "),
      a.q19Other ?? "",
      (a.q20 ?? []).join("; "),
      (a.q21 ?? []).join("; "),
      a.q22 ?? "",
      a.q23 ?? "",
      a.q24 ?? "",
      a.q25 ?? "",
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
