"use client";

import { useState, useReducer } from "react";
import dynamic from "next/dynamic";
import { CanvasProvider } from "@/components/canvas/canvas-provider";
import { EditorErrorBoundary } from "@/components/canvas/editor-error-boundary";
import { useBookFlip } from "@/lib/hooks/use-book-flip";
import { useIsMobile } from "@/lib/hooks/use-is-mobile";
import {
  Book3D,
  BookCover,
  OpenBookButton,
  BookNavigation,
  EditorBar,
} from "@/components/book";

const EditorSidebar = dynamic(() => import("@/components/editor-sidebar"), {
  ssr: false,
});

/* ───────────────────────── Edition types ───────────────────────── */

export interface EditionData {
  id: string;
  title: string;
  category: string;
  month: string;
  year: string;
  summary: string | null;
  coverImageUrl: string | null;
  status: "draft" | "published";
}

type EditionState =
  | { status: "loaded"; edition: EditionData }
  | { status: "error"; error: string };

function editionReducer(_state: EditionState, action: EditionState): EditionState {
  return action;
}

/* ───────────────────────── Client component ───────────────────────── */

export function EditionEditorClient({ initialEdition }: { initialEdition: EditionData }) {
  const [state, dispatch] = useReducer(editionReducer, { status: "loaded", edition: initialEdition } as EditionState);

  const edition = state.status === "loaded" ? state.edition : null;
  const loadError = state.status === "error" ? state.error : null;

  const updateEdition = (updater: (prev: EditionData) => EditionData) => {
    if (state.status === "loaded") {
      dispatch({ status: "loaded", edition: updater(state.edition) });
    }
  };

  /* ── Shared book hooks ── */
  const {
    isOpen,
    currentSpread,
    totalPages,
    totalSpreads,
    canAddPages,
    flipPhase,
    flipDirection,
    targetSpread,
    isAnimating,
    editingPageIndex,
    isEditing,
    thumbnails,
    dispatchBook,
    dispatchFlip,
    dispatchEditor,
    onFlipEnd,
    addPages,
  } = useBookFlip();

  const isMobile = useIsMobile();

  /* ── Edition-specific save/publish state ── */
  const [savingStatus, setSavingStatus] = useState<"idle" | "saving">("idle");

  const handleSaveStatus = async (newStatus: "draft" | "published") => {
    if (!edition || savingStatus === "saving") return;
    setSavingStatus("saving");
    try {
      const res = await fetch(`/api/admin/editions/${edition.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Error al guardar");
      const updated = await res.json();
      updateEdition((prev) => ({ ...prev, status: updated.status }));
    } catch {
      alert("Error al guardar la edición");
    } finally {
      setSavingStatus("idle");
    }
  };

  const tieneDatos = edition !== null && !!edition.coverImageUrl;

  /* ── Computed values ── */
  const maxIndex = isMobile ? totalPages - 1 : totalSpreads - 1;
  const pageLabel = isMobile
    ? `${currentSpread + 1} / ${totalPages}`
    : `${currentSpread * 2 + 1}-${currentSpread * 2 + 2} / ${totalPages}`;

  const pageW = isMobile ? 300 : 460;
  const pageH = isMobile ? 440 : 640;
  const spreadW = pageW * 2;

  /* ── Navigation (overridden for mobile-aware maxIndex) ── */
  const goToNext = () => {
    if (isAnimating || isEditing || currentSpread >= maxIndex) return;
    dispatchFlip({ type: "start", direction: "next", target: currentSpread + 1 });
  };

  const goToPrev = () => {
    if (isAnimating || isEditing || currentSpread <= 0) return;
    dispatchFlip({ type: "start", direction: "prev", target: currentSpread - 1 });
  };

  /* ── Cover data for BookCover component ── */
  const coverData =
    tieneDatos && edition
      ? {
          category: edition.category,
          title: edition.title,
          summary: edition.summary,
          month: edition.month,
          year: edition.year,
          coverUrl: edition.coverImageUrl!,
        }
      : undefined;

  const spineLabel =
    tieneDatos && edition
      ? `${edition.month} ${edition.year}`
      : "Chile País de Tradiciones";

  /* ── Error guard ── */
  if (loadError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="font-body text-base text-on-surface-variant/70">{loadError}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="cursor-pointer rounded-md border border-primary px-6 py-2 font-label text-sm tracking-wide text-primary transition-colors hover:bg-surface-container-low active:scale-95"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <>
      {/* ── Header with save/publish controls ── */}
      <header className="sticky top-0 z-30 flex items-end justify-between gap-6 bg-surface/80 px-12 py-8 backdrop-blur-md max-[980px]:flex-col max-[980px]:items-start max-[980px]:px-5 max-[980px]:py-6">
        <div>
          <nav className="mb-2 flex items-center gap-2 font-label text-[11px] uppercase tracking-widest text-on-surface-variant">
            <span>DASHBOARD</span>
            <span className="mx-1">/</span>
            <span>EDICIONES</span>
            <span className="mx-1">/</span>
            <span className="font-bold text-primary">{edition?.title ?? "Edición"}</span>
          </nav>
          <h2 className="font-headline text-4xl font-light text-on-surface max-[980px]:text-[2.4rem]">
            {tieneDatos ? edition!.title : "Nueva Revista"}
          </h2>
          {edition?.status && (
            <span className={`mt-2 inline-block rounded-full px-3 py-0.5 font-label text-[10px] font-bold uppercase tracking-[0.15em] ${
              edition.status === "published"
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-700"
            }`}>
              {edition.status === "published" ? "Publicada" : "Borrador"}
            </span>
          )}
        </div>
        {tieneDatos && (
          <div className="flex shrink-0 items-center gap-3 max-[980px]:w-full max-[980px]:flex-col">
            <button
              onClick={() => handleSaveStatus("draft")}
              disabled={savingStatus === "saving"}
              className="cursor-pointer rounded-full border border-outline-variant/40 px-6 py-2.5 font-label text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant transition-colors hover:bg-surface-container-high active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {savingStatus === "saving" ? "Guardando..." : "Guardar borrador"}
            </button>
            <button
              onClick={() => handleSaveStatus("published")}
              disabled={savingStatus === "saving"}
              className="cursor-pointer rounded-full bg-primary px-6 py-2.5 font-label text-[11px] font-bold uppercase tracking-[0.12em] text-on-primary transition-colors hover:bg-primary/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {savingStatus === "saving" ? "Publicando..." : "Publicar"}
            </button>
          </div>
        )}
      </header>

      {/* ── Book area + Sidebar ── */}
      <CanvasProvider>
        <div className="flex items-start justify-center px-12 py-20 max-[980px]:px-5">
          {tieneDatos && isOpen && isEditing && !isMobile && <EditorSidebar editionId={edition!.id} />}

          <EditorErrorBoundary>
            <div className="flex flex-col items-center">
              {tieneDatos && isOpen && isEditing && !isMobile && (
                <EditorBar
                  spreadW={spreadW}
                  editingPageIndex={editingPageIndex}
                  onClose={() =>
                    dispatchEditor({ type: "edit", pageIndex: null })
                  }
                />
              )}

              {/* Wrapper: positioning context for the "Abrir" button */}
              <div className="relative">
                <Book3D
                  spreadW={spreadW}
                  pageW={pageW}
                  pageH={pageH}
                  isOpen={isOpen}
                  isAnimating={isAnimating}
                  flipPhase={flipPhase}
                  flipDirection={flipDirection}
                  targetSpread={targetSpread}
                  currentSpread={currentSpread}
                  isMobile={isMobile}
                  editingPageIndex={editingPageIndex}
                  editionId={edition!.id}
                  thumbnails={thumbnails}
                  onThumbnailUpdate={(pageIndex, url) =>
                    dispatchEditor({ type: "setThumbnail", pageIndex, url })
                  }
                  onEdit={(pageIndex) =>
                    dispatchEditor({ type: "edit", pageIndex })
                  }
                  onFlipEnd={onFlipEnd}
                  spineLabel={spineLabel}
                  tieneDatos={tieneDatos}
                />

                {/*
                  Cover wrapper — replicates the 3D container context so the
                  cover inherits the same rotateY(-8deg) tilt and perspective
                  it had when nested inside Book3D's grid. Offset left-12
                  accounts for the BookSpine width (w-12 = 48px).
                */}
                <div
                  className="absolute top-0 left-12"
                  style={{
                    perspective: "1200px",
                    transformStyle: "preserve-3d",
                    transform: "rotateY(-8deg)",
                  }}
                >
                  <BookCover
                    pageW={pageW}
                    pageH={pageH}
                    tieneDatos={tieneDatos}
                    coverData={coverData}
                    isOpen={isOpen}
                  />
                </div>

                <OpenBookButton
                  visible={tieneDatos && !isOpen}
                  onOpen={() => dispatchBook({ type: "open" })}
                />
              </div>

              {/* ── Navigation bar ── */}
              {tieneDatos && isOpen && (
                <BookNavigation
                  currentSpread={currentSpread}
                  maxIndex={maxIndex}
                  totalPages={totalPages}
                  canAddPages={canAddPages}
                  pageLabel={pageLabel}
                  onPrev={goToPrev}
                  onNext={goToNext}
                  onAddPages={addPages}
                  onClose={() => dispatchBook({ type: "close" })}
                  isAnimating={isAnimating}
                  isEditing={isEditing}
                  editingPageIndex={editingPageIndex}
                  onCloseEditor={() =>
                    dispatchEditor({ type: "edit", pageIndex: null })
                  }
                />
              )}
            </div>
          </EditorErrorBoundary>
        </div>
      </CanvasProvider>
    </>
  );
}
