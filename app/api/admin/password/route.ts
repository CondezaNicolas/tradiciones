import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";
import { getAuthUser } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

export async function PATCH(request: Request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body as {
      currentPassword?: string;
      newPassword?: string;
    };

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Ambas contraseñas son requeridas" },
        { status: 400 },
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "La nueva contraseña debe tener al menos 8 caracteres" },
        { status: 400 },
      );
    }

    const db = getDb();

    const [admin] = await db
      .select({ id: adminUsers.id, passwordHash: adminUsers.passwordHash })
      .from(adminUsers)
      .where(eq(adminUsers.id, user.userId))
      .limit(1);

    if (!admin) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    const isValid = await verifyPassword(currentPassword, admin.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Contraseña actual incorrecta" },
        { status: 400 },
      );
    }

    const newHash = await hashPassword(newPassword);
    await db
      .update(adminUsers)
      .set({ passwordHash: newHash })
      .where(eq(adminUsers.id, admin.id));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Error al cambiar la contraseña" },
      { status: 500 },
    );
  }
}
