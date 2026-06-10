import { createClient } from "@supabase/supabase-js";
import { nanoid } from "nanoid";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type StorageProvider = "local" | "supabase";

function getStorageProvider(): StorageProvider {
  return process.env.STORAGE_PROVIDER === "supabase" ? "supabase" : "local";
}

function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function getSupabaseAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase storage no está configurado");
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

async function uploadToLocal(file: File) {
  if (process.env.VERCEL) {
    throw new Error(
      "El almacenamiento local no funciona en Vercel (filesystem efímero). " +
        "Configura STORAGE_PROVIDER=supabase con credenciales válidas, o usa Vercel Blob.",
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const uniqueName = `${nanoid()}-${sanitizeFilename(file.name)}`;
  const uploadsDir = join(process.cwd(), "public", "uploads");

  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }

  const filePath = join(uploadsDir, uniqueName);
  writeFileSync(filePath, buffer);

  return { url: `/uploads/${uniqueName}` };
}

async function uploadToSupabase(file: File) {
  const supabase = getSupabaseAdminClient();
  const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "revistas";
  const path = `uploads/${nanoid()}-${sanitizeFilename(file.name)}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  return { url: data.publicUrl };
}

export async function uploadImageFile(file: File) {
  if (getStorageProvider() === "supabase") {
    return uploadToSupabase(file);
  }

  return uploadToLocal(file);
}
