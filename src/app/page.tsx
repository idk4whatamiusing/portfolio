import Contact from "@/components/Contact";
import Experiments from "@/components/Experiments";
import Hero from "@/components/Hero";
import Info from "@/components/Info";
import Marquee from "@/components/Marquee";
import Prologue from "@/components/Prologue";
import { ProjectsProvider } from "@/components/ProjectsProvider";
import Work from "@/components/Work";
import { projectsSnapshot } from "@/data/projects";
import { countLanguages } from "@/lib/format";

export default function Home() {
  const projectCount = projectsSnapshot.projects.length;
  const languageCount = countLanguages(projectsSnapshot.projects);

  return (
    <>
      <Hero projectCount={projectCount} languageCount={languageCount} />
      <Marquee />
      <Prologue
        projectCount={projectCount}
        languageCount={languageCount}
        syncedAt={projectsSnapshot.syncedAt}
      />

      <ProjectsProvider initial={projectsSnapshot}>
        <Work />
        <Experiments />
      </ProjectsProvider>

      <Info
        projectCount={projectCount}
        languageCount={languageCount}
        syncedAt={projectsSnapshot.syncedAt}
      />
      <Contact />
    </>
  );
}
