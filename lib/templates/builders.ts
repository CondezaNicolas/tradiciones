/**
 * Reusable Fabric.js 7.2.0 object builders for page templates.
 *
 * Every builder returns a plain object that can be placed in a
 * `fabricJson.objects` array. All use `version: "7.2.0"`.
 *
 * Canvas dimensions: 460×640 (matching existing page size).
 */

/* ────────────────────────── Constants ────────────────────────── */

/** Canvas width */
export const W = 460;

/** Canvas height */
export const H = 640;

/** Default headline font */
const HEADLINE_FONT = "Manrope";

/** Default body font */
const BODY_FONT = "Manrope";

/* ────────────────────────── Text Builders ────────────────────────── */

/** Bold headline text block */
export function titleText(
  text: string,
  left: number,
  top: number,
  fontSize = 32,
  width = 380,
) {
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

/** Lighter subtitle text block */
export function subtitleText(
  text: string,
  left: number,
  top: number,
  fontSize = 18,
  width = 380,
) {
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

/** Body paragraph text block */
export function bodyText(
  text: string,
  left: number,
  top: number,
  fontSize = 14,
  width = 380,
) {
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

/** Configurable text block with full styling options */
export function textBlock(
  text: string,
  left: number,
  top: number,
  options: {
    fontSize?: number;
    width?: number;
    fontWeight?: string;
    fill?: string;
    textAlign?: string;
    fontFamily?: string;
    lineHeight?: number;
  } = {},
) {
  const {
    fontSize = 14,
    width = 380,
    fontWeight = "normal",
    fill = "#1D1B20",
    textAlign = "left",
    fontFamily = BODY_FONT,
    lineHeight = 1.6,
  } = options;

  return {
    type: "Textbox",
    version: "7.2.0",
    left,
    top,
    width,
    height: fontSize * 5,
    text,
    fontFamily,
    fontSize,
    fontWeight,
    fill,
    textAlign,
    lineHeight,
    originX: "left",
    originY: "top",
  };
}

/** Large section number (e.g. "01", "02") */
export function sectionNumber(text: string, left: number, top: number) {
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

/** Centered label for an image placeholder */
export function imageLabel(
  left: number,
  top: number,
  label = "Imagen",
  width = 200,
) {
  return {
    type: "Textbox",
    version: "7.2.0",
    left: left + width / 2,
    top: top + 60,
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

/* ────────────────────────── Shape Builders ────────────────────────── */

/** Image placeholder rectangle with border */
export function imagePlaceholder(
  left: number,
  top: number,
  width: number,
  height: number,
  label = "Imagen",
) {
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

/** Image placeholder with a visible border/frame */
export function imageFrame(
  left: number,
  top: number,
  width: number,
  height: number,
  options: {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    borderRadius?: number;
  } = {},
) {
  const {
    fill = "#E8DEF8",
    stroke = "#6750A4",
    strokeWidth = 2,
    borderRadius = 8,
  } = options;

  return {
    type: "Rect",
    version: "7.2.0",
    left,
    top,
    width,
    height,
    fill,
    stroke,
    strokeWidth,
    rx: borderRadius,
    ry: borderRadius,
    originX: "left",
    originY: "top",
  };
}

/** Horizontal divider line */
export function dividerLine(left: number, top: number, width: number) {
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

/* ────────────────────────── Background Builders ────────────────────────── */

/** Full-bleed solid color background */
export function solidBackground(
  color: string,
  width = W,
  height = H,
) {
  return {
    type: "Rect",
    version: "7.2.0",
    left: 0,
    top: 0,
    width,
    height,
    fill: color,
    stroke: null,
    strokeWidth: 0,
    rx: 0,
    ry: 0,
    originX: "left",
    originY: "top",
  };
}

/** Full-bleed gradient background (linear, vertical by default) */
export function gradientBackground(
  color1: string,
  color2: string,
  width = W,
  height = H,
  _angle = 0,
) {
  return {
    type: "Rect",
    version: "7.2.0",
    left: 0,
    top: 0,
    width,
    height,
    fill: {
      type: "linear",
      gradientUnits: "pixels",
      x1: 0,
      y1: 0,
      x2: 0,
      y2: height,
      colorStops: [
        { offset: 0, color: color1 },
        { offset: 1, color: color2 },
      ],
    },
    stroke: null,
    strokeWidth: 0,
    rx: 0,
    ry: 0,
    originX: "left",
    originY: "top",
  };
}

/* ────────────────────────── Decorative Builders ────────────────────────── */

/** Decorative ornamental shape (circle, diamond, or triangle) */
export function decorativeShape(
  type: "circle" | "diamond" | "triangle",
  left: number,
  top: number,
  size: number,
  fill: string,
  opacity = 1,
) {
  if (type === "circle") {
    return {
      type: "Ellipse",
      version: "7.2.0",
      left,
      top,
      rx: size / 2,
      ry: size / 2,
      fill,
      stroke: null,
      strokeWidth: 0,
      opacity,
      originX: "left",
      originY: "top",
    };
  }

  if (type === "diamond") {
    return {
      type: "Polygon",
      version: "7.2.0",
      left,
      top,
      width: size,
      height: size,
      fill,
      stroke: null,
      strokeWidth: 0,
      opacity,
      points: [
        { x: size / 2, y: 0 },
        { x: size, y: size / 2 },
        { x: size / 2, y: size },
        { x: 0, y: size / 2 },
      ],
      originX: "left",
      originY: "top",
    };
  }

  // triangle
  return {
    type: "Polygon",
    version: "7.2.0",
    left,
    top,
    width: size,
    height: size,
    fill,
    stroke: null,
    strokeWidth: 0,
    opacity,
    points: [
      { x: size / 2, y: 0 },
      { x: size, y: size },
      { x: 0, y: size },
    ],
    originX: "left",
    originY: "top",
  };
}

/** Ornamental divider with a center diamond shape */
export function ornamentalDivider(
  left: number,
  top: number,
  width: number,
  color: string,
) {
  const diamondSize = 8;
  const midX = left + width / 2 - diamondSize / 2;

  return [
    // left line
    {
      type: "Rect",
      version: "7.2.0",
      left,
      top: top + 1,
      width: width / 2 - diamondSize / 2 - 4,
      height: 1.5,
      fill: color,
      stroke: null,
      strokeWidth: 0,
      rx: 0,
      ry: 0,
      originX: "left",
      originY: "top",
    },
    // center diamond
    {
      type: "Polygon",
      version: "7.2.0",
      left: midX,
      top,
      width: diamondSize,
      height: diamondSize,
      fill: color,
      stroke: null,
      strokeWidth: 0,
      points: [
        { x: diamondSize / 2, y: 0 },
        { x: diamondSize, y: diamondSize / 2 },
        { x: diamondSize / 2, y: diamondSize },
        { x: 0, y: diamondSize / 2 },
      ],
      originX: "left",
      originY: "top",
    },
    // right line
    {
      type: "Rect",
      version: "7.2.0",
      left: midX + diamondSize + 4,
      top: top + 1,
      width: width / 2 - diamondSize / 2 - 4,
      height: 1.5,
      fill: color,
      stroke: null,
      strokeWidth: 0,
      rx: 0,
      ry: 0,
      originX: "left",
      originY: "top",
    },
  ];
}
