"use client";

import { useEffect, useReducer, useRef } from "react";
import { useFabric } from "@/lib/canvas/use-fabric";
import * as pageStore from "@/lib/canvas/page-store";
import { withAnonymousImages } from "@/lib/canvas/fabric-json";
import { getPendingTemplate, clearPendingTemplate } from "@/lib/templates/pending-templates";
import { useCanvasContext } from "@/components/canvas/canvas-provider";

interface CanvasEditorProps {
  pageIndex: number;
  width: number;
  height: number;
  editionId?: string;
  onSave?: (thumbnail: string) => void;
}

type SaveState = { showIndicator: false } | { showIndicator: true; hideAt: number };

function saveReducer(state: SaveState, action: { type: "show" } | { type: "hide" }): SaveState {
  switch (action.type) {
    case "show":
      return { showIndicator: true, hideAt: Date.now() + 2000 };
    case "hide":
      return { showIndicator: false };
  }
}

export default function CanvasEditor({ pageIndex, width, height, editionId, onSave }: CanvasEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  /*
   * Final save on unmount. React runs effect cleanups in definition order, so
   * this effect MUST be defined before useFabric: its cleanup then runs before
   * fabric's dispose(). Reading the canvas after dispose() yields an empty
   * objects array, which used to overwrite the saved page with a blank one.
   */
  const unmountSaveRef = useRef<() => void>(() => {});
  useEffect(() => {
    return () => {
      unmountSaveRef.current();
    };
  }, []);

  const { fabricCanvas, isReady } = useFabric(canvasRef, width, height);

  const hasLoadedRef = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [saveState, dispatch] = useReducer(saveReducer, { showIndicator: false });
  const onSaveRef = useRef(onSave);
  useEffect(() => {
    onSaveRef.current = onSave;
  });

  const { registerCanvas, unregisterCanvas, activeCanvasIndex } = useCanvasContext();
  const isActive = activeCanvasIndex === pageIndex;

  // Debounced auto-save + event registration + provider registration
  useEffect(() => {
    if (!isReady || !fabricCanvas) return;

    const performSave = () => {
      // Never persist a canvas that fabric already disposed — it reads back
      // as empty and would wipe the stored page.
      const lifecycle = fabricCanvas as unknown as {
        disposed?: boolean;
        destroyed?: boolean;
      };
      if (lifecycle.disposed || lifecycle.destroyed) return;

      const json = fabricCanvas.toJSON();
      let thumbnail: string | undefined;
      try {
        thumbnail = fabricCanvas.toDataURL({
          format: "jpeg",
          quality: 0.6,
          multiplier: 0.5,
        });
      } catch {
        // Silently ignore thumbnail generation errors
      }
      if (thumbnail) {
        onSaveRef.current?.(thumbnail);
      }

      if (editionId) {
        pageStore
          .savePageApi(
            editionId,
            pageIndex,
            json as Record<string, unknown>,
            thumbnail,
          )
          .catch((err: unknown) => {
            console.error("[page-store] savePageApi failed:", err);
          });
      } else {
        pageStore
          .savePage(pageIndex, json as Record<string, unknown>, thumbnail)
          .catch((err: unknown) => {
            console.error("[page-store] savePage failed:", err);
          });
      }

      // Show save indicator briefly
      dispatch({ type: "show" });
    };

    const debouncedSave = () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(performSave, 500);
    };

    const debouncedMoveSave = () => {
      if (moveTimeoutRef.current) {
        clearTimeout(moveTimeoutRef.current);
      }
      moveTimeoutRef.current = setTimeout(performSave, 1000);
    };

    // Standard modification events — 500ms debounce
    fabricCanvas.on("object:modified", debouncedSave);
    fabricCanvas.on("object:added", debouncedSave);
    fabricCanvas.on("object:removed", debouncedSave);

    // Selection cleared — 500ms debounce
    fabricCanvas.on("selection:cleared", debouncedSave);

    // Object moving — 1000ms debounce for performance
    fabricCanvas.on("object:moving", debouncedMoveSave);

    // Register with CanvasProvider so tools know about this canvas
    registerCanvas(pageIndex, fabricCanvas);

    // Expose the save for the unmount effect (runs before fabric dispose)
    unmountSaveRef.current = performSave;

    // Load existing page state from store (one-time per mount)
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;

      // Check pending template cache first (template just applied)
      if (editionId) {
        const pendingJson = getPendingTemplate(editionId, pageIndex);
        if (pendingJson) {
          fabricCanvas.loadFromJSON(withAnonymousImages(pendingJson)).then(() => {
            clearPendingTemplate(editionId, pageIndex);
          }).catch(() => {
            // Silently ignore load errors — canvas starts fresh
          });
          return;
        }
      }

      const loadPromise = editionId
        ? pageStore.loadPageApi(editionId, pageIndex)
        : pageStore.loadPage(pageIndex);

      loadPromise
        .then((existing) => {
          if (existing?.fabricJSON) {
            fabricCanvas.loadFromJSON(withAnonymousImages(existing.fabricJSON)).catch(() => {
              // Silently ignore load errors — canvas starts fresh
            });
          }
        })
        .catch((err: unknown) => {
          console.error("[page-store] loadPage failed:", err);
        });
    }

    return () => {
      // The actual unmount save runs in the effect defined before useFabric —
      // by the time this cleanup executes, fabric may already be disposed.
      unmountSaveRef.current = () => {};

      fabricCanvas.off("object:modified");
      fabricCanvas.off("object:added");
      fabricCanvas.off("object:removed");
      fabricCanvas.off("selection:cleared");
      fabricCanvas.off("object:moving");

      unregisterCanvas(pageIndex);

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (moveTimeoutRef.current) {
        clearTimeout(moveTimeoutRef.current);
      }
    };
  }, [isReady, fabricCanvas, pageIndex, editionId, registerCanvas, unregisterCanvas]);

  // Auto-hide save indicator after 2 seconds
  useEffect(() => {
    if (!saveState.showIndicator) return;
    const id = setTimeout(() => dispatch({ type: "hide" }), 2000);
    return () => clearTimeout(id);
  }, [saveState.showIndicator]);

  return (
    <div
      className="relative h-full w-full border bg-white transition-colors"
      style={{
        cursor: "crosshair",
        borderColor: isActive
          ? "var(--color-primary)"
          : "var(--color-outline-variant)",
        borderWidth: isActive ? "2px" : "1px",
      }}
    >
      <canvas ref={canvasRef} />

      {/* Save indicator — fades in/out */}
      <div
        className="pointer-events-none absolute right-2 bottom-2 rounded bg-on-surface/70 px-2 py-0.5 font-label text-[10px] text-white transition-opacity duration-500"
        style={{ opacity: saveState.showIndicator ? 1 : 0 }}
      >
        Guardado ✓
      </div>
    </div>
  );
}
