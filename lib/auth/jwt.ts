import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-me";
const SECRET = new TextEncoder().encode(JWT_SECRET);

export const SESSION_COOKIE = "session";

export interface SessionPayload {
  [key: string]: unknown;
  userId: string;
  email: string;
  role: string;
}

/**
 * Sign a JWT with the session payload.
 * Expires in 24 hours.
 */
export async function signJwt(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .setIssuedAt()
    .sign(SECRET);
}

/**
 * Verify and decode a JWT token.
 * Returns null if the token is invalid, expired, or any error occurs.
 */
export async function verifyJwt(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify<SessionPayload>(token, SECRET);
    return payload;
  } catch {
    return null;
  }
}
