import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getAuthUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { images } from "@/lib/db/schema";
import { uploadImageFile } from "@/lib/storage/server";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: Request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No se proporcionó un archivo" },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Tipo de archivo no permitido. Solo JPEG, PNG, WebP" },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "El archivo excede el tamaño máximo de 10MB" },
        { status: 400 },
      );
    }

    const { url } = await uploadImageFile(file);

    // Populate images table if editionId is provided
    const editionId = (formData.get("editionId") as string) ?? null;
    if (editionId) {
      const db = getDb();
      await db.insert(images).values({
        id: nanoid(),
        editionId,
        url,
        originalFilename: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
      });
    }

    return NextResponse.json({ url }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Error al subir el archivo" },
      { status: 500 },
    );
  }
}
