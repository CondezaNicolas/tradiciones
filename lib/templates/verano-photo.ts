/**
 * Verano Photo Template — Photo-focused page.
 *
 * Warm beige background with large centered image frame,
 * terracotta decorative corner shapes, and caption text area.
 */

import type { PageTemplate } from "./types";
import {
  solidBackground,
  imageFrame,
  textBlock,
  decorativeShape,
} from "./builders";

export const veranoPhotoTemplate: PageTemplate = {
  id: "verano-photo",
  name: "Foto Verano",
  description:
    "Página fotográfica con marco de imagen grande y decoraciones terracota",
  theme: "verano",
  thumbnailColor: "#d7ccc8",
  fabricJson: {
    version: "7.2.0",
    objects: [
      /* ── Warm beige background ── */
      solidBackground("#d7ccc8"),

      /* ── Top accent bar ── */
      {
        type: "Rect",
        version: "7.2.0",
        left: 0,
        top: 0,
        width: 460,
        height: 40,
        fill: "#bcaaa4",
        stroke: null,
        strokeWidth: 0,
        rx: 0,
        ry: 0,
        originX: "left",
        originY: "top",
      },

      /* ── Image frame ── */
      imageFrame(40, 70, 380, 360, {
        fill: "#efebe9",
        stroke: "#8d6e63",
        strokeWidth: 2,
        borderRadius: 4,
      }),

      /* ── Image placeholder label ── */
      textBlock("Tu imagen aquí", 130, 210, {
        fontSize: 16,
        width: 200,
        fill: "#8d6e63",
        textAlign: "center",
        fontWeight: "normal",
        lineHeight: 1.2,
      }),

      /* ── Top-left corner decoration ── */
      decorativeShape("diamond", 25, 55, 20, "#bf360c", 0.5),

      /* ── Top-right corner decoration ── */
      decorativeShape("diamond", 415, 55, 20, "#bf360c", 0.5),

      /* ── Bottom-left corner decoration ── */
      decorativeShape("diamond", 25, 425, 20, "#bf360c", 0.5),

      /* ── Bottom-right corner decoration ── */
      decorativeShape("diamond", 415, 425, 20, "#bf360c", 0.5),

      /* ── Caption text area ── */
      textBlock("Escribe aquí el pie de foto o la descripción...", 40, 460, {
        fontSize: 14,
        width: 380,
        fill: "#5d4037",
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
        fill: "#bf360c",
        stroke: null,
        strokeWidth: 0,
        rx: 1,
        ry: 1,
        opacity: 0.4,
        originX: "left",
        originY: "top",
      },
    ],
  },
};
