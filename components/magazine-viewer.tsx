"use client";

import {
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type PointerEvent,
  type TouchEvent,
  type TransitionEvent,
} from "react";
import Image from "next/image";
import { useIsMobile } from "@/lib/hooks/use-is-mobile";
import type { MagazinePage } from "@/components/magazine/zoom-page-content";
import { MagazineZoom } from "@/components/magazine/magazine-zoom";
import type { ZoomSelection } from "@/components/magazine/magazine-zoom";
import { MagazinePageControl } from "@/components/magazine/magazine-page-control";
import { MagazineCoverOverlay } from "@/components/magazine/magazine-cover-overlay";
import {
  MagazineFlipPages,
  FLIP_PHASE,
  FLIP_DIRECTION,
  flipReducer,
  INITIAL_FLIP_STATE,
} from "@/components/magazine/magazine-flip-pages";

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

// ─── Main component ──────────────────────────────────────────────────

export function MagazineViewer({ edition, pages }: MagazineViewerProps) {
  const isMobile = useIsMobile();
  const pageMap = useMemo(() => new Map(pages.map((page) => [page.pageNumber, page])), [pages]);
  const maxPageNumber = pages.reduce((max, page) => Math.max(max, page.pageNumber), FIRST_EDITORIAL_PAGE);
  const lastReadablePage = Math.max(FIRST_EDITORIAL_PAGE, maxPageNumber);
  const readablePageCount = Math.max(1, lastReadablePage - FIRST_EDITORIAL_PAGE + 1);
  const readableSpreadCount = Math.max(1, Math.ceil(readablePageCount / 2));

  const [isOpen, setIsOpen] = useState(true);
  const [currentSpread, setCurrentSpread] = useState(0);
  const [flipState, dispatchFlip] = useReducer(flipReducer, INITIAL_FLIP_STATE);
  const flipPhase = flipState.phase;
  const flipDirection = flipState.direction;
  const targetSpread = flipState.target;
  const [zoomSelection, setZoomSelection] = useState<ZoomSelection | null>(null);

  const touchStartXRef = useRef<number | null>(null);
  const dragStartXRef = useRef<number | null>(null);

  const isAnimating = flipPhase !== FLIP_PHASE.IDLE;
  const maxIndex = isMobile ? readablePageCount - 1 : readableSpreadCount - 1;
  const pageW = isMobile ? 300 : 460;
  const pageH = isMobile ? 440 : 640;

  const getMobilePageNumber = (index: number) => FIRST_EDITORIAL_PAGE + index;
  const getDesktopLeftPageNumber = (spreadIndex: number) => FIRST_EDITORIAL_PAGE + spreadIndex * 2;
  const getDesktopRightPageNumber = (spreadIndex: number) => FIRST_EDITORIAL_PAGE + spreadIndex * 2 + 1;

  const currentLabel = isMobile
    ? `${getMobilePageNumber(currentSpread)} / ${lastReadablePage}`
    : `${getDesktopLeftPageNumber(currentSpread)}-${Math.min(getDesktopRightPageNumber(currentSpread), lastReadablePage)} / ${lastReadablePage}`;

  const visiblePageNumbers = isMobile
    ? [getMobilePageNumber(currentSpread)]
    : [getDesktopLeftPageNumber(currentSpread), getDesktopRightPageNumber(currentSpread)];

  const preloadPageNumbers = useMemo(() => {
    const candidates = new Set<number>();
    const indices = [currentSpread - 1, currentSpread, currentSpread + 1];

    for (const index of indices) {
      if (index < 0 || index > maxIndex) continue;
      if (isMobile) {
        candidates.add(getMobilePageNumber(index));
      } else {
        candidates.add(getDesktopLeftPageNumber(index));
        candidates.add(getDesktopRightPageNumber(index));
      }
    }

    return Array.from(candidates).flatMap((pageNumber) => {
      const page = pageMap.get(pageNumber);
      return page?.thumbnailUrl ? [page] : [];
    });
  }, [currentSpread, isMobile, maxIndex, pageMap]);

  useEffect(() => {
    if (flipPhase !== FLIP_PHASE.READY) return;
    const rafId = requestAnimationFrame(() => dispatchFlip({ type: "animate" }));
    return () => cancelAnimationFrame(rafId);
  }, [flipPhase]);

  const goToNext = () => {
    if (isAnimating || currentSpread >= maxIndex) return;
    dispatchFlip({ type: "start", direction: FLIP_DIRECTION.NEXT, target: currentSpread + 1 });
  };

  const goToPrev = () => {
    if (isAnimating || currentSpread <= 0) return;
    dispatchFlip({ type: "start", direction: FLIP_DIRECTION.PREV, target: currentSpread - 1 });
  };

  const onFlipEnd = (event: TransitionEvent) => {
    if (event.propertyName !== "transform") return;
    setCurrentSpread(targetSpread);
    dispatchFlip({ type: "end" });
  };

  const openZoom = (pageNumber: number) => {
    const selectedPages = isMobile
      ? [pageMap.get(pageNumber)]
      : visiblePageNumbers.map((visiblePageNumber) => pageMap.get(visiblePageNumber));

    const resolvedPages = selectedPages.filter(
      (page): page is MagazinePage => Boolean(page && (page.thumbnailUrl || page.fabricJson)),
    );

    if (resolvedPages.length === 0) return;

    const title =
      resolvedPages.length === 1
        ? `Pagina ${resolvedPages[0].pageNumber}`
        : `Paginas ${resolvedPages[0].pageNumber}-${resolvedPages[resolvedPages.length - 1].pageNumber}`;

    setZoomSelection({ title, pages: resolvedPages });
  };

  const closeZoom = () => setZoomSelection(null);

  // ─── Gesture handlers ───────────────────────────────────────────

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = event.changedTouches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (!isMobile || !isOpen || isAnimating || zoomSelection) return;

    const startX = touchStartXRef.current;
    const endX = event.changedTouches[0]?.clientX ?? null;
    touchStartXRef.current = null;

    if (startX === null || endX === null) return;

    const deltaX = endX - startX;
    if (Math.abs(deltaX) < 48) return;

    if (deltaX < 0) {
      goToNext();
      return;
    }

    goToPrev();
  };

  const handleReaderPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (isMobile || !isOpen || zoomSelection) return;
    dragStartXRef.current = event.clientX;
  };

  const handleReaderPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (isMobile || !isOpen || isAnimating || zoomSelection) return;

    const startX = dragStartXRef.current;
    dragStartXRef.current = null;

    if (startX === null) return;

    const deltaX = event.clientX - startX;
    if (Math.abs(deltaX) < 56) return;

    if (deltaX < 0) {
      goToNext();
      return;
    }

    goToPrev();
  };

  // ─── Render ────────────────────────────────────────────────────

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(184,134,74,0.12),_transparent_32%),linear-gradient(180deg,_rgba(248,246,241,0.98),_rgba(243,238,231,0.92))] px-5 pb-24 pt-32 md:px-8">
      <div className="hidden">
        {preloadPageNumbers.map((page) =>
          page.thumbnailUrl ? (
            <Image key={`preload-${page.id}`} src={page.thumbnailUrl} alt="" width={460} height={640} unoptimized />
          ) : null,
        )}
      </div>

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
            <span className="font-label text-[11px] uppercase tracking-[0.18em]">{edition.month} {edition.year}</span>
            <span className="size-1.5 rounded-full bg-primary/35" />
            <span className="font-label text-[11px] uppercase tracking-[0.18em]">{readablePageCount} paginas editoriales</span>
          </div>
          {edition.summary && (
            <p className="mt-6 max-w-3xl font-body text-base leading-8 text-on-surface-variant/80 md:text-lg">{edition.summary}</p>
          )}
        </div>

        {/* Book */}
        <div className="rounded-[2rem] border border-outline-variant/15 bg-white/45 px-4 py-8 shadow-[0_30px_80px_rgba(48,37,20,0.10)] backdrop-blur-sm md:px-8 md:py-12">
          <div className="flex items-start justify-center">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="absolute inset-x-8 bottom-[-2.75rem] h-12 rounded-full bg-black/12 blur-2xl" />

                <div className="relative" style={{ perspective: "1200px" }}>
                  {!isOpen && (
                    <>
                      <div className="absolute inset-0 translate-x-[14px] translate-y-[14px] rounded-lg border border-outline-variant/20 bg-surface-container-high" />
                      <div className="absolute inset-0 translate-x-[10px] translate-y-[10px] rounded-lg border border-outline-variant/20 bg-surface-container-high" />
                      <div className="absolute inset-0 translate-x-[6px] translate-y-[6px] rounded-lg border border-outline-variant/20 bg-surface-container-high" />
                    </>
                  )}

                  <div className="relative flex" style={{ transformStyle: "preserve-3d", transform: "rotateY(-8deg)" }}>
                    {/* Spine */}
                    <div className="relative w-12 shrink-0 overflow-hidden rounded-l-lg border-y border-l border-outline-variant/30 bg-surface-container-high">
                      <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-on-surface/5 to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-label text-[9px] font-bold uppercase tracking-[0.3em] text-on-surface-variant/40 [writing-mode:vertical-lr]">
                          {edition.month} {edition.year}
                        </span>
                      </div>
                    </div>

                    {/* Page grid */}
                    <div
                      className="relative"
                      style={{
                        display: "grid",
                        gridTemplateColumns: isOpen && !isMobile ? `${pageW}px ${pageW}px` : `${pageW}px`,
                        height: pageH,
                        transition: "grid-template-columns 500ms cubic-bezier(0.4, 0, 0.2, 1)",
                        perspective: "1200px",
                      }}
                    >
                      <div
                        className="absolute inset-0 rounded-r-lg bg-surface-container-lowest"
                        onPointerDown={handleReaderPointerDown}
                        onPointerUp={handleReaderPointerUp}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                        style={{
                          boxShadow: "inset 2px 0 6px rgba(0,0,0,0.05)",
                          overflow: isAnimating ? "visible" : "hidden",
                        }}
                      >
                        <MagazineFlipPages
                          isMobile={isMobile}
                          isAnimating={isAnimating}
                          flipPhase={flipPhase}
                          flipDirection={flipDirection}
                          currentSpread={currentSpread}
                          targetSpread={targetSpread}
                          pageMap={pageMap}
                          firstEditorialPage={FIRST_EDITORIAL_PAGE}
                          onFlipEnd={onFlipEnd}
                          onOpenZoom={openZoom}
                        />
                      </div>

                      <MagazineCoverOverlay
                        edition={edition}
                        width={pageW}
                        height={pageH}
                        isOpen={isOpen}
                      />
                    </div>
                  </div>
                </div>

                {!isOpen && (
                  <button
                    type="button"
                    onClick={() => { setIsOpen(true); setCurrentSpread(0); }}
                    className="absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 rounded-full bg-on-surface/80 px-7 py-2.5 font-label text-[11px] font-bold uppercase tracking-[0.15em] text-white shadow-lg backdrop-blur-sm transition-all hover:bg-on-surface hover:shadow-xl active:scale-95"
                  >
                    Abrir revista
                  </button>
                )}
              </div>

              <MagazinePageControl
                currentLabel={currentLabel}
                onPrev={goToPrev}
                onNext={goToNext}
                onClose={() => setIsOpen(false)}
                status={{ canPrev: currentSpread === 0, canNext: currentSpread >= maxIndex, isAnimating, isOpen, isMobile }}
              />
            </div>
          </div>
        </div>
      </div>

      <MagazineZoom zoomSelection={zoomSelection} editionTitle={edition.title} onClose={closeZoom} />
    </section>
  );
}
