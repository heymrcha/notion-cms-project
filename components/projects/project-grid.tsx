import type { ProjectListItem } from "@/lib/notion/types"
import { cn } from "@/lib/utils"
import { ProjectCard } from "./project-card"

type ProjectGridProps = {
  projects: ProjectListItem[]
  className?: string
}

export function ProjectGrid({ projects, className }: ProjectGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
