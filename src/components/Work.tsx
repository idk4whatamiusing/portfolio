"use client";

import ProjectPoster from "@/components/ProjectPoster";
import Reveal from "@/components/Reveal";
import SectionLabel from "@/components/SectionLabel";
import { useProjects } from "@/components/ProjectsProvider";
import { profile } from "@/data/profile";
import { formatSyncTime, isNewProject, yearOf } from "@/lib/format";
import type { PortfolioProject } from "@/lib/types";

function ProjectTitle({ name }: { name: string }) {
  const split = name.lastIndexOf(" ");

  if (split === -1) {
    return (
      <>
        {name}
        <span className="project-row__arrow" aria-hidden="true">
          ↗
        </span>
      </>
    );
  }

  return (
    <>
      {name.slice(0, split + 1)}
      <span className="nowrap">
        {name.slice(split + 1)}
        <span className="project-row__arrow" aria-hidden="true">
          ↗
        </span>
      </span>
    </>
  );
}

function ProjectRow({
  project,
  index,
  syncedAt,
}: {
  project: PortfolioProject;
  index: number;
  syncedAt: string;
}) {
  const isNew = isNewProject(project.createdAt, syncedAt);

  return (
    <Reveal as="article" className="project-row" delay={(index % 2) * 70}>
      <div className="project-row__index" aria-hidden="true">
        <span>{String(index + 1).padStart(2, "0")}</span>
        <span className="project-row__index-line" />
        <span>{yearOf(project.createdAt)}</span>
      </div>

      <div className="project-row__content">
        <div className="project-row__meta">
          <span>{project.language ?? "Project"}</span>
          {project.featured ? <span className="tag tag--sand">Featured</span> : null}
          {isNew ? <span className="tag tag--new">New</span> : null}
          {project.fork ? <span className="tag">Fork</span> : null}
          {project.archived ? <span className="tag">Archived</span> : null}
        </div>

        <h3 className="project-row__title">
          <a href={project.url} target="_blank" rel="noreferrer">
            <ProjectTitle name={project.name} />
          </a>
        </h3>

        <p className="project-row__description">{project.description}</p>

        {project.topics.length > 0 ? (
          <ul className="project-row__topics" aria-label="Topics">
            {project.topics.slice(0, 4).map((topic) => (
              <li key={topic}>#{topic}</li>
            ))}
          </ul>
        ) : null}

        <div className="project-row__links">
          <a href={project.url} target="_blank" rel="noreferrer">
            {project.homepage ? "Visit site" : "View repository"}{" "}
            <span aria-hidden="true">↗</span>
          </a>
          {project.homepage ? (
            <a href={project.repoUrl} target="_blank" rel="noreferrer">
              Source <span aria-hidden="true">↗</span>
            </a>
          ) : null}
        </div>
      </div>

      <a
        className="project-row__media"
        href={project.url}
        target="_blank"
        rel="noreferrer"
        aria-label={`Open ${project.name}`}
      >
        <ProjectPoster
          key={`${project.id}-${project.icon ?? ""}-${project.cover ?? ""}`}
          project={project}
          index={index}
        />
      </a>
    </Reveal>
  );
}

export default function Work() {
  const { payload, live, error } = useProjects();
  const projects = payload.projects.filter((project) => project.section === "work");

  return (
    <section className="work" id="work" aria-labelledby="work-title">
      <div className="shell">
        <SectionLabel>Selected work</SectionLabel>

        <div className="section-head">
          <h2 className="section-title" id="work-title">
            Selected <em>work</em>
          </h2>
          <div className="section-head__aside">
            <span
              className="live-dot"
              data-live={live ? "true" : "false"}
              aria-hidden="true"
            />
            <p>
              {live ? "Live from GitHub" : "GitHub snapshot"}
              <br />
              <span>
                {String(projects.length).padStart(2, "0")} projects · Synced{" "}
                {formatSyncTime(payload.syncedAt)}
              </span>
            </p>
          </div>
        </div>

        {error && !live ? (
          <p className="sync-note" role="status">
            Live sync is unavailable right now — showing the last committed
            snapshot.
          </p>
        ) : null}

        {projects.length === 0 ? (
          <p className="work__empty">
            No public repositories yet. The next sync will fill this section
            automatically.
          </p>
        ) : (
          <div className="work__list">
            {projects.map((project, index) => (
              <ProjectRow
                key={project.id}
                project={project}
                index={index}
                syncedAt={payload.syncedAt}
              />
            ))}
          </div>
        )}

        <div className="work__foot">
          <p>
            Every public repository, forks included. Add the topic{" "}
            <code>hide</code> to remove one, <code>featured</code> to pin it, or{" "}
            <code>experiment</code> to move it to the lab.
          </p>
          <a
            className="link-arrow"
            href={profile.socials.github}
            target="_blank"
            rel="noreferrer"
          >
            View GitHub profile <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}
