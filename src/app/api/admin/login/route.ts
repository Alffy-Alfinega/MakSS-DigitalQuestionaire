import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getAdminPasswordHash, createSession } from "@/lib/db";
import { rateLimit, clientKey } from "@/lib/rateLimit";

export async function POST(req: Request) {
  const MAX_BYTES = 1024 * 4;
  const cl = Number(req.headers.get("content-length") ?? 0);
  if (cl && cl > MAX_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  const key = clientKey(req);
  if (!rateLimit(`login:${key}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

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
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}