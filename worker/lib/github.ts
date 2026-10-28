import type {
  PortfolioProject,
  PortfolioSection,
  ProjectsPayload,
} from "../../src/lib/types";

const GITHUB_API = "https://api.github.com";
const RAW_GITHUB = "https://raw.githubusercontent.com";
const USER_AGENT = "debopam-portfolio-sync";
const MAX_PAGES = 5;
const FALLBACK_ICON_SIZE = 256;

export type GitHubRepo = {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  archived: boolean;
  homepage: string | null;
  language: string | null;
  topics?: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string | null;
  stargazers_count: number;
  default_branch: string;
  private: boolean;
};

export type PortfolioOverride = {
  title?: string;
  description?: string;
  icon?: string;
  cover?: string;
  link?: string;
  featured?: boolean;
  section?: PortfolioSection;
  order?: number;
  hide?: boolean;
};

export type CollectOptions = {
  owner: string;
  portfolioRepo: string;
  token?: string;
  fetchImpl?: typeof fetch;
  maxReadmeFetches?: number;
  onWarning?: (message: string) => void;
  /** Reuse already-enriched projects for repositories that have not changed. */
  cachedProjects?: Map<string, { updatedAt: string; project: PortfolioProject }>;
};

export class GitHubError extends Error {
  status: number | undefined;
  resetAt: string | null;

  constructor(message: string, status?: number, resetAt?: string | null) {
    super(message);
    this.name = "GitHubError";
    this.status = status;
    this.resetAt = resetAt ?? null;
  }
}

const ACRONYMS = new Set([
  "ai", "api", "ar", "aws", "b2b", "b2c", "bgp", "bios", "cli", "cms", "cpu",
  "crm", "crud", "css", "csv", "cv", "db", "dns", "dom", "ec2", "erp", "ftp",
  "gcp", "gif", "gpu", "grpc", "gpt", "hdmi", "html", "http", "https", "id",
  "imap", "iot", "ipv4", "ipv6", "isr", "js", "json", "jwt", "kv", "lan",
  "lcd", "led", "llm", "man", "ml", "mpls", "mp4", "nas", "nat", "nlp",
  "oauth", "oled", "os", "ospf", "paas", "pan", "pdf", "png", "pwa", "qos",
  "rag", "raid", "ram", "rest", "rom", "rss", "rtos", "s3", "saas", "sdk",
  "seo", "sih", "sip", "smtp", "spa", "sql", "ssh", "ssr", "ssid", "svg", "tcp",
  "ts", "udp", "uefi", "ui", "uri", "url", "usb", "ux", "vpn", "vps", "vr",
  "wan", "wasm", "webgl", "wlan", "xml", "yaml",
]);

const COMPOUND_WORDS: Record<string, string> = {
  faceid: "Face ID",
  devops: "DevOps",
  github: "GitHub",
  gitlab: "GitLab",
  javascript: "JavaScript",
  typescript: "TypeScript",
  nextjs: "Next.js",
  nodejs: "Node.js",
  postgres: "Postgres",
  postgresql: "PostgreSQL",
};

/**
 * Turns `my-cool-app` into `My Cool App` without mangling intentional casing.
 * `sih26168-dead-reckoning` becomes `SIH 26168 Dead Reckoning`.
 */
