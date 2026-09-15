# Task 011-1: 핵심 기능 통합 테스트 (Playwright MCP)

## 고수준 명세

- **목적**: PRD §3 성공 기준(S1·S2·S3·S5·S6)과 §11 에러·예외 처리를 실제 Notion 데이터·환경 변수 조작으로 한 번에 검증하고, 발견된 버그만 수정한다.
- **범위**: 검증과 버그 수정. 새 기능·리팩터링은 하지 않는다. S2·S3는 Task 011에서 프로덕션 ISR로 실측 완료했으므로 결과를 인용하고, 이 Task는 S1·S5·엣지·플로우·반응형을 수행한다.
- **PRD 참조**: §3 S1~S6, §11, F1·F2·F3·F6, §10 반응형·다크 모드·접근성
- **리스크·미결**: Notion 데이터 조작(행 추가·속성 비움·Published 해제)과 `.env.local` 변경은 시나리오 종료 즉시 원복한다. API 키 값은 읽지도 출력하지도 않는다(`sed`로 치환, 백업 파일로 복원).
- **전제 조건**: Task 011 완료, Notion MCP로 Projects Database 편집 가능, `.env.local` 유효.

## 관련 파일

| 파일 | 변경 종류 | 설명 |
|---|---|---|
| `docs/PRD.md` | 참조 | §3 성공 기준, §11 에러 처리 |
| `tasks/011-isr-production-build.md` | 참조 | S2·S3 실측 기록 |
| `lib/notion/mappers.ts` | 참조 | 필수 속성 누락 경고, 중복 slug 처리 위치 |
| (버그 발견 시) | 수정 | 발견된 결함에 한정 |

## 수락 기준

- [x] S1: Notion에 프로젝트 1건 추가 + `Published` 체크 → 프로덕션 60초 후 목록·상세(빌드 시 없던 slug → `dynamicParams`로 생성)에 나타난다
- [x] S2·S3: Task 011 실측 기록 인용(통과)
- [x] S5: 잘못된 `NOTION_API_KEY` → 목록 ErrorState, 홈 섹션 숨김, 상세 404, 흰 화면 없음. 잘못된 `NOTION_PROJECTS_DATA_SOURCE_ID`도 동일
- [x] S6: `npx tsc --noEmit` + `npm run lint` 오류 0
- [x] 엣지 1: 필수 속성 누락 행 → 해당 행만 제외 + 서버 경고(페이지 ID·누락 속성명)
- [x] 엣지 2: `Slug` 중복 행 → 정렬상 첫 행 채택 + 경고
- [x] 엣지 3: 발행 0건 → EmptyState(404 아님), 홈 섹션 숨김
- [x] 엣지 4: 미지원 블록(토글) → 스킵, 오류 없음
- [x] 플로우: `/` → `/projects` → 상세 → 외부 링크(새 탭) → 뒤로 → 다른 상세
- [x] 375/768/1280 가로 스크롤 없음, 다크 모드 대비 유지
- [x] 조작한 Notion 데이터·`.env.local` 원복 확인

## 구현 단계

- [x] 1. Notion Projects Database 스키마·현재 4행 확인.
- [x] 2. S5(개발 서버, env 조작) → 원복.
- [x] 3. 엣지 1·2·3(개발 서버, Notion 조작) → 원복.
- [x] 4. 플로우·반응형·다크 모드·엣지 4(개발 서버, 실데이터).
- [x] 5. S1(프로덕션 빌드·ISR) → 원복(추가 행 삭제 또는 미발행 처리).
- [x] 6. S6 정적 검증. 발견 버그 수정 시 재검증.
- [x] 7. 체크박스 갱신, `ROADMAP.md` Task 011-1 ✅. 완료 후 중단하고 다음 지시를 기다린다.

## 테스트 체크리스트

> 개발 서버(`npm run dev`, 포트 3000)는 재검증 대기 없이 즉시 반영되므로 S5·엣지·플로우에 쓴다. S1은 프로덕션(`build` + `start -p 3001`)에서 60초 대기로 측정한다.

### 정상 흐름

- [x] `/` 최근 3건 → "전체 보기" → `/projects` 3건 → 첫 카드 → 상세 `<h1>` 일치 → 외부 링크 `target=_blank rel=noreferrer` → 뒤로 → 두 번째 카드 상세
- [x] S1 프로덕션: 신규 행 발행 → +62s 1회차 → +65s 2회차에 목록 4건, `/projects/<new-slug>` 200

### 예외·엣지 케이스

- [x] 잘못된 `NOTION_API_KEY` → `/projects` `role=alert` 안내, `/` 섹션 없음, 상세 404, 서버 로그 `unauthorized`
- [x] 잘못된 `NOTION_PROJECTS_DATA_SOURCE_ID` → 동일 UI, 서버 로그 `object_not_found`(또는 `validation_error`)
- [x] 필수 속성(`Slug`) 비운 행 추가 → 목록 3건 유지, 서버 `console.warn`에 페이지 ID + `Slug`
- [x] `Slug`=`admin-dashboard` 중복 행(Order 낮음) 추가 → 목록 3건, 상세는 첫 행 내용, 서버 경고
- [x] 전부 `Published` 해제 → `/projects` EmptyState(`role=status`, 200), `/` 섹션 없음
- [x] 상세 본문의 토글 블록 → DOM에 없음, 서버 오류 없음

