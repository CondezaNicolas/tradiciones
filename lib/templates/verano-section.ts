/**
 * Verano Section Template — Section divider page.
 *
 * Warm orange background with large section number,
 * section title, ornamental divider, and body text area.
 */

import type { PageTemplate } from "./types";
import {
  solidBackground,
  textBlock,
  ornamentalDivider,
} from "./builders";

export const veranoSectionTemplate: PageTemplate = {
  id: "verano-section",
  name: "Sección Verano",
  description:
    "Página de sección con número grande, título y divisor ornamental",
  theme: "verano",
  thumbnailColor: "#e65100",
  fabricJson: {
    version: "7.2.0",
    objects: [
      /* ── Solid warm-orange background ── */
      solidBackground("#e65100"),

      /* ── Large section number ── */
      textBlock("01", 40, 80, {
        fontSize: 72,
        width: 120,
        fontWeight: "bold",
        fill: "#ffe0b2",
        lineHeight: 1,
      }),

      /* ── Section title ── */
      textBlock("TÍTULO DE\nLA SECCIÓN", 40, 190, {
        fontSize: 34,
        width: 380,
        fontWeight: "bold",
        fill: "#ffffff",
        lineHeight: 1.15,
      }),

      /* ── Ornamental divider ── */
      ...ornamentalDivider(40, 320, 380, "#ffb74d"),

      /* ── Body text area ── */
      textBlock(
        "Escribe aquí una breve descripción o introducción de la sección...",
        40,
        370,
        {
          fontSize: 15,
          width: 380,
          fill: "#ffe0b2",
          lineHeight: 1.6,
        },
      ),

      /* ── Top-right accent diamond ── */
      {
        type: "Polygon",
        version: "7.2.0",
        left: 400,
        top: 20,
        width: 30,
        height: 30,
        fill: "#ff8f00",
        stroke: null,
        strokeWidth: 0,
        opacity: 0.3,
        points: [
          { x: 15, y: 0 },
          { x: 30, y: 15 },
          { x: 15, y: 30 },
          { x: 0, y: 15 },
        ],
        originX: "left",
        originY: "top",
      },

      /* ── Bottom accent line ── */
      {
        type: "Rect",
        version: "7.2.0",
        left: 40,
        top: 590,
        width: 80,
        height: 3,
        fill: "#ffb74d",
        stroke: null,
        strokeWidth: 0,
        rx: 1,
        ry: 1,
        opacity: 0.5,
        originX: "left",
        originY: "top",
      },
    ],
  },
};
