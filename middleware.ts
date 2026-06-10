import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJwt, SESSION_COOKIE } from "@/lib/auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow the login page through — users need to authenticate there
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!token) {
    return handleUnauthenticated(request);
  }

  const payload = await verifyJwt(token);

  if (!payload) {
    return handleUnauthenticated(request);
  }

  // Inject auth headers so downstream API routes can call getAuthUser()
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", payload.userId);
  requestHeaders.set("x-user-email", payload.email);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

/**
 * For page routes → redirect to login (preserving the intended URL).
 * For API routes → return 401 JSON so the client can handle it.
 */
function handleUnauthenticated(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("callbackUrl", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
