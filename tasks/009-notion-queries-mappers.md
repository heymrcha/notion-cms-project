# Task 009: Notion 클라이언트 및 쿼리·매퍼 구현 (M1)

## 고수준 명세

- **목적**: `lib/notion/*` 골격(Task 002)을 실제 구현으로 채워 Notion Database에서 발행 프로젝트와 본문 블록을 앱 전용 타입(`Project`, `NotionBlock`)으로 가져온다. PRD M1 완료 판정 대상.
- **범위**: `client.ts`(단일 인스턴스), `retry.ts`(실패 → 빈 값 래퍼), `mappers.ts`(타입 가드 매핑), `queries.ts`(쿼리 3종, 전량 페이지네이션, Slug 중복 처리). 페이지 연결은 Task 010.
- **PRD 참조**: F3(페치·매핑), §6.1 정렬·필터 규칙, §7 데이터 흐름, §7.2 API 사실, §10 Rate limit, §11 에러 처리
- **리스크·미결**: R1 — Task 008에서 타입 정의로 확인 완료. R3 — 페치 함수는 throw하지 않고 `null`/`[]`를 돌려 빌드를 실패시키지 않는다. **설계 변경**: SDK 5.26에 429/529 재시도(`Retry-After` 존중, 지수 백오프+지터)가 내장돼 있어 ROADMAP의 `retry.ts` 자체 재시도 루프 대신 `Client`의 `retry: { maxRetries: 3 }`를 쓴다. 두 겹으로 재시도하면 대기 시간이 곱으로 늘어난다. `retry.ts`는 "실패를 빈 값으로 바꾸는 `safeFetch`"만 담당.
- **전제 조건**: Task 008 완료, Notion DB에 통합 연결 권한(API 호출로 확인됨 — 4건 조회 성공).

## 관련 파일

| 파일 | 변경 종류 | 설명 |
|---|---|---|
| `lib/notion/client.ts` | 수정 | `getNotionClient()` — `new Client({ auth, retry })` 모듈 캐시 |
| `lib/notion/retry.ts` | 신규 | `safeFetch(label, fn, fallback)` — 예외를 `console.error` 후 fallback 반환 |
| `lib/notion/mappers.ts` | 수정 | `mapPageToProject`, `mapBlock` 구현(`isFullPage`/`isFullBlock` + 속성 가드) |
| `lib/notion/queries.ts` | 수정 | `getPublishedProjects`(→ `Project[] | null`), `getProjectBySlug`, `getProjectBlocks` 구현 |
| `lib/notion/types.ts` | 참조 | 계약 (변경 없음) |
| `lib/notion/mock-data.ts` | 참조 | `MOCK_RAW_UNSUPPORTED_BLOCK`으로 `mapBlock` → `null` 검증 |

## 수락 기준

- [x] `getPublishedProjects()`가 발행 3건을 `Order` desc → `Period Start` desc(subscription-checkout → onboarding-redesign → admin-dashboard)로 돌려주고 미발행 `draft-unpublished`는 없다
- [x] `getProjectBySlug("subscription-checkout")`가 해당 `Project`를, `getProjectBySlug("draft-unpublished")`·없는 slug는 `null`을 돌려준다
- [x] `getProjectBlocks(pageId)`가 §6.3 7종만 `NotionBlock[]`으로 돌려주고 토글은 빠진다. rich text의 bold/italic/code/href가 반영된다
- [x] `mapBlock(MOCK_RAW_UNSUPPORTED_BLOCK) === null`
- [x] 필수 속성 누락 페이지는 `null` + `console.warn(페이지 ID, 속성명)`. `Order` 비면 0. `Slug` 중복 시 첫 행 채택 + 경고
- [x] 페치 실패(잘못된 키/ID) 시 throw 없이 `null`/`[]` + `console.error`
- [x] `npm run build` 후 `.next/static`에 `NOTION_API_KEY` 값·키 이름이 없다
- [x] `npx tsc --noEmit` 오류 0, `any`·`as unknown as` 없음
- [x] `npm run lint` 오류 0

## 구현 단계

- [x] 1. 실제 API 응답 형태 채취(속성 타입 12개, 블록 14개 + 토글) — 완료, 아래 요약 참고.
- [x] 2. `client.ts`, `retry.ts` 작성.
- [x] 3. `mappers.ts` 작성(속성 가드 헬퍼 → `mapPageToProject`, rich text → `RichText`, `mapBlock`).
- [x] 4. `queries.ts` 작성(페이지네이션 루프, Slug 중복 제거, `safeFetch`).
- [x] 5. `npx tsc --noEmit` + `npm run lint` 오류 0 확인.
- [x] 6. 임시 페이지 `app/dev-notion/page.tsx`로 M1 판정 + Playwright, 검증 후 삭제. `npm run build` + `.next/static` grep.
- [x] 7. 체크박스를 갱신하고 `ROADMAP.md`의 Task 009를 ✅로 표시한다. 커밋한다(연속 실행 모드).

## 테스트 체크리스트

