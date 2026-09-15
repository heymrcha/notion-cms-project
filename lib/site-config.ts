export const SITE_CONFIG = {
  name: "PM 포트폴리오",
  description:
    "프로덕트 매니저의 프로젝트 포트폴리오 — 어떤 프로젝트에서 어떤 역할로 무슨 성과를 냈는지 소개합니다.",
  // 절대 URL 이 필요한 곳(sitemap, robots, OG)의 기준. 도메인이 정해지면 여기만 바꾼다 (U3, Task 014 에서 Vercel 프로덕션 도메인으로 확정)
  siteUrl: "https://notion-cms-project-kohl.vercel.app",
  // 공개 연락처. 빈 문자열이면 미설정으로 보고 /about 연락 섹션에서 제외한다 (전부 비면 섹션 자체를 숨김)
  contact: {
    email: "",
    linkedin: "",
    github: "",
  },
  navLinks: [
    { href: "/", label: "홈" },
    { href: "/projects", label: "프로젝트" },
    { href: "/about", label: "소개" },
  ],
} as const
