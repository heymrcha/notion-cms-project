// 본문 컨테이너(space-y-4, leading-7)와 같은 간격·줄 높이로 문단 세 덩어리를 흉내 낸다
const LINE_WIDTHS = ["w-full", "w-11/12", "w-4/5", "w-full", "w-2/3"] as const

export function NotionBlocksSkeleton() {
  return (
    <div
      role="status"
      aria-label="본문을 불러오는 중"
      className="animate-pulse space-y-4"
    >
      <div className="h-7 w-1/3 rounded bg-muted" />
      {LINE_WIDTHS.map((width, index) => (
        <div key={index} className={`h-5 rounded bg-muted ${width}`} />
      ))}
    </div>
  )
}
