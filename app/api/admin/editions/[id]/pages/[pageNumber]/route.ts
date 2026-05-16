import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { eq, and } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { pages } from "@/lib/db/schema";
import { getAuthUser } from "@/lib/auth/session";

type RouteContext = {
  params: Promise<{ id: string; pageNumber: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id, pageNumber } = await context.params;
  const page = Number(pageNumber);

  if (Number.isNaN(page) || page < 0) {
    return NextResponse.json(
      { error: "Número de página inválido" },
      { status: 400 },
    );
  }

  const db = getDb();

  const [result] = await db
    .select()
    .from(pages)
    .where(and(eq(pages.editionId, id), eq(pages.pageNumber, page)))
    .limit(1);

  if (!result) {
    return NextResponse.json(
      { error: "Página no encontrada" },
      { status: 404 },
    );
  }

  return NextResponse.json(result);
}

export async function PUT(request: Request, context: RouteContext) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id, pageNumber } = await context.params;
  const page = Number(pageNumber);

  if (Number.isNaN(page) || page < 0) {
    return NextResponse.json(
      { error: "Número de página inválido" },
      { status: 400 },
    );
  }

  try {
    const body = await request.json();
    const { fabricJson, thumbnailUrl } = body as {
      fabricJson?: unknown;
      thumbnailUrl?: string;
    };

    if (fabricJson === undefined) {
      return NextResponse.json(
        { error: "fabricJson es requerido" },
        { status: 400 },
      );
    }

    const db = getDb();

    // Try to find existing page
    const [existing] = await db
      .select({ id: pages.id })
      .from(pages)
      .where(and(eq(pages.editionId, id), eq(pages.pageNumber, page)))
      .limit(1);

    if (existing) {
      // Update existing page
      const [updated] = await db
        .update(pages)
        .set({
          fabricJson: JSON.stringify(fabricJson),
          thumbnailUrl: thumbnailUrl ?? null,
          updatedAt: new Date(),
        })
        .where(eq(pages.id, existing.id))
        .returning();

      return NextResponse.json(updated);
    }

    // Insert new page
    const [created] = await db
      .insert(pages)
      .values({
        id: nanoid(),
        editionId: id,
        pageNumber: page,
        fabricJson: JSON.stringify(fabricJson),
        thumbnailUrl: thumbnailUrl ?? null,
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Error al guardar la página" },
      { status: 500 },
    );
  }
}
