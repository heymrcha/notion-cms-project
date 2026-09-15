# Task 004: 프로젝트 카드 및 목록 그리드 UI 구현

## 고수준 명세

- **목적**: `/projects`가 자리 문구 대신 더미 3건을 실제 카드 그리드로 렌더하게 만든다. Phase 1에서 확정한 `ProjectCard`·`ProjectGrid`·`EmptyState`·`ErrorState` 껍데기를 채우는 첫 UI 작업이다.
- **범위**: 카드·그리드·빈/오류 상태 스타일, 기간 포맷 유틸, 정렬 순수 함수, 목록 페이지 더미 연결까지. 상세 페이지(Task 005)·블록 렌더러(Task 006)·실데이터 연결(Task 010)·Cover 이미지(Task 012)는 다루지 않는다.
- **PRD 참조**: F1(목록), F6(빈·오류 상태), §6.1 정렬 규칙, §10 접근성·반응형·다크 모드
- **리스크·미결**: 없음. `ProjectListItem`에 `order`가 없으므로 정렬은 `Project[]` 단계에서 수행하고, 정렬 함수는 `Pick<Project, "order" | "periodStart">` 제약 제네릭으로 둔다.
- **전제 조건**: Task 003 완료(`lib/notion/mock-data.ts`, 컴포넌트 껍데기), shadcn `card`·`badge` 설치됨.

## 관련 파일

| 파일 | 변경 종류 | 설명 |
|---|---|---|
| `lib/format-period.ts` | 신규 | `formatPeriod(start, end)` — `2025.03 – 2025.08` / `2025.03 – 진행 중` |
| `lib/notion/sort-projects.ts` | 신규 | `sortProjects()` — `Order` desc → `Period Start` desc, 입력 불변 |
| `components/projects/project-card.tsx` | 수정 | shadcn `Card` + `Badge`, 제목 `<Link>`만 링크 |
| `components/projects/project-grid.tsx` | 수정 | `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` |
| `components/projects/empty-state.tsx` | 수정 | 점선 박스 + 문구, `role="status"` |
| `components/projects/error-state.tsx` | 수정 | 점선 박스 + 문구, `role="alert"` |
| `app/projects/page.tsx` | 수정 | 더미 연결, `null` → 오류 / `[]` → 빈 상태 / 그 외 그리드 |
| `lib/notion/mock-data.ts` | 참조 | `MOCK_PROJECTS` (변경 없음) |

## 수락 기준

- [x] `/projects`에 카드 3장이 `구독 결제 전환율 개선` → `온보딩 플로우 재설계` → `운영 어드민 대시보드 구축` 순으로 보인다 (`order` 10이 최신 건보다 위)
- [x] 카드에 제목·`Outcome`·기간·`Tags` 배지가 보이고, 온보딩 카드 기간이 `2025.09 – 진행 중`이다
- [x] 제목 링크만 `/projects/[slug]`로 이동한다 (카드 전체 링크 아님)
- [x] 375px 1열 / 768px 2열 / 1280px 3열, 가로 스크롤 없음
- [x] 빈 상태·오류 상태 컴포넌트가 목록 페이지에서 조건부로 렌더되는 경로가 있다
- [x] `npx tsc --noEmit` 오류 0
- [x] `npm run lint` 오류 0
- [x] 코드 관례 준수: `any` 없음, 신규 컴포넌트는 서버 컴포넌트, 색은 토큰만, 컨테이너 `container mx-auto max-w-screen-2xl px-4`, 클래스 조합 `cn()`

## 구현 단계

