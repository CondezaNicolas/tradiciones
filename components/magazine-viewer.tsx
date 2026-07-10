"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { MagazinePage } from "@/components/magazine/zoom-page-content";
import { MagazineZoom } from "@/components/magazine/magazine-zoom";
import type { ZoomSelection } from "@/components/magazine/magazine-zoom";
import {
  MagazineFlipBook,
  type FlipBookHandle,
  type FlipBookPage,
} from "@/components/magazine/magazine-flip-book";
import {
  BookCoverPage,
  BookInsideCoverPage,
  BookEditorialPage,
  BookBlankPage,
  BookBackCoverPage,
} from "@/components/magazine/magazine-book-pages";

// ─── Types ───────────────────────────────────────────────────────────

interface MagazineEdition {
  id: string;
  title: string;
  category: string;
  month: string;
  year: string;
  summary: string | null;
  coverImageUrl: string | null;
}

interface MagazineViewerProps {
  edition: MagazineEdition;
  pages: MagazinePage[];
}

// ─── Constants ───────────────────────────────────────────────────────

const FIRST_EDITORIAL_PAGE = 2;
const PAGE_W = 460;
const PAGE_H = 640;

// ─── Main component ──────────────────────────────────────────────────

export function MagazineViewer({ edition, pages }: MagazineViewerProps) {
  const bookRef = useRef<FlipBookHandle>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("landscape");
  const [flipState, setFlipState] = useState("read");
  const [zoomSelection, setZoomSelection] = useState<ZoomSelection | null>(null);

  const pageMap = useMemo(
    () => new Map(pages.map((page) => [page.pageNumber, page])),
    [pages],
  );

  const lastEditorialPage = pages.reduce(
    (max, page) => Math.max(max, page.pageNumber),
    FIRST_EDITORIAL_PAGE,
  );

  const openZoom = useCallback(
    (pageNumber: number) => {
      const page = pageMap.get(pageNumber);
      if (!page || (!page.thumbnailUrl && !page.fabricJson)) return;
      setZoomSelection({ title: `Página ${pageNumber}`, pages: [page] });
    },
    [pageMap],
  );

  /*
   * Book page list:
   *   index 0            → cover (hard)
   *   index 1            → inside front cover
   *   index N (2..last)  → editorial page N (aligned with DB pageNumber)
   *   [filler]           → keeps the total even so the back cover sits alone
   *   last index         → back cover (hard)
   */
  const bookPages = useMemo<FlipBookPage[]>(() => {
    const result: FlipBookPage[] = [
      {
        key: "cover",
        density: "hard",
        content: <BookCoverPage edition={edition} />,
      },
      {
        key: "inside-cover",
        content: <BookInsideCoverPage edition={edition} />,
      },
    ];

    for (let n = FIRST_EDITORIAL_PAGE; n <= lastEditorialPage; n++) {
      const page = pageMap.get(n);
      result.push({
        key: `page-${n}`,
        content: (
          <BookEditorialPage
            pageNumber={n}
            thumbnailUrl={page?.thumbnailUrl}
            fabricJson={page?.fabricJson}
            onZoom={openZoom}
          />
        ),
      });
    }

    // Pad so the total count (including back cover) is even
    if ((result.length + 1) % 2 !== 0) {
      result.push({ key: "filler", content: <BookBlankPage /> });
    }

    result.push({
      key: "back-cover",
      density: "hard",
      content: <BookBackCoverPage edition={edition} />,
    });

    return result;
  }, [edition, pageMap, lastEditorialPage, openZoom]);

  const totalBookPages = bookPages.length;
  const backCoverIndex = totalBookPages - 1;

  // ─── Label ──────────────────────────────────────────────────────

  const pageLabel = (() => {
    if (currentIndex <= 0) return "Portada";
    if (currentIndex >= backCoverIndex) return "Contraportada";

    if (orientation === "portrait") {
      if (currentIndex === 1) return "Interior de portada";
      return `Página ${currentIndex} de ${lastEditorialPage}`;
    }

    const left = currentIndex % 2 === 0 ? currentIndex - 1 : currentIndex;
    const right = left + 1;
    if (left === 1) return `Interior · Página ${Math.min(right, lastEditorialPage)}`;
    if (right >= backCoverIndex || right > lastEditorialPage) {
      return `Página ${Math.min(left, lastEditorialPage)} de ${lastEditorialPage}`;
    }
    return `Páginas ${left}-${right} de ${lastEditorialPage}`;
  })();

  const isFlipping = flipState !== "read";
  const canPrev = currentIndex > 0;
  const canNext = currentIndex < backCoverIndex;

  // ─── Render ────────────────────────────────────────────────────

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(184,134,74,0.12),_transparent_32%),linear-gradient(180deg,_rgba(248,246,241,0.98),_rgba(243,238,231,0.92))] px-5 pb-24 pt-32 md:px-8">
      <div className="mx-auto max-w-screen-2xl">
        {/* Header */}
        <div className="mb-10 max-w-4xl">
          <span className="inline-flex rounded-full border border-outline-variant/20 bg-surface/70 px-4 py-1 font-label text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant shadow-sm backdrop-blur-sm">
            {edition.category}
          </span>
          <h1 className="mt-5 font-headline text-4xl font-light leading-tight text-on-surface md:text-6xl">
            {edition.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-on-surface-variant/65">
            <span className="font-label text-[11px] uppercase tracking-[0.18em]">
              {edition.month} {edition.year}
            </span>
            <span className="size-1.5 rounded-full bg-primary/35" />
            <span className="font-label text-[11px] uppercase tracking-[0.18em]">
              {Math.max(1, lastEditorialPage - FIRST_EDITORIAL_PAGE + 1)} páginas editoriales
            </span>
          </div>
          {edition.summary && (
            <p className="mt-6 max-w-3xl font-body text-base leading-8 text-on-surface-variant/80 md:text-lg">
              {edition.summary}
            </p>
          )}
        </div>

        {/* Book */}
        <div className="rounded-[2rem] border border-outline-variant/15 bg-white/45 px-4 py-10 shadow-[0_30px_80px_rgba(48,37,20,0.10)] backdrop-blur-sm md:px-8 md:py-14">
          <div className="relative mx-auto flex max-w-[1180px] flex-col items-center">
            {/* Floor shadow */}
            <div className="pointer-events-none absolute inset-x-16 bottom-6 h-10 rounded-full bg-black/15 blur-2xl" />

            <MagazineFlipBook
              ref={bookRef}
              pages={bookPages}
              pageWidth={PAGE_W}
              pageHeight={PAGE_H}
              onFlip={setCurrentIndex}
              onOrientationChange={setOrientation}
              onStateChange={setFlipState}
            />

            {/* Controls */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => bookRef.current?.turnToPage(0)}
                disabled={currentIndex === 0}
                className="rounded-full border border-outline-variant/30 px-5 py-2 font-label text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-25 active:scale-95"
              >
                Portada
              </button>

              <div className="mx-1 h-5 w-px bg-outline-variant/20" />

              <button
                type="button"
                onClick={() => bookRef.current?.flipPrev()}
                disabled={!canPrev || isFlipping}
                className="rounded-full border border-outline-variant/30 px-4 py-2 font-label text-[11px] uppercase tracking-[0.12em] text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-25 active:scale-95"
              >
                ← Anterior
              </button>

              <span className="min-w-[130px] text-center font-label text-[11px] uppercase tracking-[0.12em] text-on-surface-variant/65">
                {pageLabel}
              </span>

              <button
                type="button"
                onClick={() => bookRef.current?.flipNext()}
                disabled={!canNext || isFlipping}
                className="rounded-full border border-outline-variant/30 px-4 py-2 font-label text-[11px] uppercase tracking-[0.12em] text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-25 active:scale-95"
              >
                Siguiente →
              </button>

              <div className="basis-full text-center">
                <span className="font-label text-[10px] uppercase tracking-[0.16em] text-on-surface-variant/45">
                  Arrastra la esquina de la hoja para pasar la página, como en una revista real
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MagazineZoom zoomSelection={zoomSelection} editionTitle={edition.title} onClose={() => setZoomSelection(null)} />
    </section>
  );
}
