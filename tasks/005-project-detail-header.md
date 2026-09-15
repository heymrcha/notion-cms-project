# Task 005: 프로젝트 상세 상단 메타 UI 구현

## 고수준 명세

- **목적**: `/projects/[slug]`가 자리 문구 대신 프로젝트 메타(제목·Outcome·Role·기간·Tags·외부 링크)를 렌더하고, 없는 slug는 404를 돌려주게 한다. 목록(Task 004) → 상세 흐름이 처음으로 이어진다.
- **범위**: `ProjectHeader` 완성, 상세 페이지 더미 연결 + `notFound()`, `not-found.tsx`·`error.tsx` 문구 정리. Notion 본문 블록(Task 006)·`generateMetadata`(Task 010)·Cover 이미지(Task 012)는 다루지 않는다 — Cover는 `aspect-video` 자리만 확보한다.
- **PRD 참조**: F2(상세), §10 접근성·SEO(제목 `<h1>` 하나), §11 존재하지 않는 slug → 404
- **리스크·미결**: `error.tsx`의 prop 이름은 Next 16 로컬 문서 기준 `retry`(Task 001에서 확정, ROADMAP 문구도 정정됨). **R5(신규)**: `app/projects/loading.tsx`가 있으면 응답이 스트리밍되어 `notFound()`가 HTTP 상태를 404로 바꾸지 못하고 200 + `<meta name="robots" content="noindex">`로 내려간다(Next 문서 `loading.md` §Status Codes). **결정(B)**: 두 `loading.tsx`를 삭제해 진짜 404를 낸다. 개발·프로덕션(동적/ISR) 모두 404 확인. Task 012 스켈레톤은 `loading.tsx` 대신 페이지 내부 `<Suspense>`로 본문만 처리한다.
- **전제 조건**: Task 004 완료(`formatPeriod`, 카드 톤). shadcn `button`·`badge` 설치됨.

## 관련 파일

| 파일 | 변경 종류 | 설명 |
|---|---|---|
| `components/projects/project-header.tsx` | 수정 | `<header>`: Cover 자리(`aspect-video`), `<h1>`, Outcome 강조, `<dl>` Role·기간, `Badge` Tags, `externalUrl` 있을 때만 `Button asChild` + `<a target="_blank" rel="noreferrer">` |
| `app/projects/[slug]/page.tsx` | 수정 | `MOCK_PROJECTS.find(slug)` → 없으면 `notFound()`, 있으면 `<ProjectHeader>` |
| `app/projects/[slug]/not-found.tsx` | 수정 | 문구·복귀 링크 다듬기 |
| `app/projects/[slug]/error.tsx` | 수정 | 안내 문구 다듬기(`retry` 시그니처 유지) |
| `lib/format-period.ts` | 참조 | 기간 표기 재사용 (변경 없음) |
| `lib/notion/mock-data.ts` | 참조 | `MOCK_PROJECTS` (변경 없음) |
| `app/projects/loading.tsx`, `app/projects/[slug]/loading.tsx` | 삭제 | R5: 스트리밍 경계를 없애 `notFound()`가 HTTP 404를 낼 수 있게 함 |

## 수락 기준

- [x] `/projects/subscription-checkout`에 `<h1>` 제목, Outcome, Role, 기간 `2025.03 – 2025.08`, Tags 배지 3개, 외부 링크 버튼(`target="_blank" rel="noreferrer"`, href `https://example.com/subscription`)이 보인다
- [x] `/projects/onboarding-redesign`은 기간 `2025.09 – 진행 중`이고 외부 링크 버튼이 없다
- [x] `/projects/no-such-slug` → HTTP 404 + `not-found.tsx` 렌더("프로젝트를 찾을 수 없습니다" + `/projects` 링크)
- [x] 페이지에 `<h1>`이 하나뿐이고 heading 레벨을 건너뛰지 않는다
- [x] 375px / 1280px에서 가로 스크롤이 없다
- [x] `npx tsc --noEmit` 오류 0
- [x] `npm run lint` 오류 0
- [x] 코드 관례 준수: `any` 없음, 신규 코드는 서버 컴포넌트(`error.tsx` 예외), 색은 토큰만, 컨테이너 `container mx-auto max-w-screen-2xl px-4`, 클래스 조합 `cn()`

## 구현 단계

