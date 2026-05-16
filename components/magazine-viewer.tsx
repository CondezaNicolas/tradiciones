"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type TouchEvent,
  type TransitionEvent,
  type WheelEvent,
} from "react";
import Image from "next/image";

const FLIP_PHASE = {
  IDLE: "idle",
  READY: "ready",
  FLIPPING: "flipping",
} as const;

const FLIP_DIRECTION = {
  NEXT: "next",
  PREV: "prev",
} as const;

const FIRST_EDITORIAL_PAGE = 2;

type FlipPhase = (typeof FLIP_PHASE)[keyof typeof FLIP_PHASE];
type FlipDirection = (typeof FLIP_DIRECTION)[keyof typeof FLIP_DIRECTION];

interface MagazinePage {
  id: string;
  pageNumber: number;
  thumbnailUrl: string | null;
  fabricJson?: string | null;
}

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

interface FabricPageCanvasProps {
  fabricJson: string;
  width: number;
  height: number;
  className?: string;
}

interface ZoomSelection {
  title: string;
  pages: MagazinePage[];
}

function FabricPageCanvas({ fabricJson, width, height, className }: FabricPageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    let disposed = false;
    let staticCanvas: InstanceType<typeof import("fabric").StaticCanvas> | null = null;

    const renderCanvas = async () => {
      try {
        const { StaticCanvas } = await import("fabric");
        if (disposed || !canvasRef.current) return;

        staticCanvas = new StaticCanvas(canvasRef.current, {
          width,
          height,
          backgroundColor: "#ffffff",
          renderOnAddRemove: true,
        });

        await staticCanvas.loadFromJSON(JSON.parse(fabricJson) as Record<string, unknown>);
        staticCanvas.setDimensions({ width, height });
        staticCanvas.renderAll();
      } catch {
        if (staticCanvas) {
          staticCanvas.dispose();
          staticCanvas = null;
        }
      }
    };

    renderCanvas();

    return () => {
      disposed = true;
      if (staticCanvas) {
        staticCanvas.dispose();
      }
    };
  }, [fabricJson, width, height]);

  return <canvas ref={canvasRef} width={width} height={height} className={className} />;
}

function PlaceholderPage({ pageNumber }: { pageNumber: number }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-surface-container-lowest">
      <div className="text-center opacity-45">
        <span className="block font-label text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">
          Pagina {pageNumber}
        </span>
        <span className="mt-3 block font-body text-sm text-on-surface-variant/55">
          Contenido no disponible
        </span>
      </div>
    </div>
  );
}

function ReaderPage({
  pageNumber,
  thumbnailUrl,
  fabricJson,
  onZoom,
}: {
  pageNumber: number;
  thumbnailUrl?: string | null;
  fabricJson?: string | null;
  onZoom?: () => void;
}) {
  if (!thumbnailUrl && !fabricJson) {
    return <PlaceholderPage pageNumber={pageNumber} />;
  }

  return (
    <div className="relative h-full w-full bg-surface-container-lowest">
      <button
        type="button"
        onClick={onZoom}
        className="group relative block h-full w-full cursor-zoom-in overflow-hidden"
        aria-label={`Ampliar pagina ${pageNumber}`}
      >
        {fabricJson ? (
          <FabricPageCanvas
            fabricJson={fabricJson}
            width={460}
            height={640}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.01]"
          />
        ) : thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={`Pagina ${pageNumber}`}
            width={460}
            height={640}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.01]"
            draggable={false}
            unoptimized
          />
        ) : null}
        <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-surface/82 px-3 py-1 font-label text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100 md:opacity-0">
          Zoom
        </span>
      </button>
    </div>
  );
}

function renderZoomContent(page: MagazinePage, width: number, height: number) {
  if (page.fabricJson) {
    return (
      <FabricPageCanvas
        fabricJson={page.fabricJson}
        width={width}
        height={height}
        className="h-auto max-h-[78vh] w-auto max-w-full"
      />
    );
  }

  if (page.thumbnailUrl) {
    return (
      <Image
        src={page.thumbnailUrl}
        alt={`Pagina ${page.pageNumber}`}
        width={width}
        height={height}
        className="h-auto max-h-[78vh] w-full object-contain"
        unoptimized
      />
    );
  }

  return <PlaceholderPage pageNumber={page.pageNumber} />;
}

