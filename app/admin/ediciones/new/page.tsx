"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState, useEffect } from "react";
import { CanvasProvider } from "@/components/canvas/canvas-provider";
import { EditorErrorBoundary } from "@/components/canvas/editor-error-boundary";
import * as pageStore from "@/lib/canvas/page-store";

const CanvasEditor = dynamic(() => import("@/components/canvas/canvas-editor"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-surface-container-lowest">
      <span className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant/40">
        Cargando editor...
      </span>
    </div>
  ),
});

const EditorSidebar = dynamic(() => import("@/components/editor-sidebar"), {
  ssr: false,
});

const EditorToolbar = dynamic(() => import("@/components/editor-toolbar"), {
  ssr: false,
});

const INITIAL_PAGES = 2;
const MAX_PAGES = 20;

interface EdicionFormData {
  titulo: string;
  categoria: string;
  mes: string;
  anio: string;
  resumen: string;
  imagenPortada: string;
}

/* ───────────────────────── Interior page renderer ───────────────────────── */

function InteriorPage() {
  return (
    <div className="flex h-full items-center justify-center bg-surface-container-lowest">
      <span className="px-4 text-center font-label text-[11px] uppercase tracking-widest text-on-surface-variant/40">
        El editor visual solo está disponible en desktop
      </span>
    </div>
  );
}

/** Static placeholder for the inside front cover (page 1) — not editable */
function InsideCoverPage() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-surface-container-lowest">
      <div className="text-center opacity-30">
        <div className="mx-auto mb-4 h-px w-20 bg-outline-variant" />
        <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
          Interior de portada
        </span>
        <div className="mx-auto mt-4 h-px w-20 bg-outline-variant" />
      </div>
    </div>
  );
}

