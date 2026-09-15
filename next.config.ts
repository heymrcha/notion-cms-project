import type { NextConfig } from "next"

import { NOTION_FILE_HOST } from "./lib/notion/file-host"

const nextConfig: NextConfig = {
  images: {
    // Notion 파일 URL 은 /<워크스페이스 ID>/<파일 ID>/<파일명>?X-Amz-… 형태다. 서명 쿼리가 매번 달라지므로
    // search 는 생략(와일드카드)하고, 경로는 워크스페이스 ID 로 좁혀 다른 워크스페이스 파일을 막는다
    remotePatterns: [
      {
        protocol: "https",
        hostname: NOTION_FILE_HOST,
        port: "",
        pathname: "/8aff250b-b25a-4cdc-ad51-11e31b962b85/**",
      },
    ],
  },
}

export default nextConfig
