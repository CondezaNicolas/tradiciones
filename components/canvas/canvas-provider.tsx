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

/* ────────────────────────── Types ────────────────────────── */

export interface TextPreset {
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string | number;
}

/* ────────────────────────── Context shape ────────────────────────── */

interface CanvasContextValue {
  addText: (preset?: TextPreset) => void;
  addImage: (dataUrl: string) => void;
  deleteSelected: () => void;
  bringToFront: () => void;
  sendToBack: () => void;
  duplicateSelected: () => void;
  updateSelectedProperty: (props: Record<string, unknown>) => void;
  getActiveCanvasObjects: () => FabricObject[];
  selectObject: (obj: FabricObject) => void;
  moveObject: (obj: FabricObject, direction: "forward" | "backward") => void;
  selectedElement: FabricObject | null;
  canvasReady: boolean;
  registerCanvas: (index: number, canvas: Canvas) => void;
  unregisterCanvas: (index: number) => void;
  activeCanvasIndex: number | null;
  layersVersion: number;
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

const ON_SURFACE_COLOR = "#1D1B20";

export function CanvasProvider({ children }: { children: ReactNode }) {
  const canvasesRef = useRef<Map<number, Canvas>>(new Map());
  const [activeCanvasIndex, setActiveCanvasIndex] = useState<number | null>(null);
  const [selectedElement, setSelectedElement] = useState<FabricObject | null>(null);
  const [layersVersion, setLayersVersion] = useState(0);

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

  const bumpLayers = useCallback(() => {
    setLayersVersion((v) => v + 1);
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

  /* ── Tool: add text ── */

  const addText = useCallback(async (preset?: TextPreset) => {
    const canvas = getActiveCanvas();
    if (!canvas) return;

    const { Textbox } = await import("fabric");

    const text = new Textbox(preset?.text ?? "Escribe aquí...", {
      left: canvas.getWidth() / 2,
      top: canvas.getHeight() / 2,
      width: 200,
      fontFamily: preset?.fontFamily ?? "Manrope",
      fontSize: preset?.fontSize ?? 24,
      fontWeight: preset?.fontWeight ?? "normal",
      fill: ON_SURFACE_COLOR,
      originX: "center",
      originY: "center",
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.requestRenderAll();
    bumpLayers();
  }, [getActiveCanvas, bumpLayers]);

  /* ── Tool: add image ── */

  const addImage = useCallback(
    async (dataUrl: string) => {
      const canvas = getActiveCanvas();
      if (!canvas) return;

      const { FabricImage } = await import("fabric");

      const img = await FabricImage.fromURL(dataUrl);

      // Scale to fit within 80% of canvas dimensions
      const maxW = canvas.getWidth() * 0.8;
      const maxH = canvas.getHeight() * 0.8;
      const origW = img.width ?? maxW;
      const origH = img.height ?? maxH;
      const scale = Math.min(maxW / origW, maxH / origH, 1);

      img.set({
        left: canvas.getWidth() / 2,
        top: canvas.getHeight() / 2,
        scaleX: scale,
        scaleY: scale,
        originX: "center",
        originY: "center",
      });

      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.requestRenderAll();
      bumpLayers();
    },
    [getActiveCanvas, bumpLayers],
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
    bumpLayers();
  }, [getActiveCanvas, bumpLayers]);

  /* ── Tool: bring to front ── */

  const bringToFront = useCallback(() => {
    const canvas = getActiveCanvas();
    if (!canvas) return;

    const active = canvas.getActiveObject();
    if (!active) return;

    canvas.bringObjectToFront(active);
    canvas.requestRenderAll();
    canvas.fire("object:modified" as never, { target: active } as never);
    bumpLayers();
  }, [getActiveCanvas, bumpLayers]);

  /* ── Tool: send to back ── */

  const sendToBack = useCallback(() => {
    const canvas = getActiveCanvas();
    if (!canvas) return;

    const active = canvas.getActiveObject();
    if (!active) return;

    canvas.sendObjectToBack(active);
    canvas.requestRenderAll();
    canvas.fire("object:modified" as never, { target: active } as never);
    bumpLayers();
  }, [getActiveCanvas, bumpLayers]);

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
    bumpLayers();
  }, [getActiveCanvas, bumpLayers]);

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

  /* ── Tool: get active canvas objects ── */

  const getActiveCanvasObjects = useCallback((): FabricObject[] => {
    const canvas = getActiveCanvas();
    if (!canvas) return [];
    return canvas.getObjects();
  }, [getActiveCanvas]);

  /* ── Tool: select specific object ── */

  const selectObject = useCallback((obj: FabricObject) => {
    const canvas = getActiveCanvas();
    if (!canvas) return;

    canvas.setActiveObject(obj);
    canvas.requestRenderAll();
    setSelectedElement(obj);
  }, [getActiveCanvas]);

  /* ── Tool: move object forward/backward by one step ── */

  const moveObject = useCallback(
    (obj: FabricObject, direction: "forward" | "backward") => {
      const canvas = getActiveCanvas();
      if (!canvas) return;

      if (direction === "forward") {
        canvas.bringObjectForward(obj);
      } else {
        canvas.sendObjectBackwards(obj);
      }
      canvas.requestRenderAll();
      canvas.fire("object:modified" as never, { target: obj } as never);
      bumpLayers();
    },
    [getActiveCanvas, bumpLayers],
  );

  /* ── Computed ── */

  const canvasReady = canvasesRef.current.size > 0;

  /* ── Render ── */

  return (
    <CanvasContext.Provider
      value={{
        addText,
        addImage,
        deleteSelected,
        bringToFront,
        sendToBack,
        duplicateSelected,
        updateSelectedProperty,
        getActiveCanvasObjects,
        selectObject,
        moveObject,
        selectedElement,
        canvasReady,
        registerCanvas,
        unregisterCanvas,
        activeCanvasIndex,
        layersVersion,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
}
