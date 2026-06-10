import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { EditionEditorClient, type EditionData } from "./edition-editor-client";

interface EditionEditorPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditionEditorPage({ params }: EditionEditorPageProps) {
  const { id } = await params;
  const headersList = await headers();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/admin/editions/${id}`, {
    cache: "no-store",
    headers: {
      cookie: headersList.get("cookie") ?? "",
    },
  });

  if (!res.ok) {
    if (res.status === 404) notFound();
    throw new Error("Error al cargar la edición");
  }

  const edition: EditionData = await res.json();

  return <EditionEditorClient initialEdition={edition} />;
}
