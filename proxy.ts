import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, expectedSessionToken } from "./lib/auth";

export const config = {
  matcher: ["/((?!login|api/auth/login|_next/static|_next/image|favicon.ico).*)"],
};

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const expected = await expectedSessionToken();

  if (token && token === expected) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}
