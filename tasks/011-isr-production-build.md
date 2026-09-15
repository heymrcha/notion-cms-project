# Task 011: ISR 적용 및 프로덕션 빌드 검증 (M3)

## 고수준 명세

- **목적**: 목록·상세·홈을 빌드 시 정적 생성하고 60초 주기로 재검증해, 방문자 요청이 Notion API를 직접 호출하지 않으면서도 Notion 수정이 1분 안에 반영되게 한다(PRD §8, G2).
- **범위**: `export const revalidate = 60`(세 라우트), `generateStaticParams`(상세), 프로덕션 빌드·실행·반영 실측. 온디맨드 재검증(F11)은 Task 015, 성능 측정(S4)은 Task 014.
- **PRD 참조**: F4, §8, §13 M3, S1·S2·S3·S6
- **리스크·미결**:
  - R3 — `getPublishedProjects()`가 실패하면 `null`을 돌려주므로 `generateStaticParams`는 `?? []`로 빈 배열을 반환해 빌드를 실패시키지 않는다. `dynamicParams` 기본값(`true`)을 유지해 빌드 후 추가된 slug도 첫 요청에 생성된다.
  - 홈(`/`)도 `getPublishedProjects()`를 쓰므로 `revalidate` 없이는 빌드 시점 데이터로 고정된다. PRD는 두 라우트만 언급하지만 G2를 지키기 위해 홈에도 같은 값을 둔다.
  - `revalidate` 값은 정적 분석 가능한 리터럴이어야 한다(`60`, `60 * 1` 불가 — `caching-without-cache-components.md` §Route segment config).
- **전제 조건**: Task 010 완료, `.env.local` 유효, Notion MCP로 데이터 수정 가능.

## 관련 파일

| 파일 | 변경 종류 | 설명 |
|---|---|---|
| `app/projects/page.tsx` | 수정 | `export const revalidate = 60` |
| `app/projects/[slug]/page.tsx` | 수정 | `revalidate = 60` + `generateStaticParams`(발행 slug, 실패 시 `[]`) |
| `app/page.tsx` | 수정 | `revalidate = 60`(최근 3건 섹션 갱신용) |
| `lib/notion/queries.ts` | 참조 | `getPublishedProjects`는 실패 시 `null`(변경 없음) |

## 수락 기준

- [x] 빌드 로그에서 `/`, `/projects`, `/projects/[slug]`가 ISR(`◐`, 60s)로 표기되고 발행 slug 3개가 프리렌더된다
- [x] `generateStaticParams` 주석에 "재검증 시 재호출되지 않음"의 근거(로컬 문서)와 그래서 `dynamicParams` 기본값을 유지하는 이유가 적혀 있다
- [x] S2: 프로덕션 서버에서 Notion 제목 수정 → 60초 대기 → 새로고침 2회 → 목록·상세에 새 제목이 보인다
- [x] S3: `Published` 해제 → 60초 후 목록에서 사라지고 상세 URL이 404를 반환한다(원복 후 다시 나타남)
- [x] `x-nextjs-cache` 헤더로 `HIT` → `STALE` → 갱신을 관찰한다
- [x] 빌드 후 `.next/static`에 `NOTION_API_KEY` 값이 없다
- [x] `npx tsc --noEmit` 오류 0
- [x] `npm run lint` 오류 0
- [x] 코드 관례 준수: `any` 없음, 서버 컴포넌트 유지

## 구현 단계

- [x] 1. `incremental-static-regeneration.md`, `generate-static-params.md`, `dynamicParams.md`, `caching-without-cache-components.md`의 `revalidate` 절을 읽는다.
- [x] 2. 세 페이지에 `revalidate = 60`, 상세에 `generateStaticParams` 추가.
- [x] 3. `npx tsc --noEmit` + `npm run lint` 오류 0 확인.
- [x] 4. `npm run build` → 빌드 로그 확인 → `npm run start -p 3001`.
- [x] 5. 아래 테스트 체크리스트를 Playwright MCP + curl로 수행한다.
- [x] 6. 체크박스를 갱신하고 `ROADMAP.md`의 Task 011을 ✅로 표시한다. 완료 후 중단하고 다음 지시를 기다린다.

