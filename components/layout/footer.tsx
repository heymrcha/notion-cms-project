import Link from "next/link"

import { SITE_CONFIG } from "@/lib/site-config"

export function Footer() {
  return (
    <footer className="border-t border-border/40">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0 px-4">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            <Link
              href="/"
              className="font-medium underline underline-offset-4"
            >
              {SITE_CONFIG.name}
            </Link>
            로 구축되었습니다. 소스 코드는{" "}
            <a
              href={SITE_CONFIG.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              GitHub
            </a>
            에서 확인할 수 있습니다.
          </p>
        </div>
        <div className="flex items-center space-x-1">
          <p className="text-sm text-muted-foreground">
            © 2025 All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
