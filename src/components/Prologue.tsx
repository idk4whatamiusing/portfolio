import Reveal from "@/components/Reveal";
import SectionLabel from "@/components/SectionLabel";
import { profile } from "@/data/profile";
import { formatSyncTime } from "@/lib/format";

type PrologueProps = {
  projectCount: number;
  languageCount: number;
  syncedAt: string;
};

export default function Prologue({
  projectCount,
  languageCount,
  syncedAt,
}: PrologueProps) {
  return (
    <section className="prologue" id="about">
      <div className="shell">
        <SectionLabel>Prologue</SectionLabel>

        <div className="prologue__grid">
          <div className="prologue__index">
            <span className="prologue__index-number">01</span>
            <span className="mono-label">About the work</span>
          </div>

          <div className="prologue__body">
            <Reveal>
              <h2 className="prologue__statement">
                I&apos;m a student who <em>builds</em> to learn — websites,
                tools, and small experiments that make an idea tangible.
              </h2>
            </Reveal>

            <Reveal delay={120} className="prologue__copy">
              <p>{profile.about}</p>
              <p>
                This site is a live index of everything I&apos;m making. It
                reads straight from GitHub every ten minutes, so a new
                repository appears here without me touching the code.
              </p>
            </Reveal>

            <Reveal delay={200} className="prologue__actions">
              <a className="pill pill--dark" href={profile.resumeUrl}>
                <span>Download résumé</span>
                <span aria-hidden="true">↗</span>
              </a>
              <a className="link-arrow" href="#work">
                Browse the work <span aria-hidden="true">↓</span>
              </a>
            </Reveal>
          </div>
        </div>

        <div className="prologue__stats">
          <Reveal className="stat-card" delay={0}>
            <span className="stat-card__value">{String(projectCount).padStart(2, "0")}</span>
            <span className="stat-card__label">Public repositories</span>
            <span className="stat-card__meta">Forks included</span>
          </Reveal>
          <Reveal className="stat-card" delay={80}>
            <span className="stat-card__value">{String(languageCount).padStart(2, "0")}</span>
            <span className="stat-card__label">Languages in the stack</span>
            <span className="stat-card__meta">Counted from GitHub</span>
          </Reveal>
          <Reveal className="stat-card" delay={160}>
            <span className="stat-card__value">
              10<sup>min</sup>
            </span>
            <span className="stat-card__label">Sync interval</span>
            <span className="stat-card__meta">Last pass {formatSyncTime(syncedAt)}</span>
          </Reveal>
          <Reveal className="stat-card stat-card--note" delay={240}>
            <span className="stat-card__value">∞</span>
            <span className="stat-card__label">Side quests</span>
            <span className="stat-card__meta">Always one more</span>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
