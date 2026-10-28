export interface Env {
  ASSETS: Fetcher;
  PROJECTS_KV?: KVNamespace;
  MEDIA_BUCKET?: R2Bucket;
  GITHUB_OWNER: string;
  PORTFOLIO_REPO?: string;
  GITHUB_TOKEN?: string;
  SYNC_SECRET?: string;
}

export type SyncStatus = {
  ok: boolean;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  projectCount: number;
  error?: string;
  lastSuccessAt?: string;
};
