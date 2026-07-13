import { SignJWT, jwtVerify } from "jose";

/**
 * Resolve the signing secret from the environment, lazily so a missing
 * value fails loudly at request time (never falls back to a shared/known
 * secret that would let anyone forge admin sessions).
 */
function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "JWT_SECRET no está configurado (o es demasiado corto). Define una cadena aleatoria de al menos 16 caracteres antes de arrancar.",
    );
  }
  return new TextEncoder().encode(secret);
}

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
    .sign(getSecret());
}

/**
 * Verify and decode a JWT token.
 * Returns null if the token is invalid, expired, or any error occurs.
 */
export async function verifyJwt(
  token: string,
): Promise<SessionPayload | null> {
  // Resolve the secret outside the try so a missing-secret misconfiguration
  // throws loudly instead of being swallowed as an "invalid token".
  const secret = getSecret();
  try {
    const { payload } = await jwtVerify<SessionPayload>(token, secret);
    return payload;
  } catch {
    return null;
  }
}
