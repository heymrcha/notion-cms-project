import type { Metadata } from "next"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SITE_CONFIG } from "@/lib/site-config"

export const metadata: Metadata = {
  title: `소개 | ${SITE_CONFIG.name}`,
  description: "이 스타터 킷의 기술 스택과 프로젝트 구조를 소개합니다.",
}

const TECH_STACK = [
  {
    name: "Next.js 16",
    description: "App Router와 Turbopack 기반의 React 풀스택 프레임워크",
  },
  {
    name: "TypeScript",
    description: "컴파일 시점에 오류를 잡아내는 정적 타입 시스템",
  },
  {
    name: "TailwindCSS v4",
    description: "설정 파일 없이 CSS에서 바로 테마를 정의하는 유틸리티 CSS",
  },
  {
    name: "shadcn/ui",
    description: "코드를 직접 복사해 자유롭게 수정하는 Radix 기반 컴포넌트",
  },
  {
    name: "next-themes",
    description: "깜빡임 없는 라이트·다크·시스템 테마 전환",
  },
  {
    name: "Lucide React",
    description: "1000개 이상의 트리 셰이킹 가능한 SVG 아이콘",
  },
]

const PROJECT_STRUCTURE = [
  { path: "app/", description: "App Router 라우트, 레이아웃, 전역 스타일" },
  { path: "components/ui/", description: "shadcn/ui 컴포넌트 (직접 수정 가능)" },
  { path: "components/layout/", description: "헤더·푸터 등 공통 레이아웃" },
  { path: "components/providers/", description: "테마 등 전역 Context 프로바이더" },
  { path: "lib/", description: "사이트 설정과 유틸리티 함수" },
  { path: "public/", description: "이미지 등 정적 파일" },
]

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-16">
      <div className="mx-auto max-w-3xl space-y-16">
        <section className="space-y-4">
          <Badge variant="secondary">소개</Badge>
          <h1 className="text-4xl font-bold tracking-tight">
            이 스타터 킷에 대하여
          </h1>
          <p className="text-lg text-muted-foreground">
            설정에 시간을 쓰지 않고 바로 기능 개발을 시작할 수 있도록, 최신 웹
            개발에 필요한 도구를 미리 조합해 둔 프로젝트 베이스입니다. 다크모드,
            공통 레이아웃, UI 컴포넌트가 이미 연결되어 있습니다.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">기술 스택</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {TECH_STACK.map((tech) => (
              <Card key={tech.name} className="border-border/40">
                <CardHeader>
                  <CardTitle className="text-base">{tech.name}</CardTitle>
                  <CardDescription>{tech.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">프로젝트 구조</h2>
          <Card className="border-border/40">
            <CardContent className="divide-y divide-border/40 p-0">
              {PROJECT_STRUCTURE.map((item) => (
                <div
                  key={item.path}
                  className="flex flex-col gap-1 px-6 py-4 sm:flex-row sm:items-center sm:gap-4"
                >
                  <code className="shrink-0 font-mono text-sm text-primary sm:w-52">
                    {item.path}
                  </code>
                  <span className="text-sm text-muted-foreground">
                    {item.description}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">출처</h2>
          <p className="text-muted-foreground">
            이 프로젝트는{" "}
            <a
              href="https://github.com/gymcoding/claude-nextjs-starterkit"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              gymcoding/claude-nextjs-starterkit
            </a>
            을 기반으로 시작했습니다. 이후 변경사항은 원본과 동기화되지 않습니다.
          </p>
        </section>
      </div>
    </div>
  )
}
