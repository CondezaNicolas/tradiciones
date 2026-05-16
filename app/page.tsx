import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { editions } from "@/lib/db/schema";
import { EdicionesRecientes, type Edicion } from "@/components/ediciones-recientes";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { AgendaContacto } from "@/components/agenda-contacto";

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
