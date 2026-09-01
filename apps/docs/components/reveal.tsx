"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /**
   * Where the trigger line sits, as a fraction of viewport height measured up
   * from the bottom: 0.25 means a block reveals once its top edge is a quarter
   * of the way up the screen. Expressed as a distance rather than as a
   * fraction of the element so that a section taller than the viewport — one
   * that can never reach a high intersection ratio — still reveals.
   */
  offset?: number;
};

/**
 * Fades its children in the first time they scroll into view, then stays put.
 *
 * The hidden state is opacity rather than `visibility`/`display` so the
 * content stays in the accessibility tree and in the tab order the whole
 * time: tabbing into it scrolls it into view, which reveals it anyway.
 */
export function Reveal({ children, className, offset = 0.25 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Anyone who asked for less motion — or whose browser has no
    // IntersectionObserver — gets the content outright. A reveal that never
    // arrives is worse than no reveal at all.
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setRevealed(true);
      return;
    }

    function reveal(entries: IntersectionObserverEntry[]) {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      setRevealed(true);
      for (const observer of observers) observer.disconnect();
    }

    const observers = [
      // The ordinary case: the top edge climbing past the trigger line.
      new IntersectionObserver(reveal, {
        rootMargin: `0px 0px -${Math.round(offset * 100)}% 0px`,
        threshold: 0,
      }),
      // A safety net for whatever sits at the end of the document. The page
      // can run out of scroll before the last block's top edge ever reaches
      // the trigger line, which would strand it at opacity 0 for good — the
      // footer did exactly that on viewports taller than about 900px. Being
      // nearly all on screen is reveal enough. Nearly, rather than a
      // threshold of 1: subpixel rounding in the document height leaves the
      // footer's box a fraction of a pixel past the viewport, so a full ratio
      // is never actually reported. A block too tall to reach this ratio is
      // one that always crosses the trigger line above.
      new IntersectionObserver(reveal, { threshold: 0.9 }),
    ];

    for (const observer of observers) observer.observe(node);
    return () => {
      for (const observer of observers) observer.disconnect();
    };
  }, [offset]);

  return (
    <div
      ref={ref}
      data-revealed={revealed}
      className={cn(
        "transition-[opacity,translate] duration-700 ease-out motion-reduce:transition-none",
        revealed ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
