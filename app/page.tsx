import Link from "next/link"

import { ProjectGrid } from "@/components/projects/project-grid"
import { Button } from "@/components/ui/button"
import { MOCK_PROJECTS } from "@/lib/notion/mock-data"
import { sortProjects } from "@/lib/notion/sort-projects"
import { SITE_CONFIG } from "@/lib/site-config"

export default function Home() {
  // TODO: Task 010 에서 getPublishedProjects() 로 교체 (실패·0건이면 섹션 숨김)
  const recentProjects = sortProjects(MOCK_PROJECTS).slice(0, 3)

  return (
    <div className="flex flex-col">
      <section className="container mx-auto max-w-screen-2xl px-4 py-24">
        <div className="flex flex-col items-center space-y-8 text-center">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              {SITE_CONFIG.name}
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              {SITE_CONFIG.description}
            </p>
          </div>
          <Button size="lg" className="px-8 text-lg" asChild>
            <Link href="/projects">프로젝트 보기</Link>
          </Button>
        </div>
      </section>
      {/* 홈은 빈 상태 문구를 띄우지 않고 섹션 자체를 숨긴다 (ROADMAP Task 007) */}
      {recentProjects.length > 0 && (
        <section className="container mx-auto max-w-screen-2xl px-4 pb-24">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="text-2xl font-bold tracking-tight">최근 프로젝트</h2>
            <Link
              href="/projects"
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              전체 보기
            </Link>
          </div>
          <ProjectGrid projects={recentProjects} />
        </section>
      )}
    </div>
  )
}
