# Development Guidelines

> AI 에이전트 전용 운영 규칙. 사람용 설명은 `README.md`, 요구사항은 `docs/PRD.md`, 순서는 `ROADMAP.md`를 본다. 이 문서는 **어떤 파일을 어떻게 고치는가**만 다룬다.

## 1. 프로젝트 개요

- 목적: Notion Database 1개를 CMS로 쓰는 읽기 전용 PM 포트폴리오 사이트
- 스택: Next.js 16.3.4 App Router · React 19.2 · TypeScript strict · TailwindCSS v4(설정 파일 없음, `app/globals.css`) · shadcn/ui(new-york) · next-themes · `@notionhq/client`(**아직 미설치**, Task 008에서 설치)
- 현재 상태: 정적 페이지 `/`·`/about`만 존재. `lib/notion/`·`app/projects/` 없음. ROADMAP Task 001이 `우선순위`, 완료(✅) Task 없음
- 검증 수단은 `npx tsc --noEmit` + `npm run lint` + Playwright MCP뿐. **테스트 러너 없음, 도입 금지**

## 2. 디렉터리 역할

| 경로 | 역할 | 규칙 |
|---|---|---|
| `app/**/page.tsx` | 라우트 | 서버 컴포넌트. `export const metadata: Metadata` 필수(`/`는 루트 상속 예외) |
| `app/layout.tsx` | 셸 | `suppressHydrationWarning` 제거 금지. 세미콜론이 있는 유일한 파일 — 건드릴 때 스타일 맞추려 고치지 말 것 |
| `app/globals.css` | 테마·토큰 | 색 추가 시 `@theme inline` + `:root` + `.dark` **세 곳 동시 수정** |
| `components/ui/*` | shadcn 생성물 | 직접 편집 금지. `npx shadcn@latest add <name>`으로만 추가 |
| `components/layout/*` | Navbar·Footer·ThemeToggle | `SITE_CONFIG` 밖 하드코딩 콘텐츠 넣지 말 것 |
| `components/projects/*` | (신규) 프로젝트 UI | 전부 서버 컴포넌트. `"use client"` 금지 |
| `lib/site-config.ts` | 사이트 이름·설명·메뉴 단일 출처 | 페이지 추가 시 `navLinks` 갱신 |
| `lib/notion/*` | (신규) 페치·매핑 계층 | 아래 §5 |
| `docs/PRD.md` | 요구사항 | 기능 ID(F1~F13)·섹션(§)을 주석·Task 파일에서 인용 |
| `ROADMAP.md` | 작업 순서·상태 | Task 완료 시 ✅ 표기 |
| `tasks/XXX-*.md` | 작업 파일 | `tasks/000-sample.md` 구조 복제 |
| `.claude/agents/dev/*` | 보조 에이전트 | `development-planner`(로드맵), `starter-cleaner`(템플릿 정리) |
| `shrimp_data/` | shrimp-task-manager 작업 데이터(gitignore) | 수동 편집·커밋 금지. shrimp 도구로만 갱신 |

## 3. 코드 스타일 (관찰된 실제 관례)

- 2칸 들여쓰기, **세미콜론 없음**, 큰따옴표, 파일명 kebab-case
- 컴포넌트는 `export function Name()` named export. default export는 Next 라우트 파일(`page/layout/loading/error/not-found`)에만
- import 순서: 프레임워크·서드파티 → 빈 줄 → `@/…` → 상대 경로. 별칭은 `@/*` 하나뿐(`@/ui/button` 같은 `components.json` 별칭은 코드에서 해석 안 됨)
- 상수는 모듈 스코프 `UPPER_SNAKE_CASE` + `as const`, 렌더는 `.map()`
- `any` 금지. 외부 데이터는 `unknown` + 타입 가드
- 주석은 한국어, "왜"만. TODO는 `// TODO: … (PRD §5, F5)` 형식으로 근거 ID 기재
- 식별자·`data-*` 값 영어, 그 외(UI 문자열·주석·문서·커밋) 한국어

**해야 함**
```tsx
export const metadata: Metadata = { title: `프로젝트 | ${SITE_CONFIG.name}` }
const STACK = [{ name: "Next.js" }] as const
<div className={cn("container mx-auto max-w-screen-2xl px-4", className)}>
<p className="text-muted-foreground">
```
**하지 말 것**
```tsx
export default function ProjectCard() {}     // 라우트 파일 아님 → named export
<p className="text-gray-500">                // 토큰 색만
<p style={{ color: "#666" }}>
import { Button } from "@/ui/button"         // 해석 안 됨
const data: any = await res.json()
```

