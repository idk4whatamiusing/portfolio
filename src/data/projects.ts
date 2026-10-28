import snapshot from "./projects.generated.json";
import type { ProjectsPayload } from "@/lib/types";

export const projectsSnapshot = snapshot as unknown as ProjectsPayload;
