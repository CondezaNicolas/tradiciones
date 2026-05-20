"use client";

import Image from "next/image";
import { MaterialIcon, MATERIAL_ICONS } from "./material-icon";

interface CoverImageSectionProps {
  coverPreview: string | null;
  onCoverChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCoverRemove: () => void;
}

export function CoverImageSection({ coverPreview, onCoverChange, onCoverRemove }: CoverImageSectionProps) {
  return (
    <section className="space-y-6">
      <h3 className="border-b border-outline-variant/15 pb-4 font-headline text-2xl">
        Imagen de Portada
      </h3>

      {coverPreview ? (
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border-2 border-solid border-primary/30">
          <Image
            src={coverPreview}
            alt="Preview de portada"
            width={300}
            height={400}
            className="h-full w-full object-cover"
            unoptimized
          />
          <button
            type="button"
            onClick={onCoverRemove}
            className="absolute right-3 top-3 flex size-8 cursor-pointer items-center justify-center rounded-full bg-surface/80 text-on-surface shadow-md transition-all hover:bg-surface active:scale-95"
            aria-label="Eliminar imagen"
          >
            ✕
          </button>
        </div>
      ) : (
        <label className="group relative flex aspect-[3/4] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-outline-variant/30 bg-surface-container-high text-center transition-all hover:border-primary/50">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onCoverChange}
            className="sr-only"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />
          <div className="relative z-10 p-12 transition-transform duration-500 group-hover:scale-105">
            <MaterialIcon
              className="mx-auto mb-4 text-6xl text-primary/20"
              name={MATERIAL_ICONS.cloudUpload}
            />
            <p className="mb-2 font-headline text-xl text-on-surface-variant">
              Arrastra la portada aquí
            </p>
            <p className="font-label text-[11px] uppercase tracking-[0.18em] text-on-surface-variant/60">
              O haz clic para explorar archivos
            </p>
            <p className="mt-8 font-label text-[10px] text-on-surface-variant/40">
              RECOMENDADO: 2400 x 3200 PX (JPEG/PNG)
            </p>
          </div>
        </label>
      )}
    </section>
  );
}
