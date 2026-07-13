import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword } from "@/lib/auth/password";
import { setSession } from "@/lib/auth/session";
import { checkRateLimit, recordFailure, resetAttempts } from "@/lib/auth/rate-limit";

// A valid bcrypt hash used to normalise response timing when the account
// doesn't exist, so an attacker can't enumerate emails by measuring latency.
// (bcrypt hash of a random string — never matches any real password.)
const DUMMY_HASH =
  "$2b$12$Ft2LvKFYsvLfgIrFd5wkAOgWwCJ9jS0gLoFJJuneL4QveASRhyJ6i";

function clientKey(request: Request, email: string): string {
  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim() || "unknown";
  return `${ip}:${email.toLowerCase()}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body as { email?: string; password?: string };

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 },
      );
    }

    const key = clientKey(request, email);
    const limit = checkRateLimit(key);
    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: `Demasiados intentos fallidos. Intenta de nuevo en ${Math.ceil(
            limit.retryAfterSec / 60,
          )} minutos.`,
        },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
      );
    }

    const db = getDb();
    const [user] = await db
      .select({
        id: adminUsers.id,
        email: adminUsers.email,
        name: adminUsers.name,
        role: adminUsers.role,
        passwordHash: adminUsers.passwordHash,
      })
      .from(adminUsers)
      .where(eq(adminUsers.email, email))
      .limit(1);

    // Always run a bcrypt comparison (against a dummy hash if the user is
    // missing) so success and failure take comparable time.
    const valid = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);

    if (!user || !valid) {
      recordFailure(key);
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 },
      );
    }

    resetAttempts(key);

    await setSession({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
