/**
 * Pending templates cache.
 *
 * When a template is applied via `addPageWithTemplate`, the fabricJson
 * is stored here so the canvas editor can retrieve it immediately
 * without waiting for the API save to complete.
 *
 * Key format: `${editionId}-${pageNumber}`
 * Value: fabricJson object
 */

const pendingTemplates = new Map<string, Record<string, unknown>>();

/** Build the map key for a given edition + page. */
function key(editionId: string, pageNumber: number): string {
  return `${editionId}-${pageNumber}`;
}

/** Store a template's fabricJson for immediate canvas access. */
export function setPendingTemplate(
  editionId: string,
  pageNumber: number,
  fabricJson: Record<string, unknown>,
): void {
  pendingTemplates.set(key(editionId, pageNumber), fabricJson);
}

/**
 * Retrieve a pending template's fabricJson.
 * Returns `undefined` if no pending template exists for that page.
 */
export function getPendingTemplate(
  editionId: string,
  pageNumber: number,
): Record<string, unknown> | undefined {
  return pendingTemplates.get(key(editionId, pageNumber));
}

/** Remove a pending template after the canvas has consumed it. */
export function clearPendingTemplate(
  editionId: string,
  pageNumber: number,
): void {
  pendingTemplates.delete(key(editionId, pageNumber));
}
