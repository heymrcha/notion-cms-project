import Link from "next/link"

// TODO: 문구·복귀 링크 다듬기 (PRD F2, Task 005)
export default function ProjectNotFound() {
  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-16">
      <div className="mx-auto max-w-3xl space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">
          프로젝트를 찾을 수 없습니다
        </h1>
        <Link href="/projects" className="text-muted-foreground underline">
          프로젝트 목록으로 돌아가기
        </Link>
      </div>
    </div>
  )
}
