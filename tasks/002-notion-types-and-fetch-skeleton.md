# Task 002: Notion 타입 정의 및 페치 계층 파일 골격 작성

## 고수준 명세

- **목적**: UI(Phase 2)와 페치 계층(Phase 3)이 병렬로 진행될 수 있도록 `lib/notion/types.ts`를 계약으로 확정하고, `client.ts`·`queries.ts`·`mappers.ts`의 시그니처만 만들어 둔다.
- **범위**: 타입 정의와 함수 시그니처까지. Notion SDK 설치·실제 쿼리·매핑 구현은 Task 008·009에서 다룬다. `mock-data.ts`는 Task 003.
- **PRD 참조**: §6.3 지원 블록, §7 데이터 흐름, §7.1 타입 정의, §12 환경 변수, F3
- **리스크·미결**: R1 — `@notionhq/client`는 아직 설치하지 않으므로 SDK 타입에 의존하는 코드를 쓰지 않는다. 앱 전용 타입만 정의한다.
- **전제 조건**: Task 001 완료. `server-only` 패키지 설치 필요(미설치 확인됨).

## 관련 파일

| 파일 | 변경 종류 | 설명 |
|---|---|---|
| `lib/notion/types.ts` | 신규 | `Project`, `ProjectListItem`, `RichText`, `NotionBlock` |
| `lib/notion/client.ts` | 신규 | `server-only` + `getNotionClient()` 시그니처. 환경 변수 누락 검사 |
| `lib/notion/queries.ts` | 신규 | `getPublishedProjects` / `getProjectBySlug` / `getProjectBlocks` 시그니처 |
| `lib/notion/mappers.ts` | 신규 | `mapPageToProject` / `mapBlock` 시그니처 |
| `package.json` | 수정 | `server-only` 의존성 추가 |
| `.env.example` | 참조 | 두 키가 이미 한국어 주석과 함께 존재 (변경 없음) |

## 수락 기준

- [x] `Project` 타입이 PRD §7.1 필드와 정확히 일치한다
- [x] `NotionBlock`이 §6.3 7종(paragraph, heading_1/2/3, bulleted/numbered_list_item, image, quote, divider, code)만 표현한다
- [x] `RichText`에 굵게·기울임·인라인 코드·링크 정보가 있다
- [x] `client.ts`·`queries.ts`에 `import "server-only"`가 있다
- [x] `.env.example`에 `NOTION_API_KEY`, `NOTION_PROJECTS_DATA_SOURCE_ID`가 있고 `NEXT_PUBLIC_` 접두사가 없다
- [x] `npx tsc --noEmit` 오류 0
- [x] `npm run lint` 오류 0
- [x] 코드 관례 준수: `any` 없음, `as unknown as` 없음, 주석은 한국어로 "왜"만

## 구현 단계

- [x] 1. `npm i server-only` 설치.
- [x] 2. `types.ts` 작성 — PRD §7.1·§6.3 기준.
- [x] 3. `client.ts`, `queries.ts`, `mappers.ts` 시그니처 작성. 본문은 `throw new Error("미구현: Task 009")` 또는 `null`.
- [x] 4. `.env.example` 확인.
- [x] 5. `npx tsc --noEmit` + `npm run lint` 오류 0 확인, `any`·`as unknown as` grep.
- [x] 6. 작업 파일 체크박스와 `ROADMAP.md`를 갱신하고 중단한다.

## 테스트 체크리스트

> 이 작업은 타입·시그니처만 다루고 어떤 페이지도 새 코드를 import하지 않으므로 브라우저 검증 대상이 없다. 정적 검증만 수행한다.

### 정적 검증

- [x] `npx tsc --noEmit` 오류 0
- [x] `npm run lint` 오류 0
- [x] `grep -rn "any\b\|as unknown as" lib/notion` 결과 없음
- [x] `grep -rL "server-only" lib/notion/client.ts lib/notion/queries.ts` 결과 없음

## 변경 사항 요약

- `server-only@0.0.1` 설치 (`package.json` dependencies).
- `lib/notion/types.ts` — `Project`(PRD §7.1 그대로), `ProjectListItem`(카드용 Pick), `RichText`(bold/italic/code/href), `NotionBlock` 7종 유니온 + `NotionBlockType`. 미지원 블록 variant는 두지 않음(매퍼가 `null`).
- `lib/notion/client.ts` — `import "server-only"`, `NOTION_ENV_KEYS` 상수, `getNotionEnv()`(누락 시 한국어 에러), `getNotionClient(): never` 자리(Task 009).
- `lib/notion/queries.ts` — 세 함수 시그니처, 본문 `throw new Error("미구현: Task 009")`.
- `lib/notion/mappers.ts` — 두 함수 시그니처, 본문 `return null`.
- 미사용 매개변수는 `void` 처리로 lint 경고 0 유지(언더스코어 접두사는 이 ESLint 설정에서 경고가 남음).
- `.env.example` — 두 키가 이미 존재해 변경 없음.
- 검증: `npx tsc --noEmit`·`npm run lint` 오류·경고 0. `any`·`as unknown as` grep 결과 없음.
