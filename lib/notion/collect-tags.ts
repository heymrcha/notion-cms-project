import type { Project } from "./types"

// 칩 순서가 매 재검증마다 흔들리지 않도록 정렬 규칙과 무관하게 가나다·알파벳순으로 고정한다
export function collectTags(projects: readonly Project[]): string[] {
  const tags = new Set<string>()
  for (const project of projects) {
    for (const tag of project.tags) tags.add(tag)
  }
  return [...tags].sort((a, b) => a.localeCompare(b, "ko"))
}
