import { notFound } from "next/navigation";
import { EditionEditorClient, type EditionData } from "./edition-editor-client";
import { getDb } from "@/lib/db";
import { editions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface EditionEditorPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditionEditorPage({ params }: EditionEditorPageProps) {
  const { id } = await params;

  const db = getDb();
  const edition = await db.query.editions.findFirst({
    where: eq(editions.id, id),
  });

  if (!edition) notFound();

  const editionData: EditionData = {
    id: edition.id,
    title: edition.title,
    category: edition.category,
    month: edition.month,
    year: edition.year,
    summary: edition.summary,
    coverImageUrl: edition.coverImageUrl,
    status: edition.status,
  };

  return <EditionEditorClient initialEdition={editionData} />;
}
