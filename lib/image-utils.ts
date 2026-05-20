/**
 * Compress an image file by resizing to a max dimension and re-encoding.
 *
 * - Keeps aspect ratio; scales down only when the image exceeds `MAX_DIM`.
 * - Preserves PNG format, converts everything else to JPEG.
 * - Falls back to the original file when the browser cannot produce a blob.
 */
export async function compressImage(file: File): Promise<File> {
  const MAX_DIM = 2400;
  const QUALITY = 0.85;
  const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";

  const bitmap = await createImageBitmap(file);

  let w = bitmap.width;
  let h = bitmap.height;
  if (w > MAX_DIM || h > MAX_DIM) {
    if (w > h) {
      h = Math.round((h * MAX_DIM) / w);
      w = MAX_DIM;
    } else {
      w = Math.round((w * MAX_DIM) / h);
      h = MAX_DIM;
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const blob: Blob | null = await new Promise((resolve) => {
    canvas.toBlob(resolve, mimeType, QUALITY);
  });

  if (!blob) return file;

  return new File(
    [blob],
    file.name.replace(/\.\w+$/, mimeType === "image/png" ? ".png" : ".jpg"),
    { type: mimeType },
  );
}
