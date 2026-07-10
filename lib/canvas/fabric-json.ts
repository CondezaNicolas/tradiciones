/**
 * Ensures every image object in a serialized Fabric JSON layout loads with
 * crossOrigin="anonymous". Images served from Supabase Storage live on a
 * different origin; without this flag they taint the canvas and
 * toDataURL() (thumbnail generation) throws a SecurityError.
 */
export function withAnonymousImages(
  json: Record<string, unknown>,
): Record<string, unknown> {
  const objects = json.objects;
  if (!Array.isArray(objects)) return json;

  return {
    ...json,
    objects: objects.map((obj) => {
      if (
        obj &&
        typeof obj === "object" &&
        (obj as { type?: string }).type?.toLowerCase() === "image"
      ) {
        return { ...obj, crossOrigin: "anonymous" };
      }
      return obj;
    }),
  };
}
