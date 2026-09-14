import type { Metadata } from "next"

import { SITE_CONFIG } from "@/lib/site-config"

export const metadata: Metadata = {
  title: `프로젝트 | ${SITE_CONFIG.name}`,
  description: "프로덕트 매니저가 참여한 프로젝트 목록",
}

export default function ProjectsPage() {
  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-16">
      <div className="space-y-8">
        <h1 className="text-4xl font-bold tracking-tight">프로젝트</h1>
        <p className="text-muted-foreground">
          프로젝트 목록을 준비하고 있습니다.
        </p>
        {/* TODO: 카드 그리드 (PRD F1, Task 004) */}
      </div>
    </div>
  )
}
