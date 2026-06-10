/**
 * Page template types for magazine editions.
 *
 * Templates are static TypeScript data — no database, no API.
 * Each template represents a SINGLE page layout (not multi-page).
 * Templates are themed by season: Invierno (winter) or Verano (summer).
 */

/* ────────────────────────── Themes ────────────────────────── */

export const THEMES = ["invierno", "verano"] as const;

export type PageTheme = (typeof THEMES)[number];

/* ────────────────────────── Page Template ────────────────────────── */

export interface PageTemplate {
  /** Unique identifier (e.g. "invierno-portada") */
  id: string;
  /** Human-readable display name in Spanish */
  name: string;
  /** Short description of the layout purpose */
  description: string;
  /** Seasonal theme tag for filtering */
  theme: PageTheme;
  /** Hex color used as card background in the sidebar grid */
  thumbnailColor: string;
  /** Single Fabric.js canvas JSON object compatible with canvas.loadFromJSON() */
  fabricJson: Record<string, unknown>;
}
