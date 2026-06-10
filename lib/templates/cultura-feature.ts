import type { MagazineTemplate } from "./types";

/**
 * Cultura Destacada — 6-page cultural feature template.
 * Text-heavy layouts with headers, section titles, and image placeholders.
 * Page dimensions: 460×640
 */

/* ─── Reusable Fabric.js object builders ─── */

/** Canvas dimensions */
const W = 460;
const H = 640;

/** Common text styles */
const HEADLINE_FONT = "Manrope";
const BODY_FONT = "Manrope";

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

function subtitleText(text: string, left: number, top: number, fontSize = 18, width = 380) {
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

function bodyText(text: string, left: number, top: number, fontSize = 14, width = 380) {
  return {
    type: "Textbox",
    version: "7.2.0",
    left,
    top,
    width,
    height: fontSize * 6,
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

function imagePlaceholder(left: number, top: number, width: number, height: number, label = "Imagen") {
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

function imageLabel(left: number, top: number, label = "Imagen", width = 200) {
  return {
    type: "Textbox",
    version: "7.2.0",
    left: left + width / 2,
    top: top + 60,
    width: width,
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

function sectionNumber(text: string, left: number, top: number) {
  return {
    type: "Textbox",
    version: "7.2.0",
    left,
    top,
    width: 40,
    text,
    fontFamily: HEADLINE_FONT,
    fontSize: 48,
    fontWeight: "bold",
    fill: "#D0BCFF",
    textAlign: "left",
    lineHeight: 1,
    originX: "left",
    originY: "top",
  };
}

/* ─── Pages ─── */

const page1Cover = {
  version: "7.2.0",
  objects: [
    // Full-bleed background tint
    {
      type: "Rect",
      version: "7.2.0",
      left: 0,
      top: 0,
      width: W,
      height: H,
      fill: "#F3EDF7",
      stroke: null,
      strokeWidth: 0,
      rx: 0,
      ry: 0,
      originX: "left",
      originY: "top",
    },
    // Cover title
    titleText("Título de la\nCultura", 40, 60, 42, 380),
    // Subtitle
    subtitleText("Un recorrido por las tradiciones que definen nuestra identidad", 40, 190, 16, 340),
    // Hero image placeholder
    imagePlaceholder(40, 270, 380, 240, "Imagen principal"),
    imageLabel(40, 270, "Imagen principal", 380),
    // Bottom divider
    dividerLine(40, 540, 380),
    // Edition info
    subtitleText("Edición especial — Chile País de Tradiciones", 40, 560, 12, 380),
  ],
};

const page2Spread = {
  version: "7.2.0",
  objects: [
    sectionNumber("01", 40, 40),
    titleText("Sección Destacada", 40, 100, 28, 380),
    dividerLine(40, 145, 120),
    bodyText(
      "Escribe aquí el contenido principal de esta sección. " +
      "Describe la tradición cultural, su origen y significado para la comunidad local. " +
      "Este espacio está diseñado para textos largos que cuentan una historia.",
      40, 170, 14, 380,
    ),
    imagePlaceholder(40, 430, 380, 160, "Imagen de contexto"),
    imageLabel(40, 430, "Imagen de contexto", 380),
  ],
};

const page3Spread = {
  version: "7.2.0",
  objects: [
    sectionNumber("02", 40, 40),
    titleText("Entrevista", 40, 100, 28, 380),
    dividerLine(40, 145, 120),
    imagePlaceholder(40, 170, 180, 180, "Foto"),
    imageLabel(40, 170, "Foto", 180),
    bodyText(
      "Inserta aquí la entrevista o testimonio. " +
      "Las palabras de los artesanos y guardianes de tradiciones " +
      "dan vida a esta sección.",
      240, 170, 13, 180,
    ),
    bodyText(
      "Continúa la historia con más detalles y anécdotas que " +
      "enriquezcan la narrativa de esta tradición cultural.",
      40, 380, 14, 380,
    ),
  ],
};

const page4Spread = {
  version: "7.2.0",
  objects: [
    sectionNumber("03", 40, 40),
    titleText("Reportaje", 40, 100, 28, 380),
    dividerLine(40, 145, 120),
    bodyText(
      "Desarrolla el reportaje central de esta edición. " +
      "Investiga el contexto histórico, los personajes involucrados " +
      "y el impacto en la comunidad.",
      40, 170, 14, 380,
    ),
    imagePlaceholder(40, 340, 380, 200, "Imagen del reportaje"),
    imageLabel(40, 340, "Imagen del reportaje", 380),
    subtitleText("Pie de foto descriptivo", 40, 560, 11, 380),
  ],
};

const page5Spread = {
  version: "7.2.0",
  objects: [
    sectionNumber("04", 40, 40),
    titleText("Análisis", 40, 100, 28, 380),
    dividerLine(40, 145, 120),
    imagePlaceholder(40, 170, 160, 200, "Gráfico"),
    imageLabel(40, 170, "Gráfico", 160),
    bodyText(
      "Presenta datos y análisis sobre la tradición. " +
      "Estadísticas, mapas o infografías complementan " +
      "el texto.",
      220, 170, 13, 200,
    ),
    bodyText(
      "Profundiza en los hallazgos y conclusiones del análisis. " +
      "¿Qué revelan los datos sobre el estado actual de esta tradición?",
      40, 400, 14, 380,
    ),
  ],
};

const page6Closing = {
  version: "7.2.0",
  objects: [
    // Closing background
    {
      type: "Rect",
      version: "7.2.0",
      left: 0,
      top: 0,
      width: W,
      height: H,
      fill: "#F3EDF7",
      stroke: null,
      strokeWidth: 0,
      rx: 0,
      ry: 0,
      originX: "left",
      originY: "top",
    },
    titleText("Conclusión", 40, 80, 32, 380),
    dividerLine(40, 130, 120),
    bodyText(
      "Cierra la edición con una reflexión sobre las tradiciones presentadas. " +
      "¿Qué las mantiene vivas? ¿Cómo podemos contribuir a su preservación?",
      40, 160, 14, 380,
    ),
    subtitleText(
      "Chile País de Tradiciones\n" +
      "ediciones@tradiciones.cl\n" +
      "www.tradiciones.cl",
      40, 480, 12, 380,
    ),
  ],
};

/* ─── Template ─── */

export const culturaFeature: MagazineTemplate = {
  id: "cultura-feature",
  name: "Cultura Destacada",
  description: "Reportaje cultural con secciones, entrevistas y análisis en profundidad",
  thumbnailUrl: null,
  suggestedCategory: "Cultura",
  defaultPageCount: 6,
  thumbnailColor: "#D0BCFF",
  pages: [
    { pageNumber: 1, fabricJson: page1Cover },
    { pageNumber: 2, fabricJson: page2Spread },
    { pageNumber: 3, fabricJson: page3Spread },
    { pageNumber: 4, fabricJson: page4Spread },
    { pageNumber: 5, fabricJson: page5Spread },
    { pageNumber: 6, fabricJson: page6Closing },
  ],
};
