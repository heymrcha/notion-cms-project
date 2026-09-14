// Phase 2 UI 작업 전용 더미 데이터. Task 010 에서 실제 Notion 데이터로 교체하며 이 파일은 삭제한다.
import type { NotionBlock, Project, RichText } from "./types"

function plain(text: string): RichText {
  return { text, bold: false, italic: false, code: false, href: null }
}

// order 10 인 1건이 최신이 아니어도 맨 위로 와야 정렬 규칙(Order desc → Period Start desc)이 검증된다
export const MOCK_PROJECTS: Project[] = [
  {
    id: "mock-1",
    slug: "subscription-checkout",
    title: "구독 결제 전환율 개선",
    summary: "이탈 지점을 재설계해 결제 완료율을 개선한 프로젝트",
    outcome: "결제 완료율 42% → 61%",
    role: "PM (기획·지표 설계·QA)",
    periodStart: "2025-03-01",
    periodEnd: "2025-08-31",
    tags: ["B2C", "결제", "그로스"],
    coverUrl: null,
    externalUrl: "https://example.com/subscription",
    order: 10,
  },
  {
    id: "mock-2",
    slug: "onboarding-redesign",
    title: "온보딩 플로우 재설계",
    summary: "가입 직후 7일 리텐션을 높이기 위해 온보딩 단계를 3단계로 줄인 프로젝트",
    outcome: "D7 리텐션 18% → 27%",
    role: "PM (사용자 리서치·프로토타입·A/B 테스트)",
    periodStart: "2025-09-01",
    periodEnd: null,
    tags: ["B2C", "온보딩"],
    coverUrl: null,
    externalUrl: null,
    order: 0,
  },
  {
    id: "mock-3",
    slug: "admin-dashboard",
    title: "운영 어드민 대시보드 구축",
    summary: "CS 팀이 엑셀로 처리하던 환불·정산 업무를 어드민 화면으로 옮긴 프로젝트",
    outcome: "건당 처리 시간 12분 → 3분",
    role: "PM (요구사항 정의·백로그 관리)",
    periodStart: "2024-06-01",
    periodEnd: "2024-12-31",
    tags: ["B2B", "어드민", "운영"],
    coverUrl: null,
    externalUrl: null,
    order: 0,
  },
]

// §6.3 7종 전부 + 인라인 서식 4종 + 연속 리스트(그룹핑 검증용)
export const MOCK_BLOCKS: NotionBlock[] = [
  { id: "b-1", type: "heading_1", richText: [plain("배경")] },
  {
    id: "b-2",
    type: "paragraph",
    richText: [
      plain("결제 단계에서 "),
      { text: "58%", bold: true, italic: false, code: false, href: null },
      plain("가 이탈했다. 원인은 "),
      { text: "주소 입력", bold: false, italic: true, code: false, href: null },
      plain(" 폼과 "),
      { text: "checkout_v1", bold: false, italic: false, code: true, href: null },
      plain(" API 지연이었다. "),
      {
        text: "분석 노트",
        bold: false,
        italic: false,
        code: false,
        href: "https://example.com/analysis",
      },
      plain(" 참고."),
    ],
  },
  { id: "b-3", type: "heading_2", richText: [plain("역할")] },
  { id: "b-4", type: "bulleted_list_item", richText: [plain("이탈 퍼널 지표 설계")] },
  { id: "b-5", type: "bulleted_list_item", richText: [plain("주소 자동완성 도입 기획")] },
  { id: "b-6", type: "bulleted_list_item", richText: [plain("QA 시나리오 작성")] },
  { id: "b-7", type: "heading_3", richText: [plain("진행 순서")] },
  { id: "b-8", type: "numbered_list_item", richText: [plain("퍼널 로그 수집")] },
  { id: "b-9", type: "numbered_list_item", richText: [plain("A/B 테스트 2주")] },
  {
    id: "b-10",
    type: "quote",
    richText: [plain("결제는 신뢰의 문제다. 입력을 줄이는 것이 곧 신뢰다.")],
  },
  { id: "b-11", type: "divider" },
  {
    id: "b-12",
    type: "code",
    code: 'const rate = completed / started\nconsole.log(`전환율 ${rate * 100}%`)',
    language: "typescript",
  },
  {
    id: "b-13",
    type: "image",
    url: "https://placehold.co/1200x675",
    alt: "결제 퍼널 개선 전후 비교",
  },
  { id: "b-14", type: "paragraph", richText: [plain("결과적으로 결제 완료율이 19%p 올랐다.")] },
]

// Notion API 원형 모양의 미지원 블록(toggle). NotionBlock 유니온에 넣을 수 없으므로
// Task 009 에서 mapBlock 이 null 을 돌려 스킵하는지 검증하는 용도로만 쓴다.
export const MOCK_RAW_UNSUPPORTED_BLOCK: unknown = {
  object: "block",
  id: "b-raw-toggle",
  type: "toggle",
  toggle: { rich_text: [{ plain_text: "접힌 내용" }] },
}