/** Read-only page preview with thumbnail and "Editar página" button */
function ReadOnlyPage({
  pageIndex,
  onEdit,
  thumbnail: thumbnailProp,
}: {
  pageIndex: number;
  onEdit: () => void;
  thumbnail?: string | null;
}) {
  const [loadedThumbnail, setLoadedThumbnail] = useState<string | null>(null);
  const thumbnail = thumbnailProp ?? loadedThumbnail;

  useEffect(() => {
    if (thumbnailProp) return;
    let cancelled = false;
    pageStore
      .loadPage(pageIndex)
      .then((data) => {
        if (!cancelled && data?.thumbnail) {
          setLoadedThumbnail(data.thumbnail);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [pageIndex, thumbnailProp]);

  return (
    <div
      className="group relative h-full w-full cursor-pointer bg-surface-container-lowest"
      onClick={onEdit}
    >
      {thumbnail ? (
        <Image
          src={thumbnail}
          alt={`Página ${pageIndex}`}
          width={460}
          height={640}
          className="h-full w-full object-contain"
          draggable={false}
          unoptimized
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <span className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant/30">
            Página vacía
          </span>
        </div>
      )}
      {/* Hover overlay with edit button */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-on-surface/0 transition-all duration-200 group-hover:bg-on-surface/8">
        <button
          type="button"
          className="pointer-events-auto scale-95 rounded-full bg-on-surface/80 px-6 py-2.5 font-label text-[11px] font-bold uppercase tracking-[0.15em] text-white opacity-0 shadow-lg backdrop-blur-sm transition-all duration-200 group-hover:scale-100 group-hover:opacity-100"
        >
          Editar página
        </button>
      </div>
    </div>
  );
}

/* ───────────────────────────── Main page ─────────────────────────────── */

export default function NuevaEdicionPage() {
  const [data] = useState<EdicionFormData | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [currentSpread, setCurrentSpread] = useState(0);
  const [totalPages, setTotalPages] = useState(INITIAL_PAGES);
  const totalSpreads = Math.floor(totalPages / 2);
  const canAddPages = totalPages < MAX_PAGES;
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 979px)").matches,
  );
  const [editingPageIndex, setEditingPageIndex] = useState<number | null>(null);
  const isEditing = editingPageIndex !== null;
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});

  /* ── Flip animation state ── */
  const [flipPhase, setFlipPhase] = useState<"idle" | "ready" | "flipping">("idle");
  const [flipDirection, setFlipDirection] = useState<"next" | "prev">("next");
  const [targetSpread, setTargetSpread] = useState(0);
  const isAnimating = flipPhase !== "idle";

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 979px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  /* Trigger flip animation after the overlay mounts at rotateY(0) */
  useEffect(() => {
    if (flipPhase !== "ready") return;
    const id = requestAnimationFrame(() => setFlipPhase("flipping"));
    return () => cancelAnimationFrame(id);
  }, [flipPhase]);

  const tieneDatos = data !== null && data.imagenPortada !== "";

  const maxIndex = isMobile ? totalPages - 1 : totalSpreads - 1;

  const pageLabel = isMobile
    ? `${currentSpread + 1} / ${totalPages}`
    : `${currentSpread * 2 + 1}-${currentSpread * 2 + 2} / ${totalPages}`;

  const pageW = isMobile ? 300 : 460;
  const pageH = isMobile ? 440 : 640;
  const spreadW = pageW * 2;

  /* ── Flip navigation handlers ── */
  const goToNext = () => {
    if (isAnimating || isEditing || currentSpread >= maxIndex) return;
    setFlipDirection("next");
    setTargetSpread(currentSpread + 1);
    setFlipPhase("ready");
  };

  const goToPrev = () => {
    if (isAnimating || isEditing || currentSpread <= 0) return;
    setFlipDirection("prev");
    setTargetSpread(currentSpread - 1);
    setFlipPhase("ready");
  };

  const onFlipEnd = (e: React.TransitionEvent) => {
    if (e.propertyName !== "transform") return;
    setCurrentSpread(targetSpread);
    setFlipPhase("idle");
  };

  const addPages = () => {
    if (!canAddPages || isAnimating || isEditing) return;
    setTotalPages((prev) => Math.min(prev + 2, MAX_PAGES));
  };

  /* ── Page renderer: per-page editing ── */
  const renderPage = (pageIndex: number) => {
    // Page 1 is inside front cover — not editable
    if (pageIndex === 1) {
      return <InsideCoverPage />;
    }

    // Mobile: fallback message
    if (isMobile) {
      return <InteriorPage />;
    }

    // Page is currently being edited — show live Fabric.js canvas
    if (pageIndex === editingPageIndex) {
      return (
        <CanvasEditor
          key={`page-${pageIndex}`}
          pageIndex={pageIndex}
          width={pageW}
          height={pageH}
          onSave={(thumb) =>
            setThumbnails((prev) => ({ ...prev, [pageIndex]: thumb }))
          }
        />
      );
    }

    return (
      <ReadOnlyPage
        pageIndex={pageIndex}
        onEdit={() => setEditingPageIndex(pageIndex)}
        thumbnail={thumbnails[pageIndex]}
      />
    );
  };

  return (
    <>
      {/* ── Header ────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 flex items-end justify-between gap-6 bg-surface/80 px-12 py-8 backdrop-blur-md max-[980px]:flex-col max-[980px]:items-start max-[980px]:px-5 max-[980px]:py-6">
        <div>
          <nav className="mb-2 flex items-center gap-2 font-label text-[11px] uppercase tracking-widest text-on-surface-variant">
            <span>DASHBOARD</span>
            <span className="mx-1">/</span>
            <span>EDICIONES</span>
            <span className="mx-1">/</span>
            <span className="font-bold text-primary">NUEVA</span>
          </nav>
          <h2 className="font-headline text-4xl font-light text-on-surface max-[980px]:text-[2.4rem]">
            {tieneDatos ? data.titulo : "Nueva Revista"}
          </h2>
        </div>
      </header>

      {/* ── Book area + Sidebar ────────────────────────────────────────── */}
      <CanvasProvider>
        <div className="flex items-start justify-center px-12 py-20 max-[980px]:px-5">
          {/* Sidebar — only when a page is being edited */}
          {tieneDatos && isOpen && isEditing && !isMobile && <EditorSidebar />}

          {/* Book */}
          <EditorErrorBoundary>
          <div className="flex flex-col items-center">
            {/* Toolbar + close button — only when editing a page */}
            {tieneDatos && isOpen && isEditing && !isMobile && (
              <div style={{ width: spreadW }} className="mb-3">
                <div className="mb-2 flex items-center gap-2 rounded-lg border border-outline-variant/10 bg-surface/90 px-3 py-1.5 backdrop-blur-md">
                  <span className="font-label text-[10px] font-medium uppercase tracking-[0.12em] text-primary">
                    Editando página {editingPageIndex}
                  </span>
                  <div className="flex-1" />
                  <button
                    type="button"
                    onClick={() => setEditingPageIndex(null)}
                    className="rounded-full border border-outline-variant/30 px-4 py-1 font-label text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant transition-colors hover:bg-surface-container-high active:scale-95"
                  >
                    Cerrar editor
                  </button>
                </div>
                <EditorToolbar />
              </div>
            )}
            {/* Wrapper: positioning context for the "Abrir" button */}
            <div className="relative">
          <div className="relative" style={{ perspective: "1200px" }}>
            {/* Páginas apiladas (hojas visibles desde abajo) */}
            {!isOpen && (
              <>
                <div className="absolute inset-0 translate-x-[14px] translate-y-[14px] rounded-lg border border-outline-variant/20 bg-surface-container-high" />
                <div className="absolute inset-0 translate-x-[10px] translate-y-[10px] rounded-lg border border-outline-variant/20 bg-surface-container-high" />
                <div className="absolute inset-0 translate-x-[6px] translate-y-[6px] rounded-lg border border-outline-variant/20 bg-surface-container-high" />
              </>
            )}

            {/* Libro principal */}
            <div
              className="relative flex"
              style={{
                transformStyle: "preserve-3d",
                transform: "rotateY(-8deg)",
              }}
            >
              {/* Lomo del libro */}
              <div className="relative w-12 shrink-0 overflow-hidden rounded-l-lg border-y border-l border-outline-variant/30 bg-surface-container-high">
                <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-on-surface/5 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-label text-[9px] font-bold uppercase tracking-[0.3em] text-on-surface-variant/40 [writing-mode:vertical-lr]">
                    {tieneDatos
                      ? `${data.mes} ${data.anio}`
                      : "Chile País de Tradiciones"}
                  </span>
                </div>
              </div>

              {/* Área de contenido: tapa + páginas interiores */}
              <div
                className="relative"
                style={{
                  width: isOpen && !isMobile ? spreadW : pageW,
                  height: pageH,
                  transition: "width 500ms ease-in-out",
                  perspective: "1200px",
                }}
              >
                {/* ── Páginas interiores (visibles al abrir) ──────────── */}
                {tieneDatos && data && (
                  <div
                    className="absolute inset-0 rounded-r-lg bg-surface-container-lowest"
                    style={{
                      boxShadow: "inset 2px 0 6px rgba(0,0,0,0.05)",
                      overflow: isAnimating ? "visible" : "hidden",
                    }}
                  >
                    {isMobile ? (
                      /* ─── Mobile: full-page flip ─── */
                      isAnimating ? (
                        <div className="relative h-full w-full">
                          {/* Target page underneath */}
                          <div className="absolute inset-0">
                            {renderPage(targetSpread + 1)}
                          </div>
                          {/* Current page flipping away */}
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
                                  flipPhase === "flipping"
                                    ? `rotateY(${flipDirection === "next" ? "-180deg" : "180deg"})`
                                    : "rotateY(0deg)",
                                transition:
                                  flipPhase === "flipping"
                                    ? "transform 400ms ease-in-out"
                                    : "none",
                              }}
                              onTransitionEnd={onFlipEnd}
                            >
                              {renderPage(currentSpread + 1)}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full w-full">
                          {renderPage(currentSpread + 1)}
                        </div>
                      )
                    ) : (
                      /* ─── Desktop: spread with page flip ─── */
                      isAnimating ? (
                        <div className="flex h-full w-full">
                          {/* Left page (target spread) */}
                          <div
                            className="relative h-full flex-1"
                            style={{
                              boxShadow: "inset -4px 0 8px rgba(0,0,0,0.04)",
                            }}
                          >
                            {renderPage(targetSpread * 2 + 1)}

                            {/* "Prev" flip: left page rotates right → reveals previous spread */}
                            {flipDirection === "prev" && (
                              <div
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  perspective: "1200px",
                                }}
                              >
                                <div
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    transformStyle: "preserve-3d",
                                    transformOrigin: "right center",
                                    willChange: "transform",
                                    transform:
                                      flipPhase === "flipping"
                                        ? "rotateY(180deg)"
                                        : "rotateY(0deg)",
                                    transition:
                                      flipPhase === "flipping"
                                        ? "transform 550ms ease-in-out"
                                        : "none",
                                  }}
                                  onTransitionEnd={onFlipEnd}
                                >
                                  {/* Front: current left page */}
                                  <div
                                    style={{
                                      position: "absolute",
                                      inset: 0,
                                      backfaceVisibility: "hidden",
                                      background: "var(--color-surface-container-lowest)",
                                    }}
                                  >
                                    {renderPage(currentSpread * 2 + 1)}
                                    {/* Protective overlay during flip to mask canvas rendering glitches */}
                                    <div
                                      style={{
                                        position: "absolute",
                                        inset: 0,
                                        background: "var(--color-surface-container-lowest)",
                                        opacity: flipPhase === "flipping" ? 0.5 : 0,
                                        transition: "opacity 200ms",
                                        pointerEvents: "none",
                                      }}
                                    />
                                  </div>
                                  {/* Back: paper verso */}
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

                          {/* Spine */}
                          <div
                            className="relative z-10 w-[4px] shrink-0"
                            style={{
                              background:
                                "linear-gradient(to right, rgba(0,0,0,0.10), rgba(0,0,0,0.03), rgba(0,0,0,0.10))",
                              boxShadow: "0 0 8px rgba(0,0,0,0.06)",
                            }}
                          />

                          {/* Right page (target spread) */}
                          <div
                            className="relative h-full flex-1"
                            style={{
                              boxShadow: "inset 4px 0 8px rgba(0,0,0,0.04)",
                            }}
                          >
                            {renderPage(targetSpread * 2 + 2)}

                            {/* "Next" flip: right page rotates left → reveals next spread */}
                            {flipDirection === "next" && (
                              <div
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  perspective: "1200px",
                                }}
                              >
                                <div
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    transformStyle: "preserve-3d",
                                    transformOrigin: "left center",
                                    willChange: "transform",
                                    transform:
                                      flipPhase === "flipping"
                                        ? "rotateY(-180deg)"
                                        : "rotateY(0deg)",
                                    transition:
                                      flipPhase === "flipping"
                                        ? "transform 550ms ease-in-out"
                                        : "none",
                                    boxShadow:
                                      flipPhase === "flipping"
                                        ? "-4px 0 18px rgba(0,0,0,0.12)"
                                        : "none",
                                  }}
                                  onTransitionEnd={onFlipEnd}
                                >
                                  {/* Front: current right page */}
                                  <div
                                    style={{
                                      position: "absolute",
                                      inset: 0,
                                      backfaceVisibility: "hidden",
                                      background: "var(--color-surface-container-lowest)",
                                    }}
                                  >
                                    {renderPage(currentSpread * 2 + 2)}
                                    {/* Protective overlay during flip to mask canvas rendering glitches */}
                                    <div
                                      style={{
                                        position: "absolute",
                                        inset: 0,
                                        background: "var(--color-surface-container-lowest)",
                                        opacity: flipPhase === "flipping" ? 0.5 : 0,
                                        transition: "opacity 200ms",
                                        pointerEvents: "none",
                                      }}
                                    />
                                  </div>
                                  {/* Back: paper verso */}
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
                        /* Normal spread — no animation */
                        <div className="flex h-full w-full">
                          <div
                            className="h-full flex-1"
                            style={{ boxShadow: "inset -4px 0 8px rgba(0,0,0,0.04)" }}
                          >
                            {renderPage(currentSpread * 2 + 1)}
                          </div>
                          <div
                            className="relative z-10 w-[4px] shrink-0"
                            style={{
                              background:
                                "linear-gradient(to right, rgba(0,0,0,0.10), rgba(0,0,0,0.03), rgba(0,0,0,0.10))",
                              boxShadow: "0 0 8px rgba(0,0,0,0.06)",
                            }}
                          />
                          <div
                            className="h-full flex-1"
                            style={{ boxShadow: "inset 4px 0 8px rgba(0,0,0,0.04)" }}
                          >
                            {renderPage(currentSpread * 2 + 2)}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* ── Tapa del libro (se abre con rotateY) ────────────── */}
                <div
                  className="absolute top-0 left-0 overflow-hidden rounded-r-lg border border-outline-variant/30 bg-surface"
                  style={{
                    width: pageW,
                    height: pageH,
                    transformOrigin: "left center",
                    transform: isOpen ? "rotateY(-160deg)" : "rotateY(0deg)",
                    transition: "transform 600ms ease",
                    backfaceVisibility: "hidden",
                  }}
                >
                  {tieneDatos ? (
                    <>
                      <Image
                        src={data.imagenPortada}
                        alt={`Portada: ${data.titulo}`}
                        width={460}
                        height={640}
                        className="absolute inset-0 h-full w-full object-cover"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 via-on-surface/20 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-10 max-[980px]:p-6">
                        <p className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/80">
                          {data.categoria}
                        </p>
                        <h3 className="mt-2 font-headline text-3xl font-light leading-tight text-white max-[980px]:text-xl">
                          {data.titulo}
                        </h3>
                        <p className="mt-3 line-clamp-3 font-body text-sm leading-relaxed text-white/70">
                          {data.resumen}
                        </p>
                        <p className="mt-4 font-label text-xs text-white/50">
                          {data.mes} {data.anio}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Líneas decorativas del contorno */}
                      <div className="absolute inset-6 border border-outline-variant/15 rounded" />
                      <div className="absolute inset-8 border border-outline-variant/10 rounded" />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Botón "Abrir" (fuera del contexto 3D) ──────────────── */}
          {tieneDatos && !isOpen && (
            <button
              onClick={() => {
                setIsOpen(true);
                setCurrentSpread(0);
              }}
              className="absolute top-1/2 left-1/2 z-30 -translate-x-1/2 -translate-y-1/2 rounded-full bg-on-surface/80 px-7 py-2.5 font-label text-[11px] font-bold uppercase tracking-[0.15em] text-white shadow-lg backdrop-blur-sm transition-all hover:bg-on-surface hover:shadow-xl active:scale-95"
            >
              Abrir
            </button>
          )}
        </div>

        {/* ── Navegación entre páginas / Barra de edición ──────────────────────────────────── */}
        {tieneDatos && isOpen && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {isEditing ? (
              <>
                <span className="font-label text-[11px] text-on-surface-variant/50">
                  Página {editingPageIndex} de {totalPages}
                </span>
                <div className="mx-1 h-5 w-px bg-outline-variant/20" />
                <button
                  onClick={() => setEditingPageIndex(null)}
                  className="rounded-full border border-outline-variant/30 px-5 py-2 font-label text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant transition-colors hover:bg-surface-container-high active:scale-95"
                >
                  Listo
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full border border-outline-variant/30 px-5 py-2 font-label text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant transition-colors hover:bg-surface-container-high active:scale-95"
                >
                  Cerrar
                </button>

                <div className="mx-1 h-5 w-px bg-outline-variant/20" />

                <button
                  onClick={goToPrev}
                  disabled={isAnimating || currentSpread === 0}
                  className="rounded-full border border-outline-variant/30 px-4 py-2 font-label text-[11px] uppercase tracking-[0.12em] text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-25 active:scale-95"
                >
                  ← Anterior
                </button>

                <span className="min-w-[72px] text-center font-label text-[11px] text-on-surface-variant/60">
                  {pageLabel}
                </span>

                <button
                  onClick={goToNext}
                  disabled={isAnimating || currentSpread >= maxIndex}
                  className="rounded-full border border-outline-variant/30 px-4 py-2 font-label text-[11px] uppercase tracking-[0.12em] text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-25 active:scale-95"
                >
                  Siguiente →
                </button>

                {canAddPages && (
                  <>
                    <div className="mx-1 h-5 w-px bg-outline-variant/20" />

                    <button
                      onClick={addPages}
                      disabled={isAnimating}
                      className="rounded-full border border-outline-variant/30 px-4 py-2 font-label text-[11px] uppercase tracking-[0.12em] text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-25 active:scale-95"
                    >
                      + Agregar páginas
                    </button>
                  </>
                 )}
               </>
             )}
           </div>
         )}
           </div>
           </EditorErrorBoundary>
     </div>
     </CanvasProvider>
   </>
   );
}
