# Task 010: 더미 데이터를 실제 Notion 데이터로 교체 및 에러 처리 연결

## 고수준 명세

- **목적**: Phase 2에서 더미로 만든 세 화면(홈·목록·상세)을 Task 009의 페치 계층에 연결해 Notion 실데이터를 렌더한다. 더미 파일을 삭제해 실데이터 경로만 남긴다.
- **범위**: `app/page.tsx`, `app/projects/page.tsx`, `app/projects/[slug]/page.tsx`의 데이터 소스 교체와 상태 분기(오류/빈/404), `generateMetadata`, `lib/notion/mock-data.ts` 삭제. ISR(`revalidate`·`generateStaticParams`)은 Task 011.
- **PRD 참조**: F1·F2·F6, §10 SEO(상세 `<title>`·description), §11 에러 처리
- **리스크·미결**: `generateMetadata`와 페이지가 같은 slug를 각각 조회하면 Notion 호출이 두 배가 된다. Next 문서(`generate-metadata.md`)는 `fetch`가 아닌 호출에 React `cache`를 권하므로 `getProjectBySlug`·`getPublishedProjects`를 `cache()`로 감싼다(같은 렌더 안에서 1회).
- **전제 조건**: Task 007(홈 섹션), Task 009(M1) 완료.

## 관련 파일

| 파일 | 변경 종류 | 설명 |
|---|---|---|
| `app/projects/page.tsx` | 수정 | `MOCK_PROJECTS` → `await getPublishedProjects()`; `null` → `ErrorState`, `[]` → `EmptyState` 분기 유지 |
| `app/projects/[slug]/page.tsx` | 수정 | `getProjectBySlug` → `null`이면 `notFound()`; `getProjectBlocks(project.id)`; `generateMetadata` |
| `app/page.tsx` | 수정 | 최근 3건 실데이터(`null`/`[]`면 섹션 숨김) |
| `lib/notion/queries.ts` | 수정 | `getPublishedProjects`·`getProjectBySlug`를 React `cache`로 감쌈 |
| `lib/notion/mock-data.ts` | 삭제 | Phase 2 전용 더미 제거 |

## 수락 기준

- [x] `/projects`에 Notion 발행 3건이 `subscription-checkout → onboarding-redesign → admin-dashboard` 순으로 보이고 `draft-unpublished`는 없다
- [x] `/projects/subscription-checkout` 상세에 메타 + Notion 본문 13블록(토글 스킵)이 렌더되고 외부 링크가 있다
- [x] `/projects/draft-unpublished`(미발행)·`/projects/no-such-slug` 모두 HTTP 404 + `not-found.tsx`
- [x] 상세 `<title>`이 `구독 결제 전환율 개선 | PM 포트폴리오`, `description`이 Summary
- [x] `/` 최근 프로젝트 3건이 실데이터
- [x] 잘못된 `NOTION_API_KEY`로 재기동 → 목록 `ErrorState`, 홈 섹션 숨김, 흰 화면 없음(확인 후 원복)
- [x] `grep -rn mock-data app components lib` 결과 없음
- [x] `npx tsc --noEmit` 오류 0
- [x] `npm run lint` 오류 0

## 구현 단계

- [x] 1. `generate-metadata.md` 로컬 문서에서 `generateMetadata({ params })` 시그니처와 메모이제이션 지침 확인.
- [x] 2. `queries.ts`에 React `cache` 적용.
- [x] 3. 세 페이지 데이터 소스 교체, `generateMetadata` 추가.
- [x] 4. `git rm lib/notion/mock-data.ts`, 참조 0 확인.
- [x] 5. `npx tsc --noEmit` + `npm run lint` 오류 0 확인.
- [x] 6. 아래 테스트 체크리스트를 Playwright MCP로 수행한다.
- [x] 7. 체크박스를 갱신하고 `ROADMAP.md`의 Task 010을 ✅로 표시한다. 커밋한다(연속 실행 모드).

## 테스트 체크리스트

> 개발 서버(`npm run dev`, 포트 3000)를 먼저 띄운다.

