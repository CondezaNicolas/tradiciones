"use client";

import Image from "next/image";
import { FabricPageCanvas } from "@/components/canvas/fabric-page-canvas";
import { PlaceholderPage } from "@/components/magazine/zoom-page-content";

interface ReaderPageProps {
  pageNumber: number;
  thumbnailUrl?: string | null;
  fabricJson?: string | null;
  onZoom?: () => void;
}

export function ReaderPage({ pageNumber, thumbnailUrl, fabricJson, onZoom }: ReaderPageProps) {
  if (!thumbnailUrl && !fabricJson) {
    return <PlaceholderPage pageNumber={pageNumber} />;
  }

  return (
    <div className="relative h-full w-full bg-surface-container-lowest">
      <button
        type="button"
        onClick={onZoom}
        className="group relative block h-full w-full cursor-zoom-in overflow-hidden"
        aria-label={`Ampliar pagina ${pageNumber}`}
      >
        {fabricJson ? (
          <FabricPageCanvas
            fabricJson={fabricJson}
            width={460}
            height={640}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.01]"
          />
        ) : thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={`Pagina ${pageNumber}`}
            width={460}
            height={640}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.01]"
            draggable={false}
            unoptimized
          />
        ) : null}
        <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-surface/82 px-3 py-1 font-label text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100 md:opacity-0">
          Zoom
        </span>
      </button>
    </div>
  );
}
