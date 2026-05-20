"use client";

import { useCanvasContext } from "@/components/canvas/canvas-provider";

export default function EditorSidebarTextTab() {
  const { addText, activeCanvasIndex } = useCanvasContext();
  const noCanvas = activeCanvasIndex === null;

  return (
    <div className="flex flex-col gap-3">
      <span className="font-label text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface-variant/50">
        Agregar Texto
      </span>

      <button
        type="button"
        onClick={() =>
          addText({
            text: "Título",
            fontFamily: "Newsreader",
            fontSize: 48,
          })
        }
        disabled={noCanvas}
        className="flex w-full items-center rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-4 text-left transition-all duration-200 hover:bg-surface-container-high active:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span
          className="text-on-surface"
          style={{
            fontFamily: "Newsreader",
            fontSize: "28px",
            lineHeight: 1,
          }}
        >
          Título
        </span>
      </button>

      <button
        type="button"
        onClick={() =>
          addText({
            text: "Subtítulo",
            fontFamily: "Manrope",
            fontSize: 32,
            fontWeight: "bold",
          })
        }
        disabled={noCanvas}
        className="flex w-full items-center rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-left transition-all duration-200 hover:bg-surface-container-high active:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span
          className="text-on-surface"
          style={{
            fontFamily: "Manrope",
            fontSize: "20px",
            fontWeight: "bold",
            lineHeight: 1,
          }}
        >
          Subtítulo
        </span>
      </button>

      <button
        type="button"
        onClick={() =>
          addText({
            text: "Cuerpo de texto",
            fontFamily: "Manrope",
            fontSize: 18,
          })
        }
        disabled={noCanvas}
        className="flex w-full items-center rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-left transition-all duration-200 hover:bg-surface-container-high active:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span
          className="text-on-surface"
          style={{
            fontFamily: "Manrope",
            fontSize: "14px",
            lineHeight: 1,
          }}
        >
          Cuerpo de texto
        </span>
      </button>
    </div>
  );
}
