"use client";

/* eslint-disable react-hooks/refs -- the ref is handed to createElement, not read during render */
import { createElement, type ElementType, useEffect, useRef } from "react";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: ElementType;
  /** Play immediately, waiting for the preloader to finish on first visit. */
  immediate?: boolean;
};

export default function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
  immediate = false,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      element.classList.add("is-visible");
      return;
    }

    if (immediate) {
      const show = () => element.classList.add("is-visible");

      if (document.documentElement.getAttribute("data-preloaded") === "true") {
        const frame = window.requestAnimationFrame(show);
        return () => window.cancelAnimationFrame(frame);
      }

      const preloaderObserver = new MutationObserver(() => {
        if (document.documentElement.getAttribute("data-preloaded") === "true") {
          preloaderObserver.disconnect();
          window.requestAnimationFrame(show);
        }
      });

      preloaderObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-preloaded"],
      });

      return () => preloaderObserver.disconnect();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            element.classList.add("is-visible");
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [immediate]);

  return createElement(
    as,
    {
      ref,
      className: `reveal ${className ?? ""}`.trim(),
      style: { "--reveal-delay": `${delay}ms` } as React.CSSProperties,
    },
    children,
  );
}
