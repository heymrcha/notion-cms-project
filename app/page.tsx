import Link from "next/link"

import { ProjectGrid } from "@/components/projects/project-grid"
import { Button } from "@/components/ui/button"
import { getPublishedProjects } from "@/lib/notion/queries"
import { SITE_CONFIG } from "@/lib/site-config"

export default async function Home() {
  // 페치 실패(null)와 0건([]) 모두 섹션을 숨긴다 — 홈은 오류·빈 상태 문구를 띄우지 않는다
  const recentProjects = (await getPublishedProjects())?.slice(0, 3) ?? []

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
