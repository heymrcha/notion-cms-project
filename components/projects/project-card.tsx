import type { ProjectListItem } from "@/lib/notion/types"

type ProjectCardProps = {
  project: ProjectListItem
}

// TODO: shadcn card + badge 로 제목 링크·Outcome·기간·Tags 렌더 (PRD F1, Task 004)
export function ProjectCard({ project }: ProjectCardProps) {
  return <article>{project.title}</article>
}
