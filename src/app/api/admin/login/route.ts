import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getAdminPasswordHash, createSession } from "@/lib/db";

export async function POST(req: Request) {
  let body: { password?: string } = {};
  try {
    body = await req.json();
  } catch {}
  const password = body.password ?? "";
  const hash = await getAdminPasswordHash();
  if (!hash) {
    return NextResponse.json({ error: "No admin configured" }, { status: 500 });
  }
  const ok = await bcrypt.compare(password, hash);
  if (!ok) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }
  const token = await createSession(7);
  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_session", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
