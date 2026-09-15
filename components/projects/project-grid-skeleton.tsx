import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

const SKELETON_KEYS = ["a", "b", "c"] as const

// 실제 카드(제목 1줄·요약 2줄·성과·기간·배지)와 같은 세로 리듬을 맞춰 교체 시 레이아웃이 튀지 않게 한다
function ProjectCardSkeleton() {
  return (
    <Card className="h-full animate-pulse" aria-hidden>
      <CardHeader className="gap-3">
        <div className="h-6 w-3/4 rounded bg-muted" />
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-5/6 rounded bg-muted" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2">
        <div className="h-5 w-1/2 rounded bg-muted" />
        <div className="h-4 w-1/3 rounded bg-muted" />
      </CardContent>
      <CardFooter className="flex-wrap gap-2">
        <div className="h-5 w-12 rounded-md bg-muted" />
        <div className="h-5 w-16 rounded-md bg-muted" />
      </CardFooter>
    </Card>
  )
}

export function ProjectGridSkeleton() {
  return (
    <div
      role="status"
      aria-label="프로젝트를 불러오는 중"
      className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
    >
      {SKELETON_KEYS.map((key) => (
        <ProjectCardSkeleton key={key} />
      ))}
    </div>
  )
}
