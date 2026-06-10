/**
 * Template system types for magazine editions.
 *
 * Templates are static TypeScript data — no database, no API.
 * Each template provides pre-designed Fabric.js page layouts
 * so admins start from curated starting points instead of blank canvases.
 */

/* ────────────────────────── Categories ────────────────────────── */

export const TEMPLATE_CATEGORIES = [
  "Cultura",
  "Gastronomía",
  "Arquitectura",
  "Naturaleza",
] as const;

export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number];

/* ────────────────────────── Page ────────────────────────── */

export interface TemplatePage {
  /** 1-based page index */
  pageNumber: number;
  /** JSON object compatible with Fabric.js canvas.loadFromJSON() */
  fabricJson: Record<string, unknown>;
}

/* ────────────────────────── Template ────────────────────────── */

export interface MagazineTemplate {
  /** Unique identifier (e.g. "cultura-feature") */
  id: string;
  /** Human-readable display name */
  name: string;
  /** Short description of template purpose */
  description: string;
  /** Optional preview image URL (may be null until generated) */
  thumbnailUrl: string | null;
  /** Pre-fills the category field on creation */
  suggestedCategory: TemplateCategory;
  /** How many pages this template creates (minimum 2) */
  defaultPageCount: number;
  /** Hex color used as thumbnail placeholder */
  thumbnailColor: string;
  /** Ordered array of page layout definitions */
  pages: TemplatePage[];
}
