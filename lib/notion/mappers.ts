import {
  isFullBlock,
  isFullPage,
  type BlockObjectResponse,
  type PageObjectResponse,
  type RichTextItemResponse,
} from "@notionhq/client"

import type { NotionBlock, Project, RichText } from "./types"

type PageProperty = PageObjectResponse["properties"][string]

// 속성 값 읽기 — 이름·타입이 모두 맞을 때만 값을 돌려주고, 아니면 null 로 통일해 호출부가 필수 여부만 판단하게 한다.
function readText(properties: PageObjectResponse["properties"], name: string): string | null {
  const prop: PageProperty | undefined = properties[name]
  if (!prop) return null
  if (prop.type === "title") return joinPlainText(prop.title)
  if (prop.type === "rich_text") return joinPlainText(prop.rich_text)
  return null
}

function readCheckbox(properties: PageObjectResponse["properties"], name: string): boolean | null {
  const prop = properties[name]
  return prop?.type === "checkbox" ? prop.checkbox : null
}

function readDate(properties: PageObjectResponse["properties"], name: string): string | null {
  const prop = properties[name]
  return prop?.type === "date" ? (prop.date?.start ?? null) : null
}

function readMultiSelect(properties: PageObjectResponse["properties"], name: string): string[] {
  const prop = properties[name]
  return prop?.type === "multi_select" ? prop.multi_select.map((option) => option.name) : []
}

function readUrl(properties: PageObjectResponse["properties"], name: string): string | null {
  const prop = properties[name]
  return prop?.type === "url" ? prop.url : null
}

function readNumber(properties: PageObjectResponse["properties"], name: string): number | null {
  const prop = properties[name]
  return prop?.type === "number" ? prop.number : null
}

function readFirstFileUrl(properties: PageObjectResponse["properties"], name: string): string | null {
  const prop = properties[name]
  if (prop?.type !== "files") return null
  const first = prop.files[0]
  if (!first) return null
  return first.type === "file" ? first.file.url : first.external.url
}

function joinPlainText(richText: RichTextItemResponse[]): string {
  return richText.map((item) => item.plain_text).join("")
}

function warnSkip(pageId: string, reason: string) {
  console.warn(`[notion] 페이지 ${pageId} 제외 — ${reason}`)
}

// 필수 속성이 하나라도 비면 그 프로젝트만 제외하고 나머지는 정상 렌더한다 (PRD F3·§11)
export function mapPageToProject(page: unknown): Project | null {
  if (!isPageObject(page)) return null
  const { id, properties } = page

  const title = readText(properties, "Title")
  const slug = readText(properties, "Slug")
  const summary = readText(properties, "Summary")
  const outcome = readText(properties, "Outcome")
  const role = readText(properties, "Role")
  const periodStart = readDate(properties, "Period Start")

  const required: Array<[string, string | null]> = [
    ["Title", title],
    ["Slug", slug],
    ["Summary", summary],
    ["Outcome", outcome],
    ["Role", role],
    ["Period Start", periodStart],
  ]
  const missing = required.filter(([, value]) => !value).map(([name]) => name)
  if (missing.length > 0 || !title || !slug || !summary || !outcome || !role || !periodStart) {
    warnSkip(id, `필수 속성 누락 또는 타입 불일치: ${missing.join(", ")}`)
    return null
  }
  if (readCheckbox(properties, "Published") === null) {
    warnSkip(id, "Published 속성이 checkbox 가 아닙니다")
    return null
  }

  return {
    id,
    slug,
    title,
    summary,
    outcome,
    role,
    periodStart,
    periodEnd: readDate(properties, "Period End"),
    tags: readMultiSelect(properties, "Tags"),
    coverUrl: readFirstFileUrl(properties, "Cover"),
    externalUrl: readUrl(properties, "External URL"),
    order: readNumber(properties, "Order") ?? 0,
  }
}

function isPageObject(value: unknown): value is PageObjectResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "object" in value &&
    value.object === "page" &&
    isFullPage(value as PageObjectResponse)
  )
}

function isBlockObject(value: unknown): value is BlockObjectResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "object" in value &&
    value.object === "block" &&
    isFullBlock(value as BlockObjectResponse)
  )
}

function toRichText(items: RichTextItemResponse[]): RichText[] {
  return items.map((item) => ({
    text: item.plain_text,
    bold: item.annotations.bold,
    italic: item.annotations.italic,
    code: item.annotations.code,
    href: item.href,
  }))
}

// §6.3 7종만 변환하고 그 밖의 블록은 null 로 조용히 건너뛴다 (PRD N5). 중첩 자식은 한 단계만 — 자식 블록은 읽지 않는다.
export function mapBlock(block: unknown): NotionBlock | null {
  if (!isBlockObject(block)) return null
  const { id } = block

  switch (block.type) {
    case "paragraph":
      return { id, type: "paragraph", richText: toRichText(block.paragraph.rich_text) }
    case "heading_1":
      return { id, type: "heading_1", richText: toRichText(block.heading_1.rich_text) }
    case "heading_2":
      return { id, type: "heading_2", richText: toRichText(block.heading_2.rich_text) }
    case "heading_3":
      return { id, type: "heading_3", richText: toRichText(block.heading_3.rich_text) }
    case "bulleted_list_item":
      return {
        id,
        type: "bulleted_list_item",
        richText: toRichText(block.bulleted_list_item.rich_text),
      }
    case "numbered_list_item":
      return {
        id,
        type: "numbered_list_item",
        richText: toRichText(block.numbered_list_item.rich_text),
      }
    case "quote":
      return { id, type: "quote", richText: toRichText(block.quote.rich_text) }
    case "code":
      return {
        id,
        type: "code",
        code: joinPlainText(block.code.rich_text),
        language: block.code.language,
      }
    case "image": {
      const image = block.image
      const url = image.type === "file" ? image.file.url : image.external.url
      return { id, type: "image", url, alt: joinPlainText(image.caption) }
    }
    case "divider":
      return { id, type: "divider" }
    default:
      return null
  }
}
