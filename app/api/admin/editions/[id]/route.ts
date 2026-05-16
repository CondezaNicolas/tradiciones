import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { editions, pages } from "@/lib/db/schema";
import { getAuthUser } from "@/lib/auth/session";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  const db = getDb();

  const [edition] = await db
    .select()
    .from(editions)
    .where(eq(editions.id, id))
    .limit(1);

  if (!edition) {
    return NextResponse.json(
      { error: "Edición no encontrada" },
      { status: 404 },
    );
  }

  const editionPages = await db
    .select()
    .from(pages)
    .where(eq(pages.editionId, id))
    .orderBy(pages.pageNumber);

  return NextResponse.json({ ...edition, pages: editionPages });
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  const db = getDb();

  const [existing] = await db
    .select({ id: editions.id })
    .from(editions)
    .where(eq(editions.id, id))
    .limit(1);

  if (!existing) {
    return NextResponse.json(
      { error: "Edición no encontrada" },
      { status: 404 },
    );
  }

  try {
    const body = await request.json();
    const {
      title,
      category,
      month,
      year,
      summary,
      coverImageUrl,
      status,
    } = body as {
      title?: string;
      category?: string;
      month?: string;
      year?: string;
      summary?: string;
      coverImageUrl?: string;
      status?: "draft" | "published";
    };

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (title !== undefined) updateData.title = title;
    if (category !== undefined) updateData.category = category;
    if (month !== undefined) updateData.month = month;
    if (year !== undefined) updateData.year = year;
    if (summary !== undefined) updateData.summary = summary;
    if (coverImageUrl !== undefined) updateData.coverImageUrl = coverImageUrl;
    if (status !== undefined) updateData.status = status;

    const [updated] = await db
      .update(editions)
      .set(updateData)
      .where(eq(editions.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Error al actualizar la edición" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  const db = getDb();

  const [existing] = await db
    .select({ id: editions.id })
    .from(editions)
    .where(eq(editions.id, id))
    .limit(1);

  if (!existing) {
    return NextResponse.json(
      { error: "Edición no encontrada" },
      { status: 404 },
    );
  }

  // Cascade will handle pages and images deletion
  await db.delete(editions).where(eq(editions.id, id));

  return new NextResponse(null, { status: 204 });
}
