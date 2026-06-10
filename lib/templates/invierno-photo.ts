/**
 * Invierno Photo Template — Photo-focused page.
 *
 * Soft blue-gray background with large centered image frame,
 * silver decorative corner shapes, and caption text area.
 */

import type { PageTemplate } from "./types";
import {
  solidBackground,
  imageFrame,
  textBlock,
  decorativeShape,
} from "./builders";

export const inviernoPhotoTemplate: PageTemplate = {
  id: "invierno-photo",
  name: "Foto Invierno",
  description:
    "Página fotográfica con marco de imagen grande y decoraciones plateadas",
  theme: "invierno",
  thumbnailColor: "#90a4ae",
  fabricJson: {
    version: "7.2.0",
    objects: [
      /* ── Soft blue-gray background ── */
      solidBackground("#90a4ae"),

      /* ── Top accent bar ── */
      {
        type: "Rect",
        version: "7.2.0",
        left: 0,
        top: 0,
        width: 460,
        height: 40,
        fill: "#78909c",
        stroke: null,
        strokeWidth: 0,
        rx: 0,
        ry: 0,
        originX: "left",
        originY: "top",
      },

      /* ── Image frame ── */
      imageFrame(40, 70, 380, 360, {
        fill: "#eceff1",
        stroke: "#546e7a",
        strokeWidth: 2,
        borderRadius: 4,
      }),

      /* ── Image placeholder label ── */
      textBlock("Tu imagen aquí", 130, 210, {
        fontSize: 16,
        width: 200,
        fill: "#546e7a",
        textAlign: "center",
        fontWeight: "normal",
        lineHeight: 1.2,
      }),

      /* ── Top-left corner decoration ── */
      decorativeShape("diamond", 25, 55, 20, "#eceff1", 0.6),

      /* ── Top-right corner decoration ── */
      decorativeShape("diamond", 415, 55, 20, "#eceff1", 0.6),

      /* ── Bottom-left corner decoration ── */
      decorativeShape("diamond", 25, 425, 20, "#eceff1", 0.6),

      /* ── Bottom-right corner decoration ── */
      decorativeShape("diamond", 415, 425, 20, "#eceff1", 0.6),

      /* ── Caption text area ── */
      textBlock("Escribe aquí el pie de foto o la descripción...", 40, 460, {
        fontSize: 14,
        width: 380,
        fill: "#eceff1",
        lineHeight: 1.6,
      }),

      /* ── Bottom accent line ── */
      {
        type: "Rect",
        version: "7.2.0",
        left: 40,
        top: 600,
        width: 100,
        height: 2,
        fill: "#cfd8dc",
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
