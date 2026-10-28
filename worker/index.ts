import type { ProjectsPayload } from "../src/lib/types";
import snapshot from "../src/data/projects.generated.json";
import type { Env } from "./env";
import {
  getLatestPayload,
  getStatus,
  recordSyncError,
  syncProjects,
} from "./lib/sync";

const fallback = snapshot as unknown as ProjectsPayload;

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "x-content-type-options": "nosniff",
};

function json(data: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { ...JSON_HEADERS, ...(init.headers ?? {}) },
  });
}

async function hash(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 20);
}

async function isAuthorized(request: Request, env: Env): Promise<boolean> {
  const secret = env.SYNC_SECRET;
  if (!secret) return false;

  const header = request.headers.get("authorization") ?? "";
  if (!header.startsWith("Bearer ")) return false;
  const provided = header.slice("Bearer ".length).trim();
  if (!provided) return false;

  // Compare digests so the comparison does not leak the secret length.
  const [expected, actual] = await Promise.all([hash(secret), hash(provided)]);
  return expected === actual;
}

async function handleProjects(request: Request, env: Env): Promise<Response> {
  const { payload, source } = await getLatestPayload(env, fallback);
  const body = JSON.stringify(payload);
  const etag = `W/"${await hash(body)}"`;

  const headers = new Headers({
    "content-type": "application/json; charset=utf-8",
    "cache-control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
    etag,
    "x-data-source": source,
    "x-content-type-options": "nosniff",
  });

  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304, headers });
  }

  return new Response(request.method === "HEAD" ? null : body, { headers });
}

async function handleStatus(env: Env): Promise<Response> {
  const status = await getStatus(env);
  return json(
    status ?? { ok: null, message: "No sync has run yet." },
    { headers: { "cache-control": "public, max-age=30, s-maxage=60" } },
  );
}

async function handleSync(request: Request, env: Env): Promise<Response> {
  if (!(await isAuthorized(request, env))) {
    return json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const started = Date.now();
  try {
    const payload = await syncProjects(env, { force: true });
    return json({
      ok: true,
      owner: payload.owner,
      projectCount: payload.projects.length,
      syncedAt: payload.syncedAt,
      durationMs: Date.now() - started,
    });
  } catch (error) {
    await recordSyncError(env, error);
    const message = error instanceof Error ? error.message : "Sync failed.";
    return json({ ok: false, error: message }, { status: 502 });
  }
}

async function handleMedia(request: Request, env: Env): Promise<Response> {
  if (!env.MEDIA_BUCKET) {
    return new Response("Media storage is not configured.", { status: 404 });
  }

  const url = new URL(request.url);
  let key: string;
  try {
    key = decodeURIComponent(url.pathname.replace(/^\/media\//, ""));
  } catch {
    return new Response("Bad request.", { status: 400 });
  }

  if (!key || key.includes("..") || !/^(projects|site)\//.test(key)) {
    return new Response("Not found.", { status: 404 });
  }

  const object = await env.MEDIA_BUCKET.get(key);
  if (!object) return new Response("Not found.", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  headers.set("x-content-type-options", "nosniff");
  headers.set("content-security-policy", "default-src 'none'; sandbox");

  if (request.headers.get("if-none-match") === object.httpEtag) {
    return new Response(null, { status: 304, headers });
  }

  return new Response(request.method === "HEAD" ? null : object.body, { headers });
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/projects") {
      if (request.method !== "GET" && request.method !== "HEAD") {
        return json({ ok: false, error: "Method not allowed." }, { status: 405 });
      }
      return handleProjects(request, env);
    }

    if (url.pathname === "/api/status") {
      if (request.method !== "GET" && request.method !== "HEAD") {
        return json({ ok: false, error: "Method not allowed." }, { status: 405 });
      }
      return handleStatus(env);
    }

    if (url.pathname === "/api/sync") {
      if (request.method !== "POST") {
        return json({ ok: false, error: "Method not allowed." }, { status: 405 });
      }
      return handleSync(request, env);
    }

    if (url.pathname.startsWith("/api/")) {
      return json({ ok: false, error: "Not found." }, { status: 404 });
    }

    if (url.pathname.startsWith("/media/")) {
      if (request.method !== "GET" && request.method !== "HEAD") {
        return new Response("Method not allowed.", { status: 405 });
      }
      return handleMedia(request, env);
    }

    return env.ASSETS.fetch(request);
  },

  async scheduled(
    _controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    ctx.waitUntil(
      syncProjects(env).catch(async (error) => {
        console.error("[portfolio-sync] Cron sync failed", error);
        await recordSyncError(env, error);
      }),
    );
  },
};

export default worker;
