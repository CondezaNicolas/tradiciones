"use client";

interface PageControlStatus {
  canPrev: boolean;
  canNext: boolean;
  isAnimating: boolean;
  isOpen: boolean;
  isMobile: boolean;
}

interface MagazinePageControlProps {
  currentLabel: string;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  status: PageControlStatus;
}

export function MagazinePageControl({
  currentLabel,
  onPrev,
  onNext,
  onClose,
  status,
}: MagazinePageControlProps) {
  const { canPrev, canNext, isAnimating, isOpen, isMobile } = status;
  return (
    <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
      <button
        type="button"
        onClick={onClose}
        disabled={!isOpen}
        className="rounded-full border border-outline-variant/30 px-5 py-2 font-label text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-25 active:scale-95"
      >
        Cerrar
      </button>

      <div className="mx-1 h-5 w-px bg-outline-variant/20" />

      <button
        type="button"
        onClick={onPrev}
        disabled={!isOpen || isAnimating || !canPrev}
        className="rounded-full border border-outline-variant/30 px-4 py-2 font-label text-[11px] uppercase tracking-[0.12em] text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-25 active:scale-95"
      >
        ← Anterior
      </button>

      <span className="min-w-[92px] text-center font-label text-[11px] uppercase tracking-[0.12em] text-on-surface-variant/65">
        {currentLabel}
      </span>

      <button
        type="button"
        onClick={onNext}
        disabled={!isOpen || isAnimating || !canNext}
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
  );
}