export function MagazineViewer({ edition, pages }: MagazineViewerProps) {
  const pageMap = useMemo(() => new Map(pages.map((page) => [page.pageNumber, page])), [pages]);
  const maxPageNumber = pages.reduce((max, page) => Math.max(max, page.pageNumber), FIRST_EDITORIAL_PAGE);
  const lastReadablePage = Math.max(FIRST_EDITORIAL_PAGE, maxPageNumber);
  const readablePageCount = Math.max(1, lastReadablePage - FIRST_EDITORIAL_PAGE + 1);
  const readableSpreadCount = Math.max(1, Math.ceil(readablePageCount / 2));

  const [isOpen, setIsOpen] = useState(true);
  const [currentSpread, setCurrentSpread] = useState(0);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 979px)").matches,
  );
  const [flipPhase, setFlipPhase] = useState<FlipPhase>(FLIP_PHASE.IDLE);
  const [flipDirection, setFlipDirection] = useState<FlipDirection>(FLIP_DIRECTION.NEXT);
  const [targetSpread, setTargetSpread] = useState(0);
  const [zoomSelection, setZoomSelection] = useState<ZoomSelection | null>(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [zoomOffset, setZoomOffset] = useState({ x: 0, y: 0 });
  const [isZoomDragging, setIsZoomDragging] = useState(false);

  const touchStartXRef = useRef<number | null>(null);
  const dragStartXRef = useRef<number | null>(null);
  const zoomDragStartRef = useRef<{ x: number; y: number } | null>(null);
  const zoomOffsetStartRef = useRef({ x: 0, y: 0 });
  const pinchDistanceRef = useRef<number | null>(null);
  const pinchScaleRef = useRef(1);

  const isAnimating = flipPhase !== FLIP_PHASE.IDLE;
  const maxIndex = isMobile ? readablePageCount - 1 : readableSpreadCount - 1;
  const pageW = isMobile ? 300 : 460;
  const pageH = isMobile ? 440 : 640;
  const spreadW = pageW * 2;

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

    return Array.from(candidates)
      .map((pageNumber) => pageMap.get(pageNumber))
      .filter((page): page is MagazinePage => Boolean(page?.thumbnailUrl));
  }, [currentSpread, isMobile, maxIndex, pageMap]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 979px)");
    const handleChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (flipPhase !== FLIP_PHASE.READY) return;
    const rafId = requestAnimationFrame(() => setFlipPhase(FLIP_PHASE.FLIPPING));
    return () => cancelAnimationFrame(rafId);
  }, [flipPhase]);

  useEffect(() => {
    if (!zoomSelection) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setZoomSelection(null);
        setZoomScale(1);
        setZoomOffset({ x: 0, y: 0 });
        setIsZoomDragging(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [zoomSelection]);

  const goToNext = () => {
    if (isAnimating || currentSpread >= maxIndex) return;
    setFlipDirection(FLIP_DIRECTION.NEXT);
    setTargetSpread(currentSpread + 1);
    setFlipPhase(FLIP_PHASE.READY);
  };

  const goToPrev = () => {
    if (isAnimating || currentSpread <= 0) return;
    setFlipDirection(FLIP_DIRECTION.PREV);
    setTargetSpread(currentSpread - 1);
    setFlipPhase(FLIP_PHASE.READY);
  };

  const onFlipEnd = (event: TransitionEvent) => {
    if (event.propertyName !== "transform") return;
    setCurrentSpread(targetSpread);
    setFlipPhase(FLIP_PHASE.IDLE);
  };

  const resetZoomState = () => {
    setZoomScale(1);
    setZoomOffset({ x: 0, y: 0 });
    setIsZoomDragging(false);
  };

  const openZoom = (pageNumber: number) => {
    const selectedPages = isMobile
      ? [pageMap.get(pageNumber)]
      : visiblePageNumbers.map((visiblePageNumber) => pageMap.get(visiblePageNumber));

    const resolvedPages = selectedPages.filter(
      (page): page is MagazinePage => Boolean(page && (page.thumbnailUrl || page.fabricJson)),
    );

    if (resolvedPages.length === 0) return;

    resetZoomState();

    const title =
      resolvedPages.length === 1
        ? `Pagina ${resolvedPages[0].pageNumber}`
        : `Paginas ${resolvedPages[0].pageNumber}-${resolvedPages[resolvedPages.length - 1].pageNumber}`;

    setZoomSelection({ title, pages: resolvedPages });
  };

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

  const clampZoom = (value: number) => Math.min(4, Math.max(1, value));

  const handleZoomWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const nextScale = clampZoom(zoomScale + (event.deltaY < 0 ? 0.18 : -0.18));
    setZoomScale(nextScale);
    if (nextScale === 1) {
      setZoomOffset({ x: 0, y: 0 });
    }
  };

  const handleZoomPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (zoomScale <= 1) return;
    zoomDragStartRef.current = { x: event.clientX, y: event.clientY };
    zoomOffsetStartRef.current = zoomOffset;
    setIsZoomDragging(true);
  };

  const handleZoomPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!zoomDragStartRef.current || zoomScale <= 1) return;

    const deltaX = event.clientX - zoomDragStartRef.current.x;
    const deltaY = event.clientY - zoomDragStartRef.current.y;

    setZoomOffset({
      x: zoomOffsetStartRef.current.x + deltaX,
      y: zoomOffsetStartRef.current.y + deltaY,
    });
  };

  const handleZoomPointerUp = () => {
    zoomDragStartRef.current = null;
    setIsZoomDragging(false);
  };

  const getTouchDistance = (event: TouchEvent<HTMLDivElement>) => {
    if (event.touches.length < 2) return null;
    const [first, second] = [event.touches[0], event.touches[1]];
    return Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY);
  };

  const handleZoomTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const distance = getTouchDistance(event);
    if (distance === null) return;
    pinchDistanceRef.current = distance;
    pinchScaleRef.current = zoomScale;
  };

  const handleZoomTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    const distance = getTouchDistance(event);
    if (distance === null || pinchDistanceRef.current === null) return;

    const nextScale = clampZoom(pinchScaleRef.current * (distance / pinchDistanceRef.current));
    setZoomScale(nextScale);
    if (nextScale === 1) {
      setZoomOffset({ x: 0, y: 0 });
    }
  };

  const handleZoomTouchEnd = () => {
    pinchDistanceRef.current = null;
    pinchScaleRef.current = zoomScale;
  };

  const renderPage = (pageNumber: number) => {
    const page = pageMap.get(pageNumber);

    return (
      <ReaderPage
        pageNumber={pageNumber}
        thumbnailUrl={page?.thumbnailUrl}
        fabricJson={page?.fabricJson}
        onZoom={page?.thumbnailUrl || page?.fabricJson ? () => openZoom(pageNumber) : undefined}
      />
    );
  };

  const currentMobilePageNumber = getMobilePageNumber(currentSpread);
  const currentDesktopLeftPageNumber = getDesktopLeftPageNumber(currentSpread);
  const currentDesktopRightPageNumber = getDesktopRightPageNumber(currentSpread);
  const targetMobilePageNumber = getMobilePageNumber(targetSpread);
  const targetDesktopLeftPageNumber = getDesktopLeftPageNumber(targetSpread);
  const targetDesktopRightPageNumber = getDesktopRightPageNumber(targetSpread);

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(184,134,74,0.12),_transparent_32%),linear-gradient(180deg,_rgba(248,246,241,0.98),_rgba(243,238,231,0.92))] px-5 pb-24 pt-32 md:px-8">
      <div className="hidden">
        {preloadPageNumbers.map((page) =>
          page.thumbnailUrl ? (
            <Image
              key={`preload-${page.id}`}
              src={page.thumbnailUrl}
              alt=""
              width={460}
              height={640}
              unoptimized
            />
          ) : null,
        )}
      </div>

      <div className="mx-auto max-w-screen-2xl">
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
            <span className="h-1.5 w-1.5 rounded-full bg-primary/35" />
            <span className="font-label text-[11px] uppercase tracking-[0.18em]">
              {readablePageCount} paginas editoriales
            </span>
          </div>
          {edition.summary && (
            <p className="mt-6 max-w-3xl font-body text-base leading-8 text-on-surface-variant/80 md:text-lg">
              {edition.summary}
            </p>
          )}
        </div>

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

                  <div
                    className="relative flex"
                    style={{
                      transformStyle: "preserve-3d",
                      transform: "rotateY(-8deg)",
                    }}
                  >
                    <div className="relative w-12 shrink-0 overflow-hidden rounded-l-lg border-y border-l border-outline-variant/30 bg-surface-container-high">
                      <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-on-surface/5 to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-label text-[9px] font-bold uppercase tracking-[0.3em] text-on-surface-variant/40 [writing-mode:vertical-lr]">
                          {edition.month} {edition.year}
                        </span>
                      </div>
                    </div>

                    <div
                      className="relative"
                      style={{
                        width: isOpen && !isMobile ? spreadW : pageW,
                        height: pageH,
                        transition: "width 500ms ease-in-out",
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
                        {isMobile ? (
                          isAnimating ? (
                            <div className="relative h-full w-full">
                              <div className="absolute inset-0">{renderPage(targetMobilePageNumber)}</div>
                              <div
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  perspective: "800px",
                                }}
                              >
                                <div
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    backfaceVisibility: "hidden",
                                    background: "var(--color-surface-container-lowest)",
                                    transformOrigin: "center center",
                                    transform:
                                      flipPhase === FLIP_PHASE.FLIPPING
                                        ? `rotateY(${flipDirection === FLIP_DIRECTION.NEXT ? "-180deg" : "180deg"})`
                                        : "rotateY(0deg)",
                                    transition:
                                      flipPhase === FLIP_PHASE.FLIPPING ? "transform 400ms ease-in-out" : "none",
                                  }}
                                  onTransitionEnd={onFlipEnd}
                                >
                                  {renderPage(currentMobilePageNumber)}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="h-full w-full">{renderPage(currentMobilePageNumber)}</div>
                          )
                        ) : isAnimating ? (
                          <div className="flex h-full w-full">
                            <div className="relative h-full flex-1" style={{ boxShadow: "inset -4px 0 8px rgba(0,0,0,0.04)" }}>
                              {renderPage(targetDesktopLeftPageNumber)}

                              {flipDirection === FLIP_DIRECTION.PREV && (
                                <div style={{ position: "absolute", inset: 0, perspective: "1200px" }}>
                                  <div
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      transformStyle: "preserve-3d",
                                      transformOrigin: "right center",
                                      willChange: "transform",
                                      transform:
                                        flipPhase === FLIP_PHASE.FLIPPING ? "rotateY(180deg)" : "rotateY(0deg)",
                                      transition:
                                        flipPhase === FLIP_PHASE.FLIPPING ? "transform 550ms ease-in-out" : "none",
                                    }}
                                    onTransitionEnd={onFlipEnd}
                                  >
                                    <div
                                      style={{
                                        position: "absolute",
                                        inset: 0,
                                        backfaceVisibility: "hidden",
                                        background: "var(--color-surface-container-lowest)",
                                      }}
                                    >
                                      {renderPage(currentDesktopLeftPageNumber)}
                                      <div
                                        style={{
                                          position: "absolute",
                                          inset: 0,
                                          background: "var(--color-surface-container-lowest)",
                                          opacity: flipPhase === FLIP_PHASE.FLIPPING ? 0.5 : 0,
                                          transition: "opacity 200ms",
                                          pointerEvents: "none",
                                        }}
                                      />
                                    </div>
                                    <div
                                      style={{
                                        position: "absolute",
                                        inset: 0,
                                        backfaceVisibility: "hidden",
                                        transform: "rotateY(180deg)",
                                        background: "linear-gradient(to left, #e0d8cc, #ece6dc)",
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>

                            <div
                              className="relative z-10 w-[4px] shrink-0"
                              style={{
                                background:
                                  "linear-gradient(to right, rgba(0,0,0,0.10), rgba(0,0,0,0.03), rgba(0,0,0,0.10))",
                                boxShadow: "0 0 8px rgba(0,0,0,0.06)",
                              }}
                            />

                            <div className="relative h-full flex-1" style={{ boxShadow: "inset 4px 0 8px rgba(0,0,0,0.04)" }}>
                              {renderPage(targetDesktopRightPageNumber)}

                              {flipDirection === FLIP_DIRECTION.NEXT && (
                                <div style={{ position: "absolute", inset: 0, perspective: "1200px" }}>
                                  <div
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      transformStyle: "preserve-3d",
                                      transformOrigin: "left center",
                                      willChange: "transform",
                                      transform:
                                        flipPhase === FLIP_PHASE.FLIPPING ? "rotateY(-180deg)" : "rotateY(0deg)",
                                      transition:
                                        flipPhase === FLIP_PHASE.FLIPPING ? "transform 550ms ease-in-out" : "none",
                                      boxShadow:
                                        flipPhase === FLIP_PHASE.FLIPPING
                                          ? "-4px 0 18px rgba(0,0,0,0.12)"
                                          : "none",
                                    }}
                                    onTransitionEnd={onFlipEnd}
                                  >
                                    <div
                                      style={{
                                        position: "absolute",
                                        inset: 0,
                                        backfaceVisibility: "hidden",
                                        background: "var(--color-surface-container-lowest)",
                                      }}
                                    >
                                      {renderPage(currentDesktopRightPageNumber)}
                                      <div
                                        style={{
                                          position: "absolute",
                                          inset: 0,
                                          background: "var(--color-surface-container-lowest)",
                                          opacity: flipPhase === FLIP_PHASE.FLIPPING ? 0.5 : 0,
                                          transition: "opacity 200ms",
                                          pointerEvents: "none",
                                        }}
                                      />
                                    </div>
                                    <div
                                      style={{
                                        position: "absolute",
                                        inset: 0,
                                        backfaceVisibility: "hidden",
                                        transform: "rotateY(180deg)",
                                        background: "linear-gradient(to right, #e0d8cc, #ece6dc)",
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex h-full w-full">
                            <div className="h-full flex-1" style={{ boxShadow: "inset -4px 0 8px rgba(0,0,0,0.04)" }}>
                              {renderPage(currentDesktopLeftPageNumber)}
                            </div>
                            <div
                              className="relative z-10 w-[4px] shrink-0"
                              style={{
                                background:
                                  "linear-gradient(to right, rgba(0,0,0,0.10), rgba(0,0,0,0.03), rgba(0,0,0,0.10))",
                                boxShadow: "0 0 8px rgba(0,0,0,0.06)",
                              }}
                            />
                            <div className="h-full flex-1" style={{ boxShadow: "inset 4px 0 8px rgba(0,0,0,0.04)" }}>
                              {renderPage(currentDesktopRightPageNumber)}
                            </div>
                          </div>
                        )}
                      </div>

                      <div
                        className="absolute left-0 top-0 overflow-hidden rounded-r-lg border border-outline-variant/30 bg-surface"
                        style={{
                          width: pageW,
                          height: pageH,
                          transformOrigin: "left center",
                          transform: isOpen ? "rotateY(-160deg)" : "rotateY(0deg)",
                          transition: "transform 600ms ease",
                          backfaceVisibility: "hidden",
                        }}
                      >
                        {edition.coverImageUrl ? (
                          <>
                            <Image
                              src={edition.coverImageUrl}
                              alt={`Portada: ${edition.title}`}
                              width={460}
                              height={640}
                              className="absolute inset-0 h-full w-full object-cover"
                              priority
                              unoptimized
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-on-surface/85 via-on-surface/15 to-transparent" />
                            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.22),transparent_35%,transparent_70%,rgba(0,0,0,0.14))]" />
                            <div className="absolute inset-x-0 bottom-0 p-10 max-[980px]:p-6">
                              <p className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">
                                {edition.category}
                              </p>
                              <h2 className="mt-2 font-headline text-3xl font-light leading-tight text-white max-[980px]:text-xl">
                                {edition.title}
                              </h2>
                              <p className="mt-3 line-clamp-3 font-body text-sm leading-relaxed text-white/72">
                                {edition.summary}
                              </p>
                              <p className="mt-4 font-label text-xs uppercase tracking-[0.16em] text-white/55">
                                {edition.month} {edition.year}
                              </p>
                            </div>
                          </>
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-surface-container-high via-surface to-surface-container-low">
                            <div className="absolute inset-6 rounded border border-outline-variant/15" />
                            <div className="absolute inset-8 rounded border border-outline-variant/10" />
                            <div className="absolute inset-x-8 bottom-10 text-center">
                              <p className="font-label text-[10px] uppercase tracking-[0.18em] text-on-surface-variant/70">
                                {edition.category}
                              </p>
                              <h2 className="mt-3 font-headline text-3xl text-on-surface">{edition.title}</h2>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {!isOpen && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(true);
                      setCurrentSpread(0);
                    }}
                    className="absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 rounded-full bg-on-surface/80 px-7 py-2.5 font-label text-[11px] font-bold uppercase tracking-[0.15em] text-white shadow-lg backdrop-blur-sm transition-all hover:bg-on-surface hover:shadow-xl active:scale-95"
                  >
                    Abrir revista
                  </button>
                )}
              </div>

              <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={!isOpen}
                  className="rounded-full border border-outline-variant/30 px-5 py-2 font-label text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-25 active:scale-95"
                >
                  Cerrar
                </button>

                <div className="mx-1 h-5 w-px bg-outline-variant/20" />

                <button
                  type="button"
                  onClick={goToPrev}
                  disabled={!isOpen || isAnimating || currentSpread === 0}
                  className="rounded-full border border-outline-variant/30 px-4 py-2 font-label text-[11px] uppercase tracking-[0.12em] text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-25 active:scale-95"
                >
                  ← Anterior
                </button>

                <span className="min-w-[92px] text-center font-label text-[11px] uppercase tracking-[0.12em] text-on-surface-variant/65">
                  {currentLabel}
                </span>

                <button
                  type="button"
                  onClick={goToNext}
                  disabled={!isOpen || isAnimating || currentSpread >= maxIndex}
                  className="rounded-full border border-outline-variant/30 px-4 py-2 font-label text-[11px] uppercase tracking-[0.12em] text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-25 active:scale-95"
                >
                  Siguiente →
                </button>

                <div className="basis-full text-center">
                  <span className="font-label text-[10px] uppercase tracking-[0.16em] text-on-surface-variant/45">
                    {isMobile
                      ? "Desliza para pasar paginas o toca para ampliar"
                      : "Arrastra para pasar paginas o haz click para ampliar la doble pagina"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {zoomSelection && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/78 px-4 py-8 backdrop-blur-md"
          onClick={() => {
            setZoomSelection(null);
            resetZoomState();
          }}
          role="dialog"
          aria-modal="true"
          aria-label={zoomSelection.title}
        >
          <button
            type="button"
            onClick={() => {
              setZoomSelection(null);
              resetZoomState();
            }}
            className="absolute right-5 top-5 rounded-full border border-white/20 bg-white/10 px-4 py-2 font-label text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-white/18 active:scale-95"
          >
            Cerrar
          </button>
          <div className="w-full max-w-7xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between gap-4 text-white/82">
              <div>
                <p className="font-label text-[10px] uppercase tracking-[0.16em] text-white/60">
                  Vista ampliada
                </p>
                <h3 className="mt-1 font-headline text-2xl font-light">{zoomSelection.title}</h3>
              </div>
              <span className="font-label text-[10px] uppercase tracking-[0.16em] text-white/60">
                {edition.title}
              </span>
            </div>
            <div
              className="overflow-hidden rounded-[1.5rem] border border-white/12 bg-white/6 shadow-[0_24px_80px_rgba(0,0,0,0.35)]"
              onWheel={handleZoomWheel}
              onPointerDown={handleZoomPointerDown}
              onPointerMove={handleZoomPointerMove}
              onPointerUp={handleZoomPointerUp}
              onPointerCancel={handleZoomPointerUp}
              onTouchStart={handleZoomTouchStart}
              onTouchMove={handleZoomTouchMove}
              onTouchEnd={handleZoomTouchEnd}
            >
              <div
                className="flex max-h-[78vh] min-h-[50vh] items-center justify-center overflow-hidden"
                style={{ cursor: zoomScale > 1 ? "grab" : "zoom-in" }}
              >
                <div
                  className={zoomSelection.pages.length > 1 ? "flex items-stretch gap-1 bg-white" : "bg-white"}
                  style={{
                    transform: `translate(${zoomOffset.x}px, ${zoomOffset.y}px) scale(${zoomScale})`,
                    transformOrigin: "center center",
                    transition: isZoomDragging ? "none" : "transform 140ms ease-out",
                  }}
                >
                  {zoomSelection.pages.map((page) => (
                    <div key={`zoom-${page.id}`} className="bg-white">
                      {renderZoomContent(page, 1100, 1550)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 text-white/60">
              <span className="font-label text-[10px] uppercase tracking-[0.16em]">
                Rueda o pellizca para zoom
              </span>
              <button
                type="button"
                onClick={resetZoomState}
                className="rounded-full border border-white/16 bg-white/8 px-4 py-2 font-label text-[10px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-white/14 active:scale-95"
              >
                Reset zoom
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
