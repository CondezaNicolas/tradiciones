"use client";

import { useEffect, useRef } from "react";

// Cache the dynamic import so awaits in effects resolve immediately after first load
let fabricModuleCache: Promise<typeof import("fabric")> | null = null;
export function loadFabricModule() {
  if (!fabricModuleCache) fabricModuleCache = import("fabric");
  return fabricModuleCache;
}

interface FabricPageCanvasProps {
  fabricJson: string;
  width: number;
  height: number;
  className?: string;
}

export function FabricPageCanvas({ fabricJson, width, height, className }: FabricPageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    let disposed = false;
    let staticCanvas: InstanceType<typeof import("fabric").StaticCanvas> | null = null;

    const renderCanvas = () => {
      if (disposed || !canvasRef.current) return;

      loadFabricModule().then(({ StaticCanvas }) => {
        if (disposed || !canvasRef.current) return;

        staticCanvas = new StaticCanvas(canvasRef.current, {
          width,
          height,
          backgroundColor: "#ffffff",
          renderOnAddRemove: true,
        });

        staticCanvas.loadFromJSON(JSON.parse(fabricJson) as Record<string, unknown>).then(() => {
          if (disposed || !staticCanvas) return;
          staticCanvas.setDimensions({ width, height });
          staticCanvas.renderAll();
        });
      }).catch(() => {
        if (staticCanvas) {
          staticCanvas.dispose();
          staticCanvas = null;
        }
      });
    };

    renderCanvas();

    return () => {
      disposed = true;
      if (staticCanvas) {
        staticCanvas.dispose();
      }
    };
  }, [fabricJson, width, height]);

  return <canvas ref={canvasRef} width={width} height={height} className={className} />;
}
