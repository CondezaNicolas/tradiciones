import { cookies } from "next/headers";
import { signJwt, verifyJwt, SESSION_COOKIE } from "./jwt";
import type { SessionPayload } from "./jwt";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 86400, // 24 hours in seconds
};

/**
 * Create a session by signing a JWT and setting it as an httpOnly cookie.
 */
export async function setSession(payload: SessionPayload): Promise<void> {
  const [token, cookieStore] = await Promise.all([signJwt(payload), cookies()]);
  cookieStore.set(SESSION_COOKIE, token, COOKIE_OPTIONS);
}

/**
 * Read and verify the current session from the cookie.
 * Returns null if no cookie exists or the JWT is invalid/expired.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE);

  if (!cookie?.value) return null;

  return verifyJwt(cookie.value);
}

/**
 * Read auth info from middleware-injected request headers.
 * Use this in API routes instead of getSession() to avoid double JWT verification.
 * Returns null if headers are missing (unauthenticated).
 */
export function getAuthUser(request: Request): { userId: string; email: string } | null {
  const userId = request.headers.get("x-user-id");
  const email = request.headers.get("x-user-email");

  if (!userId || !email) return null;

  return { userId, email };
}

/**
 * Clear the session cookie by setting maxAge to 0.
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", { ...COOKIE_OPTIONS, maxAge: 0 });
}
