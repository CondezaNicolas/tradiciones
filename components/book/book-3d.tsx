"use client";

import flipStyles from "@/components/flip-animation.module.css";
import { PageSlot } from "./page-slot";
import { BookSpine } from "./book-spine";

/* ───────────────────────── Types ───────────────────────── */

interface Book3DProps {
  /** Dimensions */
  spreadW: number;
  pageW: number;
  pageH: number;

  /** Book state */
  isOpen: boolean;

  /** Flip animation state */
  isAnimating: boolean;
  flipPhase: "idle" | "ready" | "flipping";
  flipDirection: "next" | "prev";
  targetSpread: number;
  currentSpread: number;

  /** Viewport */
  isMobile: boolean;

  /** Editor */
  editingPageIndex: number | null;
  editionId?: string;
  thumbnails: Record<number, string>;
  onThumbnailUpdate: (pageIndex: number, url: string) => void;
  onEdit: (pageIndex: number | null) => void;

  /** Flip end handler */
  onFlipEnd: (e: React.TransitionEvent) => void;

  /** Spine label */
  spineLabel: string;

  /** Whether the data exists (controls visibility of interior pages) */
  tieneDatos: boolean;
}

/* ───────────────────────── Component ───────────────────────── */

/**
 * The full 3D perspective book with flip animation overlays.
 * This is the most complex visual component — it renders:
 * 1. Stacked page shadows (when closed)
 * 2. The 3D book container with perspective
 * 3. The book spine (BookSpine)
 * 4. The content grid (pages area)
 * 5. Interior pages with flip animation (mobile + desktop)
 * 6. The front cover (handled by parent via BookCover)
 */
