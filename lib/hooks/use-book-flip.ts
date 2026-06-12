"use client";

import { useCallback, useEffect, useReducer } from "react";
import type { PageTemplate } from "@/lib/templates/types";
import { savePageApi } from "@/lib/canvas/page-store";
import {
  setPendingTemplate,
} from "@/lib/templates/pending-templates";

/* ───────────────────────── Constants ───────────────────────── */

const INITIAL_PAGES = 2;
const MAX_PAGES = 20;

/* ───────────────────────── Types ───────────────────────────── */

interface BookState {
  isOpen: boolean;
  currentSpread: number;
  totalPages: number;
}

type BookAction =
  | { type: "open" }
  | { type: "close" }
  | { type: "goTo"; spread: number }
  | { type: "addPages" }
  | { type: "addPage" };

interface FlipState {
  phase: "idle" | "ready" | "flipping";
  direction: "next" | "prev";
  target: number;
}

type FlipAction =
  | { type: "start"; direction: "next" | "prev"; target: number }
  | { type: "animate" }
  | { type: "end" };

interface EditorState {
  editingPageIndex: number | null;
  thumbnails: Record<number, string>;
}

type EditorAction =
  | { type: "edit"; pageIndex: number | null }
  | { type: "setThumbnail"; pageIndex: number; url: string };

export interface UseBookFlipParams {
  initialPages?: number;
  maxPages?: number;
}

export interface UseBookFlipReturn {
  /* Book state */
  isOpen: boolean;
  currentSpread: number;
  totalPages: number;
  totalSpreads: number;
  canAddPages: boolean;

  /* Flip state */
  flipPhase: FlipState["phase"];
  flipDirection: FlipState["direction"];
  targetSpread: number;
  isAnimating: boolean;

  /* Editor state */
  editingPageIndex: number | null;
  isEditing: boolean;
  thumbnails: Record<number, string>;

  /* Dispatchers */
  dispatchBook: React.Dispatch<BookAction>;
  dispatchFlip: React.Dispatch<FlipAction>;
  dispatchEditor: React.Dispatch<EditorAction>;

  /* Navigation handlers */
  goToNext: () => void;
  goToPrev: () => void;
  onFlipEnd: (e: React.TransitionEvent) => void;
  addPages: () => void;
  addPageWithTemplate: (template: PageTemplate, editionId: string) => number;
}

/* ───────────────────────── Hook ────────────────────────────── */

export function useBookFlip(
  params: UseBookFlipParams = {},
): UseBookFlipReturn {
  const {
    initialPages = INITIAL_PAGES,
    maxPages = MAX_PAGES,
  } = params;

  /* ── Book reducer ── */
  const [book, dispatchBook] = useReducer(
    (state: BookState, action: BookAction): BookState => {
      switch (action.type) {
        case "open":
          return { ...state, isOpen: true, currentSpread: 0 };
        case "close":
          return { ...state, isOpen: false };
        case "goTo":
          return { ...state, currentSpread: action.spread };
        case "addPages":
          return { ...state, totalPages: Math.min(state.totalPages + 2, maxPages) };
        case "addPage":
          return { ...state, totalPages: Math.min(state.totalPages + 1, maxPages) };
      }
    },
    { isOpen: false, currentSpread: 0, totalPages: initialPages },
  );

  const isOpen = book.isOpen;
  const currentSpread = book.currentSpread;
  const totalPages = book.totalPages;
  const totalSpreads = Math.ceil(totalPages / 2);
  const canAddPages = totalPages < maxPages;

  /* ── Flip animation reducer ── */
  const [flipState, dispatchFlip] = useReducer(
    (state: FlipState, action: FlipAction): FlipState => {
      switch (action.type) {
        case "start":
          return { ...state, phase: "ready" as const, direction: action.direction, target: action.target };
        case "animate":
          return { ...state, phase: "flipping" as const };
        case "end":
          return { ...state, phase: "idle" as const };
      }
    },
    { phase: "idle", direction: "next", target: 0 },
  );

  const flipPhase = flipState.phase;
  const flipDirection = flipState.direction;
  const targetSpread = flipState.target;
  const isAnimating = flipPhase !== "idle";

  /* ── Editor reducer ── */
  const [editor, dispatchEditor] = useReducer(
    (state: EditorState, action: EditorAction): EditorState => {
      switch (action.type) {
        case "edit":
          return { ...state, editingPageIndex: action.pageIndex };
        case "setThumbnail":
          return { ...state, thumbnails: { ...state.thumbnails, [action.pageIndex]: action.url } };
      }
    },
    { editingPageIndex: null, thumbnails: {} as Record<number, string> },
  );

  const editingPageIndex = editor.editingPageIndex;
  const isEditing = editingPageIndex !== null;
  const thumbnails = editor.thumbnails;

  /* ── Flip animation trigger (ready → flipping via rAF) ── */
  useEffect(() => {
    if (flipPhase !== "ready") return;
    const rafId = requestAnimationFrame(() => dispatchFlip({ type: "animate" }));
    return () => cancelAnimationFrame(rafId);
  }, [flipPhase]);

  /* ── Navigation handlers ── */
  const maxIndex = /* caller computes based on isMobile, exposed via totalSpreads */ totalSpreads - 1;

  const goToNext = () => {
    if (isAnimating || isEditing || currentSpread >= maxIndex) return;
    dispatchFlip({ type: "start", direction: "next", target: currentSpread + 1 });
  };

  const goToPrev = () => {
    if (isAnimating || isEditing || currentSpread <= 0) return;
    dispatchFlip({ type: "start", direction: "prev", target: currentSpread - 1 });
  };

  const onFlipEnd = (e: React.TransitionEvent) => {
    if (e.propertyName !== "transform") return;
    dispatchBook({ type: "goTo", spread: targetSpread });
    dispatchFlip({ type: "end" });
  };

  const addPages = () => {
    if (!canAddPages || isAnimating || isEditing) return;
    dispatchBook({ type: "addPages" });
  };

  const addPageWithTemplate = useCallback(
    (template: PageTemplate, editionId: string): number => {
      if (totalPages >= maxPages) return -1;

      const newPageIndex = totalPages;
      const newPageNumber = totalPages + 1;
      dispatchBook({ type: "addPage" });

      const fabricJson = template.fabricJson as Record<string, unknown>;

      // Store in pending cache using 0-based pageIndex for canvas lookup
      setPendingTemplate(editionId, newPageIndex, fabricJson);

      // Persist to server using 1-based pageNumber (fire-and-forget)
      savePageApi(editionId, newPageNumber, fabricJson).catch(
        (err: unknown) => {
          console.error("[use-book-flip] savePageApi failed for template:", err);
        },
      );

      return newPageIndex;
    },
    [totalPages, maxPages, dispatchBook],
  );

  return {
    /* Book */
    isOpen,
    currentSpread,
    totalPages,
    totalSpreads,
    canAddPages,

    /* Flip */
    flipPhase,
    flipDirection,
    targetSpread,
    isAnimating,

    /* Editor */
    editingPageIndex,
    isEditing,
    thumbnails,

    /* Dispatchers */
    dispatchBook,
    dispatchFlip,
    dispatchEditor,

    /* Handlers */
    goToNext,
    goToPrev,
    onFlipEnd,
    addPages,
    addPageWithTemplate,
  };
}
