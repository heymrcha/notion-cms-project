# Task 007: 홈 히어로 및 최근 프로젝트 3건 섹션 구현

## 고수준 명세

- **목적**: 홈(`/`)에 "최근 프로젝트" 섹션을 추가해 채용 담당자가 첫 화면에서 대표 프로젝트 3건을 바로 보게 한다(PRD §5). Phase 2(더미 데이터 UI)의 마지막 Task.
- **범위**: `app/page.tsx`에 섹션 추가(정렬 규칙 상위 3건, `ProjectGrid` 재사용, "전체 보기" 링크, 0건이면 섹션 숨김). 히어로는 이미 `SITE_CONFIG` 참조 + `/projects` CTA가 완성돼 있어 점검만. F5 잔여 항목 최종 점검. 실데이터 연결은 Task 010.
- **PRD 참조**: §5 라우트 표(`/`), F5, §10 반응형·다크 모드
- **리스크·미결**: 없음.
- **전제 조건**: Task 004(`ProjectGrid`, `sortProjects`), Task 006 완료.

## 관련 파일

| 파일 | 변경 종류 | 설명 |
|---|---|---|
| `app/page.tsx` | 수정 | 히어로 아래 "최근 프로젝트" 섹션 추가 |
| `components/projects/project-grid.tsx` | 참조 | 재사용 (변경 없음) |
| `lib/notion/sort-projects.ts` | 참조 | 정렬 (변경 없음) |
| `lib/notion/mock-data.ts` | 참조 | `MOCK_PROJECTS` (변경 없음, Task 010에서 삭제) |

## 수락 기준

- [x] `/`에 `<h2>최근 프로젝트</h2>` 섹션과 카드 3장이 `구독 결제` → `온보딩` → `어드민` 순으로 보인다
- [x] "전체 보기" 링크의 href가 `/projects`이다
- [x] 프로젝트가 0건이면 섹션 자체가 렌더되지 않는다(빈 상태 문구 없음)
- [x] 히어로가 `SITE_CONFIG.name`/`description`을 쓰고 `/projects` CTA가 있다
- [x] F5 최종 점검: `SITE_CONFIG` 포트폴리오 값 / `app/docs` 없음 / `v1.0.0` 배지 없음 / 히어로 / 최근 3건
- [x] 375px / 1280px에서 가로 스크롤이 없다
- [x] `npx tsc --noEmit` 오류 0
- [x] `npm run lint` 오류 0
- [x] 코드 관례 준수: `any` 없음, 서버 컴포넌트, 색은 토큰만, 컨테이너 `container mx-auto max-w-screen-2xl px-4`

## 구현 단계

- [x] 1. `app/page.tsx` 현재 상태와 `ProjectGrid` props를 확인한다.
- [x] 2. 섹션을 추가한다(`sortProjects(MOCK_PROJECTS).slice(0, 3)`, 0건이면 `null`).
- [x] 3. F5 항목을 grep으로 점검한다.
- [x] 4. `npx tsc --noEmit` + `npm run lint` 오류 0 확인.
- [x] 5. 아래 테스트 체크리스트를 Playwright MCP로 수행한다.
- [x] 6. 체크박스를 갱신하고 `ROADMAP.md`의 Task 007을 ✅로 표시한다. 완료 후 커밋한다(연속 실행 모드).

## 테스트 체크리스트

> 개발 서버(`npm run dev`, 포트 3000)를 먼저 띄운다.

### 정상 흐름

- [x] `/` 진입 → 히어로 + "최근 프로젝트" `<h2>` + 카드 3장 순서 확인
- [x] "전체 보기" 클릭 → `/projects`
- [x] 카드 제목 클릭 → 상세 이동

### 예외·엣지 케이스

- [x] `.slice(0, 0)` 임시 적용 → 섹션이 DOM에 없고 히어로만 보임(확인 후 원복)

### 반응형·다크 모드·접근성

- [x] 375px / 1280px 가로 스크롤 없음, 1280px에서 3열
- [x] 다크 모드 대비 유지
- [x] heading 순서 `h1`(히어로) → `h2`(최근 프로젝트)

### 정적 검증

- [x] `npx tsc --noEmit` 오류 0
- [x] `npm run lint` 오류 0

## 변경 사항 요약

- `app/page.tsx` — 히어로 아래 "최근 프로젝트" 섹션 추가. `sortProjects(MOCK_PROJECTS).slice(0, 3)`를 `ProjectGrid`로 렌더하고 "전체 보기"(`/projects`) 링크를 둔다. 0건이면 `&&`로 섹션 자체를 렌더하지 않는다(홈은 빈 상태 문구 없음). Task 010에서 `getPublishedProjects()`로 교체할 TODO.
- 히어로는 이미 `SITE_CONFIG.name`/`description` + `/projects` CTA로 완성돼 있어 손대지 않음.
- F5 최종 점검: `SITE_CONFIG` 포트폴리오 값 ✅ / `app/docs` 없음 ✅ / `v1.0.0` 배지 없음 ✅ / 히어로 ✅ / 최근 3건 ✅ — F5 전 항목 완료.
- 검증: tsc·lint 0. Playwright — `/` heading `H1 → H2`, 카드 3장 정렬 순(구독→온보딩→어드민), 1280px 3열·375px 1열, 가로 스크롤 없음, "전체 보기" href `/projects`, CTA "프로젝트 보기", 다크 모드 대비 정상, `.slice(0, 0)` 시 섹션·카드 DOM에 없음(원복 완료).
