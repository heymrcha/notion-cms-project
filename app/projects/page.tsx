import type { Metadata } from "next"

import { EmptyState } from "@/components/projects/empty-state"
import { ErrorState } from "@/components/projects/error-state"
import { ProjectGrid } from "@/components/projects/project-grid"
import { getPublishedProjects } from "@/lib/notion/queries"
import { SITE_CONFIG } from "@/lib/site-config"

export const metadata: Metadata = {
  title: `프로젝트 | ${SITE_CONFIG.name}`,
  description: "프로덕트 매니저가 참여한 프로젝트 목록",
}

export default async function ProjectsPage() {
  // 정렬은 Notion 쿼리(Order desc → Period Start desc)가 이미 끝냈다
  const projects = await getPublishedProjects()

  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-16">
      <div className="space-y-8">
        <h1 className="text-4xl font-bold tracking-tight">프로젝트</h1>
        {projects === null ? (
          <ErrorState />
        ) : projects.length === 0 ? (
          <EmptyState />
        ) : (
          <ProjectGrid projects={projects} />
        )}
      </div>
    </div>
  )
}
