import { SITE_CONFIG } from "@/lib/site-config"

export function Footer() {
  return (
    <footer className="border-t border-border/40">
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} {SITE_CONFIG.name}
        </p>
      </div>
    </footer>
  )
}
