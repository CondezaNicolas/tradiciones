/**
 * Invierno Cover Template — Full-page cover design.
 *
 * Dark navy-to-blue gradient background with scattered silver
 * decorative circles (snowflake-like), large centered white
 * title, ornamental divider, and silver subtitle.
 */

import type { PageTemplate } from "./types";
import {
  gradientBackground,
  textBlock,
  decorativeShape,
  ornamentalDivider,
} from "./builders";

export const inviernoCoverTemplate: PageTemplate = {
  id: "invierno-cover",
  name: "Portada Invierno",
  description:
    "Portada con gradiente azul oscuro, decoraciones plateadas y título centrado",
  theme: "invierno",
  thumbnailColor: "#1a237e",
  fabricJson: {
    version: "7.2.0",
    objects: [
      /* ── Full-page gradient background ── */
      gradientBackground("#0d1b3e", "#1a237e"),

      /* ── Decorative snowflake-like circles ── */
      decorativeShape("circle", 20, 40, 140, "#cfd8dc", 0.12),
      decorativeShape("circle", 350, 20, 70, "#eceff1", 0.09),
      decorativeShape("circle", 390, 250, 50, "#eceff1", 0.07),
      decorativeShape("diamond", 370, 530, 45, "#cfd8dc", 0.1),
      decorativeShape("circle", 10, 430, 90, "#eceff1", 0.06),
      decorativeShape("diamond", 160, 30, 30, "#cfd8dc", 0.08),

      /* ── Title ── */
      textBlock("TÍTULO DE\nLA EDICIÓN", 40, 180, {
        fontSize: 38,
        width: 380,
        fontWeight: "bold",
        fill: "#ffffff",
        lineHeight: 1.15,
      }),

      /* ── Ornamental divider ── */
      ...ornamentalDivider(130, 370, 200, "#cfd8dc"),

      /* ── Subtitle ── */
      textBlock("Subtítulo de la edición", 40, 410, {
        fontSize: 16,
        width: 380,
        fill: "#b0bec5",
        lineHeight: 1.5,
      }),

      /* ── Bottom accent line ── */
      {
        type: "Rect",
        version: "7.2.0",
        left: 40,
        top: 590,
        width: 120,
        height: 3,
        fill: "#cfd8dc",
        stroke: null,
        strokeWidth: 0,
        rx: 1,
        ry: 1,
        opacity: 0.6,
        originX: "left",
        originY: "top",
      },
    ],
  },
};
