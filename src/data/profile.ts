export const siteUrl = "https://debopam-portfolio.dsjzcjmsh6.workers.dev";

export type Experience = {
  role: string;
  company: string;
  period: string;
  description: string;
};

export type StudyNote = {
  title: string;
  description: string;
  year: string;
};

export const profile = {
  name: "Debopam Das",
  firstName: "Debopam",
  lastName: "Das",
  initials: "DD",
  role: "Developer & Student",
  roleShort: "Developer / Designer",
  tagline: "I build small, useful things for the web — and occasionally break them on purpose.",
  about:
    "I'm Debopam, a student and enthusiast passionate about technology, design, and creative problem-solving. I love experimenting with new tools, building side projects, and constantly learning.",
  availability: "Open to internships & collaborations",
  resumeUrl: "/resume.pdf",
  socials: {
    github: "https://github.com/idk4whatamiusing",
    githubHandle: "idk4whatamiusing",
    email: "kyahifarakpdtahein@gmail.com",
  },
  experience: [
    {
      role: "Student",
      company: "Exploring & Learning",
      period: "Present",
      description:
        "Learning full-stack development and design by shipping side projects, reading source code, and rebuilding things I like.",
    },
  ] satisfies Experience[],
  skills: [
    "TypeScript",
    "React",
    "Next.js",
    "Go",
    "Python",
    "Node.js",
    "Cloudflare",
    "Postgres",
    "Figma",
    "Design systems",
    "Motion",
    "Illustration",
  ],
  studyNotes: [
    {
      title: "Generative type",
      description:
        "Stencil letterforms, SVG distortion, and type that reacts to input.",
      year: "2026",
    },
    {
      title: "Motion studies",
      description:
        "Small interaction prototypes exploring scroll, easing, and editorial pacing.",
      year: "2026",
    },
    {
      title: "Tiny tools",
      description:
        "Single-purpose utilities built to scratch a personal itch.",
      year: "2025",
    },
    {
      title: "Shader sketches",
      description:
        "Learning WebGL by rebuilding gradients, grain, and light from scratch.",
      year: "2025",
    },
  ] satisfies StudyNote[],
};
