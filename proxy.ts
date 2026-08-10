import { NextRequest, NextResponse } from "next/server";
import {
  MISSING_PASSWORD_MESSAGE,
  SESSION_COOKIE,
  expectedSessionToken,
  isAuthConfigured,
} from "./lib/auth";

export const config = {
  matcher: ["/((?!login|api/auth/login|_next/static|_next/image|favicon.ico).*)"],
};

export async function proxy(request: NextRequest) {
  // Still fails closed, but says which variable is missing instead of throwing
  // an opaque 500 on every route.
  if (!isAuthConfigured()) {
    return new NextResponse(MISSING_PASSWORD_MESSAGE, {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const expected = await expectedSessionToken();

  if (token && token === expected) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}
