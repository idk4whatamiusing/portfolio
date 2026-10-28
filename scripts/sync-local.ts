import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { collectPayload } from "../worker/lib/github";

async function main(): Promise<void> {
  const owner = process.env.GITHUB_OWNER?.trim();
  if (!owner) {
    throw new Error("GITHUB_OWNER is missing. Add it to .dev.vars or your environment.");
  }

  const portfolioRepo = process.env.PORTFOLIO_REPO?.trim() ?? "";
  const token = process.env.GITHUB_TOKEN?.trim() || undefined;

  console.log(`Syncing public repositories for @${owner}…`);
  const payload = await collectPayload({
    owner,
    portfolioRepo,
    token,
    onWarning: (message) => console.warn(`[warn] ${message}`),
  });

  const target = path.join(process.cwd(), "src", "data", "projects.generated.json");
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  const work = payload.projects.filter((project) => project.section === "work").length;
  const experiments = payload.projects.length - work;
  console.log(
    `Wrote ${payload.projects.length} projects (${work} work, ${experiments} experiments) to ${path.relative(process.cwd(), target)}.`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
