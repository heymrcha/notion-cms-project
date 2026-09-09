import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, Shield, Palette, Code, Rocket, Users } from "lucide-react"
import { SITE_CONFIG } from "@/lib/site-config"

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="container max-w-screen-2xl px-4 py-24 mx-auto">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="space-y-4">
            <Badge variant="secondary" className="text-sm">
              ⚡ Next.js v16 + TailwindCSS v4
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              빠른 웹 개발을 위한
              <br />
              <span className="text-primary">최신 스타터 킷</span>
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Next.js v16, TypeScript, TailwindCSS v4, shadcn/ui로 구성된 
              현대적인 웹 개발 스타터 킷입니다. 
              몇 분 만에 프로젝트를 시작하세요.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link href="/docs">
                <Rocket className="mr-2 h-5 w-5" />
                시작하기
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8" asChild>
              <a href={SITE_CONFIG.githubUrl} target="_blank" rel="noreferrer">
                <Code className="mr-2 h-5 w-5" />
                GitHub 보기
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container max-w-screen-2xl px-4 py-24 mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            모든 것이 준비되어 있습니다
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            최신 기술 스택으로 구성된 완전한 개발 환경을 제공합니다.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-border/40 hover:border-border transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>최고 성능</CardTitle>
              <CardDescription>
                Next.js v16의 App Router와 Turbopack으로 최적화된 개발 환경
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border/40 hover:border-border transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Palette className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>모던 디자인</CardTitle>
              <CardDescription>
                TailwindCSS v4와 shadcn/ui로 구성된 아름다운 UI 컴포넌트
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border/40 hover:border-border transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>타입 안전성</CardTitle>
              <CardDescription>
                TypeScript로 구성된 안전하고 확장 가능한 코드베이스
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border/40 hover:border-border transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Code className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>개발자 경험</CardTitle>
              <CardDescription>
                ESLint, Prettier, 다크모드 등 최적화된 개발 환경
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border/40 hover:border-border transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Rocket className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>빠른 시작</CardTitle>
              <CardDescription>
                바로 사용 가능한 컴포넌트와 레이아웃으로 즉시 개발 시작
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border/40 hover:border-border transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>커뮤니티</CardTitle>
              <CardDescription>
                활발한 커뮤니티와 지속적인 업데이트 지원
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted/30 py-24">
        <div className="container max-w-screen-2xl px-4 mx-auto text-center space-y-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            지금 바로 시작해보세요
          </h2>
          <p className="max-w-xl mx-auto text-lg text-muted-foreground">
            몇 분 만에 현대적인 웹 애플리케이션 개발을 시작할 수 있습니다.
          </p>
          <Button size="lg" className="text-lg px-8" asChild>
            <Link href="/docs">
              <Rocket className="mr-2 h-5 w-5" />
              시작하기
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
