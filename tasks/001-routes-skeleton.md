# Task 001: 프로젝트 라우트 골격 및 특수 파일 생성

## 고수준 명세

- **목적**: `SITE_CONFIG.navLinks`의 `/projects`가 404인 상태를 해소하고, `/projects`·`/projects/[slug]` 라우트와 Next.js 특수 파일(`loading`·`error`·`not-found`)의 자리를 확보해 Phase 2 UI 작업의 골격을 만든다.
- **범위**: 라우트 파일 생성과 자리표시 문구까지. 카드 그리드(Task 004)·상세 메타(Task 005)·스켈레톤(Task 012)·`generateMetadata`(Task 010)는 다루지 않는다.
- **PRD 참조**: §5 정보 구조, F1·F2 라우트, F5 사이트 셸 정리
- **리스크·미결**: 해당 없음. 단, Next 16 로컬 문서(`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/error.md`)에 따르면 `error.tsx`의 재시도 prop은 `reset`이 아닌 **`retry`**다(`reset`은 "대부분 `retry`를 쓰라"로 격하). ROADMAP Task 005의 "`reset` 버튼" 문구는 Task 005 착수 시 수정 제안한다.
- **전제 조건**: 없음. `app/docs` 삭제·`v1.0.0` 배지 제거는 커밋 `7083736`에 이미 반영됨.

## 관련 파일

| 파일 | 변경 종류 | 설명 |
|---|---|---|
| `app/projects/page.tsx` | 신규 | 목록 페이지 껍데기. `metadata` 제목 `` `프로젝트 | ${SITE_CONFIG.name}` `` |
| `app/projects/[slug]/page.tsx` | 신규 | 상세 페이지 껍데기. `params`는 Promise → `await` |
| `app/projects/loading.tsx` | 신규 | 자리 파일 (Task 012에서 스켈레톤) |
| `app/projects/[slug]/loading.tsx` | 신규 | 자리 파일 (Task 012에서 스켈레톤) |
| `app/projects/[slug]/error.tsx` | 신규 | 클라이언트 컴포넌트(Next 규약). `retry` 버튼 최소형 |
| `app/projects/[slug]/not-found.tsx` | 신규 | 자리 파일 (Task 005에서 문구·복귀 링크) |
| `README.md` | 수정 | "`/projects`는 404" 문구를 현재 상태로 갱신 |
| `lib/site-config.ts` | 참조 | `navLinks`에 `/projects` 이미 존재 (변경 없음) |

## 수락 기준

- [x] `/projects`가 200으로 렌더되고 `<h1>프로젝트</h1>`가 보인다
- [x] `/projects/any-slug`가 200으로 렌더되고 slug 값이 자리 문구에 표시된다
- [x] navbar "프로젝트" 링크 클릭 시 `/projects`로 이동하고 활성 스타일이 적용된다
- [x] `"use client"`가 붙은 신규 파일은 `app/projects/[slug]/error.tsx` 하나뿐이다
- [x] `npx tsc --noEmit` 오류 0
- [x] `npm run lint` 오류 0
- [x] 코드 관례 준수: `any` 없음, 신규 컴포넌트는 서버 컴포넌트, 색은 토큰만, 컨테이너 `container mx-auto max-w-screen-2xl px-4`, 클래스 조합 `cn()`

## 구현 단계

- [x] 1. Next.js 16 로컬 문서 `file-conventions/page.md`·`error.md`·`not-found.md`·`loading.md`를 읽는다.
- [x] 2. `app/projects/page.tsx`, `app/projects/[slug]/page.tsx`를 `app/about/page.tsx` 구조에 맞춰 작성한다.
- [x] 3. `loading.tsx` 2개, `error.tsx`, `not-found.tsx` 자리 파일을 작성한다.
- [x] 4. `README.md`의 404 문구를 갱신한다.
- [x] 5. `npx tsc --noEmit` + `npm run lint`를 실행해 오류 0을 확인한다.
- [x] 6. 아래 테스트 체크리스트를 Playwright MCP로 수행한다.
- [x] 7. F5 잔여 항목 재점검 후 커밋(사전 변경 `.gitignore`·`shrimp-rules.md` 포함). 작업 파일 체크박스와 `ROADMAP.md`를 갱신하고 중단한다.

## 테스트 체크리스트

> 개발 서버(`npm run dev`, 포트 3000)를 먼저 띄운다.

### 정상 흐름

- [x] `http://localhost:3000/projects` 진입 → `<h1>프로젝트</h1>` 렌더, 콘솔 오류 없음
- [x] `http://localhost:3000/projects/sample-slug` 진입 → 자리 문구에 `sample-slug` 표시
- [x] navbar "프로젝트" 클릭 → `/projects` 이동, 링크에 `text-foreground` 활성 클래스

### 반응형·다크 모드·접근성

- [x] 375px / 1280px에서 가로 스크롤이 없다
- [x] 다크 모드 전환 시 텍스트·배경 대비가 유지된다

### 정적 검증

- [x] `npx tsc --noEmit` 오류 0
- [x] `npm run lint` 오류 0

## 변경 사항 요약

- `app/projects/page.tsx`, `app/projects/[slug]/page.tsx` 신규 — 자리표시 문구, `metadata` 제목 규약 준수. 상세는 `params`를 `await`.
- `app/projects/loading.tsx`, `app/projects/[slug]/loading.tsx`, `app/projects/[slug]/not-found.tsx` 자리 파일 신규.
- `app/projects/[slug]/error.tsx` 신규 — 유일한 신규 클라이언트 컴포넌트. Next 16 규약대로 `retry` prop 사용(`reset` 아님).
- `README.md` — "`/projects`는 404" 문구를 라우트 골격 존재 상태로 갱신.
- 검증: `npx tsc --noEmit`·`npm run lint` 오류 0. Playwright MCP로 `/projects`(200, h1 "프로젝트", navbar 활성 클래스)·`/projects/sample-slug`(slug 표시)·375px 가로 스크롤 없음·다크 모드 대비·콘솔 오류 0 확인.
- F5 잔여 재점검: `app/docs` 없음, `v1.0.0` 배지 없음 — 커밋 `7083736`에 이미 반영됨.
