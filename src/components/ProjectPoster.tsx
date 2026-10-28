"use client";

/* eslint-disable @next/next/no-img-element */

import { useState, type CSSProperties } from "react";
import { initialsOf, toneFor } from "@/lib/format";
import type { PortfolioProject } from "@/lib/types";

export default function ProjectPoster({
  project,
  index,
  className,
}: {
  project: PortfolioProject;
  index: number;
  className?: string;
}) {
  const [iconSrc, setIconSrc] = useState<string | null>(project.icon);
  const [coverFailed, setCoverFailed] = useState(false);
  const tone = toneFor(project.id);
  const isGeneratedCover = project.cover?.startsWith(
    "https://opengraph.githubassets.com/",
  );

  return (
    <div
      className={`project-poster ${className ?? ""}`.trim()}
      style={{ "--tone": tone } as CSSProperties}
    >
      {project.cover && !coverFailed ? (
        <img
          className={`project-poster__cover ${isGeneratedCover ? "project-poster__cover--og" : ""}`.trim()}
          src={project.cover}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setCoverFailed(true)}
        />
      ) : null}
      <span className="project-poster__veil" aria-hidden="true" />
      <span className="project-poster__index" aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="project-poster__name" aria-hidden="true">
        {project.name}
      </span>

      <span className="project-poster__icon" aria-hidden="true">
        {iconSrc ? (
          <img
            src={iconSrc}
            alt=""
            width={128}
            height={128}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => {
              if (project.iconFallback && iconSrc !== project.iconFallback) {
                setIconSrc(project.iconFallback);
              } else {
                setIconSrc(null);
              }
            }}
          />
        ) : (
          <span className="project-poster__monogram">{initialsOf(project.name)}</span>
        )}
      </span>

      <span className="project-poster__foot" aria-hidden="true">
        <span>{project.language ?? "Open source"}</span>
        <span>{project.stars > 0 ? `★ ${project.stars}` : "View project ↗"}</span>
      </span>
    </div>
  );
}
