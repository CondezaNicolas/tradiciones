"use client";

import Image from "next/image";
import { FabricPageCanvas } from "@/components/canvas/fabric-page-canvas";

interface MagazinePage {
  id: string;
  pageNumber: number;
  thumbnailUrl: string | null;
  fabricJson?: string | null;
}

interface ZoomPageContentProps {
  page: MagazinePage;
  width: number;
  height: number;
}

export type { MagazinePage };

export function PlaceholderPage({ pageNumber }: { pageNumber: number }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-surface-container-lowest">
      <div className="text-center opacity-45">
        <span className="block font-label text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">
          Pagina {pageNumber}
        </span>
        <span className="mt-3 block font-body text-sm text-on-surface-variant/55">
          Contenido no disponible
        </span>
      </div>
    </div>
  );
}

export function ZoomPageContent({ page, width, height }: ZoomPageContentProps) {
  if (page.fabricJson) {
    return (
      <FabricPageCanvas
        fabricJson={page.fabricJson}
        width={width}
        height={height}
        className="h-auto max-h-[78vh] w-auto max-w-full"
      />
    );
  }

  if (page.thumbnailUrl) {
    return (
      <Image
        src={page.thumbnailUrl}
        alt={`Pagina ${page.pageNumber}`}
        width={width}
        height={height}
        className="h-auto max-h-[78vh] w-full object-contain"
        unoptimized
      />
    );
  }

  return <PlaceholderPage pageNumber={page.pageNumber} />;
}
