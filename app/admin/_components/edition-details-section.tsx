"use client";

import { MaterialIcon, MATERIAL_ICONS } from "./material-icon";
import { StatusToggle } from "@/app/admin/_components/status-toggle";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
] as const;

const ANIOS = ["2025", "2026"] as const;

type FormField = "titulo" | "categoria" | "mes" | "anio" | "resumen";

interface EditionDetailsSectionProps {
  titulo: string;
  categoria: string;
  mes: string;
  anio: string;
  resumen: string;
  isSubmitting: boolean;
  canSubmit: boolean;
  onFieldChange: (field: FormField, value: string) => void;
  onSubmit: () => void;
}

export function EditionDetailsSection({
  titulo,
  categoria,
  mes,
  anio,
  resumen,
  isSubmitting,
  canSubmit,
  onFieldChange,
  onSubmit,
}: EditionDetailsSectionProps) {
  return (
    <section className="space-y-6">
      <h3 className="border-b border-outline-variant/15 pb-4 font-headline text-2xl">
        Detalles de la Edición
      </h3>

      <div className="space-y-8">
        <div className="group">
          <label htmlFor="create-titulo" className="mb-2 block font-label text-[11px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
            TÍTULO DE PORTADA
          </label>
          <input
            id="create-titulo"
            type="text"
            value={titulo}
            onChange={(e) => onFieldChange("titulo", e.target.value)}
            placeholder="Ej: El Alma de la Patagonia"
            className="w-full border-b-2 border-transparent bg-surface-container-high p-4 font-headline text-xl transition-all placeholder:text-on-surface-variant/30 focus:border-secondary focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-8 max-[640px]:grid-cols-1">
          <div>
            <label htmlFor="create-categoria" className="mb-2 block font-label text-[11px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
              CATEGORÍA PRINCIPAL
            </label>
            <select
              id="create-categoria"
              value={categoria}
              onChange={(e) => onFieldChange("categoria", e.target.value)}
              className="w-full rounded-none border-none bg-surface-container-high py-3 font-label text-sm outline-none focus:ring-0"
            >
              <option>Invierno</option>
              <option>Verano</option>
            </select>
          </div>

          <div>
            <label htmlFor="create-mes" className="mb-2 block font-label text-[11px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
              MES / AÑO DE PUBLICACIÓN
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                id="create-mes"
                value={mes}
                onChange={(e) => onFieldChange("mes", e.target.value)}
                className="w-full rounded-none border-none bg-surface-container-high py-3 font-label text-sm outline-none focus:ring-0"
              >
                {MESES.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
              <select
                value={anio}
                onChange={(e) => onFieldChange("anio", e.target.value)}
                className="w-full rounded-none border-none bg-surface-container-high py-3 font-label text-sm outline-none focus:ring-0"
              >
                {ANIOS.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="create-resumen" className="mb-2 block font-label text-[11px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
            RESUMEN EDITORIAL
          </label>
          <textarea
            id="create-resumen"
            rows={4}
            value={resumen}
            onChange={(e) => onFieldChange("resumen", e.target.value)}
            placeholder="Breve descripción del corazón de esta edición..."
            className="w-full resize-none border-none bg-surface-container-high p-4 font-body text-base leading-relaxed placeholder:text-on-surface-variant/30 focus:outline-none"
          />
        </div>

        <button
          type="button"
          disabled={!canSubmit || isSubmitting}
          onClick={onSubmit}
          className={[
            "rounded-md px-8 py-3 font-label text-sm tracking-wide shadow-lg shadow-primary/10 transition-all active:scale-95",
            canSubmit && !isSubmitting
              ? "cursor-pointer bg-gradient-to-br from-primary to-primary-container text-white hover:opacity-90"
              : "cursor-not-allowed bg-surface-container-high text-on-surface-variant/40 shadow-none",
          ].join(" ")}
        >
          {isSubmitting ? "Creando..." : "Crear Revista"}
        </button>
      </div>

      <section className="space-y-6 pt-6">
        <h3 className="border-b border-outline-variant/15 pb-4 font-headline text-2xl">
          Configuración de Estado
        </h3>

        <div className="flex items-center justify-between gap-6 rounded-xl bg-surface-container-low p-8 max-[1200px]:flex-col max-[1200px]:items-start max-[980px]:p-6">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-surface-container-high text-primary">
              <MaterialIcon className="text-[24px]" name={MATERIAL_ICONS.visibility} />
            </div>
            <div>
              <p className="font-label text-sm font-bold">Estado de Visibilidad</p>
              <p className="font-label text-xs text-on-surface-variant">
                Define si la edición será visible para los suscriptores.
              </p>
            </div>
          </div>

          <StatusToggle />
        </div>
      </section>
    </section>
  );
}
