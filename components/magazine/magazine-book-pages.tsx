"use client";

import Image from "next/image";
import { FabricPageCanvas } from "@/components/canvas/fabric-page-canvas";
import { PlaceholderPage } from "@/components/magazine/zoom-page-content";

/* ────────────────────────── Types ────────────────────────── */

interface MagazineEdition {
  id: string;
  title: string;
  category: string;
  month: string;
  year: string;
  summary: string | null;
  coverImageUrl: string | null;
}

/* ────────────────────────── Cover (hard page) ────────────────────────── */

export function BookCoverPage({ edition }: { edition: MagazineEdition }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-surface">
      {edition.coverImageUrl ? (
        <>
          <Image
            src={edition.coverImageUrl}
            alt={`Portada: ${edition.title}`}
            fill
            sizes="560px"
            className="object-cover"
            priority
            unoptimized
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-on-surface/85 via-on-surface/15 to-transparent" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.22),transparent_35%,transparent_70%,rgba(0,0,0,0.14))]" />
          <div className="absolute inset-x-0 bottom-0 p-8 max-[600px]:p-5">
            <p className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">
              {edition.category}
            </p>
            <h2 className="mt-2 font-headline text-3xl font-light leading-tight text-white max-[600px]:text-xl">
              {edition.title}
            </h2>
            {edition.summary && (
              <p className="mt-3 line-clamp-3 font-body text-sm leading-relaxed text-white/72 max-[600px]:hidden">
                {edition.summary}
              </p>
            )}
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
      {/* Spine-side shading */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-black/25 to-transparent" />
    </div>
  );
}

/* ─────────────────── Inside front cover (paper page) ─────────────────── */

export function BookInsideCoverPage({ edition }: { edition: MagazineEdition }) {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center bg-[#faf6ef]">
      <div className="text-center opacity-45">
        <div className="mx-auto mb-5 h-px w-16 bg-outline-variant" />
        <p className="font-label text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">
          Chile País de Tradiciones
        </p>
        <p className="mt-3 font-body text-xs text-on-surface-variant/70">
          {edition.month} {edition.year}
        </p>
        <div className="mx-auto mt-5 h-px w-16 bg-outline-variant" />
      </div>
      <PaperTexture />
    </div>
  );
}

/* ───────────────────── Editorial page (canvas/photo) ───────────────────── */

interface BookEditorialPageProps {
  pageNumber: number;
  thumbnailUrl?: string | null;
  fabricJson?: string | null;
  onZoom?: (pageNumber: number) => void;
}

export function BookEditorialPage({
  pageNumber,
  thumbnailUrl,
  fabricJson,
  onZoom,
}: BookEditorialPageProps) {
  const hasContent = Boolean(fabricJson || thumbnailUrl);

  return (
    <div className="relative h-full w-full bg-white">
      {fabricJson ? (
        <div className="absolute inset-0 [&_.canvas-container]:!h-full [&_.canvas-container]:!w-full [&_canvas]:!h-full [&_canvas]:!w-full">
          <FabricPageCanvas fabricJson={fabricJson} width={460} height={640} />
        </div>
      ) : thumbnailUrl ? (
        <Image
          src={thumbnailUrl}
          alt={`Página ${pageNumber}`}
          fill
          sizes="560px"
          className="object-contain"
          unoptimized
          draggable={false}
        />
      ) : (
        <PlaceholderPage pageNumber={pageNumber} />
      )}

      {hasContent && onZoom && (
        <button
          type="button"
          onClick={() => onZoom(pageNumber)}
          className="absolute bottom-3 right-3 z-10 cursor-zoom-in rounded-full bg-surface/85 px-3 py-1 font-label text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant opacity-70 shadow-sm backdrop-blur-sm transition-opacity hover:opacity-100"
          aria-label={`Ampliar página ${pageNumber}`}
        >
          Zoom
        </button>
      )}

      {/* Page number */}
      <span className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 font-label text-[9px] tracking-[0.2em] text-on-surface-variant/40">
        {pageNumber}
      </span>
      <PaperTexture />
    </div>
  );
}

/* ─────────────────────── Blank filler / back cover ─────────────────────── */

export function BookBlankPage() {
  return (
    <div className="relative h-full w-full bg-[#faf6ef]">
      <PaperTexture />
    </div>
  );
}

export function BookBackCoverPage({ edition }: { edition: MagazineEdition }) {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-surface-container-high via-surface to-surface-container-low">
      <div className="text-center">
        <div className="mx-auto mb-6 h-px w-20 bg-outline-variant/50" />
        <p className="font-headline text-2xl font-light text-on-surface/80">
          Chile País de Tradiciones
        </p>
        <p className="mt-3 font-label text-[10px] uppercase tracking-[0.22em] text-on-surface-variant/60">
          {edition.month} {edition.year}
        </p>
        <div className="mx-auto mt-6 h-px w-20 bg-outline-variant/50" />
      </div>
      {/* Spine-side shading (right edge — back cover binds on the right) */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-black/20 to-transparent" />
    </div>
  );
}

/* ────────────────────────── Shared texture ────────────────────────── */

/** Subtle paper grain + edge shading so pages read as printed paper */
function PaperTexture() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          "linear-gradient(90deg, rgba(0,0,0,0.045) 0%, transparent 6%, transparent 94%, rgba(0,0,0,0.03) 100%)",
      }}
    />
  );
}
