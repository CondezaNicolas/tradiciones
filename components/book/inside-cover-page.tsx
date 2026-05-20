"use client";

/** Static placeholder for the inside front cover (page 1) — not editable */
export function InsideCoverPage() {
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
