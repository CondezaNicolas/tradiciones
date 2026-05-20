"use client";

/** Mobile-only static placeholder — canvas editor is not available on small viewports */
export function InteriorPage() {
  return (
    <div className="flex h-full items-center justify-center bg-surface-container-lowest">
      <span className="px-4 text-center font-label text-[11px] uppercase tracking-widest text-on-surface-variant/40">
        El editor visual solo está disponible en desktop
      </span>
    </div>
  );
}