### 반응형·다크 모드·접근성

- [x] 375/768/1280 `scrollWidth <= innerWidth` (목록·상세)
- [x] 다크 모드 스크린샷 대비
- [x] 접근성 스냅샷: 제목 링크 이름, `img[alt]`, heading 레벨 연속

### 정적 검증

- [x] `npx tsc --noEmit` 오류 0
- [x] `npm run lint` 오류 0

## 변경 사항 요약

### 결과 (모두 통과)

| 항목 | 결과 |
|---|---|
| S1 (프로덕션) | 빌드 후 Notion에 `s1-new-project` 추가·발행 → t0 목록 3·상세 404(HIT) → +62s STALE → +65s 목록 4·상세 200. `generateStaticParams`에 없던 slug가 `dynamicParams`로 생성됨 |
| S2·S3 | Task 011 실측 인용(제목 수정 반영, Published 해제 → 목록 제외·404, 원복 복귀) |
| S5 | 잘못된 `NOTION_API_KEY` → 목록 `role=alert` "프로젝트를 불러오지 못했습니다", 홈 섹션 없음, 상세 404, 로그 `unauthorized: API token is invalid.`. 잘못된 `NOTION_PROJECTS_DATA_SOURCE_ID` → 동일 UI, 로그 `object_not_found`. 두 경우 모두 흰 화면 없음(h1·안내 문구 렌더). `.env.local`은 백업과 `cmp` 일치 확인 |
| S6 | `npx tsc --noEmit` 0, `npm run lint` 0 |
| 엣지 1 | `Slug` 빈 발행 행 → 목록 3건 유지, 로그 `페이지 <id> 제외 — 필수 속성 누락 또는 타입 불일치: Slug` |
| 엣지 2 | **버그 발견·수정** (아래) |
| 엣지 3 | 전부 `Published` 해제 → `/projects` 200 + `role=status` "아직 발행된 프로젝트가 없습니다.", 홈 섹션 없음 |
| 엣지 4 | 상세 본문 토글 → DOM에 없음(`details` 0, 텍스트 미노출), 서버 오류 없음 |
| 플로우 | `/` → 전체 보기 → `/projects` → 첫 카드 → 상세(h1 일치, `<title>` 형식) → 외부 링크 버튼(`target=_blank rel=noreferrer`, 새 탭 `example.com/subscription`) → 뒤로 → 두 번째 상세("2025.09 – 진행 중", 외부 링크 버튼 없음) |
| 반응형 | 375/768/1280 열 수 1/2/3, 목록·상세 `scrollWidth <= innerWidth` |
| 다크 모드 | `.dark`에서 배경 `lab(2.75)` / 글자 `lab(98.26)`, 스크린샷 대비 양호 |
| 접근성 | 제목 링크 이름 있음, `img[alt]` 누락 0, heading `h1→h2→h3` 연속(아래 콘텐츠 수정 후) |

### 버그 수정: 중복 slug·정렬 규칙 (`lib/notion/queries.ts`)

- **증상**: `Slug`가 같은 행(`Order -1`)을 추가하자 원래 행(`Order` 비어 있음) 대신 새 행이 목록·상세 모두에 채택됐다.
- **원인**: Notion 서버 정렬은 `Order`가 빈 행을 방향과 무관하게 맨 뒤로 보낸다. 앱은 빈 값을 0으로 매핑하지만 정렬은 서버 결과를 그대로 믿었기 때문에 "비어 있으면 0 취급"(PRD §6.1)이 지켜지지 않았다. 음수 `Order`가 없어도, 빈 `Order` 행이 `Order 0` 행보다 뒤로 밀리는 문제가 잠재해 있었다.
- **수정**: 매핑 후 `sortProjects`(Task 004의 순수 함수)로 다시 정렬한 뒤 `dedupeBySlug`. 서버 정렬은 안정 정렬의 동점 순서를 고정하기 위해 유지. 경고 문구를 "채택 ID / 제외 ID"가 드러나게 변경.
- **재검증**: 같은 데이터로 목록·상세가 원래 행을 채택하고 경고에 두 ID가 찍힘.

### 콘텐츠 수정 (Notion)

- 세 프로젝트 본문의 최상위 heading을 `heading_2` → `heading_1`(하위는 한 단계씩 상향)으로 바꿔 사이트에서 `h1→h2→h3`가 되게 했다(§10 접근성). Task 010에서 미뤄 둔 항목.

### R6 추가 관찰

- S1 경로에서도 재현: 발행 전에 그 URL이 404로 캐시돼 있으면, 발행 후 첫 재생성본은 본문은 정상이나 `<title>` 기본값 + `noindex`가 한 주기(≤60초) 남는다. ROADMAP R6에 반영.

### 원복 확인

- Notion: 테스트 행 3건(`[TEST]` 2건, `[S1]` 1건)은 앱 통합 권한으로 `archived: true` 처리, 실제 3건 `Published` 복귀, 목록 3건 확인.
- `.env.local`: 백업과 바이트 단위 일치.
