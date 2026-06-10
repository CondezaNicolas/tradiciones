import type { PageTemplate, PageTheme } from "./types";
import { inviernoCoverTemplate } from "./invierno-cover";
import { inviernoSectionTemplate } from "./invierno-section";
import { inviernoPhotoTemplate } from "./invierno-photo";
import { veranoCoverTemplate } from "./verano-cover";
import { veranoSectionTemplate } from "./verano-section";
import { veranoPhotoTemplate } from "./verano-photo";

/**
 * Central registry of single-page templates.
 */
export const PAGE_TEMPLATES: readonly PageTemplate[] = [
  inviernoCoverTemplate,
  inviernoSectionTemplate,
  inviernoPhotoTemplate,
  veranoCoverTemplate,
  veranoSectionTemplate,
  veranoPhotoTemplate,
];

/**
 * Look up a page template by its unique id.
 * Returns `undefined` if no template matches.
 */
export function getTemplateById(id: string): PageTemplate | undefined {
  return PAGE_TEMPLATES.find((t) => t.id === id);
}

/**
 * Filter page templates by theme.
 */
export function getTemplatesByTheme(theme: PageTheme): readonly PageTemplate[] {
  return PAGE_TEMPLATES.filter((t) => t.theme === theme);
}
