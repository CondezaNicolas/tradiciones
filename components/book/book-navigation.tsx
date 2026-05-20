"use client";

interface BookNavigationProps {
  currentSpread: number;
  maxIndex: number;
  /** @deprecated Not used internally — kept for API consistency */
  isMobile?: boolean;
  totalPages: number;
  canAddPages: boolean;
  pageLabel: string;
  onPrev: () => void;
  onNext: () => void;
  onAddPages: () => void;
  onClose: () => void;
  isAnimating: boolean;
  isEditing: boolean;
  editingPageIndex: number | null;
  onCloseEditor: () => void;
}

/**
 * Bottom navigation bar shown when the book is open.
 * Renders either the editor mode toolbar or the page navigation controls.
 */
export function BookNavigation({
  currentSpread,
  maxIndex,
  totalPages,
  canAddPages,
  pageLabel,
  onPrev,
  onNext,
  onAddPages,
  onClose,
  isAnimating,
  isEditing,
  editingPageIndex,
  onCloseEditor,
}: BookNavigationProps) {
  return (
    <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
      {isEditing ? (
        <>
          <span className="font-label text-[11px] text-on-surface-variant/50">
            Página {editingPageIndex} de {totalPages}
          </span>
          <div className="mx-1 h-5 w-px bg-outline-variant/20" />
          <button
            onClick={onCloseEditor}
            className="rounded-full border border-outline-variant/30 px-5 py-2 font-label text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant transition-colors hover:bg-surface-container-high active:scale-95"
          >
            Listo
          </button>
        </>
      ) : (
        <>
          <button
            onClick={onClose}
            className="rounded-full border border-outline-variant/30 px-5 py-2 font-label text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant transition-colors hover:bg-surface-container-high active:scale-95"
          >
            Cerrar
          </button>

          <div className="mx-1 h-5 w-px bg-outline-variant/20" />

          <button
            onClick={onPrev}
            disabled={isAnimating || currentSpread === 0}
            className="rounded-full border border-outline-variant/30 px-4 py-2 font-label text-[11px] uppercase tracking-[0.12em] text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-25 active:scale-95"
          >
            ← Anterior
          </button>

          <span className="min-w-[72px] text-center font-label text-[11px] text-on-surface-variant/60">
            {pageLabel}
          </span>

          <button
            onClick={onNext}
            disabled={isAnimating || currentSpread >= maxIndex}
            className="rounded-full border border-outline-variant/30 px-4 py-2 font-label text-[11px] uppercase tracking-[0.12em] text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-25 active:scale-95"
          >
            Siguiente →
          </button>

          {canAddPages && (
            <>
              <div className="mx-1 h-5 w-px bg-outline-variant/20" />

              <button
                onClick={onAddPages}
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
  );
}
