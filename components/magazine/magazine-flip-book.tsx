"use client";

import {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useRef,
  type ReactNode,
} from "react";
import { PageFlip } from "page-flip";

/* ────────────────────────── Types ────────────────────────── */

export interface FlipBookPage {
  key: string;
  /** Hard pages (cover / back cover) flip rigidly like cardboard */
  density?: "hard" | "soft";
  content: ReactNode;
}

export interface FlipBookHandle {
  flipNext: () => void;
  flipPrev: () => void;
  turnToPage: (page: number) => void;
}

interface MagazineFlipBookProps {
  pages: FlipBookPage[];
  pageWidth: number;
  pageHeight: number;
  onFlip: (pageIndex: number) => void;
  onOrientationChange: (orientation: "portrait" | "landscape") => void;
  onStateChange?: (state: string) => void;
}

/* ────────────────────────── Component ────────────────────────── */

/**
 * Realistic page-flip book built on StPageFlip (page-flip).
 *
 * The library re-parents the page elements into its own wrapper DOM, so this
 * component is memoized to never re-render after mount — page content must be
 * fully determined by the initial props. Interaction happens imperatively via
 * the ref handle, and state flows out through the onFlip callback.
 */
export const MagazineFlipBook = memo(
  forwardRef<FlipBookHandle, MagazineFlipBookProps>(function MagazineFlipBook(
    { pages, pageWidth, pageHeight, onFlip, onOrientationChange, onStateChange },
    ref,
  ) {
    const outerRef = useRef<HTMLDivElement | null>(null);
    const bookRef = useRef<HTMLDivElement | null>(null);
    const flipRef = useRef<PageFlip | null>(null);

    const onFlipRef = useRef(onFlip);
    const onOrientationRef = useRef(onOrientationChange);
    const onStateChangeRef = useRef(onStateChange);
    useEffect(() => {
      onFlipRef.current = onFlip;
      onOrientationRef.current = onOrientationChange;
      onStateChangeRef.current = onStateChange;
    });

    useEffect(() => {
      const outer = outerRef.current;
      const book = bookRef.current;
      if (!outer || !book) return;

      // Strict-mode remount: PageFlip.destroy() removed the book node from the
      // DOM on cleanup — re-attach it and strip the stale wrappers before
      // re-initializing.
      if (!book.isConnected) {
        outer.appendChild(book);
      }
      const pageEls = Array.from(
        book.querySelectorAll<HTMLElement>("[data-flip-page]"),
      );
      for (const stale of Array.from(
        book.querySelectorAll(":scope > .stf__wrapper"),
      )) {
        stale.remove();
      }
      for (const el of pageEls) {
        el.removeAttribute("style");
        book.appendChild(el);
      }

      const pf = new PageFlip(book, {
        width: pageWidth,
        height: pageHeight,
        size: "stretch",
        minWidth: 240,
        maxWidth: 560,
        minHeight: 330,
        maxHeight: 780,
        showCover: true,
        usePortrait: true,
        drawShadow: true,
        maxShadowOpacity: 0.45,
        flippingTime: 800,
        mobileScrollSupport: true,
        swipeDistance: 24,
        showPageCorners: true,
        // Clicking the page opens zoom; flipping happens via corners,
        // drag/swipe, and the nav buttons.
        disableFlipByClick: true,
      });

      pf.loadFromHTML(pageEls);

      pf.on("flip", (e) => {
        onFlipRef.current(e.data as number);
      });
      pf.on("changeOrientation", (e) => {
        onOrientationRef.current(e.data as "portrait" | "landscape");
      });
      pf.on("changeState", (e) => {
        onStateChangeRef.current?.(e.data as string);
      });
      pf.on("init", (e) => {
        const data = e.data as { page: number; mode: "portrait" | "landscape" };
        onFlipRef.current(data.page);
        onOrientationRef.current(data.mode);
      });

      flipRef.current = pf;

      return () => {
        flipRef.current = null;
        try {
          pf.destroy();
        } catch {
          // PageFlip throws if the DOM was already torn down — safe to ignore
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        flipNext: () => flipRef.current?.flipNext(),
        flipPrev: () => flipRef.current?.flipPrev(),
        turnToPage: (page: number) => flipRef.current?.flip(page),
      }),
      [],
    );

    return (
      <div ref={outerRef} className="w-full">
        <div ref={bookRef}>
          {pages.map((page) => (
            <div
              key={page.key}
              data-flip-page
              data-density={page.density ?? "soft"}
              className="overflow-hidden bg-[#fbf8f2] shadow-[0_0_6px_rgba(0,0,0,0.08)]"
            >
              {page.content}
            </div>
          ))}
        </div>
      </div>
    );
  }),
  // Never re-render: PageFlip owns this DOM subtree after mount.
  () => true,
);
