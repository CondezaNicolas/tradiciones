import type { MagazineTemplate } from "./types";

/**
 * Ensayo Fotográfico — 8-page photo essay template.
 * Image-dominant layouts with minimal text, large photo frames.
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

function subtitleText(text: string, left: number, top: number, fontSize = 14, width = 380) {
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

function captionText(text: string, left: number, top: number, width = 380) {
  return {
    type: "Textbox",
    version: "7.2.0",
    left,
    top,
    width,
    height: 30,
    text,
    fontFamily: BODY_FONT,
    fontSize: 11,
    fontWeight: "normal",
    fill: "#49454F",
    textAlign: "left",
    lineHeight: 1.4,
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
    top: top + 80,
    width,
    text: label,
    fontFamily: BODY_FONT,
    fontSize: 12,
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
      fill: "#1D1B20",
      stroke: null,
      strokeWidth: 0,
      rx: 0,
      ry: 0,
      originX: "left",
      originY: "top",
    },
    // Title in white on dark background
    {
      type: "Textbox",
      version: "7.2.0",
      left: 40,
      top: 50,
      width: 380,
      height: 64,
      text: "Ensayo\nFotográfico",
      fontFamily: HEADLINE_FONT,
      fontSize: 42,
      fontWeight: "bold",
      fill: "#FFFFFF",
      textAlign: "left",
      lineHeight: 1.2,
      originX: "left",
      originY: "top",
    },
    {
      type: "Textbox",
      version: "7.2.0",
      left: 40,
      top: 175,
      width: 340,
      height: 40,
      text: "Una historia contada a través de imágenes",
      fontFamily: BODY_FONT,
      fontSize: 16,
      fontWeight: "normal",
      fill: "#CAC4D0",
      textAlign: "left",
      lineHeight: 1.5,
      originX: "left",
      originY: "top",
    },
    imagePlaceholder(40, 240, 380, 300),
    {
      type: "Textbox",
      version: "7.2.0",
      left: 230,
      top: 330,
      width: 380,
      text: "Imagen de portada",
      fontFamily: BODY_FONT,
      fontSize: 12,
      fontWeight: "normal",
      fill: "#6750A4",
      textAlign: "center",
      lineHeight: 1.2,
      originX: "center",
      originY: "center",
    },
    {
      type: "Textbox",
      version: "7.2.0",
      left: 40,
      top: 570,
      width: 380,
      text: "Chile País de Tradiciones",
      fontFamily: BODY_FONT,
      fontSize: 11,
      fontWeight: "normal",
      fill: "#938F99",
      textAlign: "left",
      lineHeight: 1,
      originX: "left",
      originY: "top",
    },
  ],
};

const page2FullImage = {
  version: "7.2.0",
  objects: [
    imagePlaceholder(20, 20, W - 40, H - 100),
    imageLabel(20, 20, "Imagen a pantalla completa", W - 40),
    captionText("Pie de foto — Describe la escena, el lugar y el contexto de esta imagen", 20, H - 60, W - 40),
  ],
};

const page3TwoImages = {
  version: "7.2.0",
  objects: [
    imagePlaceholder(20, 20, W - 40, 280),
    imageLabel(20, 20, "Imagen superior", W - 40),
    imagePlaceholder(20, 320, W - 40, 240),
    imageLabel(20, 320, "Imagen inferior", W - 40),
    captionText("Pie de foto combinado para ambas imágenes", 20, 580, W - 40),
  ],
};

const page4ImageWithText = {
  version: "7.2.0",
  objects: [
    imagePlaceholder(20, 20, W - 40, 400),
    imageLabel(20, 20, "Imagen principal", W - 40),
    titleText("Título de la sección", 30, 440, 22, 400),
    dividerLine(30, 475, 100),
    subtitleText(
      "Texto narrativo que acompaña la fotografía. " +
      "Describe la historia detrás de la imagen.",
      30, 495, 13, 400,
    ),
    captionText("© Fotógrafo — Lugar, Fecha", 30, 600, 400),
  ],
};

const page5Grid = {
  version: "7.2.0",
  objects: [
    imagePlaceholder(20, 20, 205, 295),
    imageLabel(20, 20, "Foto 1", 205),
    imagePlaceholder(235, 20, 205, 295),
    imageLabel(235, 20, "Foto 2", 205),
    imagePlaceholder(20, 335, 205, 265),
    imageLabel(20, 335, "Foto 3", 205),
    imagePlaceholder(235, 335, 205, 265),
    imageLabel(235, 335, "Foto 4", 205),
  ],
};

const page6FullImage2 = {
  version: "7.2.0",
  objects: [
    imagePlaceholder(20, 20, W - 40, H - 100),
    imageLabel(20, 20, "Imagen a pantalla completa", W - 40),
    captionText("Pie de foto — Contexto y significado de esta imagen", 20, H - 60, W - 40),
  ],
};

const page7ImageWithText2 = {
  version: "7.2.0",
  objects: [
    imagePlaceholder(20, 20, W - 40, 380),
    imageLabel(20, 20, "Imagen principal", W - 40),
    titleText("Reflexión final", 30, 420, 22, 400),
    dividerLine(30, 455, 100),
    subtitleText(
      "Última reflexión visual del ensayo. " +
      "La imagen que cierra la narrativa fotográfica.",
      30, 475, 13, 400,
    ),
    captionText("© Fotógrafo — Lugar, Fecha", 30, 600, 400),
  ],
};

const page8Closing = {
  version: "7.2.0",
  objects: [
    {
      type: "Rect",
      version: "7.2.0",
      left: 0,
      top: 0,
      width: W,
      height: H,
      fill: "#1D1B20",
      stroke: null,
      strokeWidth: 0,
      rx: 0,
      ry: 0,
      originX: "left",
      originY: "top",
    },
    {
      type: "Textbox",
      version: "7.2.0",
      left: 40,
      top: 200,
      width: 380,
      height: 50,
      text: "Créditos",
      fontFamily: HEADLINE_FONT,
      fontSize: 28,
      fontWeight: "bold",
      fill: "#FFFFFF",
      textAlign: "center",
      lineHeight: 1.2,
      originX: "left",
      originY: "top",
    },
    {
      type: "Textbox",
      version: "7.2.0",
      left: 40,
      top: 280,
      width: 380,
      height: 120,
      text:
        "Fotografía: Nombre del fotógrafo\n" +
        "Dirección editorial: Nombre\n" +
        "Diseño: Nombre del diseñador\n\n" +
        "Chile País de Tradiciones\n" +
        "ediciones@tradiciones.cl",
      fontFamily: BODY_FONT,
      fontSize: 14,
      fontWeight: "normal",
      fill: "#CAC4D0",
      textAlign: "center",
      lineHeight: 1.6,
      originX: "left",
      originY: "top",
    },
  ],
};

/* ─── Template ─── */

export const ensayoFotografico: MagazineTemplate = {
  id: "ensayo-fotografico",
  name: "Ensayo Fotográfico",
  description: "Narrativa visual con páginas dominadas por imágenes y texto mínimo",
  thumbnailUrl: null,
  suggestedCategory: "Naturaleza",
  defaultPageCount: 8,
  thumbnailColor: "#B3E5FC",
  pages: [
    { pageNumber: 1, fabricJson: page1Cover },
    { pageNumber: 2, fabricJson: page2FullImage },
    { pageNumber: 3, fabricJson: page3TwoImages },
    { pageNumber: 4, fabricJson: page4ImageWithText },
    { pageNumber: 5, fabricJson: page5Grid },
    { pageNumber: 6, fabricJson: page6FullImage2 },
    { pageNumber: 7, fabricJson: page7ImageWithText2 },
    { pageNumber: 8, fabricJson: page8Closing },
  ],
};
