import { NextResponse } from "next/server";
import { eq, asc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { pages } from "@/lib/db/schema";
import { getAuthUser } from "@/lib/auth/session";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  const db = getDb();

  const editionPages = await db
    .select()
    .from(pages)
    .where(eq(pages.editionId, id))
    .orderBy(asc(pages.pageNumber));

  return NextResponse.json(editionPages);
}
