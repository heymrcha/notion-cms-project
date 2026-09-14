import type { Metadata } from "next"

import { SITE_CONFIG } from "@/lib/site-config"

// TODO: generateMetadata 로 Title·Summary 반영 (PRD §10 SEO, Task 010)
export const metadata: Metadata = {
  title: `프로젝트 상세 | ${SITE_CONFIG.name}`,
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  // Next.js 16 에서 params 는 Promise 이므로 await 가 필요하다
  const { slug } = await params

  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-16">
      <div className="mx-auto max-w-3xl space-y-8">
        <h1 className="text-4xl font-bold tracking-tight">프로젝트 상세</h1>
        <p className="text-muted-foreground">
          <code>{slug}</code> 프로젝트의 상세 내용을 준비하고 있습니다.
        </p>
        {/* TODO: 상세 메타·본문 렌더 (PRD F2, Task 005·006) */}
      </div>
    </div>
  )
}
