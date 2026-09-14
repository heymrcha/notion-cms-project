# Task 003: 프로젝트 컴포넌트 골격 및 더미 데이터 유틸리티 작성

## 고수준 명세

- **목적**: Phase 2 UI 작업(Task 004~007)이 바로 착수할 수 있도록 `components/projects/*` 여섯 개의 props 계약을 확정하고, `types.ts`를 따르는 더미 데이터를 준비한다.
- **범위**: 컴포넌트 껍데기(props 타입 + 최소 JSX)와 `lib/notion/mock-data.ts`까지. 실제 스타일·마크업은 Task 004~006, 페이지 연결은 Task 004·005에서 다룬다.
- **PRD 참조**: §6.3 블록, §7 데이터 흐름(컴포넌트 목록), F1·F2·F6
- **리스크·미결**: 없음. 단, `NotionBlock` 유니온에 미지원 variant가 없어 타입 안전한 `MOCK_BLOCKS`에는 미지원 블록을 넣을 수 없다. Notion API 원형 모양의 `MOCK_RAW_UNSUPPORTED_BLOCK: unknown`을 별도 export 해 Task 009 `mapBlock` 스킵 검증에 쓴다.
- **전제 조건**: Task 002 완료(`lib/notion/types.ts`).

## 관련 파일

| 파일 | 변경 종류 | 설명 |
|---|---|---|
| `components/projects/project-card.tsx` | 신규 | `ProjectCard({ project: ProjectListItem })` |
| `components/projects/project-grid.tsx` | 신규 | `ProjectGrid({ projects: ProjectListItem[] })` |
| `components/projects/project-header.tsx` | 신규 | `ProjectHeader({ project: Project })` |
| `components/projects/notion-blocks.tsx` | 신규 | `NotionBlocks({ blocks: NotionBlock[] })` |
| `components/projects/empty-state.tsx` | 신규 | `EmptyState({ className? })` |
| `components/projects/error-state.tsx` | 신규 | `ErrorState({ className? })` |
| `lib/notion/mock-data.ts` | 신규 | `MOCK_PROJECTS`, `MOCK_BLOCKS`, `MOCK_RAW_UNSUPPORTED_BLOCK` (Task 010에서 삭제) |
| `lib/notion/types.ts` | 참조 | 계약 (변경 없음) |

## 수락 기준

- [x] 여섯 컴포넌트가 named export 이고 props 타입이 `lib/notion/types.ts`를 참조한다
- [x] `components/projects/*`에 `"use client"`가 없다
- [x] `MOCK_PROJECTS`가 3건이며 `order`·`periodStart`가 정렬 검증에 유효하게 분산되고, 1건은 `periodEnd: null`, 1건은 `externalUrl` 있음
- [x] `MOCK_BLOCKS`에 §6.3 7종이 모두 있고, 굵게·기울임·인라인 코드·링크 `RichText`와 연속 리스트 항목이 포함된다
- [x] `npx tsc --noEmit` 오류 0
- [x] `npm run lint` 오류 0
- [x] 코드 관례 준수: `any` 없음, 신규 컴포넌트는 서버 컴포넌트, 색은 토큰만, 클래스 조합 `cn()`

## 구현 단계

- [x] 1. `lib/notion/types.ts`와 기존 컴포넌트 스타일(`components/layout/footer.tsx`)을 확인한다.
- [x] 2. 컴포넌트 여섯 개를 props 타입 + 최소 JSX + TODO 주석으로 작성한다.
- [x] 3. `lib/notion/mock-data.ts`를 작성한다.
- [x] 4. `npx tsc --noEmit` + `npm run lint` 오류 0, `"use client"` grep 결과 없음 확인.
- [x] 5. 작업 파일 체크박스와 `ROADMAP.md`를 갱신하고 중단한다.

## 테스트 체크리스트

> 이 작업의 컴포넌트는 아직 어떤 페이지에도 연결되지 않으므로 브라우저 검증 대상이 없다(연결은 Task 004·005). 정적 검증만 수행한다.

### 정적 검증

- [x] `npx tsc --noEmit` 오류 0
- [x] `npm run lint` 오류 0
- [x] `grep -rl "use client" components/projects` 결과 없음
- [x] `grep -rn "\bany\b" components/projects lib/notion` 결과 없음

## 변경 사항 요약

- `components/projects/` 여섯 개 신규(전부 서버 컴포넌트, named export, props 타입은 `lib/notion/types.ts` 참조): `ProjectCard`, `ProjectGrid`(카드 map + `cn()`), `ProjectHeader`, `NotionBlocks`, `EmptyState`, `ErrorState`. 각 파일에 담당 Task 를 명시한 TODO 주석.
- `lib/notion/mock-data.ts` 신규 — `MOCK_PROJECTS` 3건(order 10/0/0, periodStart 2025-03/2025-09/2024-06 으로 정렬 규칙 검증 가능, 1건 `periodEnd: null`, 1건 `externalUrl`), `MOCK_BLOCKS` 14개(7종 전부·인라인 서식 4종·연속 bulleted 3개·numbered 2개), `MOCK_RAW_UNSUPPORTED_BLOCK: unknown`(toggle, Task 009 스킵 검증용).
- 검증: `npx tsc --noEmit`·`npm run lint` 오류·경고 0. `"use client"`·`any` grep 결과 없음.