- [x] 1. `next/link` 로컬 문서(`node_modules/next/dist/docs/01-app/03-api-reference/02-components/link.md`)와 shadcn `card`·`badge` 소스를 확인한다.
- [x] 2. `lib/format-period.ts`, `lib/notion/sort-projects.ts`를 작성한다.
- [x] 3. `project-card.tsx` → `project-grid.tsx` → `empty-state.tsx` / `error-state.tsx`를 채운다.
- [x] 4. `app/projects/page.tsx`에 더미를 연결하고 빈·오류 상태 분기를 둔다.
- [x] 5. `npx tsc --noEmit` + `npm run lint` 오류 0 확인.
- [x] 6. 아래 테스트 체크리스트를 Playwright MCP로 수행한다.
- [x] 7. 체크박스를 갱신하고 `ROADMAP.md`의 Task 004를 ✅로 표시한다. 완료 후 중단하고 다음 지시를 기다린다.

## 테스트 체크리스트

> 개발 서버(`npm run dev`, 포트 3000)를 먼저 띄운다.

### 정상 흐름

- [x] `http://localhost:3000/projects` 진입 → 카드 3장이 기대 순서로 렌더된다 (스냅샷으로 제목 순서 확인)
- [x] 첫 카드의 제목 링크 `href`가 `/projects/subscription-checkout`이고, 클릭 시 상세 자리 페이지로 이동한다
- [x] 브라우저 뒤로 가기 → 목록으로 복귀한다

### 예외·엣지 케이스

- [x] 페이지 상수를 `[]`로 바꾸면 "아직 발행된 프로젝트가 없습니다."가 보인다 (확인 후 원복)
- [x] 페이지 상수를 `null`로 바꾸면 "프로젝트를 불러오지 못했습니다."가 보인다 (확인 후 원복)

### 반응형·다크 모드·접근성

- [x] 뷰포트 375px / 768px / 1280px에서 가로 스크롤이 없다 (`document.documentElement.scrollWidth <= innerWidth`)
- [x] 375px에서 1열, 768px에서 2열, 1280px에서 3열이다
- [x] 테마 토글로 다크 모드 전환 → 텍스트·배경 대비가 유지된다
- [x] 접근성 스냅샷에서 제목 링크에 접근 가능한 이름이 있고 heading 레벨이 건너뛰지 않는다

### 정적 검증

- [x] `npx tsc --noEmit` 오류 0
- [x] `npm run lint` 오류 0

## 변경 사항 요약

- `lib/format-period.ts` 신규 — `formatPeriod(start, end)`. ISO 문자열 앞 7자만 잘라 `2025.03 – 2025.08` / `2025.09 – 진행 중`으로 만든다(Date 변환 시 타임존으로 월이 어긋나는 문제 회피).
- `lib/notion/sort-projects.ts` 신규 — `sortProjects<T extends Pick<Project, "order" | "periodStart">>()`. 복사본을 정렬해 입력 불변, `Order` desc → `Period Start` desc. `ProjectListItem`에 `order`가 없어 제네릭 제약으로 `Project`·`ProjectListItem` 모두 수용.
- `components/projects/project-card.tsx` — shadcn `Card` + `Badge(secondary)`. 제목 `<Link>`만 링크(접근 가능한 이름 = 제목 텍스트), `summary` 2줄 클램프, `outcome` 강조, `<time dateTime>` 기간, `tags` 비면 footer 생략.
- `components/projects/project-grid.tsx` — `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`.
- `components/projects/empty-state.tsx` / `error-state.tsx` — 점선 박스, `role="status"` / `role="alert"`. 오류 문구에 "잠시 후 다시 시도해 주세요." 추가.
- `app/projects/page.tsx` — `Project[] | null` 상수로 더미 연결. `null` → `ErrorState`, `[]` → `EmptyState`, 그 외 `ProjectGrid`. Task 010에서 `getPublishedProjects()`로 교체할 지점에 TODO.
- 검증: tsc·lint 오류 0. Playwright MCP — 1280px 3열 / 768px 2열 / 375px 1열, 가로 스크롤 없음, 카드 순서 `구독 결제` → `온보딩` → `어드민`(order 10 우선 확인), 기간 표기, 배지 8개, 제목 링크 클릭 → 상세 → 뒤로 가기 복귀, 다크 모드 대비 정상, 빈·오류 상태 SSR 출력 확인 후 원복.