- [x] 1. `not-found.md` 로컬 문서와 shadcn `button`의 `asChild`를 확인한다.
- [x] 2. `project-header.tsx`, `not-found.tsx`, `error.tsx` 마크업을 작성한다(ui-markup-specialist 위임).
- [x] 3. `app/projects/[slug]/page.tsx`에 더미를 연결하고 `notFound()` 분기를 둔다.
- [x] 4. `npx tsc --noEmit` + `npm run lint` 오류 0 확인.
- [x] 5. 아래 테스트 체크리스트를 Playwright MCP로 수행한다.
- [x] 6. 체크박스를 갱신하고 `ROADMAP.md`의 Task 005를 ✅로 표시한다. 완료 후 중단하고 다음 지시를 기다린다.

## 테스트 체크리스트

> 개발 서버(`npm run dev`, 포트 3000)를 먼저 띄운다.

### 정상 흐름

- [x] `/projects` 첫 카드 제목 클릭 → `/projects/subscription-checkout`, `<h1>`이 카드 제목과 일치
- [x] 상세 하단 외부 링크가 `target="_blank" rel="noreferrer"`를 갖는다
- [x] 브라우저 뒤로 가기 → 목록으로 복귀
- [x] `/projects/onboarding-redesign`에는 외부 링크 버튼이 없고 기간이 "진행 중"

### 예외·엣지 케이스

- [x] `/projects/no-such-slug` → HTTP 404(개발·프로덕션·ISR 모두) + `not-found.tsx` 렌더, `/projects` 복귀 링크 존재

### 반응형·다크 모드·접근성

- [x] 375px / 1280px에서 가로 스크롤이 없다
- [x] 다크 모드에서 대비 유지
- [x] `<h1>` 하나, heading 레벨 건너뛰지 않음, 외부 링크에 접근 가능한 이름

### 정적 검증

- [x] `npx tsc --noEmit` 오류 0
- [x] `npm run lint` 오류 0

## 변경 사항 요약

- `components/projects/project-header.tsx`(ui-markup-specialist 작성) — `<header>`: Cover 자리 `aspect-video bg-muted`(TODO Task 012) → `<h1>` → Outcome 강조 → `<dl>` 역할·기간(`<time dateTime>`, `formatPeriod` 재사용, 모바일 세로/`sm:` 가로) → Tags `Badge secondary` → `externalUrl` 있을 때만 `Button asChild` + `<a target="_blank" rel="noreferrer">프로젝트 보기</a>`(lucide `ExternalLink`, `aria-hidden`).
- `app/projects/[slug]/page.tsx` — `MOCK_PROJECTS.find(slug)` → 없으면 `notFound()`(`never` 반환이라 이후 `project` 타입이 좁혀짐) → `<ProjectHeader>`. 본문 자리 TODO(Task 006), `generateMetadata` TODO(Task 010).
- `app/projects/[slug]/not-found.tsx` — 설명 문장 추가, 복귀 링크를 `Button asChild variant="outline"` + `Link`로.
- `app/projects/[slug]/error.tsx` — 안내 문장 추가, "목록으로" 버튼 추가. `"use client"`·`retry` 시그니처 유지.
- 검증: tsc·lint 0. Playwright — 카드 클릭 → 상세 `<h1>` 일치, `<h1>` 1개, dl 역할·기간, 배지 3개, 외부 링크 `target=_blank rel=noreferrer` href 일치, 뒤로 가기 복귀, 온보딩 상세 "진행 중"·외부 링크 없음, no-such-slug → not-found UI + `noindex`, 375px 가로 스크롤 없음·dl 세로 배치, 다크 모드 대비 정상.
- **R5 → 결정 B 적용**: `app/projects/loading.tsx`·`app/projects/[slug]/loading.tsx` 삭제. `loading.tsx`가 만드는 Suspense 경계 때문에 응답이 스트리밍되어 `notFound()`가 상태 코드를 바꾸지 못하고 200 + `noindex`로 내려가던 문제(Next 문서 `loading.md` §Status Codes)를 해소. 삭제 후 개발 서버(재시작 필요 — 파일 규약 삭제는 HMR이 반영하지 않음), 프로덕션 동적 라우트, 프로덕션 ISR(`revalidate = 60` + `generateStaticParams` 임시 적용) 세 조건 모두 `/projects/no-such-slug` → 404 확인. PRD S3 그대로 성립. Task 012는 페이지 내부 `<Suspense>`로 본문(`getProjectBlocks`)만 스켈레톤 처리하고 존재 확인은 스트리밍 전에 끝낸다.
- 측정 시 주의: `pkill -f "next start"`는 npm 래퍼만 죽이고 실제 서버가 포트를 계속 잡을 수 있다. 프로덕션 재측정 전 `lsof -t -iTCP:3001 -sTCP:LISTEN`으로 잔존 프로세스를 확인할 것(이번에 잔존 서버 때문에 한동안 잘못된 200을 읽었음).
