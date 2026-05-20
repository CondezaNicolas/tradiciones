"use client";

import { MaterialIcon, MATERIAL_ICONS } from "./material-icon";

export function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-6 flex size-20 items-center justify-center rounded-2xl bg-primary/10">
        <MaterialIcon className="text-4xl text-primary/50" name={MATERIAL_ICONS.autoStories} />
      </div>
      <h3 className="mb-2 font-headline text-xl text-on-surface">
        No hay ediciones todavía
      </h3>
      <p className="mb-8 max-w-sm font-body text-base leading-relaxed text-on-surface-variant/70">
        Creá tu primera revista y empezá a contar las tradiciones de Chile.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="cursor-pointer rounded-md bg-gradient-to-br from-primary to-primary-container px-8 py-3 font-label text-sm tracking-wide text-white shadow-lg shadow-primary/10 transition-opacity hover:opacity-90 active:scale-95"
      >
        Crear Primera Edición
      </button>
    </div>
  );
}
