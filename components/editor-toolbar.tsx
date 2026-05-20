"use client";

import { useCanvasContext } from "@/components/canvas/canvas-provider";
import {
  MdFormatBold,
  MdFormatItalic,
  MdFlipToFront,
  MdFlipToBack,
  MdDeleteOutline,
} from "react-icons/md";

function Divider() {
  return <div className="mx-1 h-6 w-px bg-outline-variant/20" />;
}

export default function EditorToolbar() {
  const {
    selectedElement,
    updateSelectedProperty,
    deleteSelected,
    bringToFront,
    sendToBack,
    activeCanvasIndex,
  } = useCanvasContext();

  if (activeCanvasIndex === null) return null;

  const hasSelection = selectedElement !== null;
  const el = selectedElement as Record<string, unknown> | null;

  const isText = selectedElement?.type === "textbox";
  const isImage = selectedElement?.type === "image";

  const fontSize = isText ? Number(el?.fontSize ?? 24) : 0;
  const isBold = isText
    ? el?.fontWeight === "bold" || Number(el?.fontWeight ?? 0) >= 700
    : false;
  const isItalic = isText ? el?.fontStyle === "italic" : false;
  const rawFill = el?.fill;
  const fill =
    isText && typeof rawFill === "string" && rawFill.startsWith("#")
      ? rawFill
      : "#1D1B20";
  const opacity = hasSelection ? Number(el?.opacity ?? 1) : 1;
  const imgW = isImage
    ? Math.round(Number(el?.width ?? 0) * Number(el?.scaleX ?? 1))
    : 0;
  const imgH = isImage
    ? Math.round(Number(el?.height ?? 0) * Number(el?.scaleY ?? 1))
    : 0;

  return (
    <div className="flex h-12 w-full items-center gap-1.5 rounded-lg border-b border-outline-variant/10 bg-surface/90 px-3 backdrop-blur-md">
      {!hasSelection ? (
        <span className="w-full text-center font-label text-[11px] text-on-surface-variant/40">
          Seleccioná un elemento
        </span>
      ) : (
        <>
          {/* ── Text-specific controls ── */}
          {isText && (
            <>
              <input
                type="number"
                value={fontSize}
                min={8}
                max={200}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v) && v >= 8 && v <= 200) {
                    updateSelectedProperty({ fontSize: v });
                  }
                }}
                className="h-7 w-[60px] rounded border border-outline-variant/30 bg-surface-container-lowest px-2 font-label text-[11px] text-on-surface outline-none focus:border-primary"
                title="Tamaño de fuente"
              />

              <Divider />

              <button
                type="button"
                onClick={() =>
                  updateSelectedProperty({
                    fontWeight: isBold ? "normal" : "bold",
                  })
                }
                title="Negrita"
                className={`flex size-8 items-center justify-center rounded transition-colors ${
                  isBold
                    ? "bg-primary/15 text-primary"
                    : "text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                <MdFormatBold size={18} />
              </button>

              <button
                type="button"
                onClick={() =>
                  updateSelectedProperty({
                    fontStyle: isItalic ? "normal" : "italic",
                  })
                }
                title="Itálica"
                className={`flex size-8 items-center justify-center rounded transition-colors ${
                  isItalic
                    ? "bg-primary/15 text-primary"
                    : "text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                <MdFormatItalic size={18} />
              </button>

              <Divider />

              <label
                className="relative flex size-8 items-center justify-center"
                title="Color"
              >
                <span className="sr-only">Color del texto</span>
                <input
                  type="color"
                  value={fill}
                  onChange={(e) =>
                    updateSelectedProperty({ fill: e.target.value })
                  }
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
                <div
                  className="size-5 rounded-full border border-outline-variant/40"
                  style={{ backgroundColor: fill }}
                />
              </label>

              <Divider />
            </>
          )}

          {/* ── Image-specific controls ── */}
          {isImage && (
            <>
              <span className="font-label text-[11px] text-on-surface-variant/60">
                {imgW} × {imgH}
              </span>
              <Divider />
            </>
          )}

          {/* ── Opacity slider (all types) ── */}
          <div className="flex items-center gap-2">
            <span className="font-label text-[10px] text-on-surface-variant/50">
              {Math.round(opacity * 100)}%
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={opacity}
              onChange={(e) =>
                updateSelectedProperty({ opacity: parseFloat(e.target.value) })
              }
              className="h-1 w-20 cursor-pointer appearance-none rounded bg-outline-variant/30 accent-primary"
              title="Opacidad"
            />
          </div>

          <Divider />

          {/* ── Common: z-order ── */}
          <button
            type="button"
            onClick={bringToFront}
            title="Traer al frente"
            className="flex size-8 items-center justify-center rounded text-on-surface-variant transition-colors hover:bg-surface-container-high"
          >
            <MdFlipToFront size={16} />
          </button>

          <button
            type="button"
            onClick={sendToBack}
            title="Enviar atrás"
            className="flex size-8 items-center justify-center rounded text-on-surface-variant transition-colors hover:bg-surface-container-high"
          >
            <MdFlipToBack size={16} />
          </button>

          <Divider />

          {/* ── Common: delete ── */}
          <button
            type="button"
            onClick={deleteSelected}
            title="Eliminar"
            className="flex size-8 items-center justify-center rounded text-on-surface-variant transition-colors hover:bg-error-container hover:text-error"
          >
            <MdDeleteOutline size={16} />
          </button>
        </>
      )}
    </div>
  );
}
