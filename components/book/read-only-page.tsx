"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import * as pageStore from "@/lib/canvas/page-store";

interface ReadOnlyPageProps {
  pageIndex: number;
  onEdit: () => void;
  thumbnail?: string | null;
  editionId?: string;
}

export function ReadOnlyPage({ pageIndex, onEdit, thumbnail: thumbnailProp, editionId }: ReadOnlyPageProps) {
  const [loadedThumbnail, setLoadedThumbnail] = useState<string | null>(null);
  const thumbnail = thumbnailProp ?? loadedThumbnail;

  useEffect(() => {
    if (thumbnailProp) return;
    let cancelled = false;
    const loadPromise = editionId
      ? pageStore.loadPageApi(editionId, pageIndex)
      : pageStore.loadPage(pageIndex);

    loadPromise
      .then((data) => {
        if (!cancelled && data?.thumbnail) {
          setLoadedThumbnail(data.thumbnail);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [pageIndex, thumbnailProp, editionId]);

  return (
    <div
      className="group relative h-full w-full cursor-pointer bg-surface-container-lowest"
      role="button"
      tabIndex={0}
      onClick={onEdit}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onEdit(); }}
    >
      {thumbnail ? (
        <Image
          src={thumbnail}
          alt={`Página ${pageIndex}`}
          width={460}
          height={640}
          className="h-full w-full object-contain"
          draggable={false}
          unoptimized
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <span className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant/30">
            Página vacía
          </span>
        </div>
      )}
      {/* Hover overlay with edit button */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-on-surface/0 transition-all duration-200 group-hover:bg-on-surface/8">
        <button
          type="button"
          className="pointer-events-auto scale-95 rounded-full bg-on-surface/80 px-6 py-2.5 font-label text-[11px] font-bold uppercase tracking-[0.15em] text-white opacity-0 shadow-lg backdrop-blur-sm transition-all duration-200 group-hover:scale-100 group-hover:opacity-100"
        >
          Editar página
        </button>
      </div>
    </div>
  );
}
