import type { Metadata } from "next"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SITE_CONFIG } from "@/lib/site-config"

export const metadata: Metadata = {
  title: `소개 | ${SITE_CONFIG.name}`,
  description: "프로덕트 매니저 소개와 경력 요약",
}

// ── 아래 상수만 고치면 페이지 내용이 바뀐다 (PRD U1: /about 은 하드코딩) ──
// TODO(사용자 확인): 자리 표본이다. 실제 소개·경력·역량으로 교체할 것

const INTRO_PARAGRAPHS = [
  "문제를 숫자로 정의하고, 가장 작은 실험으로 답을 찾는 프로덕트 매니저입니다.",
  "B2C 결제·온보딩부터 B2B 운영 도구까지, 지표 설계와 실행을 함께 맡아 왔습니다. 잘 만든 화면보다 잘 고른 문제가 성과를 만든다고 믿습니다.",
] as const

const CAREER = [
  {
    company: "예시 스타트업",
    role: "Product Manager",
    period: "2024 – 현재",
    highlights: [
      "구독 결제 퍼널 재설계로 결제 완료율 42% → 61%",
      "온보딩 3단계 축소로 D7 리텐션 18% → 27%",
    ],
  },
  {
    company: "예시 플랫폼사",
    role: "Associate PM",
    period: "2022 – 2024",
    highlights: [
      "CS 운영 어드민 구축으로 건당 처리 시간 12분 → 3분",
      "지표 대시보드 도입으로 주간 리포트 자동화",
    ],
  },
] as const

const SKILLS = [
  "지표 설계",
  "A/B 테스트",
  "사용자 인터뷰",
  "PRD 작성",
  "백로그 관리",
  "SQL",
  "Figma",
] as const

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-16">
      <div className="mx-auto max-w-3xl space-y-12">
        <header className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">소개</h1>
          {INTRO_PARAGRAPHS.map((paragraph) => (
            <p key={paragraph} className="text-lg leading-8 text-muted-foreground">
              {paragraph}
            </p>
          ))}
        </header>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">경력</h2>
          <ol className="space-y-8">
            {CAREER.map((job) => (
              <li key={`${job.company}-${job.period}`} className="space-y-2">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <h3 className="text-lg font-semibold">
                    {job.company}
                    <span className="font-normal text-muted-foreground"> · {job.role}</span>
                  </h3>
                  <p className="text-sm text-muted-foreground">{job.period}</p>
                </div>
                <ul className="list-disc space-y-1 pl-6 text-foreground">
                  {job.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">역량</h2>
          <ul className="flex flex-wrap gap-2">
            {SKILLS.map((skill) => (
              <li key={skill}>
                <Badge variant="secondary">{skill}</Badge>
              </li>
            ))}
          </ul>
        </section>

        <Button asChild variant="outline">
          <Link href="/projects">프로젝트 보러 가기</Link>
        </Button>
      </div>
    </div>
  )
}
