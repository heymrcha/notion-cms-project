import type { Project } from "./types"

type Sortable = Pick<Project, "order" | "periodStart">

// PRD §6.1 정렬 규칙: Order 내림차순 → Period Start 내림차순.
// ISO 날짜 문자열은 사전순이 곧 시간순이므로 Date 변환 없이 비교한다.
export function sortProjects<T extends Sortable>(projects: T[]): T[] {
  return [...projects].sort((a, b) => {
    if (a.order !== b.order) return b.order - a.order
    if (a.periodStart === b.periodStart) return 0
    return a.periodStart < b.periodStart ? 1 : -1
  })
}
