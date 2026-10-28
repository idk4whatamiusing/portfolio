export function formatSyncTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "recently";

  const datePart = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
    .format(date)
    .toUpperCase();

  const timePart = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(date);

  return `${datePart} · ${timePart} UTC`;
}

export function isNewProject(createdAt: string, syncedAt: string): boolean {
  const created = new Date(createdAt).getTime();
  const synced = new Date(syncedAt).getTime();
  if (Number.isNaN(created) || Number.isNaN(synced)) return false;
  return synced - created < 1000 * 60 * 60 * 24 * 30;
}

export function yearOf(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : String(date.getUTCFullYear());
}

export function initialsOf(name: string): string {
  const words = name
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return "DD";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

const TONES = ["#b7a181", "#9c8462", "#7f8874", "#8c7266", "#a0957e", "#6f7f78"];

export function toneFor(seed: string): string {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return TONES[hash % TONES.length];
}

export function countLanguages(
  projects: { language: string | null }[],
): number {
  return new Set(
    projects.map((project) => project.language).filter((language): language is string => Boolean(language)),
  ).size;
}
