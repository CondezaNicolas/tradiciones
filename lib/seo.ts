/**
 * Shared SEO constants. SITE_URL drives canonical URLs, Open Graph,
 * the sitemap, and robots.txt — set NEXT_PUBLIC_SITE_URL when the
 * production domain changes.
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://tradiciones.vercel.app";

export const SITE_NAME = "Chile País de Tradiciones";

export const SITE_DESCRIPTION =
  "Revista digital dedicada a preservar la riqueza cultural de Chile a través del periodismo de alta gama y la fotografía documental: tradiciones, oficios, fiestas y paisajes de todo el país.";

export const SITE_KEYWORDS = [
  "Chile",
  "tradiciones chilenas",
  "revista digital",
  "cultura chilena",
  "patrimonio",
  "fotografía documental",
  "fiestas tradicionales",
  "folclore",
  "identidad nacional",
];

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

/**
 * Serialise data for injection into a `<script type="application/ld+json">`
 * tag. `JSON.stringify` alone does not escape `<`, so a value containing
 * `</script>` (e.g. an edition title) could break out of the tag and inject
 * markup. Escaping `<` to its unicode form keeps the JSON valid while making
 * tag-breakout impossible.
 */
export function jsonLdSafe(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
