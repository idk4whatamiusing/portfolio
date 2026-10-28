export type PortfolioSection = "work" | "experiment";

export type PortfolioProject = {
  /** Repository name, used as a stable id. */
  id: string;
  /** Human-readable, prettified repository name. */
  name: string;
  description: string;
  /** Live site when the repository has a homepage, otherwise the GitHub URL. */
  url: string;
  repoUrl: string;
  homepage: string | null;
  icon: string | null;
  iconFallback: string | null;
  cover: string | null;
  language: string | null;
  topics: string[];
  fork: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  section: PortfolioSection;
  featured: boolean;
  order: number;
  stars: number;
};

export type ProjectsPayload = {
  syncedAt: string;
  owner: string;
  projects: PortfolioProject[];
};
