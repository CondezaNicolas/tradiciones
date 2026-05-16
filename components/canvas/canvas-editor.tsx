"use client";

import { useEffect, useRef, useState } from "react";
import { useFabric } from "@/lib/canvas/use-fabric";
import * as pageStore from "@/lib/canvas/page-store";
import { useCanvasContext } from "@/components/canvas/canvas-provider";

interface CanvasEditorProps {
  pageIndex: number;
  width: number;
  height: number;
  editionId?: string;
  onSave?: (thumbnail: string) => void;
}

export default function CanvasEditor({ pageIndex, width, height, editionId, onSave }: CanvasEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { fabricCanvas, isReady } = useFabric(canvasRef, width, height);

  const hasLoadedRef = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const saveIndicatorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
      setShowSaveIndicator(true);
      if (saveIndicatorTimeoutRef.current) {
        clearTimeout(saveIndicatorTimeoutRef.current);
      }
      saveIndicatorTimeoutRef.current = setTimeout(() => {
        setShowSaveIndicator(false);
      }, 2000);
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

    // Load existing page state from store (one-time per mount)
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      const loadPromise = editionId
        ? pageStore.loadPageApi(editionId, pageIndex)
        : pageStore.loadPage(pageIndex);

      loadPromise
        .then((existing) => {
          if (existing?.fabricJSON) {
            fabricCanvas.loadFromJSON(existing.fabricJSON).catch(() => {
              // Silently ignore load errors — canvas starts fresh
            });
          }
        })
        .catch((err: unknown) => {
          console.error("[page-store] loadPage failed:", err);
        });
    }

    return () => {
      // Force immediate save on unmount (preserves work when closing editor)
      try {
        if (fabricCanvas) {
          const json = fabricCanvas.toJSON();
          let thumbnail: string | undefined;
          try {
            thumbnail = fabricCanvas.toDataURL({
              format: "jpeg",
              quality: 0.6,
              multiplier: 0.5,
            });
          } catch {
            // Silently ignore
          }
          if (editionId) {
            pageStore
              .savePageApi(
                editionId,
                pageIndex,
                json as Record<string, unknown>,
                thumbnail,
              )
              .catch(() => {});
          } else {
            pageStore
              .savePage(pageIndex, json as Record<string, unknown>, thumbnail)
              .catch(() => {});
          }

          if (thumbnail) {
            onSaveRef.current?.(thumbnail);
          }
        }
      } catch {
        // Guard against errors during unmount save
      }

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
      if (saveIndicatorTimeoutRef.current) {
        clearTimeout(saveIndicatorTimeoutRef.current);
      }
    };
  }, [isReady, fabricCanvas, pageIndex, editionId, registerCanvas, unregisterCanvas]);

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
        style={{ opacity: showSaveIndicator ? 1 : 0 }}
      >
        Guardado ✓
      </div>
    </div>
  );
}