> 개발 서버(`npm run dev`, 포트 3000)를 먼저 띄운다. 임시 서버 컴포넌트 `app/dev-notion/page.tsx`가 세 함수의 결과를 JSON으로 출력한다(검증 후 삭제, 커밋 금지).

### 정상 흐름

- [x] `/dev-notion`에서 `getPublishedProjects()` 결과 3건, slug 순서 `subscription-checkout → onboarding-redesign → admin-dashboard`
- [x] 같은 화면에서 `getProjectBySlug("subscription-checkout")`의 `externalUrl`·`tags` 3개·`periodEnd` 일치, `onboarding-redesign`의 `periodEnd === null`, `order === 0`
- [x] `getProjectBlocks()` 결과 13건(토글 제외), 타입 순서가 Notion 본문과 일치, 첫 paragraph에 bold/italic/code/href 조각 존재

### 예외·엣지 케이스

- [x] `getProjectBySlug("draft-unpublished")` → `null`, `getProjectBySlug("no-such-slug")` → `null`
- [x] `mapBlock(MOCK_RAW_UNSUPPORTED_BLOCK)` → `null`(스크립트)
- [x] `.env.local`의 `NOTION_PROJECTS_DATA_SOURCE_ID`를 잘못된 값으로 바꾸고 재기동 → `/dev-notion`이 `null`/`[]`를 출력하고 서버 콘솔에 `console.error`, 흰 화면·throw 없음. 확인 후 원복

### 정적 검증

- [x] `npx tsc --noEmit` 오류 0
- [x] `npm run lint` 오류 0
- [x] `npm run build` 성공, `grep -r "NOTION_API_KEY" .next/static` 결과 없음

## 변경 사항 요약

- **실제 응답 채취**(구현 근거): 속성 타입 — `Title: title`, `Slug/Summary/Outcome/Role: rich_text`, `Published: checkbox`, `Period Start/End: date{start}`, `Tags: multi_select`, `Cover: files[]`, `External URL: url`, `Order: number`(비면 `null`). 블록 14개 — §6.3 7종 13개 + `toggle`(has_children). 이미지는 `external.url` 또는 `file.url`, 캡션이 `alt`.
- `lib/notion/client.ts` — `getNotionClient()`가 `new Client({ auth, retry: { maxRetries: 3 } })`를 모듈 스코프에 캐시. **ROADMAP과 다른 점**: SDK 5.26에 429/529 재시도(`Retry-After` 존중, 지수 백오프+지터, `canRetry`/`calculateRetryDelay`)가 내장돼 있어 자체 재시도 루프를 만들지 않는다. 두 겹이면 대기 시간이 곱으로 늘어난다.
- `lib/notion/retry.ts` 신규 — `safeFetch(label, fn, fallback)`. 예외를 `console.error("[notion] <label> 실패 — <code>: <message>")`로 기록하고 fallback 반환(throw 금지, R3).
- `lib/notion/mappers.ts` — `mapPageToProject`: `isFullPage` 가드 → 속성 이름·타입 모두 맞을 때만 읽는 헬퍼(`readText/readCheckbox/readDate/readMultiSelect/readUrl/readNumber/readFirstFileUrl`). 필수 6개(Title·Slug·Summary·Outcome·Role·Period Start) 누락 시 `null` + `console.warn(페이지 ID, 누락 속성명)`. `Order` 비면 0. `mapBlock`: `isFullBlock` 가드 → 7종 `switch`, `default: null`. rich text `annotations`·`href` → `RichText`. 캐스트 없이 제어 흐름 좁힘만 사용.
- `lib/notion/queries.ts` — `queryAllPages()`가 `has_more`/`next_cursor`로 전량 페치. `getPublishedProjects(): Promise<Project[] | null>`(**시그니처 변경**: 실패 `null`, 0건 `[]`로 오류/빈 상태 구분), `getProjectBySlug`는 `and: [Published, Slug equals]`, `getProjectBlocks`는 `blocks.children.list` 전량 + `mapBlock`. `dedupeBySlug`로 중복 시 첫 행 채택 + 경고. 필터·정렬 상수는 `satisfies`로 SDK 타입 검증.
- **M1 완료 판정**(임시 `app/dev-notion/page.tsx`, 삭제함): 발행 3건 `subscription-checkout(order 10) → onboarding-redesign(2025-09, periodEnd null) → admin-dashboard`, `draft-unpublished`·없는 slug → `null`, 블록 13건(토글 제외) 순서 일치, 인라인 bold/italic/code/href 4종, 이미지 URL·alt. Playwright로 화면 출력 확인.
- 엣지: `mapBlock(MOCK_RAW_UNSUPPORTED_BLOCK)`·비정상 입력 → `null`; 필수 속성 누락 페이지 → `null` + 경고; 잘못된 `NOTION_PROJECTS_DATA_SOURCE_ID` → 세 함수 `null`/`[]` + `object_not_found` 로그, HTTP 200, throw 없음(`.env.local` 원복 완료).
- `npm run build` 성공, `.next/static`에 `NOTION_API_KEY`·`ntn_`·data source ID 없음. tsc·lint 0.
- Task 010 참고: `app/projects/page.tsx`의 `Project[] | null` 분기가 이 시그니처와 바로 맞물린다.
