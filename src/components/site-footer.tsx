'use client'

import { ExternalLink, GitBranch } from 'lucide-react'
import { useLanguage } from '@/components/language-switcher'

export function SiteFooter() {
  const { t } = useLanguage()

  return (
    <footer className="mx-auto flex w-full max-w-7xl flex-col gap-3 border-t border-border px-4 py-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8 lg:px-12">
      <p className="leading-relaxed">
        k6 Builder — {t.footerTagline}
      </p>
      <nav aria-label={t.externalLinksLabel} className="flex items-center gap-4">
        <a
          href="https://github.com/Bermartos/k6builder"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 transition-colors hover:text-foreground"
        >
          <GitBranch className="size-3.5" aria-hidden="true" />
          GitHub
        </a>
        <a
          href="https://www.linkedin.com/in/daniel-bermejo-martos-3170b42b"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 transition-colors hover:text-foreground"
        >
          <ExternalLink className="size-3.5" aria-hidden="true" />
          LinkedIn
        </a>
      </nav>
    </footer>
  )
}
