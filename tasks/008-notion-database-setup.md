# Task 008: Notion Database 준비 및 SDK 설치 (M1 선행)

## 고수준 명세

- **목적**: Task 009(페치 계층 구현)가 바로 착수할 수 있도록 `@notionhq/client`를 설치하고, 설치된 버전의 타입 정의로 PRD §7.2의 API 사실(`dataSources.query`, 페이지네이션, 에러 코드)을 재확인한다(R1). Notion 측 준비(통합·DB·더미·env)는 이 세션 밖에서 이미 끝났으므로 상태만 점검한다.
- **범위**: SDK 설치, 타입 정의·Context7 문서 확인, `.env.local`·`.gitignore` 점검, Notion 준비 상태 기록. 코드 구현은 Task 009.
- **PRD 참조**: §6.1 스키마, §7.2 확인된 API 사실, §10 Rate limit, §12 환경 변수
- **리스크·미결**: R1 — 설치된 SDK가 `dataSources.query({ data_source_id })`를 제공함을 확인(아래). 통합 연결 권한 부여는 코드로 확인할 수 없어 Task 009의 첫 API 호출로 판정한다.
- **전제 조건**: 없음(Phase 2와 독립).

## 관련 파일

| 파일 | 변경 종류 | 설명 |
|---|---|---|
| `package.json`, `package-lock.json` | 수정 | `@notionhq/client` 의존성 추가 |
| `.env.local` | 참조 | 두 키 존재 확인(값은 읽지 않음, 커밋 금지) |
| `.gitignore` | 참조 | `.env*` 무시·`!.env.example` 확인 |
| `docs/PRD.md` | 참조 | §6.1 스키마, §7.2 API 근거 |

## 수락 기준

- [x] `@notionhq/client`가 설치되고 버전이 기록된다
- [x] 타입 정의에서 `Client.dataSources.query(QueryDataSourceParameters)`, `isFullPage`·`isFullBlock`·`APIResponseError`·`APIErrorCode`·`collectPaginatedAPI` export를 확인한다
- [x] `APIErrorCode`에 `rate_limited`·`service_overload`·`object_not_found`가 있고, `APIResponseError`에 `status`·`headers`가 있어 `Retry-After`를 읽을 수 있다
- [x] `.env.local`에 `NOTION_API_KEY`, `NOTION_PROJECTS_DATA_SOURCE_ID`가 비어 있지 않고 `git check-ignore .env.local`이 통과한다
- [x] Notion 준비 상태(통합·DB 12개 속성·발행 3건·미발행 1건)와 통합 연결 권한 절차가 기록된다
- [x] `npx tsc --noEmit` 오류 0
- [x] `npm run lint` 오류 0

## 구현 단계

- [x] 1. `npm i @notionhq/client` 후 버전 확인.
- [x] 2. `node_modules/@notionhq/client/build/src/{Client,index,errors,helpers}.d.ts`, `api-endpoints/{data-sources,blocks}.d.ts`에서 R1 항목 확인.
- [x] 3. Context7(`/websites/developers_notion_reference`)로 `dataSources.query` 필터·정렬·페이지네이션, Rate limit·`Retry-After` 재확인.
- [x] 4. `.env.local`·`.gitignore` 점검, Notion 준비 상태 기록.
- [x] 5. `npx tsc --noEmit` + `npm run lint` 오류 0 확인.
- [x] 6. 체크박스를 갱신하고 `ROADMAP.md`의 Task 008을 ✅로 표시한다. 커밋한다(연속 실행 모드).

## 테스트 체크리스트

> 이 Task는 설치·확인만 하므로 브라우저 검증 대상이 없다. API 호출 검증은 Task 009의 M1 완료 판정에서 수행한다.

### 정적 검증

- [x] `npx tsc --noEmit` 오류 0
- [x] `npm run lint` 오류 0
- [x] `git status`에 `.env.local`이 나타나지 않는다

## 변경 사항 요약

- `@notionhq/client` **5.26.0** 설치(`package.json`·`package-lock.json`). SDK 기본 API 버전 `Client.defaultNotionVersion = "2025-09-03"`(PRD §7.2와 일치). Context7 문서는 `2026-03-11`을 예시로 쓰지만 SDK 기본값을 그대로 둔다 — 응답 형태가 바뀔 수 있으므로 버전은 필요할 때만 명시적으로 올린다.
- **R1 확인(타입 정의)**:
  - `Client.d.ts:248` `dataSources.query(args: WithAuth<QueryDataSourceParameters>)` 존재. `databases.query`도 남아 있으나 쓰지 않는다.
  - `api-endpoints/data-sources.d.ts:344` `QueryDataSourceBodyParameters`: `sorts[{ property, direction }]`, `filter: { and | or | PropertyFilter }`, `start_cursor`, `page_size`. 텍스트 필터는 `rich_text: TextPropertyFilter`(`equals` 포함).
  - `api-endpoints/blocks.d.ts:958` `ListBlockChildrenQueryParameters`: `start_cursor`, `page_size`.
  - `index.d.ts` export: `isFullPage`, `isFullBlock`, `collectPaginatedAPI`, `iteratePaginatedAPI`, `APIResponseError`, `APIErrorCode`, `isNotionClientError`.
  - `errors.d.ts:5` `APIErrorCode`에 `Unauthorized`, `ObjectNotFound`, `RateLimited`, `ServiceOverload`, `ServiceUnavailable`, `GatewayTimeout` 등. `APIResponseError.status`·`.headers`가 있고 `getResponseHeader(headers, name)` 헬퍼로 `Retry-After`를 읽을 수 있다.
  - 주의: `collectPaginatedAPI`는 한 쿼리당 10,000행 한도에서 조용히 멈춘다(`helpers.d.ts:119`). 이 사이트는 20건 미만이라 무관하지만 주석으로 남긴다.
- **Context7 확인**(`/websites/developers_notion_reference`): `notion.dataSources.query({ data_source_id, filter, sorts })` 예시, checkbox `equals: true` 필터, `has_more`/`next_cursor` 페이지네이션, Rate limit(커넥션당 평균 3회/초, 429 `rate_limited`·529 `service_overload`, `Retry-After` 정수 초). 공식 JS 재시도 예시는 `Retry-After` 없으면 `min(2^attempt, 30)`초 + 지터.
- `.env.local`: `NOTION_API_KEY`, `NOTION_PROJECTS_DATA_SOURCE_ID` 모두 비어 있지 않음(값 미열람). `git check-ignore .env.local` 통과, `.gitignore`의 `.env*` + `!.env.example`.
- **Notion 준비 상태(세션 밖에서 완료)**: 통합 생성·API 키 발급, Projects Database(§6.1 12개 속성, Notion MCP로 생성, data source `d9613acb-917c-4f54-ace9-f9602e6effb4`), 발행 3건(`subscription-checkout` Order 10, `onboarding-redesign` Period End 없음, `admin-dashboard`) + 미발행 1건(`draft-unpublished`), 본문에 §6.3 7종·인라인 서식·토글 포함.
- **data source ID 확인 방법**: Notion MCP `notion-create-database` 응답의 `collection://<id>`가 data source ID다(Database ID `c4830185…`와 다름). UI에서는 DB 페이지 `···` → "데이터 소스 관리"에서 확인. API로는 `databases.retrieve`의 `data_sources[].id`.
- **남은 사용자 수작업**: Notion에서 Projects Database 페이지 `···` → 연결 → 사이트용 통합 추가. 미완료 시 Task 009 첫 호출이 `object_not_found`로 실패한다.
