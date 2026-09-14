import { cn } from "@/lib/utils"

type ErrorStateProps = {
  className?: string
}

// TODO: 문구·여백 다듬기 (PRD F6·§11, Task 004)
export function ErrorState({ className }: ErrorStateProps) {
  return (
    <p className={cn("text-muted-foreground", className)}>
      프로젝트를 불러오지 못했습니다.
    </p>
  )
}
