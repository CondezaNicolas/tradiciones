import type { MagazineTemplate } from "./types";

/**
 * Blank template — 2 empty pages.
 * Always the first item in the registry.
 */

const EMPTY_CANVAS: Record<string, unknown> = {
  version: "7.2.0",
  objects: [],
};

export const enBlanco: MagazineTemplate = {
  id: "en-blanco",
  name: "En Blanco",
  description: "Empezar desde cero con páginas vacías",
  thumbnailUrl: null,
  suggestedCategory: "Cultura",
  defaultPageCount: 2,
  thumbnailColor: "#E8E0E8",
  pages: [
    { pageNumber: 1, fabricJson: { ...EMPTY_CANVAS } },
    { pageNumber: 2, fabricJson: { ...EMPTY_CANVAS } },
  ],
};
