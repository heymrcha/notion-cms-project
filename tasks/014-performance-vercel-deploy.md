# Task 014: 성능 검증 및 Vercel 배포 (S4·U2)

## 고수준 명세

- **목적**: 프로덕션 빌드 기준 `/projects` 모바일 LCP 2.5초 이내·CLS 0.1 이하를 수치로 확인하고(S4), Vercel에 배포해 실제 환경에서 ISR(S1~S3)이 기대대로 동작하는지 검증한다(U2). README에 Notion 설정·배포 절차를 정리한다.
- **범위**: Lighthouse 측정(로컬 프로덕션 → 배포 URL), Vercel 배포(사용자 수작업 구간 명시), README 갱신, `siteUrl` 확정(U3). 온디맨드 재검증은 Task 015.
- **PRD 참조**: S4, §8, §10 성능, §13 M3, §14 U2·U3
- **리스크·미결**:
  - U2 — Vercel 확정. 비-Vercel 전환 시 §8 재검토 항목을 README 리스크 절에 유지.
  - U3 — 배포 후 실제 도메인으로 `SITE_CONFIG.siteUrl` 교체.
  - Vercel 로그인·프로젝트 생성·환경 변수 입력은 **사용자가 직접** 한다(자격 증명 입력 금지). 이 구간에서 작업을 멈추고 안내한다.
  - 로컬 `next start`는 Vercel 엣지·CDN이 없으므로 LCP가 보수적으로 나온다. 배포 후 같은 측정을 반복한다.
- **전제 조건**: Task 013 완료, 원격 `main` 최신.

## 관련 파일

| 파일 | 변경 종류 | 설명 |
|---|---|---|
| `README.md` | 수정 | 현재 상태·Notion 설정 절차·배포 절차·리스크 |
| `lib/site-config.ts` | 수정(배포 후) | `siteUrl` 실제 도메인 |
| `tasks/014-performance-vercel-deploy.md` | 신규 | 측정 수치 기록 |

## 수락 기준

- [x] 로컬 프로덕션 Lighthouse(모바일 프리셋) `/projects` LCP ≤ 2.5s, CLS ≤ 0.1 — 수치 기록
- [x] README에 Notion 설정(통합 생성 → DB 연결 권한 → data source ID 확인 → `.env.local`)과 Vercel 배포 절차가 한국어로 있다
- [x] README "현재 상태"가 기획 단계 문구에서 구현 완료 상태로 갱신됐다
- [ ] Vercel 배포 URL에서 `/projects` 200, Lighthouse 재측정 수치 기록
- [ ] 배포 URL에서 S1·S2·S3 재검증
- [ ] `SITE_CONFIG.siteUrl`이 실제 배포 도메인
- [x] `npx tsc --noEmit` 오류 0
- [x] `npm run lint` 오류 0

## 구현 단계

- [x] 1. `npm run build && npm run start -p 3001` 후 `npx lighthouse`(모바일 프리셋, headless)로 `/projects` 측정.
- [x] 2. 미달 시 이미지 `priority`/`sizes`·폰트·카드 수 조정 후 재측정.
- [x] 3. README 갱신.
- [ ] 4. Vercel 연결·환경 변수 등록(사용자 수작업) — 안내 후 대기.
- [ ] 5. 배포 URL에서 Lighthouse·S1~S3 재검증, `siteUrl` 확정.
- [ ] 6. 체크박스 갱신, `ROADMAP.md` Task 014 ✅.

## 테스트 체크리스트

### 정상 흐름

- [x] 로컬 프로덕션 Lighthouse 모바일: LCP·CLS·FCP·TBT 수치
- [ ] 배포 URL Lighthouse 모바일: 동일 수치
- [ ] 배포 URL: `/`, `/projects`, `/projects/subscription-checkout`, `/sitemap.xml`, `/robots.txt` 200

### 예외·엣지 케이스

- [ ] 배포 URL S3: Notion `Published` 해제 → 60초 후 목록 제외·상세 404 → 원복
- [ ] 배포 URL S2: 제목 수정 → 60초 후 반영 → 원복
- [ ] 배포 URL 없는 slug 404

### 정적 검증

- [x] `npx tsc --noEmit` 오류 0
- [x] `npm run lint` 오류 0

## 진행 기록 (1/2 — 로컬 측정·README, 배포 대기)

### 로컬 프로덕션 Lighthouse (`npx lighthouse --preset=perf --form-factor=mobile --throttling-method=simulate`, headless Chrome)

| 회차 | 조건 | LCP | CLS | FCP | TBT | 점수 |
|---|---|---|---|---|---|---|
| 1 | 초기 상태(`priority`) | 2.9s | 0 | 0.8s | 0ms | 95 |
| 2·3 | `loading="eager"` + `fetchPriority="high"` | 3.1s / 2.7s | 0 | 0.8s | 0ms | 94 / 97 |
| 4 | + Geist Mono `preload: false` (콜드) | 2.9s | 0 | 0.8s | 0ms | 95 |
| 5·6 | 같은 조건(웜) | **2.5s / 2.5s** | **0** | 0.8s | 0ms | 97 |

- LCP 요소는 첫 카드 커버 이미지(750w webp 15KB). 관측 로드 시간은 6ms지만 시뮬레이션(1.6Mbps·RTT 150ms)에서 총 전송 ~318KB(JS 185KB, 폰트 52→29KB, favicon 26KB, CSS 10KB)와 대역폭을 나눠 써 LCP가 밀린다.
- 조치 1: Next 16에서 `priority`는 deprecated(`image.md` §preload) → `CoverImage`를 `loading="eager"` + `fetchPriority="high"`로 변경(prop `eager`). Lighthouse의 "fetchpriority=high 없음" 지적 해소.
- 조치 2: `Geist_Mono`는 코드 블록에서만 쓰이는데 모든 페이지에서 High 우선순위로 프리로드됨 → `preload: false`. 폰트 전송 52KB → 29KB.
- 남은 여지(미적용): `public/favicon.ico` 26KB(스타터 잔재, 디자인 결정 필요), Navbar의 Radix 드롭다운·next-themes 번들(unused JS 49KB 추정). Vercel은 Brotli·HTTP/2·CDN이라 로컬 `next start`(gzip)보다 유리하므로 **배포 URL 측정을 최종 판정**으로 삼는다.

### README

- "현재 상태"를 구현 완료·배포 단계로 갱신, Notion 설정 절차 5단계(통합 → DB 스키마 → 연결 권한 → data source ID 조회 명령 → 확인), 콘텐츠 작성 규칙(Published·heading_1·지원 블록·Order·60초), Vercel 배포 절차 5단계, 호스팅 변경 시 재검토 항목, 프로젝트 구조 트리 최신화.

### 대기 중 — 사용자 수작업

1. GitHub `main`을 최신으로 푸시(위 변경 포함).
2. Vercel에서 저장소 Import, 환경 변수 `NOTION_API_KEY`·`NOTION_PROJECTS_DATA_SOURCE_ID` 등록, Deploy.
3. 배포 URL을 알려 주면 Lighthouse 재측정·S1~S3 재검증·`siteUrl` 확정을 이어서 진행한다.
