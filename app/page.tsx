import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { editions } from "@/lib/db/schema";
import { EdicionesRecientes, type Edicion } from "@/components/ediciones-recientes";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { AgendaContacto } from "@/components/agenda-contacto";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, absoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: absoluteUrl("/images/logo.png"),
      description: SITE_DESCRIPTION,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: "es-CL",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "Periodical",
      "@id": `${SITE_URL}/#periodical`,
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: "es-CL",
      description: SITE_DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export default async function Home() {
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
    })
    .from(editions)
    .where(eq(editions.status, "published"))
    .orderBy(desc(editions.createdAt))
    .limit(3);

  const ediciones: Edicion[] = published.map((row) => ({
    id: row.id,
    mes: row.month,
    anio: row.year,
    titulo: row.title,
    descripcion: row.summary ?? "",
    imagen: row.coverImageUrl ?? "",
    alt: row.title,
  }));

  const hasEdiciones = ediciones.length > 0;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Header />
      <main className="flex-1">
        <Hero hasEdiciones={hasEdiciones} />
        <EdicionesRecientes ediciones={ediciones} />
        <AgendaContacto />
      </main>
      <Footer />
    </>
  );
}
