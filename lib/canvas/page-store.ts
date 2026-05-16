import type { PageLayout } from "./types";

const DB_NAME = "magazine-editor-db" as const;
const STORE_NAME = "pages" as const;
const DB_VERSION = 1 as const;

/* ────────────────────── IndexedDB helpers ────────────────────── */

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "pageNumber" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/* ────────────────────── IndexedDB API ────────────────────── */

export async function savePage(
  pageNumber: number,
  fabricJSON: Record<string, unknown>,
  thumbnail?: string,
): Promise<void> {
  if (typeof window === "undefined") return;

  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);

  const data: PageLayout = { pageNumber, fabricJSON, thumbnail };
  store.put(data);

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

export async function loadPage(
  pageNumber: number,
): Promise<PageLayout | null> {
  if (typeof window === "undefined") return null;

  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);
  const request = store.get(pageNumber);

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      db.close();
      resolve((request.result as PageLayout | undefined) ?? null);
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

export async function clearPages(): Promise<void> {
  if (typeof window === "undefined") return;

  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  store.clear();

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

/* ────────────────────── Server API ────────────────────── */

/**
 * Save a page to the server API.
 * Falls back to IndexedDB on network error.
 */
export async function savePageApi(
  editionId: string,
  pageNumber: number,
  fabricJSON: Record<string, unknown>,
  thumbnail?: string,
): Promise<void> {
  try {
    const response = await fetch(
      `/api/admin/editions/${editionId}/pages/${pageNumber}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fabricJson: fabricJSON,
          thumbnailUrl: thumbnail ?? null,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`API save failed: ${response.status}`);
    }
  } catch {
    // Fallback to IndexedDB on network error
    console.warn(
      "[page-store] API save failed, falling back to IndexedDB",
    );
    await savePage(pageNumber, fabricJSON, thumbnail);
  }
}

/**
 * Load a page from the server API.
 * Falls back to IndexedDB on network error.
 */
export async function loadPageApi(
  editionId: string,
  pageNumber: number,
): Promise<PageLayout | null> {
  try {
    const response = await fetch(
      `/api/admin/editions/${editionId}/pages/${pageNumber}`,
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`API load failed: ${response.status}`);
    }

    const data = await response.json();

    // API stores fabricJson as a JSON string
    const fabricJSON =
      typeof data.fabricJson === "string"
        ? (JSON.parse(data.fabricJson) as Record<string, unknown>)
        : (data.fabricJson as Record<string, unknown>);

    return {
      pageNumber: data.pageNumber as number,
      fabricJSON,
      thumbnail: (data.thumbnailUrl as string | null) ?? undefined,
    };
  } catch {
    // Fallback to IndexedDB on network error
    console.warn(
      "[page-store] API load failed, falling back to IndexedDB",
    );
    return loadPage(pageNumber);
  }
}
