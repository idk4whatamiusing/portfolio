"use client";

import { useEffect, useState } from "react";

const PRELOAD_KEY = "dd:preloaded";

export default function Preloader() {
  const [count, setCount] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const finish = () => {
      root.setAttribute("data-preloaded", "true");
      try {
        sessionStorage.setItem(PRELOAD_KEY, "1");
      } catch {
        // Storage can be blocked; the preloader still finishes.
      }
    };

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      (() => {
        try {
          return sessionStorage.getItem(PRELOAD_KEY) === "1";
        } catch {
          return false;
        }
      })()
    ) {
      finish();
      const skipTimer = window.setTimeout(() => setDone(true), 0);
      return () => window.clearTimeout(skipTimer);
    }

    let frame = 0;
    let hideTimer = 0;
    const started = performance.now();
    const duration = 1250;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * 100));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
        return;
      }

      hideTimer = window.setTimeout(() => {
        setLeaving(true);
        window.setTimeout(() => {
          finish();
          setDone(true);
        }, 950);
      }, 260);
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (done) return null;

  return (
    <div
      className={`preloader ${leaving ? "is-leaving" : ""}`.trim()}
      aria-hidden="true"
    >
      <div className="preloader__top">
        <span>Debopam Das</span>
        <span>Portfolio — 2026</span>
      </div>

      <div className="preloader__center">
        <span className="preloader__name">
          Debopam <em>Das</em>
        </span>
      </div>

      <div className="preloader__bottom">
        <span>Loading the good stuff</span>
        <span className="preloader__count">
          {String(count).padStart(3, "0")}
          <sup>%</sup>
        </span>
      </div>

      <div className="preloader__bar">
        <span style={{ transform: `scaleX(${count / 100})` }} />
      </div>
    </div>
  );
}
