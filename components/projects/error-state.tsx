import { cn } from "@/lib/utils"

type ErrorStateProps = {
  className?: string
}

export function ErrorState({ className }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-xl border border-dashed px-6 py-16 text-center text-muted-foreground",
        className
      )}
    >
      프로젝트를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
    </div>
  )
}
