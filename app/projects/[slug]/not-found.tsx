import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function ProjectNotFound() {
  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-16">
      <div className="mx-auto max-w-3xl space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">
          프로젝트를 찾을 수 없습니다
        </h1>
        <p className="text-muted-foreground">
          주소가 잘못됐거나 아직 발행되지 않은 프로젝트입니다.
        </p>
        <Button asChild variant="outline">
          <Link href="/projects">프로젝트 목록으로 돌아가기</Link>
        </Button>
      </div>
    </div>
  )
}