### 정상 흐름

- [x] `/projects` 카드 3장 순서 + 온보딩 기간 "진행 중"
- [x] 첫 카드 클릭 → 상세 `<h1>` 일치, `<title>` 형식, 본문 `h2/h3`·`ul(3)`·`ol(2)`·`blockquote`·`hr`·`pre`·`img[alt]`, 외부 링크 `target=_blank rel=noreferrer`
- [x] 뒤로 가기 → 목록, `/` 최근 3건 동일 순서

### 예외·엣지 케이스

- [x] `/projects/draft-unpublished` → 404 + not-found UI(초안 내용 미노출)
- [x] `/projects/no-such-slug` → 404
- [x] 잘못된 `NOTION_API_KEY` → `/projects` ErrorState(`role=alert`), `/` 섹션 없음, 상세 404(페치 실패도 `null`이므로). 원복 후 정상 복귀

### 반응형·다크 모드·접근성

- [x] 375px / 1280px 가로 스크롤 없음(목록·상세)
- [x] 다크 모드 대비 유지

### 정적 검증

- [x] `npx tsc --noEmit` 오류 0
- [x] `npm run lint` 오류 0

## 변경 사항 요약

- `lib/notion/queries.ts` — `getPublishedProjects`·`getProjectBySlug`를 React `cache()`로 감쌈. SDK 호출은 `fetch`처럼 자동 메모이즈되지 않아 `generateMetadata`와 페이지가 같은 slug를 두 번 조회하던 것을 한 번으로 줄인다(Next 문서 `generate-metadata.md`).
- `app/projects/page.tsx` — `await getPublishedProjects()`. `null` → `ErrorState`, `[]` → `EmptyState`, 그 외 `ProjectGrid`. 정렬은 Notion 쿼리가 끝내므로 `sortProjects` 호출 제거.
- `app/projects/[slug]/page.tsx` — `getProjectBySlug` → `null`이면 `notFound()`(미발행·없음·페치 실패 모두 404 — 초안이 새지 않는 쪽), `getProjectBlocks(project.id)`로 본문. `generateMetadata`: `` `${title} | ${SITE_CONFIG.name}` `` + `description: summary`, 없는 slug는 "프로젝트를 찾을 수 없습니다 | …".
- `app/page.tsx` — `(await getPublishedProjects())?.slice(0, 3) ?? []`. 실패·0건 모두 섹션 숨김.
- `lib/notion/mock-data.ts` 삭제. `app`·`components`·`lib`에 `mock-data`·`MOCK_` 참조 0. `lib/notion/sort-projects.ts`는 앱에서 더 이상 호출하지 않지만 순수 유틸로 유지(Task 016 필터 등 재사용 가능).
- 검증(실데이터): tsc·lint 0. `/projects` 3건 `subscription-checkout → onboarding-redesign → admin-dashboard`, 기간 표기, 1280px 3열; 상세 `<title>` `구독 결제 전환율 개선 | PM 포트폴리오`, description = Summary, 본문 `ul(3)`·`ol(2)`·`blockquote`·`hr`·`pre`·`img[alt]`·인라인 4종, 토글 텍스트 미노출, 외부 링크 `rel=noreferrer`; `/projects/draft-unpublished`·`no-such-slug` → **404**; `/` 최근 3건 동일 순서; 375px 가로 스크롤 없음; 다크 모드 정상.
- S5(잘못된 `NOTION_API_KEY`): `/projects` 200 + `role="alert"` ErrorState, `/` 섹션 없음, 상세 404, 서버 로그 `unauthorized`, 흰 화면·throw 없음. `.env.local` 원복 후 정상 복귀 확인.
- **콘텐츠 참고**: 실제 Notion 본문의 첫 섹션 제목이 `heading_2`라 화면 heading이 `H1 → H3 → H4`로 건너뛴다. 렌더러 규칙(§6.3: `heading_1 → h2`)은 맞으므로 Notion에서 최상위 섹션을 `heading_1`로 쓰면 해결된다. Task 011-1에서 콘텐츠 정리 시 반영.
