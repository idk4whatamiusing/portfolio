"use client";

import { useEffect, useRef } from "react";
import { profile } from "@/data/profile";

const LINKS = [
  { href: "#work", label: "Work", meta: "Selected repositories" },
  { href: "#experiments", label: "Experiments", meta: "The lab" },
  { href: "#info", label: "Info", meta: "About & toolkit" },
  { href: "#contact", label: "Contact", meta: "Say hello" },
];

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
};

export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 90);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])',
        ),
      ).filter((element) => element.offsetParent !== null);

      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  return (
    <div
      id="site-menu"
      ref={panelRef}
      className={`mobile-menu ${open ? "is-open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      aria-hidden={!open}
    >
      <div className="mobile-menu__head">
        <span className="mobile-menu__brand">Debopam Das</span>
        <span className="mobile-menu__label">Menu / 2026</span>
        <button
          ref={closeRef}
          type="button"
          className="mobile-menu__close"
          onClick={onClose}
        >
          <span>Close</span>
          <span aria-hidden="true">×</span>
        </button>
      </div>

      <nav className="mobile-menu__nav" aria-label="Mobile">
        {LINKS.map((link, index) => (
          <a
            key={link.href}
            href={link.href}
            onClick={onClose}
            style={{ "--menu-delay": `${90 + index * 70}ms` } as React.CSSProperties}
          >
            <span className="mobile-menu__index">0{index + 1}</span>
            <span className="mobile-menu__link">{link.label}</span>
            <span className="mobile-menu__meta">{link.meta}</span>
            <span className="mobile-menu__arrow" aria-hidden="true">
              ↗
            </span>
          </a>
        ))}
      </nav>

      <div className="mobile-menu__foot">
        <div>
          <span className="mono-label">Elsewhere</span>
          <a href={`mailto:${profile.socials.email}`}>{profile.socials.email}</a>
          <a
            href={profile.socials.github}
            target="_blank"
            rel="noreferrer"
          >
            GitHub ↗
          </a>
        </div>
        <p>{profile.availability}</p>
      </div>
    </div>
  );
}
