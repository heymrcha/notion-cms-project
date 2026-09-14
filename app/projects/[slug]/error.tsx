"use client" // Next.js 규약상 에러 바운더리는 클라이언트 컴포넌트여야 한다

import { Button } from "@/components/ui/button"

// TODO: 안내 문구 다듬기 (PRD §11, Task 005)
export default function ProjectDetailError({
  retry,
}: {
  error: Error & { digest?: string }
  // Next.js 16 은 reset 대신 retry 를 권장한다 (세그먼트를 다시 페치·렌더)
  retry: () => void
}) {
  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-16">
      <div className="mx-auto max-w-3xl space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">
          프로젝트를 불러오지 못했습니다
        </h1>
        <Button onClick={() => retry()}>다시 시도</Button>
      </div>
    </div>
  )
}
