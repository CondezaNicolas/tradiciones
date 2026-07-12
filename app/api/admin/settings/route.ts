import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getContactInfo, updateContactInfo } from "@/lib/db/site-settings";
import { getAuthUser } from "@/lib/auth/session";

function normalize(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function GET(request: Request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const db = getDb();
  const contact = await getContactInfo(db);

  return NextResponse.json(contact);
}

export async function PATCH(request: Request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const email = normalize(body.email);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "El correo no tiene un formato válido" },
        { status: 400 },
      );
    }

    const contact = {
      phone: normalize(body.phone),
      whatsapp: normalize(body.whatsapp),
      email,
      address: normalize(body.address),
    };

    const db = getDb();
    const updated = await updateContactInfo(db, contact);

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Error al guardar la información de contacto" },
      { status: 500 },
    );
  }
}
