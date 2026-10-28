import Parallax from "@/components/Parallax";
import Reveal from "@/components/Reveal";
import { profile } from "@/data/profile";

type HeroProps = {
  projectCount: number;
  languageCount: number;
};

export default function Hero({ projectCount, languageCount }: HeroProps) {
  return (
    <section className="hero" id="top">
      <div className="hero__grid" aria-hidden="true" />
      <div className="hero__contours" aria-hidden="true" />
      <Parallax className="hero__sun-wrap" speed={0.08}>
        <div className="hero__sun" aria-hidden="true">
          <span className="hero__sun-ring" />
          <span className="hero__sun-ring hero__sun-ring--two" />
        </div>
      </Parallax>

      <div className="hero__meta">
        <span>Developer / Designer</span>
        <span className="hero__meta-center">Portfolio — Vol. 02</span>
        <span className="hero__meta-right">
          <i aria-hidden="true" />
          Available for work
        </span>
      </div>

      <div className="hero__title-wrap">
        <h1 className="hero__title">
          <span className="hero__line hero__line--first">
            <Reveal as="span" immediate>
              Debopam
            </Reveal>
          </span>
          <span className="hero__line hero__line--second">
            <Reveal as="span" delay={140} immediate>
              <em>Das</em>
            </Reveal>
          </span>
        </h1>
        <Reveal className="hero__role" delay={260} as="p" immediate>
          Building small, useful things for the web.
        </Reveal>
      </div>

      <div className="hero__footer">
        <div className="hero__intro">
          <p>
            I&apos;m a student who learns by shipping. This is a live index of
            the repositories, tools, and experiments that come out of it.
          </p>
          <span className="hero__status">
            <i aria-hidden="true" />
            {profile.availability}
          </span>
        </div>

        <dl className="hero__stats">
          <div>
            <dt>Public repos</dt>
            <dd>{String(projectCount).padStart(2, "0")}</dd>
          </div>
          <div>
            <dt>Languages</dt>
            <dd>{String(languageCount).padStart(2, "0")}</dd>
          </div>
          <div>
            <dt>Auto-sync</dt>
            <dd>
              10<sup>min</sup>
            </dd>
          </div>
        </dl>

        <a className="circle-link" href="#work">
          <span>
            Selected
            <br />
            work
          </span>
          <span aria-hidden="true">↓</span>
        </a>
      </div>

      <div className="hero__scroll" aria-hidden="true">
        <span>Scroll to explore</span>
        <span className="hero__scroll-line" />
      </div>
    </section>
  );
}
