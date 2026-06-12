"use client";

import dynamic from "next/dynamic";
import { InsideCoverPage } from "./inside-cover-page";
import { InteriorPage } from "./interior-page";
import { ReadOnlyPage } from "./read-only-page";

const CanvasEditor = dynamic(() => import("@/components/canvas/canvas-editor"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-surface-container-lowest">
      <span className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant/40">
        Cargando editor…
      </span>
    </div>
  ),
});

interface PageSlotProps {
  pageIndex: number;
  editingPageIndex: number | null;
  isMobile: boolean;
  pageW: number;
  pageH: number;
  editionId?: string;
  thumbnails: Record<number, string>;
  onThumbnailUpdate: (pageIndex: number, url: string) => void;
  onEdit: (pageIndex: number | null) => void;
}

/**
 * Renders the correct content for a single page slot:
 * inside cover, mobile placeholder, canvas editor, or read-only preview.
 */
export function PageSlot({
  pageIndex,
  editingPageIndex,
  isMobile,
  pageW,
  pageH,
  editionId,
  thumbnails,
  onThumbnailUpdate,
  onEdit,
}: PageSlotProps) {
  if (pageIndex === 1) {
    return <InsideCoverPage />;
  }

  if (isMobile) {
    return <InteriorPage />;
  }

  if (pageIndex === editingPageIndex) {
    return (
      <CanvasEditor
        key={`page-${pageIndex}`}
        pageIndex={pageIndex}
        width={pageW}
        height={pageH}
        {...(editionId ? { editionId } : {})}
        onSave={(thumb: string) => onThumbnailUpdate(pageIndex, thumb)}
      />
    );
  }

  return (
    <ReadOnlyPage
      pageIndex={pageIndex}
      onEdit={() => onEdit(pageIndex)}
      thumbnail={thumbnails[pageIndex]}
      editionId={editionId}
    />
  );
}
