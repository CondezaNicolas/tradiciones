import type { MagazineTemplate } from "./types";

/**
 * Recetas Gastronómicas — 6-page recipe collection template.
 * Structured layouts with image + text pairings for recipes.
 * Page dimensions: 460×640
 */

const W = 460;
const H = 640;

const HEADLINE_FONT = "Manrope";
const BODY_FONT = "Manrope";

/* ─── Object builders ─── */

function titleText(text: string, left: number, top: number, fontSize = 32, width = 380) {
  return {
    type: "Textbox",
    version: "7.2.0",
    left,
    top,
    width,
    height: fontSize * 1.4,
    text,
    fontFamily: HEADLINE_FONT,
    fontSize,
    fontWeight: "bold",
    fill: "#1D1B20",
    textAlign: "left",
    lineHeight: 1.2,
    originX: "left",
    originY: "top",
  };
}

function subtitleText(text: string, left: number, top: number, fontSize = 16, width = 380) {
  return {
    type: "Textbox",
    version: "7.2.0",
    left,
    top,
    width,
    height: fontSize * 1.6,
    text,
    fontFamily: BODY_FONT,
    fontSize,
    fontWeight: "normal",
    fill: "#49454F",
    textAlign: "left",
    lineHeight: 1.5,
    originX: "left",
    originY: "top",
  };
}

function bodyText(text: string, left: number, top: number, fontSize = 13, width = 200) {
  return {
    type: "Textbox",
    version: "7.2.0",
    left,
    top,
    width,
    height: fontSize * 5,
    text,
    fontFamily: BODY_FONT,
    fontSize,
    fontWeight: "normal",
    fill: "#1D1B20",
    textAlign: "left",
    lineHeight: 1.6,
    originX: "left",
    originY: "top",
  };
}

function imagePlaceholder(left: number, top: number, width: number, height: number) {
  return {
    type: "Rect",
    version: "7.2.0",
    left,
    top,
    width,
    height,
    fill: "#E8DEF8",
    stroke: "#6750A4",
    strokeWidth: 2,
    rx: 8,
    ry: 8,
    originX: "left",
    originY: "top",
  };
}

function imageLabel(left: number, top: number, label: string, width: number) {
  return {
    type: "Textbox",
    version: "7.2.0",
    left: left + width / 2,
    top: top + 60,
    width,
    text: label,
    fontFamily: BODY_FONT,
    fontSize: 11,
    fontWeight: "normal",
    fill: "#6750A4",
    textAlign: "center",
    lineHeight: 1.2,
    originX: "center",
    originY: "center",
  };
}

function dividerLine(left: number, top: number, width: number) {
  return {
    type: "Rect",
    version: "7.2.0",
    left,
    top,
    width,
    height: 2,
    fill: "#CAC4D0",
    stroke: null,
    strokeWidth: 0,
    rx: 0,
    ry: 0,
    originX: "left",
    originY: "top",
  };
}

function badge(left: number, top: number, text: string) {
  return {
    type: "Rect",
    version: "7.2.0",
    left,
    top,
    width: 90,
    height: 28,
    fill: "#6750A4",
    stroke: null,
    strokeWidth: 0,
    rx: 14,
    ry: 14,
    originX: "left",
    originY: "top",
  };
}

function badgeText(left: number, top: number, text: string) {
  return {
    type: "Textbox",
    version: "7.2.0",
    left: left + 45,
    top: top + 14,
    width: 90,
    text,
    fontFamily: BODY_FONT,
    fontSize: 10,
    fontWeight: "bold",
    fill: "#FFFFFF",
    textAlign: "center",
    lineHeight: 1,
    originX: "center",
    originY: "center",
  };
}

/* ─── Pages ─── */

const page1Cover = {
  version: "7.2.0",
  objects: [
    {
      type: "Rect",
      version: "7.2.0",
      left: 0,
      top: 0,
      width: W,
      height: H,
      fill: "#FFFBFE",
      stroke: null,
      strokeWidth: 0,
      rx: 0,
      ry: 0,
      originX: "left",
      originY: "top",
    },
    titleText("Recetas de\nChile", 40, 50, 42, 380),
    subtitleText("Tradición gastronómica chilena — Edición especial", 40, 175, 14, 340),
    imagePlaceholder(40, 230, 380, 300, ),
    imageLabel(40, 230, "Foto de portada", 380),
    subtitleText("Chile País de Tradiciones", 40, 560, 11, 380),
  ],
};

