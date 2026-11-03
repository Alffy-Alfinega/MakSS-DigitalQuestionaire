import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAllResponses, insertResponse, deleteAllResponses, validateSession } from "@/lib/db";
import { rateLimit, clientKey } from "@/lib/rateLimit";

async function isAdmin() {
  const store = await cookies();
  const token = store.get("admin_session")?.value;
  return token ? validateSession(token) : false;
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const list = await getAllResponses();
    return NextResponse.json({ responses: list, count: list.length });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const MAX_BYTES = 1024 * 256;
  const cl = Number(req.headers.get("content-length") ?? 0);
  if (cl && cl > MAX_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  const key = clientKey(req);
  if (!rateLimit(`submit:${key}`, 20, 60 * 1000)) {
    return NextResponse.json({ error: "Too many submissions. Try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const answers = (body as { answers?: unknown })?.answers;
  if (!answers || typeof answers !== "object") {
    return NextResponse.json({ error: "Missing answers" }, { status: 400 });
  }
  try {
    const id = await insertResponse(answers);
    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function DELETE() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await deleteAllResponses();
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
