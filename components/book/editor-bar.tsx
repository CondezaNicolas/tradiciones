"use client";

import dynamic from "next/dynamic";

const EditorToolbar = dynamic(() => import("@/components/editor-toolbar"), {
  ssr: false,
});

interface EditorBarProps {
  spreadW: number;
  editingPageIndex: number | null;
  onClose: () => void;
}

/**
 * Top toolbar bar shown above the book when a page is being edited on desktop.
 * Displays the current page indicator, a close button, and the editor toolbar.
 */
export function EditorBar({ spreadW, editingPageIndex, onClose }: EditorBarProps) {
  return (
    <div style={{ width: spreadW }} className="mb-3">
      <div className="mb-2 flex items-center gap-2 rounded-lg border border-outline-variant/10 bg-surface/90 px-3 py-1.5 backdrop-blur-md">
        <span className="font-label text-[10px] font-medium uppercase tracking-[0.12em] text-primary">
          Editando página {editingPageIndex}
        </span>
        <div className="flex-1" />
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-outline-variant/30 px-4 py-1 font-label text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant transition-colors hover:bg-surface-container-high active:scale-95"
        >
          Cerrar editor
        </button>
      </div>
      <EditorToolbar />
    </div>
  );
}
