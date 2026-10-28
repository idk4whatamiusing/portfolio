import Barcode from "@/components/Barcode";
import { profile } from "@/data/profile";

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="shell">
        <div className="footer__top">
          <a className="footer__brand" href="#top" aria-label="Back to top">
            <span>{profile.initials}</span>
            <em>Debopam Das</em>
          </a>
          <p>
            © {new Date().getFullYear()} Debopam Das. Designed and built with
            care. Hosted on Cloudflare.
          </p>
          <a className="footer__top-link" href="#top">
            Back to top <span aria-hidden="true">↑</span>
          </a>
        </div>

        <div className="footer__bottom">
          <span>Projects sync from GitHub every 10 minutes.</span>
          <Barcode />
          <span>Portfolio / Vol. 02</span>
        </div>
      </div>
    </footer>
  );
}
