import { timingSafeEqual } from "node:crypto"

import { revalidatePath } from "next/cache"

// 무효화 대상. 세 페이지 모두 Notion 데이터를 읽고, sitemap 은 revalidate 가 3600 이라
// 함께 무효화하지 않으면 새 slug 가 최대 1시간 동안 사이트맵에 빠진다.
// Route Handler 의 revalidatePath 는 "다음 방문 때" 재생성을 예약할 뿐이라(revalidatePath.md)
// 전체 경로를 무효화해도 Notion 호출이 즉시 몰리지 않는다
const REVALIDATE_TARGETS: ReadonlyArray<{ path: string; type?: "page" | "layout" }> = [
  { path: "/" },
  // layout 타입은 그 아래 페이지와 라우트 핸들러(상세의 opengraph-image 포함)까지 한 번에 무효화한다.
  // "/projects/[slug]" 를 page 로 무효화하면 OG 카드 엔트리는 남아 옛 제목이 계속 나간다 (Task 017 실측)
  { path: "/projects", type: "layout" },
  { path: "/sitemap.xml" },
]

function readBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization")
  if (!header) return null
  const [scheme, token] = header.split(" ")
  return scheme === "Bearer" && token ? token : null
}

// 문자열 === 비교는 첫 불일치 위치에서 끝나 응답 시간으로 시크릿을 한 글자씩 추측할 수 있다.
// timingSafeEqual 은 길이가 같아야 하므로, 길이가 다르면 비교 없이 false 를 돌려준다
function isSecretMatch(candidate: string, expected: string): boolean {
  const a = Buffer.from(candidate)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

// Notion 자동화(웹훅)가 호출한다. 시크릿은 Authorization: Bearer 헤더로만 받는다 —
// 쿼리 파라미터는 접근 로그와 브라우저 기록에 남기 때문이다. GET 을 두지 않아 주소창·크롤러로는 발동하지 않는다.
// Notion 은 실패 시 재시도할 수 있으므로 여러 번 불려도 결과가 같다(멱등)
export async function POST(request: Request) {
  const secret = process.env.NOTION_REVALIDATE_SECRET
  if (!secret) {
    // 시크릿이 없으면 열어 두지 않고 닫는다. 401 과 구분해 설정 누락임을 로그로 알린다
    console.error("[revalidate] NOTION_REVALIDATE_SECRET 이 설정되지 않아 요청을 거부합니다")
    return Response.json({ revalidated: false, message: "재검증이 설정되지 않았습니다" }, { status: 503 })
  }

  const token = readBearerToken(request)
  if (!token || !isSecretMatch(token, secret)) {
    return Response.json({ revalidated: false, message: "인증에 실패했습니다" }, { status: 401 })
  }

  for (const target of REVALIDATE_TARGETS) {
    if (target.type) revalidatePath(target.path, target.type)
    else revalidatePath(target.path)
  }

  return Response.json({
    revalidated: true,
    paths: REVALIDATE_TARGETS.map((target) => target.path),
    now: Date.now(),
  })
}