## 테스트 체크리스트

> 프로덕션 서버(`npm run build && npm run start -p 3001`)를 기준으로 한다. 잔존 서버는 `lsof -t -iTCP:3001 -sTCP:LISTEN`으로 먼저 확인한다(Task 005의 교훈).

### 정상 흐름

- [x] `/projects` 카드 3장, `/projects/subscription-checkout` 상세 정상 렌더, 응답 헤더 `x-nextjs-cache: HIT`
- [x] Notion에서 `admin-dashboard` 제목을 수정 → 60초 대기 → 새로고침 2회 → 목록·상세·홈에 새 제목(S2) → 원복

### 예외·엣지 케이스

- [x] `Published` 해제(`admin-dashboard`) → 60초 후 목록 2건, 상세 404(S3) → 원복 후 60초 뒤 복귀
- [x] `/projects/no-such-slug` → 404 (ISR 상태에서도)
- [x] `/projects/draft-unpublished` → 404

### 정적 검증

- [x] `npx tsc --noEmit` 오류 0
- [x] `npm run lint` 오류 0
- [x] `grep -r "ntn_" .next/static` 결과 없음

## 변경 사항 요약

### 구현

- `app/projects/page.tsx`, `app/projects/[slug]/page.tsx`, `app/page.tsx`에 `export const revalidate = 60`. 홈은 PRD 범위 밖이지만 `getPublishedProjects()`를 쓰므로 빼면 빌드 시점 데이터로 고정된다(G2 위반) — 같은 주기로 맞췄다.
- `[slug]/page.tsx`에 `generateStaticParams`: `getPublishedProjects()` 결과의 slug 배열, 실패(`null`) 시 `[]`(R3). `dynamicParams`는 기본값 유지. 주석에 "ISR 재검증 시 재호출되지 않음"(`generate-static-params.md`)과 그래서 런타임 생성에 기대는 이유를 남겼다.

### 검증 (프로덕션 `next build` + `next start -p 3001`)

- 빌드 로그: `/`, `/projects`, `/projects/[slug]` 모두 `Revalidate 1m / Expire 1y`, `●` SSG로 slug 3개 프리렌더. `.next/static`에 `ntn_`·`NOTION_API_KEY` 0건.
- **S2** (Notion MCP로 `admin-dashboard` 제목 수정): t0 `HIT` 옛 제목 → t+62s 첫 새로고침 `STALE` 옛 제목(백그라운드 재생성) → t+65s 두 번째 새로고침 `HIT` 새 제목. 목록·상세·홈 동시 반영. 문서의 stale-while-revalidate 설명과 정확히 일치.
- **S3** (`Published` 해제): 같은 타임라인으로 목록 3건 → 2건, 상세 `200` → `404`. 원복 후 62초 뒤 3건·`200`·원래 제목 복귀 확인.
- `/projects/no-such-slug`, `/projects/draft-unpublished` → `404` + `not-found.tsx`(ISR 상태에서도 유지).
- `npx tsc --noEmit`·`npm run lint` 오류 0.

### 발견 사항 (R6)

- 404였던 상세 엔트리가 재발행되어 **처음** 재생성될 때, 본문은 정상이지만 `<title>`이 레이아웃 기본값이고 `<meta name="robots" content="noindex">`가 붙은 채 캐시된다. 다음 재검증 주기(최대 60초)에서 올바른 제목·`noindex` 없음으로 복구됨을 실측했다(`t+62s STALE` → `t+65s HIT` 정상). 재발행은 드물고 창이 60초라 MVP 영향은 작다. ROADMAP 리스크 표에 R6으로 기록, Task 015(온디맨드 재검증)에서 `revalidatePath` 호출 시 같은 현상이 있는지 재점검한다.
- 측정 스크립트는 `sleep` 기반 curl 프로브(`$CLAUDE_JOB_DIR/tmp`)로 수행했다. Playwright는 화면·404 UI 확인에 사용.
