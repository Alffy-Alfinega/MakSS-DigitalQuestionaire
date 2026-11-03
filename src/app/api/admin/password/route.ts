import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { validateSession, getAdminPasswordHash, setAdminPasswordHash } from "@/lib/db";

export async function POST(req: Request) {
  const store = await cookies();
  const token = store.get("admin_session")?.value;
  if (!token || !(await validateSession(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: { current?: string; next?: string } = {};
  try {
    body = await req.json();
  } catch {}
  const current = body.current ?? "";
  const next = body.next ?? "";
  if (next.length < 6) {
    return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });
  }
  const hash = await getAdminPasswordHash();
  if (!hash || !(await bcrypt.compare(current, hash))) {
    return NextResponse.json({ error: "Current password is wrong" }, { status: 401 });
  }
  const newHash = await bcrypt.hash(next, 10);
  await setAdminPasswordHash(newHash);
  return NextResponse.json({ ok: true });
}
