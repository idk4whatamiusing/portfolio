import Reveal from "@/components/Reveal";
import SectionLabel from "@/components/SectionLabel";
import { profile } from "@/data/profile";

export default function Contact() {
  return (
    <section className="contact" id="contact" aria-labelledby="contact-title">
      <div className="shell">
        <SectionLabel tone="light">Contact</SectionLabel>

        <div className="contact__meta">
          <span>Have a project in mind?</span>
          <span className="contact__status">
            <i aria-hidden="true" />
            {profile.availability}
          </span>
        </div>

        <Reveal>
          <h2 className="contact__title" id="contact-title">
            Let&apos;s make
            <br />
            <em>something</em> good.
          </h2>
        </Reveal>

        <div className="contact__actions">
          <a className="contact__email" href={`mailto:${profile.socials.email}`}>
            <span>{profile.socials.email}</span>
            <span aria-hidden="true">↗</span>
          </a>
          <a
            className="circle-link circle-link--light"
            href={`mailto:${profile.socials.email}`}
          >
            <span>
              Say
              <br />
              hello
            </span>
            <span aria-hidden="true">↗</span>
          </a>
        </div>

        <div className="contact__foot">
          <div>
            <span className="mono-label">Elsewhere</span>
            <a href={profile.socials.github} target="_blank" rel="noreferrer">
              GitHub <span aria-hidden="true">↗</span>
            </a>
            <a href={profile.resumeUrl}>
              Résumé <span aria-hidden="true">↗</span>
            </a>
          </div>
          <p>
            Open to internships, collaborations, and interesting problems.
            The best way to reach me is email.
          </p>
        </div>
      </div>
    </section>
  );
}
