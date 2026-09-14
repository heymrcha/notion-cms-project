import type { ProjectListItem } from "@/lib/notion/types"
import { cn } from "@/lib/utils"
import { ProjectCard } from "./project-card"

type ProjectGridProps = {
  projects: ProjectListItem[]
  className?: string
}

// TODO: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 (PRD F1, Task 004)
export function ProjectGrid({ projects, className }: ProjectGridProps) {
  return (
    <div className={cn("grid gap-6", className)}>
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
