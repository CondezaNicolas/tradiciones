"use client";

import dynamic from "next/dynamic";
import { useState, useCallback } from "react";
import { nanoid } from "nanoid";
import { CanvasProvider } from "@/components/canvas/canvas-provider";
import { EditorErrorBoundary } from "@/components/canvas/editor-error-boundary";
import { useBookFlip } from "@/lib/hooks/use-book-flip";
import { useIsMobile } from "@/lib/hooks/use-is-mobile";
import type { PageTemplate } from "@/lib/templates/types";
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

interface EdicionFormData {
  titulo: string;
  categoria: string;
  mes: string;
  anio: string;
  resumen: string;
  imagenPortada: string;
}

/* ───────────────────────────── Main page ─────────────────────────────── */

export default function NuevaEdicionPage() {
  const [data] = useState<EdicionFormData | null>(null);
  const [tempEditionId] = useState(() => nanoid());

  const MAX_PAGES = 20;

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
    addPageWithTemplate,
  } = useBookFlip();

  const handleApplyTemplate = useCallback(
    (template: PageTemplate) => {
      if (totalPages >= MAX_PAGES) return;

      const newPageIndex = addPageWithTemplate(template, tempEditionId);
      if (newPageIndex < 0) return;

      const targetSpreadIndex = Math.floor(newPageIndex / 2);
      if (targetSpreadIndex !== currentSpread) {
        const direction = targetSpreadIndex > currentSpread ? "next" : "prev";
        dispatchFlip({ type: "start", direction, target: targetSpreadIndex });
      }

      dispatchEditor({ type: "edit", pageIndex: newPageIndex });
    },
    [totalPages, addPageWithTemplate, tempEditionId, currentSpread, dispatchFlip, dispatchEditor],
  );

  const isMobile = useIsMobile();

  const tieneDatos = data !== null && data.imagenPortada !== "";

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
    tieneDatos && data
      ? {
          category: data.categoria,
          title: data.titulo,
          summary: data.resumen,
          month: data.mes,
          year: data.anio,
          coverUrl: data.imagenPortada,
        }
      : undefined;

  const spineLabel =
    tieneDatos && data
      ? `${data.mes} ${data.anio}`
      : "Chile País de Tradiciones";

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
            {tieneDatos && data ? data.titulo : "Nueva Revista"}
          </h2>
        </div>
      </header>

      {/* ── Book area + Sidebar ────────────────────────────────────────── */}
      <CanvasProvider>
        <div className="flex items-start justify-center px-12 py-20 max-[980px]:px-5">
          {/* Sidebar — only when a page is being edited */}
          {tieneDatos && isOpen && isEditing && !isMobile && <EditorSidebar editionId={tempEditionId} onApplyTemplate={handleApplyTemplate} />}

          {/* Book */}
          <EditorErrorBoundary>
            <div className="flex flex-col items-center">
              {/* Toolbar — only when editing a page */}
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
                  editionId={tempEditionId}
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