const page2Intro = {
  version: "7.2.0",
  objects: [
    titleText("Introducción", 40, 40, 28, 380),
    dividerLine(40, 82, 100),
    bodyText(
      "La gastronomía chilena es un reflejo de su geografía y cultura. " +
      "Desde el norte hasta la patagonia, cada región aporta sabores únicos " +
      "que cuentan historias de tradición y comunidad.",
      40, 110, 14, 380,
    ),
    imagePlaceholder(40, 290, 380, 200),
    imageLabel(40, 290, "Imagen del paisaje gastronómico", 380),
    subtitleText("Ingredientes estrella de esta edición", 40, 520, 12, 380),
  ],
};

const page3Recipe1 = {
  version: "7.2.0",
  objects: [
    badge(40, 30, ""),
    badgeText(40, 30, "Receta 1"),
    titleText("Pastel de Choclo", 40, 75, 26, 380),
    dividerLine(40, 115, 80),
    imagePlaceholder(40, 140, 380, 200),
    imageLabel(40, 140, "Foto del plato", 380),
    subtitleText("Ingredientes", 40, 365, 14, 380),
    bodyText(
      "• Choclos rallados\n" +
      "• Carne de vacuno\n" +
      "• Cebolla, ajo\n" +
      "• Aceitunas, pasas\n" +
      "• Huevos duros",
      40, 390, 12, 180,
    ),
    subtitleText("Preparación", 240, 365, 14, 180),
    bodyText(
      "Describe los pasos de preparación de forma clara y concisa.",
      240, 390, 12, 180,
    ),
  ],
};

const page4Recipe2 = {
  version: "7.2.0",
  objects: [
    badge(40, 30, ""),
    badgeText(40, 30, "Receta 2"),
    titleText("Curanto en Hoyo", 40, 75, 26, 380),
    dividerLine(40, 115, 80),
    imagePlaceholder(40, 140, 180, 200),
    imageLabel(40, 140, "Foto", 180),
    imagePlaceholder(230, 140, 190, 200),
    imageLabel(230, 140, "Proceso", 190),
    subtitleText("Ingredientes", 40, 370, 14, 380),
    bodyText(
      "• Mariscos variados\n" +
      "• Carnes\n" +
      "• Papas, cebolla\n" +
      "• Repollo, habas",
      40, 395, 12, 380,
    ),
    bodyText(
      "Describe la preparación tradicional del curanto.",
      40, 520, 12, 380,
    ),
  ],
};

const page5Recipe3 = {
  version: "7.2.0",
  objects: [
    badge(40, 30, ""),
    badgeText(40, 30, "Receta 3"),
    titleText("Empanadas de Pino", 40, 75, 26, 380),
    dividerLine(40, 115, 80),
    imagePlaceholder(40, 140, 380, 200),
    imageLabel(40, 140, "Foto del plato terminado", 380),
    subtitleText("Ingredientes", 40, 365, 14, 380),
    bodyText(
      "• Harina, manteca\n" +
      "• Carne picada\n" +
      "• Cebolla, huevo\n" +
      "• Aceitunas, pasas",
      40, 390, 12, 180,
    ),
    subtitleText("Preparación", 240, 365, 14, 180),
    bodyText(
      "Instrucciones paso a paso para las empanadas.",
      240, 390, 12, 180,
    ),
  ],
};

const page6Closing = {
  version: "7.2.0",
  objects: [
    {
      type: "Rect",
      version: "7.2.0",
      left: 0,
      top: 0,
      width: W,
      height: H,
      fill: "#FFFBFE",
      stroke: null,
      strokeWidth: 0,
      rx: 0,
      ry: 0,
      originX: "left",
      originY: "top",
    },
    titleText("Consejos y\nDespedida", 40, 60, 32, 380),
    dividerLine(40, 145, 120),
    bodyText(
      "Comparte consejos culinarios, trucos de las abuelas y " +
      "recomendaciones para disfrutar estas recetas en familia.",
      40, 175, 14, 380,
    ),
    subtitleText(
      "Chile País de Tradiciones\n" +
      "ediciones@tradiciones.cl",
      40, 520, 12, 380,
    ),
  ],
};

/* ─── Template ─── */

export const recetasGastronomicas: MagazineTemplate = {
  id: "recetas-gastronomicas",
  name: "Recetas Gastronómicas",
  description: "Colección de recetas tradicionales con ingredientes y pasos de preparación",
  thumbnailUrl: null,
  suggestedCategory: "Gastronomía",
  defaultPageCount: 6,
  thumbnailColor: "#FFD8E4",
  pages: [
    { pageNumber: 1, fabricJson: page1Cover },
    { pageNumber: 2, fabricJson: page2Intro },
    { pageNumber: 3, fabricJson: page3Recipe1 },
    { pageNumber: 4, fabricJson: page4Recipe2 },
    { pageNumber: 5, fabricJson: page5Recipe3 },
    { pageNumber: 6, fabricJson: page6Closing },
  ],
};
