import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { editions } from "@/lib/db/schema";
import { getAuthUser } from "@/lib/auth/session";

export async function GET(request: Request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const db = getDb();
  const allEditions = await db
    .select()
    .from(editions)
    .orderBy(desc(editions.createdAt));

  return NextResponse.json(allEditions);
}

export async function POST(request: Request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, category, month, year, summary, coverImageUrl, status } =
      body as {
        title?: string;
        category?: string;
        month?: string;
        year?: string;
        summary?: string;
        coverImageUrl?: string;
        status?: "draft" | "published";
      };

    if (
      !title?.trim() ||
      !category?.trim() ||
      !month?.trim() ||
      !year?.trim()
    ) {
      return NextResponse.json(
        { error: "Título, categoría, mes y año son requeridos" },
        { status: 400 },
      );
    }

    const id = nanoid();
    const db = getDb();

    const [created] = await db
      .insert(editions)
      .values({
        id,
        title: title.trim(),
        category: category.trim(),
        month: month.trim(),
        year: year.trim(),
        summary: summary?.trim() || null,
        coverImageUrl: coverImageUrl?.trim() || null,
        status: status === "published" ? "published" : "draft",
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Error al crear la edición" },
      { status: 500 },
    );
  }
}
