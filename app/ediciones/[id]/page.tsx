import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getDb } from "@/lib/db";
import { editions, pages } from "@/lib/db/schema";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MagazineViewer } from "@/components/magazine-viewer";
import { SITE_URL, SITE_NAME, absoluteUrl } from "@/lib/seo";
import { IoArrowBackOutline } from "react-icons/io5";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const db = getDb();

  const [edition] = await db
    .select({
      title: editions.title,
      category: editions.category,
      month: editions.month,
      year: editions.year,
      summary: editions.summary,
      coverImageUrl: editions.coverImageUrl,
      createdAt: editions.createdAt,
    })
    .from(editions)
    .where(and(eq(editions.id, id), eq(editions.status, "published")))
    .limit(1);

  if (!edition) {
    return {
      title: "Edición no encontrada",
      robots: { index: false, follow: false },
    };
  }

  const description =
    edition.summary ??
    `Edición ${edition.category} de ${edition.month} ${edition.year} de ${SITE_NAME}: tradiciones, cultura y fotografía documental de Chile.`;
  const canonicalPath = `/ediciones/${id}`;
  const coverImage = edition.coverImageUrl ?? "/images/hero-background.webp";

  return {
    title: `${edition.title} · ${edition.month} ${edition.year}`,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type: "article",
      url: absoluteUrl(canonicalPath),
      siteName: SITE_NAME,
      locale: "es_CL",
      title: `${edition.title} · ${edition.month} ${edition.year}`,
      description,
      section: edition.category,
      publishedTime: edition.createdAt?.toISOString(),
      images: [
        {
          url: coverImage,
          width: 920,
          height: 1280,
          alt: `Portada: ${edition.title}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${edition.title} · ${edition.month} ${edition.year}`,
      description,
      images: [coverImage],
    },
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
      createdAt: editions.createdAt,
      updatedAt: editions.updatedAt,
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

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": absoluteUrl(`/ediciones/${edition.id}`),
    headline: edition.title,
    description:
      edition.summary ?? `Edición ${edition.category} de ${dateLabel}`,
    articleSection: edition.category,
    inLanguage: "es-CL",
    image: edition.coverImageUrl ? [edition.coverImageUrl] : undefined,
    datePublished: edition.createdAt?.toISOString(),
    dateModified: edition.updatedAt?.toISOString(),
    mainEntityOfPage: absoluteUrl(`/ediciones/${edition.id}`),
    isPartOf: {
      "@type": "Periodical",
      "@id": `${SITE_URL}/#periodical`,
      name: SITE_NAME,
    },
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/images/logo.png"),
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
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
