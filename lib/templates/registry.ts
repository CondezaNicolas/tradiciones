import type { MagazineTemplate } from "./types";
import { enBlanco } from "./en-blanco";
import { culturaFeature } from "./cultura-feature";
import { recetasGastronomicas } from "./recetas-gastronomicas";
import { ensayoFotografico } from "./ensayo-fotografico";

/**
 * Central registry of all magazine templates.
 * "en-blanco" is always the first item as per spec.
 */
export const TEMPLATES: readonly MagazineTemplate[] = [
  enBlanco,
  culturaFeature,
  recetasGastronomicas,
  ensayoFotografico,
] as const;

/**
 * Look up a template by its unique id.
 * Returns `undefined` if no template matches.
 */
export function getTemplateById(id: string): MagazineTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