export function prettifyRepoName(name: string): string {
  const cleaned = name.replace(/[._-]+/g, " ").replace(/\s+/g, " ").trim();
  if (!cleaned) return name;

  return cleaned
    .split(" ")
    .map((word) => {
      if (!word) return word;

      const compound = COMPOUND_WORDS[word.toLowerCase()];
      if (compound) return compound;

      // Preserve intentional camelCase / PascalCase spellings.
      if (/[A-Z]/.test(word.slice(1)) || /^[A-Z]{2,}/.test(word)) {
        return word;
      }

      const lower = word.toLowerCase();

      // `sih26168` -> `SIH 26168`, `ps162` -> `PS 162`
      const split = lower.match(/^([a-z]{2,})(\d{3,})$/);
      if (split) {
        return `${split[1].toUpperCase()} ${split[2]}`;
      }

      // `3d` -> `3D`, `2d` -> `2D`
      if (/^\d[a-z]$/.test(lower)) {
        return `${lower.slice(0, -1)}${lower.slice(-1).toUpperCase()}`;
      }

      if (ACRONYMS.has(lower)) return lower.toUpperCase();

      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

function normalizeHomepage(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(candidate);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

function safeImageUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function safeText(value: unknown, maxLength = 600): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.replace(/\s+/g, " ").trim();
  if (!trimmed) return null;
  return trimmed.length > maxLength ? `${trimmed.slice(0, maxLength - 1).trimEnd()}…` : trimmed;
}

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

/** Pulls the first useful paragraph out of a README. */
export function firstReadmeParagraph(markdown: string): string | null {
  let text = markdown.replace(/^\uFEFF/, "");

  // Frontmatter
  text = text.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, "");

  // Code fences, inline code, images, badges, HTML
  text = text.replace(/```[\s\S]*?```/g, "\n\n");
  text = text.replace(/~~~[\s\S]*?~~~/g, "\n\n");
  text = text.replace(/!\[[^\]]*\]\([^)]*\)/g, " ");
  text = text.replace(/\[!\[[^\]]*\]\([^)]*\)\]\([^)]*\)/g, " ");
  text = text.replace(/<a[^>]*>.*?<\/a>/gis, " ");
  text = text.replace(/<[^>]+>/g, " ");
  text = text.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");

  // Headings, rules, tables, badges
  text = text
    .split("\n")
    .filter((line) => {
      const trimmed = line.trim();
      if (!trimmed) return true;
      if (/^#{1,6}\s/.test(trimmed)) return false;
      if (/^[-=*_]{3,}$/.test(trimmed)) return false;
      if (trimmed.startsWith("|")) return false;
      if (/shields\.io|badgen\.net|badge/i.test(trimmed)) return false;
      if (/^<img/i.test(trimmed)) return false;
      return true;
    })
    .join("\n");

  const paragraphs = text
    .split(/\n\s*\n+/)
    .map((paragraph) =>
      decodeEntities(
        paragraph
          .replace(/^\s*[-*+>]\s+/gm, "")
          .replace(/[*_`~]/g, "")
          .replace(/\s+/g, " ")
          .trim(),
      ),
    )
    .filter((paragraph) => paragraph.length >= 40);

  const first = paragraphs.find(
    (paragraph) =>
      !/table of contents|installation|getting started|license|contributing/i.test(
        paragraph,
      ),
  );

  if (!first) return null;
  return first.length > 220 ? `${first.slice(0, 219).trimEnd()}…` : first;
}

function githubHeaders(token?: string): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": USER_AGENT,
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function fetchWithTimeout(
  fetchImpl: typeof fetch,
  input: string,
  init: RequestInit = {},
  timeoutMs = 12_000,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetchImpl(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

/** Fetches every public repository owned by the user, forks included. */
export async function fetchAllRepos(
  options: Pick<CollectOptions, "owner" | "token" | "fetchImpl">,
): Promise<GitHubRepo[]> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const repos: GitHubRepo[] = [];

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const url =
      `${GITHUB_API}/users/${encodeURIComponent(options.owner)}/repos` +
      `?per_page=100&page=${page}&sort=created&direction=desc&type=owner`;

    const response = await fetchWithTimeout(fetchImpl, url, {
      headers: githubHeaders(options.token),
    });

    if (!response.ok) {
      const reset = response.headers.get("x-ratelimit-reset");
      const remaining = response.headers.get("x-ratelimit-remaining");
      const resetIso = reset ? new Date(Number(reset) * 1000).toISOString() : null;
      throw new GitHubError(
        response.status === 403 || response.status === 429
          ? `GitHub API rate limit reached (remaining: ${remaining ?? "unknown"}). Add a GITHUB_TOKEN secret.`
          : `GitHub API request failed with ${response.status}.`,
        response.status,
        resetIso,
      );
    }

    const batch = (await response.json()) as GitHubRepo[];
    if (!Array.isArray(batch)) {
      throw new GitHubError("GitHub returned an unexpected repositories payload.");
    }

    repos.push(...batch);
    if (batch.length < 100) break;
    if (!response.headers.get("link")) break;
  }

  return repos;
}

export async function fetchPortfolioOverride(
  owner: string,
  repo: string,
  fetchImpl: typeof fetch = fetch,
): Promise<PortfolioOverride | null> {
  const url = `${RAW_GITHUB}/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/HEAD/portfolio.json`;
  try {
    const response = await fetchWithTimeout(fetchImpl, url, {
      headers: { "User-Agent": USER_AGENT },
    });
    if (!response.ok) return null;

    const text = await response.text();
    if (text.length > 32_768) return null;

    const parsed = JSON.parse(text) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;

    const input = parsed as Record<string, unknown>;
    const override: PortfolioOverride = {};

    const title = safeText(input.title, 120);
    const description = safeText(input.description, 600);
    const icon = safeImageUrl(input.icon);
    const cover = safeImageUrl(input.cover);
    const link = safeImageUrl(input.link);

    if (title) override.title = title;
    if (description) override.description = description;
    if (icon) override.icon = icon;
    if (cover) override.cover = cover;
    if (link) override.link = link;
    if (typeof input.featured === "boolean") override.featured = input.featured;
    if (input.section === "work" || input.section === "experiment") {
      override.section = input.section;
    }
    if (typeof input.order === "number" && Number.isFinite(input.order)) {
      override.order = input.order;
    }
    if (typeof input.hide === "boolean") override.hide = input.hide;

    return override;
  } catch {
    return null;
  }
}

export async function fetchReadmeDescription(
  owner: string,
  repo: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string | null> {
  for (const filename of ["README.md", "readme.md"]) {
    const url = `${RAW_GITHUB}/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/HEAD/${filename}`;
    try {
      const response = await fetchWithTimeout(fetchImpl, url, {
        headers: { "User-Agent": USER_AGENT },
      });
      if (!response.ok) continue;

      const text = await response.text();
      if (text.length > 400_000) continue;

      const paragraph = firstReadmeParagraph(text);
      if (paragraph) return paragraph;
    } catch {
      // Try the next conventional filename.
    }
  }
  return null;
}

export function buildProject(
  repo: GitHubRepo,
  override: PortfolioOverride | null,
  readmeDescription: string | null,
  options: Pick<CollectOptions, "owner">,
): PortfolioProject {
  const homepage = normalizeHomepage(repo.homepage);
  let iconHost: string | null = null;
  if (homepage) {
    try {
      iconHost = new URL(homepage).hostname;
    } catch {
      iconHost = null;
    }
  }

  const topics = Array.isArray(repo.topics) ? repo.topics.filter(Boolean) : [];
  const topicSet = new Set(topics.map((topic) => topic.toLowerCase()));

  const section: PortfolioSection =
    override?.section ?? (topicSet.has("experiment") ? "experiment" : "work");
  const description =
    override?.description ??
    safeText(repo.description, 600) ??
    readmeDescription ??
    `A public repository by @${options.owner}.`;

  const icon =
    override?.icon ??
    (iconHost
      ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(iconHost)}&sz=${FALLBACK_ICON_SIZE}`
      : null);

  return {
    id: repo.name,
    name: override?.title ?? prettifyRepoName(repo.name),
    description,
    url: override?.link ?? homepage ?? repo.html_url,
    repoUrl: repo.html_url,
    homepage,
    icon,
    iconFallback: iconHost
      ? `https://icons.duckduckgo.com/ip3/${encodeURIComponent(iconHost)}.ico`
      : null,
    cover: override?.cover ?? `https://opengraph.githubassets.com/1/${options.owner}/${repo.name}`,
    language: repo.language,
    topics,
    fork: repo.fork,
    archived: repo.archived,
    createdAt: repo.created_at,
    updatedAt: repo.updated_at,
    section,
    featured: override?.featured ?? topicSet.has("featured"),
    order: override?.order ?? 999,
    stars: repo.stargazers_count ?? 0,
  };
}

export function mapLimit<T, R>(
  items: T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  let active = 0;

  return new Promise((resolve, reject) => {
    const next = () => {
      if (cursor >= items.length && active === 0) {
        resolve(results);
        return;
      }
      while (active < limit && cursor < items.length) {
        const index = cursor;
        const item = items[index];
        cursor += 1;
        active += 1;
        mapper(item, index)
          .then((result) => {
            results[index] = result;
          })
          .catch(reject)
          .finally(() => {
            active -= 1;
            next();
          });
      }
    };
    next();
  });
}

/**
 * Turns raw repository responses into portfolio projects.
 * Only repositories that changed since the cached snapshot are re-enriched.
 */
export async function collectProjects(options: CollectOptions): Promise<PortfolioProject[]> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const maxReadmeFetches = options.maxReadmeFetches ?? 10;
  const owner = options.owner;
  const portfolioRepo = options.portfolioRepo.toLowerCase();
  const cached = options.cachedProjects ?? new Map();

  const repos = await fetchAllRepos(options);
  const candidates = repos.filter((repo) => {
    if (repo.private) return false;
    if (repo.name.toLowerCase() === portfolioRepo) return false;
    // The profile README repository is not a project.
    if (repo.name.toLowerCase() === owner.toLowerCase()) return false;
    if (repo.name.toLowerCase() === ".github") return false;
    const topics = (repo.topics ?? []).map((topic) => topic.toLowerCase());
    return !topics.includes("hide");
  });

  let readmeBudget = maxReadmeFetches;

  const projects = await mapLimit(candidates, 4, async (repo) => {
    const cacheKey = repo.name.toLowerCase();
    const cachedEntry = cached.get(cacheKey);
    if (cachedEntry && cachedEntry.updatedAt === repo.updated_at) {
      return cachedEntry.project;
    }

    const override = await fetchPortfolioOverride(owner, repo.name, fetchImpl);

    if (repo.topics?.some((topic) => topic.toLowerCase() === "hide")) {
      return null;
    }
    if (override?.hide) return null;

    let readmeDescription: string | null = null;
    if (!repo.description && !override?.description && readmeBudget > 0) {
      readmeBudget -= 1;
      readmeDescription = await fetchReadmeDescription(owner, repo.name, fetchImpl);
    }

    return buildProject(repo, override, readmeDescription, { owner });
  });

  return projects
    .filter((project): project is PortfolioProject => project !== null)
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      if (a.order !== b.order) return a.order - b.order;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}

export async function collectPayload(
  options: CollectOptions,
): Promise<ProjectsPayload> {
  const projects = await collectProjects(options);
  return {
    syncedAt: new Date().toISOString(),
    owner: options.owner,
    projects,
  };
}
