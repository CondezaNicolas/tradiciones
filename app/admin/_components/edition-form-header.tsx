"use client";

import { MaterialIcon, MATERIAL_ICONS } from "./material-icon";

interface EditionFormHeaderProps {
  onCancel: () => void;
  isSubmitting: boolean;
}

export function EditionFormHeader({ onCancel, isSubmitting }: EditionFormHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-end justify-between gap-6 bg-surface/80 px-12 py-8 backdrop-blur-md max-[980px]:flex-col max-[980px]:items-start max-[980px]:px-5 max-[980px]:py-6">
      <div>
        <nav className="mb-2 flex items-center gap-2 font-label text-[11px] uppercase tracking-widest text-on-surface-variant">
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer transition-colors hover:text-primary"
          >
            EDICIONES
          </button>
          <MaterialIcon className="text-[12px]" name={MATERIAL_ICONS.chevronRight} />
          <span className="font-bold text-primary">NUEVA EDICIÓN</span>
        </nav>
        <h2 className="font-headline text-4xl font-light text-on-surface max-[980px]:text-[2.4rem]">
          Crear Nueva Edición
        </h2>
      </div>

      <div className="flex gap-4 max-[640px]:w-full max-[640px]:flex-col">
        <button
          type="button"
          onClick={onCancel}
          className="cursor-pointer rounded-md border border-outline-variant/30 px-6 py-2 font-label text-sm tracking-wide text-on-surface-variant transition-colors hover:bg-surface-container-low active:scale-95"
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={isSubmitting}
          className="cursor-pointer rounded-md bg-gradient-to-br from-primary to-primary-container px-8 py-2 font-label text-sm tracking-wide text-white shadow-lg shadow-primary/10 transition-opacity hover:opacity-90 active:scale-95 disabled:opacity-50"
        >
          Publicar Edición
        </button>
      </div>
    </header>
  );
}
