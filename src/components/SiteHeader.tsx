"use client";

import { useCallback, useEffect, useState } from "react";
import MobileMenu from "@/components/MobileMenu";
import { profile } from "@/data/profile";

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const closeMenu = useCallback(() => setOpen(false), []);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(window.scrollY > 24);
      setProgress(scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0);
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
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("menu-open", open);
    return () => root.classList.remove("menu-open");
  }, [open]);

  return (
    <>
      <header className="site-header" data-scrolled={scrolled ? "true" : "false"}>
        <div className="site-header__progress" aria-hidden="true">
          <span style={{ transform: `scaleX(${progress})` }} />
        </div>

        <div className="site-header__inner">
          <a className="brand" href="#top" aria-label="Debopam Das — back to top">
            <span className="brand__mark">{profile.initials}</span>
            <span className="brand__text">
              <strong>{profile.name}</strong>
              <span>Portfolio / 2026</span>
            </span>
          </a>

          <nav className="site-nav" aria-label="Primary">
            <a href="#work">Work</a>
            <a href="#experiments">Experiments</a>
            <a href="#info">Info</a>
          </nav>

          <div className="site-header__actions">
            <a className="pill pill--header" href="#contact">
              <span>Let&apos;s talk</span>
              <span aria-hidden="true">↗</span>
            </a>
            <button
              type="button"
              className="menu-button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="site-menu"
            >
              <span>Menu</span>
              <span className="menu-button__lines" aria-hidden="true">
                <i />
                <i />
              </span>
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={open} onClose={closeMenu} />
    </>
  );
}
