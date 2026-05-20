"use client";

import Image from "next/image";

/** Cover data displayed on the front of the closed book */
interface CoverData {
  category: string;
  title: string;
  summary: string | null;
  month: string;
  year: string;
  coverUrl: string;
}

interface BookCoverProps {
  pageW: number;
  pageH: number;
  /** Whether edition data (including cover image) is available */
  tieneDatos: boolean;
  /** Cover data (required when tieneDatos is true) */
  coverData?: CoverData | null;
  /** Whether the book is currently open */
  isOpen: boolean;
}

/**
 * Front cover of the 3D book.
 * - When closed: shows the cover image / decorative lines + optional "Abrir" button.
 * - When open: rotates away (handled by parent via CSS transform).
 */
export function BookCover({
  pageW,
  pageH,
  tieneDatos,
  coverData,
  isOpen,
}: BookCoverProps) {
  return (
    <>
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
        {tieneDatos && coverData ? (
          <>
            <Image
              src={coverData.coverUrl}
              alt={`Portada: ${coverData.title}`}
              width={460}
              height={640}
              className="absolute inset-0 h-full w-full object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 via-on-surface/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-10 max-[980px]:p-6">
              <p className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/80">
                {coverData.category}
              </p>
              <h3 className="mt-2 font-headline text-3xl font-light leading-tight text-white max-[980px]:text-xl">
                {coverData.title}
              </h3>
              <p className="mt-3 line-clamp-3 font-body text-sm leading-relaxed text-white/70">
                {coverData.summary}
              </p>
              <p className="mt-4 font-label text-xs text-white/50">
                {coverData.month} {coverData.year}
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
    </>
  );
}

/* ── "Abrir" button (positioned absolutely over the closed book) ── */

interface OpenBookButtonProps {
  visible: boolean;
  onOpen: () => void;
}

export function OpenBookButton({ visible, onOpen }: OpenBookButtonProps) {
  if (!visible) return null;
  return (
    <button
      onClick={onOpen}
      className="absolute top-1/2 left-1/2 z-30 -translate-x-1/2 -translate-y-1/2 rounded-full bg-on-surface/80 px-7 py-2.5 font-label text-[11px] font-bold uppercase tracking-[0.15em] text-white shadow-lg backdrop-blur-sm transition-all hover:bg-on-surface hover:shadow-xl active:scale-95"
    >
      Abrir
    </button>
  );
}
