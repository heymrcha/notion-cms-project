import type { Metadata } from "next"

import { SITE_CONFIG } from "@/lib/site-config"

export const metadata: Metadata = {
  title: `소개 | ${SITE_CONFIG.name}`,
  description: "프로덕트 매니저 소개와 경력 요약",
}

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-16">
      <div className="mx-auto max-w-3xl space-y-8">
        <h1 className="text-4xl font-bold tracking-tight">소개</h1>
        {/* TODO: PM 소개·경력 요약 (PRD F9) */}
      </div>
    </div>
  )
}