## 4. Next.js 16 규칙

- **코드 작성 전 `node_modules/next/dist/docs/01-app/` 해당 문서를 먼저 읽는다.** 학습 데이터와 다르다. 특히:
  - 동적 라우트 `params`·`searchParams`는 Promise → `03-api-reference/03-file-conventions/page.md`
  - ISR → `02-guides/incremental-static-regeneration.md`, `01-getting-started/09-revalidating.md`
  - 에러·404 → `01-getting-started/10-error-handling.md`, `file-conventions/error.md`·`not-found.md`
  - 이미지 → `01-getting-started/12-images.md`, `05-config`의 `images.remotePatterns`
  - 메타데이터 → `01-getting-started/14-metadata-and-og-images.md`
- `"use client"` 허용 파일: 기존 5개(`theme-provider`, `navbar`, `theme-toggle`, `ui/dropdown-menu`, `ui/label`) + `app/projects/[slug]/error.tsx`(Next 규약상 필수). 그 외 신규 클라이언트 경계 금지
- 라우트 세그먼트 캐싱은 `export const revalidate = 60`. `force-dynamic`·`revalidate = 0` 금지
- `alert`/`confirm`/`prompt` 금지(Playwright 세션이 멈춤)

## 5. Notion 페치 계층 규칙 (`lib/notion/`)

| 파일 | 내용 | 금지 |
|---|---|---|
| `client.ts` | `import "server-only"` + `Client` 단일 인스턴스. env 누락 시 명확한 한국어 에러 | 클라이언트 컴포넌트에서 import |
| `types.ts` | `Project`(PRD §7.1 필드 그대로), `ProjectListItem`, `NotionBlock` 유니온(§6.3 7종), `RichText` | Notion SDK 응답 타입을 UI까지 전달 |
| `queries.ts` | `notion.dataSources.query({ data_source_id, filter, sorts })`, `has_more`/`next_cursor` 전량 페치, `blocks.children.list` | **`notion.databases.query` 사용 금지**(구버전) |
| `mappers.ts` | `mapPageToProject(page: unknown): Project \| null`, `mapBlock(block: unknown): NotionBlock \| null` | throw. 실패 행은 `null` + `console.warn(pageId, 누락 속성명)` |
| `retry.ts` | 429/529 → `Retry-After` 초 대기, 없으면 지수 백오프, 최대 3회 | 소진 시 throw(빌드 실패 방지 → 빈 배열/`null` 반환) |

- 필터: 목록·상세 **둘 다** `Published = true`. 상세는 `Slug equals` AND `Published`
- 정렬: `Order` desc → `Period Start` desc. `Order` 비면 0
- `Slug` 중복: 정렬상 첫 행 채택 + `console.warn`
- 지원 블록 7종 외는 `null`로 조용히 스킵. 중첩은 1단계만
- 환경 변수 이름은 `NOTION_API_KEY`, `NOTION_PROJECTS_DATA_SOURCE_ID` **고정**. `NEXT_PUBLIC_` 접두사 금지. `DATABASE_ID`라는 이름 금지
- 설치 시 `@notionhq/client`의 설치된 버전 `.d.ts`에서 `dataSources.query` 존재를 먼저 확인(R1)

## 6. 페이지별 동작 규칙

| 상황 | 동작 |
|---|---|
| `/projects` 페치 실패(`null`) | `components/projects/error-state.tsx` 렌더. 404·throw 아님 |
| `/projects` 0건 | `empty-state.tsx` 렌더. 404 아님 |
| `/projects/[slug]` 없는 slug·미발행 slug | `notFound()` |
| `/projects/[slug]` 페치 예외 | `error.tsx`(클라이언트) + `reset` 버튼 |
| `/` 최근 3건 페치 실패·0건 | 섹션 자체 숨김. 빈 상태 문구 금지 |
| `External URL` 있을 때 | `target="_blank" rel="noreferrer"` 버튼. 없으면 렌더 안 함 |
| `Period End` null | "진행 중" 표기(`lib/format-period.ts`) |
| 카드 링크 | 제목 `<Link>`에만. 카드 전체 링크 금지(접근성) |

## 7. 파일 연동 규칙 (하나를 고치면 같이 고칠 것)

