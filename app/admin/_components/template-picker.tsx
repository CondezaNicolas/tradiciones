"use client";

import { cn } from "@/lib/utils";
import { TEMPLATES } from "@/lib/templates/registry";
import type { MagazineTemplate } from "@/lib/templates/types";

/* ─────────────────────── Card ─────────────────────── */

function TemplateCard({
  template,
  isSelected,
  onSelect,
}: {
  template: MagazineTemplate;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(template.id)}
      className={cn(
        "group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border-2 text-left transition-all active:scale-[0.98]",
        isSelected
          ? "border-primary shadow-lg shadow-primary/10"
          : "border-outline-variant/20 hover:border-primary/40 hover:shadow-md",
      )}
    >
      {/* Color thumbnail */}
      <div
        className="relative aspect-[4/3] w-full"
        style={{ backgroundColor: template.thumbnailColor }}
      >
        {template.id === "en-blanco" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant/40">
              Página en blanco
            </span>
          </div>
        )}
        {isSelected && (
          <div className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-full bg-primary text-sm text-white">
            ✓
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col gap-2 bg-surface-container-low p-4">
        <h4 className="font-headline text-lg leading-tight">{template.name}</h4>
        <p className="flex-1 font-body text-sm leading-relaxed text-on-surface-variant/70">
          {template.description}
        </p>
        <div className="flex items-center justify-between pt-2">
          <span className="inline-block rounded-full bg-surface-container-high px-3 py-1 font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60">
            {template.suggestedCategory}
          </span>
          <span className="font-label text-[10px] text-on-surface-variant/40">
            {template.defaultPageCount} págs.
          </span>
        </div>
      </div>
    </button>
  );
}

/* ─────────────────────── Picker ─────────────────────── */

interface TemplatePickerProps {
  selectedTemplateId: string;
  onSelect: (templateId: string) => void;
}

export function TemplatePicker({ selectedTemplateId, onSelect }: TemplatePickerProps) {
  return (
    <section className="space-y-6">
      <div>
        <h3 className="border-b border-outline-variant/15 pb-4 font-headline text-2xl">
          Elegir Plantilla
        </h3>
        <p className="mt-3 font-body text-sm leading-relaxed text-on-surface-variant/60">
          Selecciona una plantilla base para tu edición. Podrás personalizar completamente cada página en el editor.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {TEMPLATES.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            isSelected={selectedTemplateId === template.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}
