"use client";

import { useCanvasContext } from "@/components/canvas/canvas-provider";
import type { FabricObject } from "fabric";
import {
  MdTextFields,
  MdImage,
  MdLayers,
  MdFlipToFront,
  MdFlipToBack,
  MdDeleteOutline,
} from "react-icons/md";

/* ────────────────────────── Helpers ────────────────────────── */

function getObjectLabel(obj: FabricObject): string {
  switch (obj.type) {
    case "textbox":
      return "Texto";
    case "image":
      return "Imagen";
    default:
      return obj.type ?? "Elemento";
  }
}

function getObjectIcon(obj: FabricObject) {
  return obj.type === "image" ? MdImage : MdTextFields;
}

/* ────────────────────────── Component ────────────────────────── */

export default function EditorSidebarLayersTab() {
  const {
    selectedElement,
    activeCanvasIndex,
    getActiveCanvasObjects,
    selectObject,
    moveObject,
    deleteSelected,
    layersVersion,
  } = useCanvasContext();

  const noCanvas = activeCanvasIndex === null;

  // Get layers for the active canvas — layersVersion forces re-evaluation
  const objects = noCanvas ? [] : getActiveCanvasObjects();
  // Reverse so top layers appear first (like Canva)
  const layers = [...objects].reverse();

  // Exhaust layersVersion dependency for reactive updates
  void layersVersion;

  return (
    <div className="flex flex-col gap-2">
      {layers.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <MdLayers size={32} className="text-on-surface-variant/20" />
          <span className="font-label text-[10px] text-on-surface-variant/40">
            No hay elementos en esta página
          </span>
        </div>
      ) : (
        <>
          <span className="font-label text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface-variant/50">
            Elementos ({layers.length})
          </span>

          <div className="flex flex-col gap-1">
            {layers.map((obj) => {
              const Icon = getObjectIcon(obj);
              const isSelected = selectedElement === obj;
              return (
                <button
                  key={`layer-${obj.type}-${Math.round(obj.left ?? 0)}-${Math.round(obj.top ?? 0)}`}
                  type="button"
                  onClick={() => selectObject(obj)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left transition-all duration-200 ${
                    isSelected
                      ? "bg-primary/10 text-on-surface"
                      : "text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  <Icon
                    size={16}
                    className={
                      isSelected
                        ? "text-primary"
                        : "text-on-surface-variant/60"
                    }
                  />
                  <span className="flex-1 font-label text-[11px]">
                    {getObjectLabel(obj)}
                  </span>
                  <div
                    className="flex gap-0.5"
                    role="group"
                    aria-label="Ordenar capa"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") e.stopPropagation(); }}
                  >
                    <button
                      type="button"
                      onClick={() => moveObject(obj, "forward")}
                      title="Traer adelante"
                      className="flex size-6 items-center justify-center rounded text-on-surface-variant/50 transition-colors hover:bg-surface-container-high hover:text-on-surface-variant"
                    >
                      <MdFlipToFront size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveObject(obj, "backward")}
                      title="Enviar atrás"
                      className="flex size-6 items-center justify-center rounded text-on-surface-variant/50 transition-colors hover:bg-surface-container-high hover:text-on-surface-variant"
                    >
                      <MdFlipToBack size={14} />
                    </button>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Delete selected element */}
          {selectedElement && (
            <div className="mt-4 border-t border-outline-variant/15 pt-3">
              <button
                type="button"
                onClick={deleteSelected}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-error/30 px-3 py-2 font-label text-[11px] font-medium text-error transition-all duration-200 hover:bg-error-container active:scale-95"
              >
                <MdDeleteOutline size={16} />
                Eliminar
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
