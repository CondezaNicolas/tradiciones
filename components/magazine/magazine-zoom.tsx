"use client";

import {
  useEffect,
  useReducer,
  useRef,
  type TouchEvent as ReactTouchEvent,
  type WheelEvent as ReactWheelEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { ZoomPageContent, type MagazinePage } from "./zoom-page-content";

interface ZoomSelection {
  title: string;
  pages: MagazinePage[];
}

interface ZoomState {
  scale: number;
  offset: { x: number; y: number };
  isDragging: boolean;
}

type ZoomAction =
  | { type: "reset" }
  | { type: "scale"; value: number }
  | { type: "offset"; value: { x: number; y: number } }
  | { type: "dragging"; value: boolean };

function zoomReducer(state: ZoomState, action: ZoomAction): ZoomState {
  switch (action.type) {
    case "reset":
      return { scale: 1, offset: { x: 0, y: 0 }, isDragging: false };
    case "scale":
      return { ...state, scale: action.value };
    case "offset":
      return { ...state, offset: action.value };
    case "dragging":
      return { ...state, isDragging: action.value };
  }
}

const INITIAL_ZOOM_STATE: ZoomState = { scale: 1, offset: { x: 0, y: 0 }, isDragging: false };

interface MagazineZoomProps {
  zoomSelection: ZoomSelection | null;
  editionTitle: string;
  onClose: () => void;
}

function clampZoom(value: number) {
  return Math.min(4, Math.max(1, value));
}

export function MagazineZoom({ zoomSelection, editionTitle, onClose }: MagazineZoomProps) {
  const [zoom, dispatchZoom] = useReducer(zoomReducer, INITIAL_ZOOM_STATE);

  const zoomDragStartRef = useRef<{ x: number; y: number } | null>(null);
  const zoomOffsetStartRef = useRef({ x: 0, y: 0 });
  const pinchDistanceRef = useRef<number | null>(null);
  const pinchScaleRef = useRef(1);

  // Stable ref for onClose so the effect doesn't re-subscribe on every render
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!zoomSelection) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [zoomSelection]);

  const resetZoomState = () => {
    dispatchZoom({ type: "reset" });
  };

  const handleClose = () => {
    onClose();
    resetZoomState();
  };

  const handleZoomWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const nextScale = clampZoom(zoom.scale + (event.deltaY < 0 ? 0.18 : -0.18));
    dispatchZoom({ type: "scale", value: nextScale });
    if (nextScale === 1) {
      dispatchZoom({ type: "offset", value: { x: 0, y: 0 } });
    }
  };

  const handleZoomPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (zoom.scale <= 1) return;
    zoomDragStartRef.current = { x: event.clientX, y: event.clientY };
    zoomOffsetStartRef.current = zoom.offset;
    dispatchZoom({ type: "dragging", value: true });
  };

  const handleZoomPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!zoomDragStartRef.current || zoom.scale <= 1) return;

    const deltaX = event.clientX - zoomDragStartRef.current.x;
    const deltaY = event.clientY - zoomDragStartRef.current.y;

    dispatchZoom({
      type: "offset",
      value: {
        x: zoomOffsetStartRef.current.x + deltaX,
        y: zoomOffsetStartRef.current.y + deltaY,
      },
    });
  };

  const handleZoomPointerUp = () => {
    zoomDragStartRef.current = null;
    dispatchZoom({ type: "dragging", value: false });
  };

  const getTouchDistance = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (event.touches.length < 2) return null;
    const [first, second] = [event.touches[0], event.touches[1]];
    return Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY);
  };

  const handleZoomTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    const distance = getTouchDistance(event);
    if (distance === null) return;
    pinchDistanceRef.current = distance;
    pinchScaleRef.current = zoom.scale;
  };

  const handleZoomTouchMove = (event: ReactTouchEvent<HTMLDivElement>) => {
    const distance = getTouchDistance(event);
    if (distance === null || pinchDistanceRef.current === null) return;

    const nextScale = clampZoom(pinchScaleRef.current * (distance / pinchDistanceRef.current));
    dispatchZoom({ type: "scale", value: nextScale });
    if (nextScale === 1) {
      dispatchZoom({ type: "offset", value: { x: 0, y: 0 } });
    }
  };

  const handleZoomTouchEnd = () => {
    pinchDistanceRef.current = null;
    pinchScaleRef.current = zoom.scale;
  };

  if (!zoomSelection) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/78 px-4 py-8 backdrop-blur-md"
      onClick={handleClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") handleClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={zoomSelection.title}
    >
      <button
        type="button"
        onClick={handleClose}
        className="absolute right-5 top-5 rounded-full border border-white/20 bg-white/10 px-4 py-2 font-label text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-white/18 active:scale-95"
      >
        Cerrar
      </button>
      <div
        className="w-full max-w-7xl"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
        role="document"
      >
        <div className="mb-4 flex items-center justify-between gap-4 text-white/82">
          <div>
            <p className="font-label text-[10px] uppercase tracking-[0.16em] text-white/60">
              Vista ampliada
            </p>
            <h3 className="mt-1 font-headline text-2xl font-light">{zoomSelection.title}</h3>
          </div>
          <span className="font-label text-[10px] uppercase tracking-[0.16em] text-white/60">
            {editionTitle}
          </span>
        </div>
        <div
          className="overflow-hidden rounded-[1.5rem] border border-white/12 bg-white/6 shadow-[0_24px_80px_rgba(0,0,0,0.35)]"
          onWheel={handleZoomWheel}
          onPointerDown={handleZoomPointerDown}
          onPointerMove={handleZoomPointerMove}
          onPointerUp={handleZoomPointerUp}
          onPointerCancel={handleZoomPointerUp}
          onTouchStart={handleZoomTouchStart}
          onTouchMove={handleZoomTouchMove}
          onTouchEnd={handleZoomTouchEnd}
        >
          <div
            className="flex max-h-[78vh] min-h-[50vh] items-center justify-center overflow-hidden"
            style={{ cursor: zoom.scale > 1 ? "grab" : "zoom-in" }}
          >
            <div
              className={zoomSelection.pages.length > 1 ? "flex items-stretch gap-1 bg-white" : "bg-white"}
              style={{
                transform: `translate(${zoom.offset.x}px, ${zoom.offset.y}px) scale(${zoom.scale})`,
                transformOrigin: "center center",
                transition: zoom.isDragging ? "none" : "transform 140ms ease-out",
              }}
            >
              {zoomSelection.pages.map((page) => (
                <div key={`zoom-${page.id}`} className="bg-white">
                  <ZoomPageContent page={page} width={1100} height={1550} />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 text-white/60">
          <span className="font-label text-[10px] uppercase tracking-[0.16em]">
            Rueda o pellizca para zoom
          </span>
          <button
            type="button"
            onClick={resetZoomState}
            className="rounded-full border border-white/16 bg-white/8 px-4 py-2 font-label text-[10px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-white/14 active:scale-95"
          >
            Reset zoom
          </button>
        </div>
      </div>
    </div>
  );
}

export type { ZoomSelection };
