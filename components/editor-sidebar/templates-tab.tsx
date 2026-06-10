"use client";

import { useState } from "react";
import { PAGE_TEMPLATES, getTemplatesByTheme } from "@/lib/templates/registry";
import type { PageTemplate, PageTheme } from "@/lib/templates/types";
import { cn } from "@/lib/utils";

/* ────────────────────────── Constants ────────────────────────── */

const THEME_FILTERS = ["todos", "invierno", "verano"] as const;
type FilterOption = (typeof THEME_FILTERS)[number];

const THEME_LABELS: Record<FilterOption, string> = {
  todos: "Todos",
  invierno: "Invierno",
  verano: "Verano",
};

const THEME_BADGE_COLORS: Record<PageTheme, string> = {
  invierno: "bg-indigo-100 text-indigo-700",
  verano: "bg-orange-100 text-orange-700",
};

/* ────────────────────────── Types ────────────────────────── */

interface TemplatesTabProps {
  onApplyTemplate: (template: PageTemplate) => void;
}

/* ────────────────────────── Component ────────────────────────── */

export default function TemplatesTab({ onApplyTemplate }: TemplatesTabProps) {
  const [filter, setFilter] = useState<FilterOption>("todos");

  const templates =
    filter === "todos"
      ? PAGE_TEMPLATES
      : getTemplatesByTheme(filter as PageTheme);

  return (
    <div className="flex flex-col gap-3">
      {/* ── Theme filter ── */}
      <div className="flex gap-1 rounded-lg bg-surface-container-lowest p-1">
        {THEME_FILTERS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setFilter(option)}
            className={cn(
              "flex-1 rounded-md px-2 py-1.5 font-label text-[10px] font-semibold uppercase tracking-wider transition-all duration-200",
              filter === option
                ? "bg-surface-container-high text-on-surface shadow-sm"
                : "text-on-surface-variant/60 hover:text-on-surface-variant",
            )}
          >
            {THEME_LABELS[option]}
          </button>
        ))}
      </div>

      {/* ── Template grid ── */}
      <div className="grid grid-cols-2 gap-2">
        {templates.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onApplyTemplate(template)}
            className="group flex flex-col gap-1.5 rounded-lg border border-outline-variant/20 bg-surface-container-lowest p-2 text-left transition-all duration-200 hover:border-primary/40 hover:bg-surface-container-high active:scale-[0.97]"
          >
            {/* Color thumbnail */}
            <div
              className="aspect-[4/3] w-full rounded-md"
              style={{ backgroundColor: template.thumbnailColor }}
            />

            {/* Name + theme badge */}
            <span className="truncate font-label text-[10px] font-medium text-on-surface">
              {template.name}
            </span>
            <span
              className={cn(
                "inline-block w-fit rounded-full px-1.5 py-0.5 font-label text-[8px] font-bold uppercase tracking-wider",
                THEME_BADGE_COLORS[template.theme],
              )}
            >
              {template.theme}
            </span>
          </button>
        ))}
      </div>

      {templates.length === 0 && (
        <p className="py-8 text-center font-label text-[11px] text-on-surface-variant/50">
          No hay plantillas disponibles
        </p>
      )}
    </div>
  );
}
