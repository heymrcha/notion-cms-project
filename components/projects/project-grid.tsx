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
      {/* 첫 카드는 모든 폭에서 첫 화면에 들어오므로 그 커버만 LCP 후보로 프리로드한다 */}
      {projects.map((project, index) => (
        <ProjectCard key={project.id} project={project} eager={index === 0} />
      ))}
    </div>
  )
}
