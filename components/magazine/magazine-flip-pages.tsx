"use client";

import type { TransitionEvent } from "react";
import type { MagazinePage } from "@/components/magazine/zoom-page-content";
import flipStyles from "../flip-animation.module.css";
import { ReaderPage } from "./reader-page";

// ─── Types ───────────────────────────────────────────────────────────

export const FLIP_PHASE = {
  IDLE: "idle",
  READY: "ready",
  FLIPPING: "flipping",
} as const;

export const FLIP_DIRECTION = {
  NEXT: "next",
  PREV: "prev",
} as const;

export type FlipPhase = (typeof FLIP_PHASE)[keyof typeof FLIP_PHASE];
export type FlipDirection = (typeof FLIP_DIRECTION)[keyof typeof FLIP_DIRECTION];

interface FlipState {
  phase: FlipPhase;
  direction: FlipDirection;
  target: number;
}

export type FlipAction =
  | { type: "start"; direction: FlipDirection; target: number }
  | { type: "animate" }
  | { type: "end" };

export function flipReducer(state: FlipState, action: FlipAction): FlipState {
  switch (action.type) {
    case "start": return { ...state, phase: FLIP_PHASE.READY, direction: action.direction, target: action.target };
    case "animate": return { ...state, phase: FLIP_PHASE.FLIPPING };
    case "end": return { ...state, phase: FLIP_PHASE.IDLE };
  }
}

export const INITIAL_FLIP_STATE: FlipState = {
  phase: FLIP_PHASE.IDLE,
  direction: FLIP_DIRECTION.NEXT,
  target: 0,
};

// ─── Sub-components ──────────────────────────────────────────────────

interface FlipPageProps {
  flipOrigin: "left" | "right";
  pageNumber: number;
  pageMap: Map<number, MagazinePage>;
  onOpenZoom: (pageNumber: number) => void;
  onFlipEnd: (event: TransitionEvent<Element>) => void;
}

