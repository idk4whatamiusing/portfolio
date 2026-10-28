import Reveal from "@/components/Reveal";
import SectionLabel from "@/components/SectionLabel";
import { profile } from "@/data/profile";
import { formatSyncTime } from "@/lib/format";

type InfoProps = {
  projectCount: number;
  languageCount: number;
  syncedAt: string;
};

export default function Info({
  projectCount,
  languageCount,
  syncedAt,
}: InfoProps) {
  return (
    <section className="info" id="info" aria-labelledby="info-title">
      <div className="shell">
        <SectionLabel>Info</SectionLabel>

        <div className="info__grid">
          <div className="info__intro">
            <h2 className="section-title" id="info-title">
              Learning <em>in public.</em>
            </h2>
            <p className="info__lead">
              I care about clarity, craft, and the small details that make a
              thing feel considered. Most of what I know comes from building
              something slightly too ambitious and figuring it out on the way.
            </p>
            <a className="pill pill--dark" href="#contact">
              <span>Work with me</span>
              <span aria-hidden="true">↗</span>
            </a>
          </div>

          <div className="info__content">
            <Reveal className="info__block">
              <h3 className="mono-label">Experience</h3>
              <ol className="timeline">
                {profile.experience.map((item) => (
                  <li key={`${item.role}-${item.company}`}>
                    <span className="timeline__period">{item.period}</span>
                    <div>
                      <h4>
                        {item.role}
                        <span> — {item.company}</span>
                      </h4>
                      <p>{item.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Reveal>

            <Reveal className="info__block" delay={80}>
              <h3 className="mono-label">Toolkit</h3>
              <ul className="toolkit">
                {profile.skills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </Reveal>

            <Reveal className="info__block" delay={140}>
              <h3 className="mono-label">Elsewhere</h3>
              <ul className="link-list">
                <li>
                  <a
                    href={profile.socials.github}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>GitHub</span>
                    <span className="link-list__handle">
                      @{profile.socials.githubHandle}
                    </span>
                    <span aria-hidden="true">↗</span>
                  </a>
                </li>
                <li>
                  <a href={`mailto:${profile.socials.email}`}>
                    <span>Email</span>
                    <span className="link-list__handle">
                      {profile.socials.email}
                    </span>
                    <span aria-hidden="true">↗</span>
                  </a>
                </li>
                <li>
                  <a href={profile.resumeUrl}>
                    <span>Résumé</span>
                    <span className="link-list__handle">PDF</span>
                    <span aria-hidden="true">↗</span>
                  </a>
                </li>
              </ul>
            </Reveal>
          </div>
        </div>

        <div className="info__stats">
          <div>
            <span>{String(projectCount).padStart(2, "0")}</span>
            <p>Public repositories</p>
          </div>
          <div>
            <span>{String(languageCount).padStart(2, "0")}</span>
            <p>Languages</p>
          </div>
          <div>
            <span>10<sup>min</sup></span>
            <p>Sync loop</p>
          </div>
          <div>
            <span>24<sup>/7</sup></span>
            <p>Always building</p>
          </div>
        </div>

        <p className="info__sync">
          Project index last synced {formatSyncTime(syncedAt)}. Hosted on
          Cloudflare Workers; the source of truth is GitHub.
        </p>
      </div>
    </section>
  );
}
