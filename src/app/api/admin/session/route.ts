import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateSession } from "@/lib/db";

export async function GET() {
  const store = await cookies();
  const token = store.get("admin_session")?.value;
  const authed = token ? await validateSession(token) : false;
  return NextResponse.json({ authenticated: authed });
}
