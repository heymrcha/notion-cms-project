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
  title: `문서 | ${SITE_CONFIG.name}`,
  description: "설치, 실행, 컴포넌트 추가, 테마 변경 방법을 안내합니다.",
}

const SCRIPTS = [
  { command: "npm run dev", description: "Turbopack 개발 서버 실행 (포트 3000)" },
  { command: "npm run build", description: "프로덕션 빌드 생성" },
  { command: "npm run start", description: "빌드 결과물로 프로덕션 서버 실행" },
  { command: "npm run lint", description: "ESLint 검사" },
]

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-border/40 bg-muted/50 px-4 py-3">
      <code className="font-mono text-sm">{children}</code>
    </pre>
  )
}

export default function DocsPage() {
  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-16">
      <div className="mx-auto max-w-3xl space-y-16">
        <section className="space-y-4">
          <Badge variant="secondary">문서</Badge>
          <h1 className="text-4xl font-bold tracking-tight">시작하기</h1>
          <p className="text-lg text-muted-foreground">
            프로젝트를 실행하고 확장하는 데 필요한 기본 내용을 정리했습니다.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">1. 설치와 실행</h2>
          <p className="text-muted-foreground">
            의존성을 설치한 뒤 개발 서버를 실행하고{" "}
            <code className="font-mono text-sm text-primary">
              http://localhost:3000
            </code>
            에 접속합니다.
          </p>
          <CodeBlock>{`npm install
npm run dev`}</CodeBlock>
          <p className="text-muted-foreground">
            환경변수가 필요하면{" "}
            <code className="font-mono text-sm text-primary">.env.example</code>
            을 복사해 사용합니다. 복사한 파일은 git에 올라가지 않습니다.
          </p>
          <CodeBlock>cp .env.example .env.local</CodeBlock>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">2. npm 스크립트</h2>
          <Card className="border-border/40">
            <CardContent className="divide-y divide-border/40 p-0">
              {SCRIPTS.map((script) => (
                <div
                  key={script.command}
                  className="flex flex-col gap-1 px-6 py-4 sm:flex-row sm:items-center sm:gap-4"
                >
                  <code className="shrink-0 font-mono text-sm text-primary sm:w-40">
                    {script.command}
                  </code>
                  <span className="text-sm text-muted-foreground">
                    {script.description}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">
            3. UI 컴포넌트 추가
          </h2>
          <p className="text-muted-foreground">
            shadcn/ui는 라이브러리를 설치하는 대신 컴포넌트 코드를{" "}
            <code className="font-mono text-sm text-primary">components/ui/</code>
            에 직접 복사합니다. 그래서 필요한 대로 자유롭게 고칠 수 있습니다.
          </p>
          <CodeBlock>npx shadcn@latest add dialog</CodeBlock>
          <p className="text-muted-foreground">
            현재 badge, button, card, dropdown-menu, input, label, navigation-menu가
            설치되어 있습니다.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">4. 테마 커스터마이징</h2>
          <p className="text-muted-foreground">
            색상은{" "}
            <code className="font-mono text-sm text-primary">app/globals.css</code>
            의 CSS 변수로 정의되어 있습니다.{" "}
            <code className="font-mono text-sm text-primary">:root</code>가 라이트,{" "}
            <code className="font-mono text-sm text-primary">.dark</code>가 다크
            모드이며, 두 곳을 함께 수정해야 양쪽 테마가 일관됩니다.
          </p>
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="text-base">테마 전환 동작 방식</CardTitle>
              <CardDescription>
                next-themes가 html 요소에 dark 클래스를 붙였다 떼는 방식으로
                동작합니다. 사용자가 고른 테마는 브라우저에 저장되어 다음 방문에도
                유지되고, 시스템 설정을 따르는 선택지도 제공합니다.
              </CardDescription>
            </CardHeader>
          </Card>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">5. 페이지 추가</h2>
          <p className="text-muted-foreground">
            App Router는 폴더 구조가 곧 URL입니다. 아래처럼 파일을 만들면{" "}
            <code className="font-mono text-sm text-primary">/pricing</code>{" "}
            경로가 생깁니다. 헤더 메뉴에 노출하려면{" "}
            <code className="font-mono text-sm text-primary">
              lib/site-config.ts
            </code>
            의 navLinks에 항목을 추가하면 됩니다.
          </p>
          <CodeBlock>{`app/
└── pricing/
    └── page.tsx`}</CodeBlock>
        </section>
      </div>
    </div>
  )
}
