"use client";

import { useEffect, useRef } from "react";

type ParallaxProps = {
  children: React.ReactNode;
  className?: string;
  speed?: number;
};

export default function Parallax({
  children,
  className,
  speed = 0.12,
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      const distance = rect.top + rect.height / 2 - window.innerHeight / 2;
      const offset = Math.max(-140, Math.min(140, -distance * speed));
      element.style.setProperty("--parallax", `${offset.toFixed(2)}px`);
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [speed]);

  return (
    <div
      ref={ref}
      className={`parallax ${className ?? ""}`.trim()}
      style={{ "--parallax": "0px" } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
