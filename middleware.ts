import { NextRequest, NextResponse } from "next/server";
import { betterFetch } from "@better-fetch/fetch";

type Session = {
  user: { id: string; email: string; name: string | null; image: string | null };
  session: { id: string; expiresAt: string };
};

const PUBLIC_ROUTES = ["/login", "/register"];
const AUTH_ROUTES = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const { data: session } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL: request.nextUrl.origin,
      headers: { cookie: request.headers.get("cookie") ?? "" },
    }
  );

  const isAuthenticated = !!session;

  const isAuthRoute = AUTH_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + "/")
  );
  const isPublicRoute = PUBLIC_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + "/")
  );

  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(isAuthenticated ? "/chat" : "/login", request.url)
    );
  }

  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
