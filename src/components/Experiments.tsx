"use client";

import { useRef, useState } from "react";
import ProjectPoster from "@/components/ProjectPoster";
import SectionLabel from "@/components/SectionLabel";
import { useProjects } from "@/components/ProjectsProvider";
import { profile } from "@/data/profile";
import { initialsOf, isNewProject, yearOf } from "@/lib/format";
import type { PortfolioProject } from "@/lib/types";

const pad = (value: number) => String(value).padStart(2, "0");

function ExperimentCard({
  project,
  index,
  syncedAt,
}: {
  project: PortfolioProject;
  index: number;
  syncedAt: string;
}) {
  return (
    <a
      className="experiment-card"
      href={project.url}
      target="_blank"
      rel="noreferrer"
      draggable={false}
    >
      <div className="experiment-card__top">
        <span>Exp / {pad(index + 1)}</span>
        <span className="experiment-card__top-meta">
          {isNewProject(project.createdAt, syncedAt) ? (
            <span className="tag tag--new">New</span>
          ) : null}
          {project.fork ? <span className="tag">Fork</span> : null}
          <span>{yearOf(project.createdAt)}</span>
        </span>
      </div>

      <ProjectPoster
        key={`${project.id}-${project.icon ?? ""}-${project.cover ?? ""}`}
        project={project}
        index={index}
        className="project-poster--rail"
      />

      <div className="experiment-card__body">
        <h3>{project.name}</h3>
        <p>{project.description}</p>
        <div className="experiment-card__meta">
          <span>{project.language ?? "Open source"}</span>
          <span aria-hidden="true">↗</span>
        </div>
      </div>
    </a>
  );
}

export default function Experiments() {
  const { payload } = useProjects();
  const experiments = payload.projects.filter(
    (project) => project.section === "experiment",
  );
  const showingNotes = experiments.length === 0;

  const railRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ active: false, startX: 0, startScroll: 0, moved: 0 });
  const [dragging, setDragging] = useState(false);

  const scrollByCard = (direction: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector<HTMLElement>(".experiment-card");
    const distance = card ? card.offsetWidth + 24 : rail.clientWidth * 0.8;
    rail.scrollBy({ left: distance * direction, behavior: "smooth" });
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const rail = railRef.current;
    if (!rail) return;
    dragState.current = {
      active: true,
      startX: event.clientX,
      startScroll: rail.scrollLeft,
      moved: 0,
    };
    setDragging(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = dragState.current;
    const rail = railRef.current;
    if (!state.active || !rail) return;
    const delta = event.clientX - state.startX;
    state.moved = Math.max(state.moved, Math.abs(delta));
    rail.scrollLeft = state.startScroll - delta;
  };

  const endDrag = () => {
    dragState.current.active = false;
    setDragging(false);
  };

  const handleClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (dragState.current.moved > 6) {
      event.preventDefault();
      event.stopPropagation();
      dragState.current.moved = 0;
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollByCard(1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollByCard(-1);
    }
  };

  return (
    <section className="experiments" id="experiments" aria-labelledby="experiments-title">
      <div className="shell">
        <SectionLabel tone="light">Experiments</SectionLabel>

        <div className="section-head section-head--light">
          <h2 className="section-title" id="experiments-title">
            The <em>lab</em>
          </h2>
          <div className="section-head__aside">
            <p>
              {showingNotes
                ? "Ongoing studies"
                : `${pad(experiments.length)} experiments`}
              <br />
              <span>
                {showingNotes
                  ? "Tag a repo with experiment to add one"
                  : "Synced from GitHub, newest first"}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="rail-head shell">
        <p className="rail-hint">
          <span aria-hidden="true">↔</span> Drag to explore
        </p>
        <div className="rail-controls">
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            aria-label="Previous experiments"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            aria-label="Next experiments"
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={railRef}
        className={`rail ${dragging ? "is-dragging" : ""}`}
        role="region"
        aria-label="Experiment cards"
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={handleClickCapture}
        onKeyDown={handleKeyDown}
      >
        {showingNotes
          ? profile.studyNotes.map((note, index) => (
              <article className="experiment-card experiment-card--study" key={note.title}>
                <div className="experiment-card__top">
                  <span>Study / {pad(index + 1)}</span>
                  <span>{note.year}</span>
                </div>
                <div className="experiment-card__abstract" aria-hidden="true">
                  <span className="experiment-card__orb" />
                  <span className="experiment-card__monogram">
                    {initialsOf(note.title)}
                  </span>
                </div>
                <div className="experiment-card__body">
                  <h3>{note.title}</h3>
                  <p>{note.description}</p>
                  <div className="experiment-card__meta">
                    <span>Ongoing study</span>
                    <span>∞</span>
                  </div>
                </div>
              </article>
            ))
          : experiments.map((project, index) => (
              <ExperimentCard
                key={project.id}
                project={project}
                index={index}
                syncedAt={payload.syncedAt}
              />
            ))}
      </div>

      {showingNotes ? (
        <div className="shell">
          <p className="experiments__note">
            These are field notes, not repositories. Once a repo is tagged{" "}
            <code>experiment</code>, it replaces this rail on the next sync.
          </p>
        </div>
      ) : null}
    </section>
  );
}
