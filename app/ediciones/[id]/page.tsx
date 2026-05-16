import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { editions, pages } from "@/lib/db/schema";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MagazineViewer } from "@/components/magazine-viewer";
import { IoArrowBackOutline } from "react-icons/io5";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const db = getDb();

  const [edition] = await db
    .select({
      title: editions.title,
      category: editions.category,
    })
    .from(editions)
    .where(and(eq(editions.id, id), eq(editions.status, "published")))
    .limit(1);

  if (!edition) {
    return { title: "Edición no encontrada" };
  }

  return {
    title: `${edition.title} — Chile País de Tradiciones`,
    description: `Edición de ${edition.category}`,
  };
}

export default async function EdicionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const db = getDb();

  const [edition] = await db
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
    .where(and(eq(editions.id, id), eq(editions.status, "published")))
    .limit(1);

  if (!edition) {
    notFound();
  }

  const editionPages = await db
    .select({
      id: pages.id,
      pageNumber: pages.pageNumber,
      thumbnailUrl: pages.thumbnailUrl,
      fabricJson: pages.fabricJson,
    })
    .from(pages)
    .where(eq(pages.editionId, id))
    .orderBy(pages.pageNumber);

  const dateLabel = `${edition.month} ${edition.year}`;

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-screen-2xl px-5 pt-32 md:px-8">
          <Link
            href="/#ediciones-recientes"
            className="inline-flex items-center gap-2 font-body text-sm text-on-surface-variant transition-colors hover:text-primary"
          >
            <IoArrowBackOutline className="text-base" />
            Volver a ediciones
          </Link>
        </div>
        <MagazineViewer edition={edition} pages={editionPages} />
        <div className="mx-auto max-w-screen-xl px-5 pb-24 md:px-8">
          <div className="rounded-[1.5rem] border border-outline-variant/15 bg-surface-container-low/40 px-6 py-6 shadow-[0_14px_40px_rgba(48,37,20,0.06)] md:px-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-label text-[10px] uppercase tracking-[0.18em] text-on-surface-variant/55">
                  Lectura publicada
                </p>
                <p className="mt-2 font-body text-sm leading-7 text-on-surface-variant/80 md:text-base">
                  Navega la revista como objeto fisico: abre portada, pasa paginas y recorre el contenido tal como fue diagramado.
                </p>
              </div>
              <p className="font-label text-[11px] uppercase tracking-[0.18em] text-on-surface-variant/60">
                {dateLabel}
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
