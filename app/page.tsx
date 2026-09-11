import Link from "next/link"

import { Button } from "@/components/ui/button"
import { SITE_CONFIG } from "@/lib/site-config"

export default function Home() {
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
      {/* TODO: 최근 프로젝트 3건 카드 (PRD §5, F5) */}
    </div>
  )
}
