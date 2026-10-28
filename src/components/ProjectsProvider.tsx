"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ProjectsPayload } from "@/lib/types";

type ProjectsState = {
  payload: ProjectsPayload;
  live: boolean;
  error: boolean;
};

const ProjectsContext = createContext<ProjectsState | null>(null);

export function ProjectsProvider({
  initial,
  children,
}: {
  initial: ProjectsPayload;
  children: ReactNode;
}) {
  const [payload, setPayload] = useState(initial);
  const [live, setLive] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch("/api/projects", {
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error(`Request failed: ${response.status}`);

        const data = (await response.json()) as ProjectsPayload;
        if (!Array.isArray(data?.projects) || typeof data.syncedAt !== "string") {
          throw new Error("Unexpected projects payload");
        }
        if (cancelled) return;

        setPayload(data);
        setLive(response.headers.get("x-data-source") === "kv");
        setError(false);
      } catch {
        if (!cancelled) setError(true);
      }
    };

    // Let the hero finish before spending a request on the live index.
    const initialTimer = window.setTimeout(load, 900);
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, 5 * 60 * 1000);

    return () => {
      cancelled = true;
      window.clearTimeout(initialTimer);
      window.clearInterval(interval);
    };
  }, []);

  const value = useMemo(() => ({ payload, live, error }), [payload, live, error]);

  return (
    <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>
  );
}

export function useProjects(): ProjectsState {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error("useProjects must be used inside ProjectsProvider");
  }
  return context;
}
