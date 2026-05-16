"use client";

import { useEffect, useRef, useState } from "react";

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
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Guard against React 19 strict mode double-mount
    if (mountedRef.current) return;
    mountedRef.current = true;

    let cancelled = false;

    async function init() {
      const { Canvas } = await import("fabric");

      if (cancelled || !canvasRef.current) return;

      const fc = new Canvas(canvasRef.current, {
        width,
        height,
        backgroundColor: "#ffffff",
      });

      fabricCanvasRef.current = fc;
      setIsReady(true);
    }

    init();

    return () => {
      cancelled = true;
      mountedRef.current = false;

      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }

      setIsReady(false);
    };
  }, [canvasRef, width, height]);

  return { fabricCanvas: fabricCanvasRef.current, isReady };
}
