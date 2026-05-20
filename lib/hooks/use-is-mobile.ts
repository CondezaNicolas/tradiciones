"use client";

import { useEffect, useState } from "react";

/**
 * Reactive hook that returns `true` when the viewport is narrower than the
 * given breakpoint (default 979 px).
 *
 * SSR-safe: returns `false` on the server.
 * Uses lazy state initialisation so `matchMedia` is only called once.
 */
export function useIsMobile(breakpoint = 979): boolean {
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia(`(max-width: ${breakpoint}px)`).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [breakpoint]);

  return isMobile;
}
