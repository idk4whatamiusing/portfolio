import type { PortfolioProject, ProjectsPayload } from "../../src/lib/types";
import type { Env, SyncStatus } from "../env";
import { collectPayload, mapLimit } from "./github";

export const LATEST_KEY = "projects:latest";
export const CACHE_KEY = "sync:cache:v2";
export const STATUS_KEY = "sync:status";
const CACHE_VERSION = 2;
const MAX_ICON_BYTES = 1_500_000;
const MIRROR_CONCURRENCY = 4;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/x-icon",
  "image/vnd.microsoft.icon",
]);

type CacheEntry = {
  updatedAt: string;
  project: PortfolioProject;
};

type CacheFile = {
  v: number;
  entries: Record<string, CacheEntry>;
};

function logWarning(message: string): void {
  console.warn(`[portfolio-sync] ${message}`);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "repo";
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function readCache(kv: KVNamespace | undefined): Promise<Map<string, CacheEntry>> {
  const entries = new Map<string, CacheEntry>();
  if (!kv) return entries;

  try {
    const raw = await kv.get(CACHE_KEY, "text");
    if (!raw) return entries;
    const parsed = JSON.parse(raw) as CacheFile;
    if (!parsed || parsed.v !== CACHE_VERSION || !parsed.entries) return entries;

    for (const [key, entry] of Object.entries(parsed.entries)) {
      if (entry?.updatedAt && entry.project?.id) {
        entries.set(key, entry);
      }
    }
  } catch (error) {
    logWarning(`Could not read sync cache: ${String(error)}`);
  }

  return entries;
}

async function writeCache(
  kv: KVNamespace,
  projects: PortfolioProject[],
  repos: Map<string, string>,
): Promise<void> {
  const entries: Record<string, CacheEntry> = {};
  for (const project of projects) {
    const key = project.id.toLowerCase();
    const updatedAt = repos.get(key);
    if (updatedAt) entries[key] = { updatedAt, project };
  }
  await kv.put(CACHE_KEY, JSON.stringify({ v: CACHE_VERSION, entries }));
}

/**
 * Copies a remote favicon into R2 so the site never depends on a third-party
 * image host at runtime. Returns the original URL when R2 is not configured or
 * the image cannot be mirrored safely.
 */
async function mirrorIcon(env: Env, project: PortfolioProject): Promise<string | null> {
  const bucket = env.MEDIA_BUCKET;
  const source = project.icon;
  if (!bucket || !source || !source.startsWith("https://")) return source;

  const hash = (await sha256(source)).slice(0, 16);
  const prefix = `projects/${slugify(project.id)}/`;
  const key = `${prefix}icon-${hash}`;

  try {
    const existing = await bucket.head(key);
    if (existing) return `/media/${key}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);
    let response: Response;
    try {
      response = await fetch(source, {
        signal: controller.signal,
        headers: {
          Accept: "image/avif,image/webp,image/png,image/*;q=0.8",
          "User-Agent": "Mozilla/5.0 (compatible; debopam-portfolio/1.0)",
        },
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) return source;
    const contentType = (response.headers.get("content-type") ?? "")
      .split(";")[0]
      .trim()
      .toLowerCase();
    if (!ALLOWED_IMAGE_TYPES.has(contentType)) return source;

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength === 0 || buffer.byteLength > MAX_ICON_BYTES) return source;

    await bucket.put(key, buffer, {
      httpMetadata: {
        contentType,
        cacheControl: "public, max-age=31536000, immutable",
      },
    });

    // Content-hashed keys mean an icon change leaves the old object behind.
    // Prune only when we actually upload, so steady-state syncs stay cheap.
    try {
      const listed = await bucket.list({ prefix, limit: 20 });
      for (const object of listed.objects) {
        if (object.key !== key) await bucket.delete(object.key);
      }
    } catch (error) {
      logWarning(`Could not prune old media for ${project.id}: ${String(error)}`);
    }

    return `/media/${key}`;
  } catch (error) {
    logWarning(`Could not mirror icon for ${project.id}: ${String(error)}`);
    return source;
  }
}

export async function syncProjects(
  env: Env,
  options: { force?: boolean } = {},
): Promise<ProjectsPayload> {
  const startedAt = new Date().toISOString();
  const started = Date.now();

  if (!env.GITHUB_OWNER) {
    throw new Error("GITHUB_OWNER is not configured.");
  }

  const cache = options.force ? new Map<string, CacheEntry>() : await readCache(env.PROJECTS_KV);

  const payload = await collectPayload({
    owner: env.GITHUB_OWNER,
    portfolioRepo: env.PORTFOLIO_REPO ?? "",
    token: env.GITHUB_TOKEN,
    cachedProjects: cache,
    onWarning: logWarning,
  });

  const mirrored = await mapLimit(payload.projects, MIRROR_CONCURRENCY, async (project) => {
    const icon = await mirrorIcon(env, project);
    return icon === project.icon ? project : { ...project, icon };
  });

  const finalPayload: ProjectsPayload = { ...payload, projects: mirrored };

  if (env.PROJECTS_KV) {
    await env.PROJECTS_KV.put(LATEST_KEY, JSON.stringify(finalPayload));
    await writeCache(
      env.PROJECTS_KV,
      finalPayload.projects,
      // Reconstruct updatedAt from the GitHub payload embedded in each project.
      new Map(finalPayload.projects.map((project) => [project.id.toLowerCase(), project.updatedAt])),
    );
  }

  const status: SyncStatus = {
    ok: true,
    startedAt,
    finishedAt: new Date().toISOString(),
    durationMs: Date.now() - started,
    projectCount: finalPayload.projects.length,
    lastSuccessAt: new Date().toISOString(),
  };
  await writeStatus(env, status);

  return finalPayload;
}

export async function recordSyncError(env: Env, error: unknown): Promise<void> {
  const message = error instanceof Error ? error.message : String(error);
  const now = new Date().toISOString();
  const status: SyncStatus = {
    ok: false,
    startedAt: now,
    finishedAt: now,
    durationMs: 0,
    projectCount: 0,
    error: message.slice(0, 500),
  };
  await writeStatus(env, status);
}

async function writeStatus(env: Env, status: SyncStatus): Promise<void> {
  if (!env.PROJECTS_KV) return;
  try {
    await env.PROJECTS_KV.put(STATUS_KEY, JSON.stringify(status));
  } catch (error) {
    logWarning(`Could not write sync status: ${String(error)}`);
  }
}

export async function getStatus(env: Env): Promise<SyncStatus | null> {
  if (!env.PROJECTS_KV) return null;
  try {
    const raw = await env.PROJECTS_KV.get(STATUS_KEY, "text");
    return raw ? (JSON.parse(raw) as SyncStatus) : null;
  } catch {
    return null;
  }
}

export async function getLatestPayload(
  env: Env,
  fallback: ProjectsPayload,
): Promise<{ payload: ProjectsPayload; source: "kv" | "snapshot" }> {
  if (!env.PROJECTS_KV) return { payload: fallback, source: "snapshot" };

  try {
    const raw = await env.PROJECTS_KV.get(LATEST_KEY, "text");
    if (!raw) return { payload: fallback, source: "snapshot" };

    const parsed = JSON.parse(raw) as ProjectsPayload;
    if (!parsed || !Array.isArray(parsed.projects)) {
      return { payload: fallback, source: "snapshot" };
    }
    return { payload: parsed, source: "kv" };
  } catch (error) {
    logWarning(`Could not read latest payload: ${String(error)}`);
    return { payload: fallback, source: "snapshot" };
  }
}
