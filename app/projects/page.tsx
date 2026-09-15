import type { Metadata } from "next"

import { EmptyState } from "@/components/projects/empty-state"
import { ErrorState } from "@/components/projects/error-state"
import { ProjectGrid } from "@/components/projects/project-grid"
import { MOCK_PROJECTS } from "@/lib/notion/mock-data"
import { sortProjects } from "@/lib/notion/sort-projects"
import type { Project } from "@/lib/notion/types"
import { SITE_CONFIG } from "@/lib/site-config"

export const metadata: Metadata = {
  title: `프로젝트 | ${SITE_CONFIG.name}`,
  description: "프로덕트 매니저가 참여한 프로젝트 목록",
}

export default function ProjectsPage() {
  // TODO: Task 010 에서 getPublishedProjects() 로 교체. 페치 계층은 실패 시 null 을 돌려주므로 타입을 미리 맞춰 둔다
  const projects: Project[] | null = MOCK_PROJECTS

  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-16">
      <div className="space-y-8">
        <h1 className="text-4xl font-bold tracking-tight">프로젝트</h1>
        {projects === null ? (
          <ErrorState />
        ) : projects.length === 0 ? (
          <EmptyState />
        ) : (
          <ProjectGrid projects={sortProjects(projects)} />
        )}
      </div>
    </div>
  )
}