| 변경 | 동시 수정 |
|---|---|
| 페이지 라우트 추가 | `lib/site-config.ts` `navLinks` |
| 사이트 이름·설명 변경 | `lib/site-config.ts`만. `layout.tsx`·Navbar·Footer는 손대지 않음 |
| 색 토큰 추가 | `app/globals.css`의 `@theme inline` + `:root` + `.dark` |
| 환경 변수 추가 | `.env.example`(한국어 주석, 값 비움) + `README.md` 환경 변수 표 + `lib/notion/client.ts` 누락 검사 |
| `Project` 타입 필드 변경 | `lib/notion/types.ts` → `mappers.ts` → `mock-data.ts`(존재 시) → 사용하는 `components/projects/*` |
| Task 완료 | `tasks/XXX-*.md` 체크박스·"변경 사항 요약" 추가 + `ROADMAP.md` 해당 Task `✅` + `See: /tasks/XXX-….md` |
| `next.config.ts` `images.remotePatterns` 추가 | 실제 Notion 응답 URL 호스트를 먼저 채취해 근거로 남김(R2) |
| `lib/notion/mock-data.ts` 삭제(Task 010) | `app/page.tsx`, `app/projects/**`, 컴포넌트의 import 전부 제거 |

## 8. 작업 흐름 규칙

1. Task 착수 전 `ROADMAP.md`에서 다음 미완료 Task 확인 → `tasks/000-sample.md` 구조로 `tasks/XXX-description.md` 생성(빈 체크박스, 변경 요약 없음)
2. Next.js 관련 코드면 §4 문서 먼저 읽기. Notion SDK면 Context7로 `@notionhq/client` 문서 조회
3. 구현 → 단계마다 Task 파일 체크박스 갱신
4. `npx tsc --noEmit` 0 → `npm run lint` 0 → Playwright MCP로 Task 파일 "테스트 체크리스트" 수행(375/768/1280, 다크 모드)
5. Task 파일 끝에 "변경 사항 요약" 추가, `ROADMAP.md` ✅
6. **각 Task 완료 후 중단하고 지시 대기.** 커밋은 요청받았을 때만, 메시지는 한국어
7. `js`/`tsx` 수정 후 브라우저 확인 시 하드 리로드

병렬 가능: Task 004~007 ∥ Task 008~009. Task 010은 둘 다 끝나야 착수. Task 016은 발행 20건 도달 전 착수 금지.

## 9. 의사결정 기준

| 애매한 상황 | 선택 |
|---|---|
| 클라이언트 훅이 필요해 보인다 | 서버 컴포넌트로 재설계. URL 검색 파라미터·서버 조건부 렌더로 해결. 정말 필요하면 사용자에게 확인 |
| PRD와 ROADMAP이 충돌 | PRD 우선, ROADMAP 수정 제안 |
| 웹 예제와 설치된 SDK 타입이 다름 | 설치된 `.d.ts` 우선 |
| CLAUDE.md와 학습 데이터가 다름 | CLAUDE.md·로컬 `node_modules/next/dist/docs` 우선 |
| 필드가 PRD §6.1 스키마에 없음 | 추가하지 않음. 비목표(§2) 확인 후 사용자에게 보고 |
| 검색·필터·페이지네이션·인증·블로그 요청 | PRD 비목표. 구현하지 않고 P2/범위 밖임을 알림 |
| 스타일 값이 토큰에 없음 | `globals.css` 세 곳에 토큰 추가. 인라인 hex 금지 |
| 테스트 요청 | 러너 도입 논의부터. 임의 설치 금지 |
| 오류 시 throw vs 빈 값 | 페치 계층은 항상 빈 값(`[]`/`null`). 빌드를 실패시키지 않음 |

## 10. 금지 사항

- `any`, `// @ts-ignore`, `as unknown as X` 우회
- `notion.databases.query`, `NOTION_DATABASE_ID`
- `NEXT_PUBLIC_NOTION_*`
- `components/ui/*` 수동 편집, `tailwind.config.*` 생성
- `text-gray-*`·hex·`style` 색 지정
- `layout.tsx`의 `suppressHydrationWarning` 제거
- 카드 전체 `<Link>`, `<h1>` 이외에서 heading 레벨 건너뛰기
- `alert`/`confirm`/`prompt`
- `import`/`export` 없는 스크립트 태그 로드(워크스페이스 다른 프로젝트 관례를 이 프로젝트에 적용하지 말 것)
- 테스트 러너·상태 관리 라이브러리·CSS-in-JS 설치
- 요청 없는 커밋·푸시, `.env.local` 커밋
- 영어 UI 문자열·영어 주석·영어 커밋 메시지, 한국어 식별자
