import { NextRequest, NextResponse } from "next/server";
import {
  MISSING_PASSWORD_MESSAGE,
  SESSION_COOKIE,
  expectedSessionToken,
  isAuthConfigured,
  isValidPassword,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  // Checked before comparing: without APP_PASSWORD every attempt would fail as
  // "wrong password", which points at the wrong problem.
  if (!isAuthConfigured()) {
    return NextResponse.json({ error: MISSING_PASSWORD_MESSAGE }, { status: 503 });
  }

  const { password } = (await request.json()) as { password?: string };

  if (!password || !(await isValidPassword(password))) {
    return NextResponse.json({ error: "Password salah" }, { status: 401 });
  }

  const token = await expectedSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
