"use client";

interface BookSpineProps {
  /** @deprecated Not used internally — kept for API consistency */
  spreadW?: number;
  /** @deprecated Not used internally — kept for API consistency */
  pageH?: number;
  /** The spine label — e.g. "Enero 2026" or "Chile País de Tradiciones" */
  label: string;
}

/**
 * Decorative book spine (left edge of the 3D book).
 * Contains a vertical label and a subtle gradient overlay.
 */
export function BookSpine({ label }: BookSpineProps) {
  return (
    <div className="relative w-12 shrink-0 overflow-hidden rounded-l-lg border-y border-l border-outline-variant/30 bg-surface-container-high">
      <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-on-surface/5 to-transparent" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-label text-[9px] font-bold uppercase tracking-[0.3em] text-on-surface-variant/40 [writing-mode:vertical-lr]">
          {label}
        </span>
      </div>
    </div>
  );
}
