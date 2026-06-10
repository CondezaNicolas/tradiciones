/**
 * Verano Cover Template — Full-page cover design.
 *
 * Warm terracotta-to-sandy gradient background with decorative
 * sun/wave shapes, large centered title, ornamental divider,
 * and sandy subtitle.
 */

import type { PageTemplate } from "./types";
import {
  gradientBackground,
  textBlock,
  decorativeShape,
  ornamentalDivider,
} from "./builders";

export const veranoCoverTemplate: PageTemplate = {
  id: "verano-cover",
  name: "Portada Verano",
  description:
    "Portada con gradiente terracota, decoraciones doradas y título centrado",
  theme: "verano",
  thumbnailColor: "#bf360c",
  fabricJson: {
    version: "7.2.0",
    objects: [
      /* ── Full-page gradient background ── */
      gradientBackground("#bf360c", "#d84315"),

      /* ── Decorative sun-like circles ── */
      decorativeShape("circle", 340, 20, 100, "#ffb74d", 0.12),
      decorativeShape("circle", 10, 500, 80, "#ffe0b2", 0.1),
      decorativeShape("circle", 380, 420, 50, "#ffb74d", 0.08),

      /* ── Decorative wave-like triangles ── */
      decorativeShape("triangle", 30, 60, 40, "#ffe0b2", 0.1),
      decorativeShape("triangle", 350, 550, 35, "#ffe0b2", 0.08),

      /* ── Decorative diamonds ── */
      decorativeShape("diamond", 50, 530, 30, "#ffb74d", 0.1),
      decorativeShape("diamond", 170, 20, 25, "#ffe0b2", 0.08),

      /* ── Title ── */
      textBlock("TÍTULO DE\nLA EDICIÓN", 40, 180, {
        fontSize: 38,
        width: 380,
        fontWeight: "bold",
        fill: "#ffffff",
        lineHeight: 1.15,
      }),

      /* ── Ornamental divider ── */
      ...ornamentalDivider(130, 370, 200, "#ffb74d"),

      /* ── Subtitle ── */
      textBlock("Subtítulo de la edición", 40, 410, {
        fontSize: 16,
        width: 380,
        fill: "#ffe0b2",
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
        fill: "#ffb74d",
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
