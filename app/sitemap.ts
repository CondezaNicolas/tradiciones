import type { MetadataRoute } from "next";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { editions } from "@/lib/db/schema";
import { SITE_URL, absoluteUrl } from "@/lib/seo";

// Re-generate on every request so newly published editions appear
// without a redeploy.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = getDb();

  const published = await db
    .select({
      id: editions.id,
      updatedAt: editions.updatedAt,
      createdAt: editions.createdAt,
    })
    .from(editions)
    .where(eq(editions.status, "published"))
    .orderBy(desc(editions.createdAt));

  const editionEntries: MetadataRoute.Sitemap = published.map((edition) => ({
    url: absoluteUrl(`/ediciones/${edition.id}`),
    lastModified: edition.updatedAt ?? edition.createdAt ?? undefined,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: editionEntries[0]?.lastModified ?? new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...editionEntries,
  ];
}
