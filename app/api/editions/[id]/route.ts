import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { editions, pages } from "@/lib/db/schema";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const db = getDb();

  const [edition] = await db
    .select({
      id: editions.id,
      title: editions.title,
      category: editions.category,
      month: editions.month,
      year: editions.year,
      summary: editions.summary,
      coverImageUrl: editions.coverImageUrl,
      createdAt: editions.createdAt,
    })
    .from(editions)
    .where(and(eq(editions.id, id), eq(editions.status, "published")))
    .limit(1);

  if (!edition) {
    return NextResponse.json(
      { error: "Edición no encontrada" },
      { status: 404 },
    );
  }

  // Thumbnails only — no fabricJson (editor-only payload)
  const editionPages = await db
    .select({
      id: pages.id,
      pageNumber: pages.pageNumber,
      thumbnailUrl: pages.thumbnailUrl,
    })
    .from(pages)
    .where(eq(pages.editionId, id))
    .orderBy(pages.pageNumber);

  return NextResponse.json({ ...edition, pages: editionPages });
}
