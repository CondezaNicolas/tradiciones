"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  use,
  type ReactNode,
} from "react";
import type { Canvas, FabricObject } from "fabric";

/* ────────────────────────── Context shape ────────────────────────── */

interface CanvasContextValue {
  addImage: (dataUrl: string) => void;
  deleteSelected: () => void;
  bringToFront: () => void;
  sendToBack: () => void;
  duplicateSelected: () => void;
  updateSelectedProperty: (props: Record<string, unknown>) => void;
  selectedElement: FabricObject | null;
  canvasReady: boolean;
  registerCanvas: (index: number, canvas: Canvas) => void;
  unregisterCanvas: (index: number) => void;
  activeCanvasIndex: number | null;
}

const CanvasContext = createContext<CanvasContextValue | null>(null);

/* ────────────────────────── Hook ────────────────────────── */

export function useCanvasContext(): CanvasContextValue {
  const ctx = use(CanvasContext);
  if (!ctx) {
    throw new Error("useCanvasContext must be used within a CanvasProvider");
  }
  return ctx;
}

/* ────────────────────────── Provider ────────────────────────── */

export function CanvasProvider({ children }: { children: ReactNode }) {
  const canvasesRef = useRef<Map<number, Canvas>>(new Map());
  const [activeCanvasIndex, setActiveCanvasIndex] = useState<number | null>(null);
  const [selectedElement, setSelectedElement] = useState<FabricObject | null>(null);

  // Ref so event handlers always see the latest activeCanvasIndex
  const activeIndexRef = useRef<number | null>(null);

  useEffect(() => {
    activeIndexRef.current = activeCanvasIndex;
  }, [activeCanvasIndex]);

  /* ── Helpers ── */

  const getActiveCanvas = useCallback((): Canvas | null => {
    const idx = activeIndexRef.current;
    if (idx === null) return null;
    return canvasesRef.current.get(idx) ?? null;
  }, []);

  /* ── Register / unregister ── */

  const registerCanvas = useCallback((index: number, canvas: Canvas) => {
    canvasesRef.current.set(index, canvas);

    const onMouseDown = () => {
      setActiveCanvasIndex(index);
      const activeObj = canvas.getActiveObject();
      setSelectedElement(activeObj ?? null);
    };

    const onSelectionCreated = (e: { selected?: FabricObject[] }) => {
      if (activeIndexRef.current === index) {
        setSelectedElement(e.selected?.[0] ?? null);
      }
    };

    const onSelectionUpdated = (e: { selected?: FabricObject[] }) => {
      if (activeIndexRef.current === index) {
        setSelectedElement(e.selected?.[0] ?? null);
      }
    };

    const onSelectionCleared = () => {
      if (activeIndexRef.current === index) {
        setSelectedElement(null);
      }
    };

    canvas.on("mouse:down", onMouseDown);
    canvas.on("selection:created", onSelectionCreated);
    canvas.on("selection:updated", onSelectionUpdated);
    canvas.on("selection:cleared", onSelectionCleared);
  }, []);

  const unregisterCanvas = useCallback(
    (index: number) => {
      const canvas = canvasesRef.current.get(index);
      if (canvas) {
        canvas.off("mouse:down");
        canvas.off("selection:created");
        canvas.off("selection:updated");
        canvas.off("selection:cleared");
        canvasesRef.current.delete(index);
      }

      // If the removed canvas was active, clear selection state
      if (activeIndexRef.current === index) {
        setActiveCanvasIndex(null);
        setSelectedElement(null);
      }
    },
    [],
  );

  /* ── Tool: add image ── */

  const addImage = useCallback(
    async (dataUrl: string) => {
      const canvas = getActiveCanvas();
      if (!canvas) return;

      const { FabricImage } = await import("fabric");

      const img = await FabricImage.fromURL(dataUrl);

      // Fit the image to the page size immediately — as large as possible
      // without cropping, no manual resizing needed or allowed.
      const pageW = canvas.getWidth();
      const pageH = canvas.getHeight();
      const origW = img.width || pageW;
      const origH = img.height || pageH;
      const scale = Math.min(pageW / origW, pageH / origH);

      img.set({
        left: pageW / 2,
        top: pageH / 2,
        scaleX: scale,
        scaleY: scale,
        originX: "center",
        originY: "center",
        hasControls: false,
        lockScalingX: true,
        lockScalingY: true,
      });

      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.requestRenderAll();
    },
    [getActiveCanvas],
  );

  /* ── Tool: delete selected ── */

  const deleteSelected = useCallback(() => {
    const canvas = getActiveCanvas();
    if (!canvas) return;

    const active = canvas.getActiveObject();
    if (!active) return;

    canvas.remove(active);
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    setSelectedElement(null);
  }, [getActiveCanvas]);

  /* ── Tool: bring to front ── */

  const bringToFront = useCallback(() => {
    const canvas = getActiveCanvas();
    if (!canvas) return;

    const active = canvas.getActiveObject();
    if (!active) return;

    canvas.bringObjectToFront(active);
    canvas.requestRenderAll();
    canvas.fire("object:modified" as never, { target: active } as never);
  }, [getActiveCanvas]);

  /* ── Tool: send to back ── */

  const sendToBack = useCallback(() => {
    const canvas = getActiveCanvas();
    if (!canvas) return;

    const active = canvas.getActiveObject();
    if (!active) return;

    canvas.sendObjectToBack(active);
    canvas.requestRenderAll();
    canvas.fire("object:modified" as never, { target: active } as never);
  }, [getActiveCanvas]);

  /* ── Tool: duplicate selected ── */

  const duplicateSelected = useCallback(async () => {
    const canvas = getActiveCanvas();
    if (!canvas) return;

    const active = canvas.getActiveObject();
    if (!active) return;

    const clone = await active.clone();
    clone.set({
      left: (clone.left ?? 0) + 20,
      top: (clone.top ?? 0) + 20,
    });

    canvas.add(clone);
    canvas.setActiveObject(clone);
    canvas.requestRenderAll();
    setSelectedElement(clone);
  }, [getActiveCanvas]);

  /* ── Tool: update selected property ── */

  const updateSelectedProperty = useCallback(
    (props: Record<string, unknown>) => {
      const canvas = getActiveCanvas();
      if (!canvas) return;

      const active = canvas.getActiveObject();
      if (!active) return;

      active.set(props);
      canvas.requestRenderAll();
      canvas.fire("object:modified" as never, { target: active } as never);
    },
    [getActiveCanvas],
  );

  /* ── Computed ── */

  const canvasReady = canvasesRef.current.size > 0;

  /* ── Render ── */

  return (
    <CanvasContext.Provider
      value={{
        addImage,
        deleteSelected,
        bringToFront,
        sendToBack,
        duplicateSelected,
        updateSelectedProperty,
        selectedElement,
        canvasReady,
        registerCanvas,
        unregisterCanvas,
        activeCanvasIndex,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
}
