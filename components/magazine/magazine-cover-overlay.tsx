"use client";

import Image from "next/image";

interface MagazineEdition {
  id: string;
  title: string;
  category: string;
  month: string;
  year: string;
  summary: string | null;
  coverImageUrl: string | null;
}

interface MagazineCoverOverlayProps {
  edition: MagazineEdition;
  width: number;
  height: number;
  isOpen: boolean;
}

export function MagazineCoverOverlay({ edition, width, height, isOpen }: MagazineCoverOverlayProps) {
  return (
    <div
      className="absolute left-0 top-0 overflow-hidden rounded-r-lg border border-outline-variant/30 bg-surface"
      style={{
        width,
        height,
        transformOrigin: "left center",
        transform: isOpen ? "rotateY(-160deg)" : "rotateY(0deg)",
        transition: "transform 600ms ease",
        backfaceVisibility: "hidden",
      }}
    >
      {edition.coverImageUrl ? (
        <>
          <Image
            src={edition.coverImageUrl}
            alt={`Portada: ${edition.title}`}
            width={460}
            height={640}
            className="absolute inset-0 h-full w-full object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-on-surface/85 via-on-surface/15 to-transparent" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.22),transparent_35%,transparent_70%,rgba(0,0,0,0.14))]" />
          <div className="absolute inset-x-0 bottom-0 p-10 max-[980px]:p-6">
            <p className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">
              {edition.category}
            </p>
            <h2 className="mt-2 font-headline text-3xl font-light leading-tight text-white max-[980px]:text-xl">
              {edition.title}
            </h2>
            <p className="mt-3 line-clamp-3 font-body text-sm leading-relaxed text-white/72">
              {edition.summary}
            </p>
            <p className="mt-4 font-label text-xs uppercase tracking-[0.16em] text-white/55">
              {edition.month} {edition.year}
            </p>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-surface-container-high via-surface to-surface-container-low">
          <div className="absolute inset-6 rounded border border-outline-variant/15" />
          <div className="absolute inset-8 rounded border border-outline-variant/10" />
          <div className="absolute inset-x-8 bottom-10 text-center">
            <p className="font-label text-[10px] uppercase tracking-[0.18em] text-on-surface-variant/70">
              {edition.category}
            </p>
            <h2 className="mt-3 font-headline text-3xl text-on-surface">{edition.title}</h2>
          </div>
        </div>
      )}
    </div>
  );
}
