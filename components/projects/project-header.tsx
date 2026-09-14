import type { Project } from "@/lib/notion/types"

type ProjectHeaderProps = {
  project: Project
}

// TODO: h1·Outcome·Role·기간·Tags, External URL 버튼, Cover 자리 (PRD F2, Task 005)
export function ProjectHeader({ project }: ProjectHeaderProps) {
  return (
    <header>
      <h1 className="text-4xl font-bold tracking-tight">{project.title}</h1>
    </header>
  )
}
