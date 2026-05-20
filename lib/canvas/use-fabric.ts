"use client";

import { useEffect, useRef, useReducer } from "react";

// Cache the dynamic import so awaits in effects resolve immediately after first load
let fabricModuleCache: Promise<typeof import("fabric")> | null = null;
function loadFabricModule() {
  if (!fabricModuleCache) fabricModuleCache = import("fabric");
  return fabricModuleCache;
}

interface FabricState {
  fabricCanvas: InstanceType<typeof import("fabric").Canvas> | null;
  isReady: boolean;
}

type FabricAction =
  | { type: "initialized"; canvas: InstanceType<typeof import("fabric").Canvas> }
  | { type: "reset" };

interface UseFabricReturn {
  fabricCanvas: InstanceType<typeof import("fabric").Canvas> | null;
  isReady: boolean;
}

export function useFabric(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  width: number,
  height: number,
): UseFabricReturn {
  const fabricCanvasRef = useRef<InstanceType<typeof import("fabric").Canvas> | null>(null);
  const mountedRef = useRef(false);
  const [state, dispatch] = useReducer(
    (prev: FabricState, action: FabricAction): FabricState => {
      switch (action.type) {
        case "initialized": return { fabricCanvas: action.canvas, isReady: true };
        case "reset": return { fabricCanvas: null, isReady: false };
      }
    },
    { fabricCanvas: null, isReady: false },
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Guard against React 19 strict mode double-mount
    if (mountedRef.current) return;
    mountedRef.current = true;

    let cancelled = false;

    function init() {
      if (cancelled || !canvasRef.current) return;

      loadFabricModule().then((fabricModule) => {
        if (cancelled || !canvasRef.current) return;

        const fc = new fabricModule.Canvas(canvasRef.current, {
          width,
          height,
          backgroundColor: "#ffffff",
        });

        fabricCanvasRef.current = fc;
        dispatch({ type: "initialized", canvas: fc });
      });
    }

    init();

    return () => {
      cancelled = true;
      mountedRef.current = false;

      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }

      dispatch({ type: "reset" });
    };
  }, [canvasRef, width, height]);

  return state;
}
