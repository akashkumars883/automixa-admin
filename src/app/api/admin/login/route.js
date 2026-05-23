import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, getAdminPassword, getAdminSessionToken } from "@/lib/adminAuth";

export async function POST(request) {
  const { password } = await request.json().catch(() => ({}));

  const adminPassword = getAdminPassword();
  const adminToken = getAdminSessionToken();

  if (!adminPassword || !adminToken) {
    return NextResponse.json(
      { error: "Admin auth not configured" },
      { status: 500 }
    );
  }

  if (typeof password !== "string" || password !== adminPassword) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, adminToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}