export function Book3D({
  spreadW,
  pageW,
  pageH,
  isOpen,
  isAnimating,
  flipPhase,
  flipDirection,
  targetSpread,
  currentSpread,
  isMobile,
  editingPageIndex,
  editionId,
  thumbnails,
  onThumbnailUpdate,
  onEdit,
  onFlipEnd,
  spineLabel,
  tieneDatos,
}: Book3DProps) {
  /* Shared PageSlot props factory */
  const slotProps = (pageIndex: number) => ({
    pageIndex,
    editingPageIndex,
    isMobile,
    pageW,
    pageH,
    ...(editionId ? { editionId } : {}),
    thumbnails,
    onThumbnailUpdate,
    onEdit,
  });

  return (
    <div className="relative" style={{ perspective: "1200px" }}>
      {/* Stacked page shadows (visible when closed) */}
      {!isOpen && (
        <>
          <div className="absolute inset-0 translate-x-[14px] translate-y-[14px] rounded-lg border border-outline-variant/20 bg-surface-container-high" />
          <div className="absolute inset-0 translate-x-[10px] translate-y-[10px] rounded-lg border border-outline-variant/20 bg-surface-container-high" />
          <div className="absolute inset-0 translate-x-[6px] translate-y-[6px] rounded-lg border border-outline-variant/20 bg-surface-container-high" />
        </>
      )}

      {/* Main 3D book container */}
      <div
        className="relative flex"
        style={{
          transformStyle: "preserve-3d",
          transform: "rotateY(-8deg)",
        }}
      >
        {/* Book spine */}
        <BookSpine spreadW={spreadW} pageH={pageH} label={spineLabel} />

        {/* Content grid: cover + interior pages */}
        <div
          className="relative"
          style={{
            display: "grid",
            gridTemplateColumns: isOpen && !isMobile ? `${pageW}px ${pageW}px` : `${pageW}px`,
            height: pageH,
            transition: "grid-template-columns 500ms cubic-bezier(0.4, 0, 0.2, 1)",
            perspective: "1200px",
          }}
        >
          {/* Interior pages (visible when open) */}
          {tieneDatos && (
            <div
              className="absolute inset-0 rounded-r-lg bg-surface-container-lowest"
              style={{
                boxShadow: "inset 2px 0 6px rgba(0,0,0,0.05)",
                overflow: isAnimating ? "visible" : "hidden",
              }}
            >
              {isMobile ? (
                /* ─── Mobile: full-page flip ─── */
                isAnimating ? (
                  <div className="relative h-full w-full">
                    <div className="absolute inset-0">
                      <PageSlot {...slotProps(targetSpread + 1)} />
                    </div>
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        perspective: "800px",
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          backfaceVisibility: "hidden",
                          background: "var(--color-surface-container-lowest)",
                          transformOrigin: "center center",
                          transform:
                            flipPhase === "flipping"
                              ? `rotateY(${flipDirection === "next" ? "-180deg" : "180deg"})`
                              : "rotateY(0deg)",
                          transition:
                            flipPhase === "flipping"
                              ? "transform 400ms ease-in-out"
                              : "none",
                        }}
                        onTransitionEnd={onFlipEnd}
                      >
                        <PageSlot {...slotProps(currentSpread + 1)} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full w-full">
                    <PageSlot {...slotProps(currentSpread + 1)} />
                  </div>
                )
              ) : (
                /* ─── Desktop: spread with page flip ─── */
                isAnimating ? (
                  <div className="flex h-full w-full">
                    {/* Left page (target spread) */}
                    <div
                      className="relative h-full flex-1"
                      style={{
                        boxShadow: "inset -4px 0 8px rgba(0,0,0,0.04)",
                      }}
                    >
                      <PageSlot {...slotProps(targetSpread * 2 + 1)} />

                      {flipDirection === "prev" && (
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            perspective: "1200px",
                          }}
                        >
                          <div
                            className={`${flipStyles.flipPage} ${flipPhase === "ready" || flipPhase === "flipping" ? "will-change-transform" : ""}`}
                            style={{
                              transformOrigin: "right center",
                              transform:
                                flipPhase === "flipping"
                                  ? "rotateY(180deg)"
                                  : "rotateY(0deg)",
                              transition:
                                flipPhase === "flipping"
                                  ? "transform 550ms ease-in-out"
                                  : "none",
                            }}
                            onTransitionEnd={onFlipEnd}
                          >
                            {/* Front: current left page */}
                            <div className={flipStyles.flipFront}>
                              <PageSlot {...slotProps(currentSpread * 2 + 1)} />
                              <div
                                className={flipStyles.flipOverlay}
                                style={{ opacity: flipPhase === "flipping" ? 0.5 : 0 }}
                              />
                            </div>
                            {/* Back: paper verso */}
                            <div
                              className={flipStyles.flipBack}
                              style={{ transform: "rotateY(180deg)", background: "linear-gradient(to left, #e0d8cc, #ece6dc)" }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Inner spine shadow */}
                    <div
                      className="relative z-10 w-[4px] shrink-0"
                      style={{
                        background:
                          "linear-gradient(to right, rgba(0,0,0,0.10), rgba(0,0,0,0.03), rgba(0,0,0,0.10))",
                        boxShadow: "0 0 8px rgba(0,0,0,0.06)",
                      }}
                    />

                    {/* Right page (target spread) */}
                    <div
                      className="relative h-full flex-1"
                      style={{
                        boxShadow: "inset 4px 0 8px rgba(0,0,0,0.04)",
                      }}
                    >
                      <PageSlot {...slotProps(targetSpread * 2 + 2)} />

                      {flipDirection === "next" && (
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            perspective: "1200px",
                          }}
                        >
                          <div
                            className={`${flipStyles.flipPage} ${flipPhase === "ready" || flipPhase === "flipping" ? "will-change-transform" : ""}`}
                            style={{
                              transformOrigin: "left center",
                              transform:
                                flipPhase === "flipping"
                                  ? "rotateY(-180deg)"
                                  : "rotateY(0deg)",
                              transition:
                                flipPhase === "flipping"
                                  ? "transform 550ms ease-in-out"
                                  : "none",
                              boxShadow:
                                flipPhase === "flipping"
                                  ? "-4px 0 18px rgba(0,0,0,0.12)"
                                  : "none",
                            }}
                            onTransitionEnd={onFlipEnd}
                          >
                            {/* Front: current right page */}
                            <div className={flipStyles.flipFront}>
                              <PageSlot {...slotProps(currentSpread * 2 + 2)} />
                              <div
                                className={flipStyles.flipOverlay}
                                style={{ opacity: flipPhase === "flipping" ? 0.5 : 0 }}
                              />
                            </div>
                            {/* Back: paper verso */}
                            <div
                              className={flipStyles.flipBack}
                              style={{ transform: "rotateY(180deg)", background: "linear-gradient(to right, #e0d8cc, #ece6dc)" }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Normal spread — no animation */
                  <div className="flex h-full w-full">
                    <div
                      className="h-full flex-1"
                      style={{ boxShadow: "inset -4px 0 8px rgba(0,0,0,0.04)" }}
                    >
                      <PageSlot {...slotProps(currentSpread * 2 + 1)} />
                    </div>
                    <div
                      className="relative z-10 w-[4px] shrink-0"
                      style={{
                        background:
                          "linear-gradient(to right, rgba(0,0,0,0.10), rgba(0,0,0,0.03), rgba(0,0,0,0.10))",
                        boxShadow: "0 0 8px rgba(0,0,0,0.06)",
                      }}
                    />
                    <div
                      className="h-full flex-1"
                      style={{ boxShadow: "inset 4px 0 8px rgba(0,0,0,0.04)" }}
                    >
                      <PageSlot {...slotProps(currentSpread * 2 + 2)} />
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/*
            NOTE: The front cover div is NOT included here.
            It's rendered by the parent via <BookCover /> because it needs
            access to edition-specific data (coverUrl, category, title, etc.)
            that shouldn't be tunneled through this generic component.

            The parent renders BookCover as a sibling AFTER Book3D in the DOM,
            positioned absolutely over the same grid cell.
          */}
        </div>
      </div>
    </div>
  );
}
