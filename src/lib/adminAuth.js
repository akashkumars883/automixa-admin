import { NextResponse } from "next/server";

export const ADMIN_COOKIE_NAME = "automixa_admin";

export function getAdminSessionToken() {
  return process.env.ADMIN_SESSION_TOKEN || "";
}

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "";
}

export function isAdminAuthedFromRequest(request) {
  const token = getAdminSessionToken();
  if (!token) return false;
  return request.cookies.get(ADMIN_COOKIE_NAME)?.value === token;
}

export function requireAdminFromRequest(request) {
  if (!isAdminAuthedFromRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