function FlipPage({ flipOrigin, pageNumber, pageMap, onOpenZoom, onFlipEnd }: FlipPageProps) {
  const page = pageMap.get(pageNumber);
  const pageData = {
    pageNumber,
    thumbnailUrl: page?.thumbnailUrl,
    fabricJson: page?.fabricJson,
    onZoom: page?.thumbnailUrl || page?.fabricJson ? () => onOpenZoom(pageNumber) : undefined,
  };

  return (
    <div style={{ position: "absolute", inset: 0, perspective: "1200px" }}>
      <div
        className={flipStyles.flipPage}
        style={{
          transformOrigin: `${flipOrigin === "left" ? "left" : "right"} center`,
          width: "100%",
          height: "100%",
        }}
        onTransitionEnd={onFlipEnd}
      >
        <div className={flipStyles.flipFront}>
          <ReaderPage {...pageData} />
          <div className={flipStyles.flipOverlay} />
        </div>
        <div
          className={flipStyles.flipBack}
          style={{ transform: "rotateY(180deg)", background: "linear-gradient(to left, #e0d8cc, #ece6dc)" }}
        />
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────

interface MagazineFlipPagesProps {
  isMobile: boolean;
  isAnimating: boolean;
  flipPhase: FlipPhase;
  flipDirection: FlipDirection;
  currentSpread: number;
  targetSpread: number;
  pageMap: Map<number, MagazinePage>;
  firstEditorialPage: number;
  onFlipEnd: (event: TransitionEvent<Element>) => void;
  onOpenZoom: (pageNumber: number) => void;
}

export function MagazineFlipPages({
  isMobile,
  isAnimating,
  flipPhase,
  flipDirection,
  currentSpread,
  targetSpread,
  pageMap,
  firstEditorialPage,
  onFlipEnd,
  onOpenZoom,
}: MagazineFlipPagesProps) {
  const getMobilePageNumber = (index: number) => firstEditorialPage + index;
  const getDesktopLeftPageNumber = (spreadIndex: number) => firstEditorialPage + spreadIndex * 2;
  const getDesktopRightPageNumber = (spreadIndex: number) => firstEditorialPage + spreadIndex * 2 + 1;

  const pageProps = (pageNumber: number) => {
    const page = pageMap.get(pageNumber);
    return {
      pageNumber,
      thumbnailUrl: page?.thumbnailUrl,
      fabricJson: page?.fabricJson,
      onZoom: page?.thumbnailUrl || page?.fabricJson ? () => onOpenZoom(pageNumber) : undefined,
    };
  };

  // ─── Mobile rendering ──────────────────────────────────────────

  if (isMobile) {
    const currentMobilePage = getMobilePageNumber(currentSpread);
    const targetMobilePage = getMobilePageNumber(targetSpread);

    if (!isAnimating) {
      return (
        <div className="h-full w-full">
          <ReaderPage {...pageProps(currentMobilePage)} />
        </div>
      );
    }

    return (
      <div className="relative h-full w-full">
        <div className="absolute inset-0">
          <ReaderPage {...pageProps(targetMobilePage)} />
        </div>
        <div style={{ position: "absolute", inset: 0, perspective: "800px" }}>
          <div
            style={{
              width: "100%",
              height: "100%",
              backfaceVisibility: "hidden",
              background: "var(--color-surface-container-lowest)",
              transformOrigin: "center center",
              transform:
                flipPhase === FLIP_PHASE.FLIPPING
                  ? `rotateY(${flipDirection === FLIP_DIRECTION.NEXT ? "-180deg" : "180deg"})`
                  : "rotateY(0deg)",
              transition:
                flipPhase === FLIP_PHASE.FLIPPING ? "transform 400ms ease-in-out" : "none",
            }}
            onTransitionEnd={onFlipEnd}
          >
            <ReaderPage {...pageProps(currentMobilePage)} />
          </div>
        </div>
      </div>
    );
  }

  // ─── Desktop rendering ─────────────────────────────────────────

  const currentLeft = getDesktopLeftPageNumber(currentSpread);
  const currentRight = getDesktopRightPageNumber(currentSpread);
  const targetLeft = getDesktopLeftPageNumber(targetSpread);
  const targetRight = getDesktopRightPageNumber(targetSpread);

  if (!isAnimating) {
    return (
      <div className="flex h-full w-full">
        <div className="h-full flex-1" style={{ boxShadow: "inset -4px 0 8px rgba(0,0,0,0.04)" }}>
          <ReaderPage {...pageProps(currentLeft)} />
        </div>
        <div
          className="relative z-10 w-[4px] shrink-0"
          style={{
            background: "linear-gradient(to right, rgba(0,0,0,0.10), rgba(0,0,0,0.03), rgba(0,0,0,0.10))",
            boxShadow: "0 0 8px rgba(0,0,0,0.06)",
          }}
        />
        <div className="h-full flex-1" style={{ boxShadow: "inset 4px 0 8px rgba(0,0,0,0.04)" }}>
          <ReaderPage {...pageProps(currentRight)} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full">
      <div className="relative h-full flex-1" style={{ boxShadow: "inset -4px 0 8px rgba(0,0,0,0.04)" }}>
        <ReaderPage {...pageProps(targetLeft)} />
        {flipDirection === FLIP_DIRECTION.PREV && (
          <FlipPage
            flipOrigin="right"
            pageNumber={currentLeft}
            pageMap={pageMap}
            onOpenZoom={onOpenZoom}
            onFlipEnd={onFlipEnd}
          />
        )}
      </div>

      <div
        className="relative z-10 w-[4px] shrink-0"
        style={{
          background: "linear-gradient(to right, rgba(0,0,0,0.10), rgba(0,0,0,0.03), rgba(0,0,0,0.10))",
          boxShadow: "0 0 8px rgba(0,0,0,0.06)",
        }}
      />

      <div className="relative h-full flex-1" style={{ boxShadow: "inset 4px 0 8px rgba(0,0,0,0.04)" }}>
        <ReaderPage {...pageProps(targetRight)} />
        {flipDirection === FLIP_DIRECTION.NEXT && (
          <FlipPage
            flipOrigin="left"
            pageNumber={currentRight}
            pageMap={pageMap}
            onOpenZoom={onOpenZoom}
            onFlipEnd={onFlipEnd}
          />
        )}
      </div>
    </div>
  );
}
