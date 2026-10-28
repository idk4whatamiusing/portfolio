import type { Metadata, Viewport } from "next";
import {
  Big_Shoulders_Stencil,
  Instrument_Serif,
  Space_Mono,
} from "next/font/google";
import Preloader from "@/components/Preloader";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { profile, siteUrl } from "@/data/profile";
import "./globals.css";

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-instrument",
});

const stencil = Big_Shoulders_Stencil({
  subsets: ["latin"],
  weight: "variable",
  display: "swap",
  variable: "--font-stencil",
});

const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${profile.name} — Developer & Student`,
    template: `%s — ${profile.name}`,
  },
  description:
    "Portfolio of Debopam Das — a live index of public repositories, experiments, and things built to learn.",
  applicationName: `${profile.name} — Portfolio`,
  authors: [{ name: profile.name, url: profile.socials.github }],
  creator: profile.name,
  keywords: [
    "Debopam Das",
    "portfolio",
    "developer",
    "designer",
    "open source",
    "Next.js",
    "Cloudflare",
  ],
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: `${profile.name} — Portfolio`,
    title: `${profile.name} — Developer & Student`,
    description:
      "A live index of public repositories, experiments, and things built to learn.",
  },
  twitter: {
    card: "summary",
    title: `${profile.name} — Developer & Student`,
    description:
      "A live index of public repositories, experiments, and things built to learn.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#2c2824",
  width: "device-width",
  initialScale: 1,
};

const bootScript = `(function(){var d=document.documentElement;d.classList.add('js');try{if(sessionStorage.getItem('dd:preloaded')==='1'){d.setAttribute('data-preloaded','true')}}catch(e){};window.setTimeout(function(){if(!d.hasAttribute('data-preloaded')){d.setAttribute('data-preloaded','true')}},5000);})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${serif.variable} ${stencil.variable} ${mono.variable}`}
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Preloader />
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
