import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { editions } from "@/lib/db/schema";

export async function GET() {
  const db = getDb();

  const published = await db
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
    .where(eq(editions.status, "published"))
    .orderBy(desc(editions.createdAt));

  return NextResponse.json(published);
}
