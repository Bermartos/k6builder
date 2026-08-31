'use client'

import Link from 'next/link'
import { Activity, ArrowLeft, Github } from 'lucide-react'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeToggle } from '@/components/theme-toggle'
import { dictionary, type Language } from '@/lib/i18n'
import { cn } from '@/lib/utils'

const GITHUB_URL = 'https://github.com/Bermartos/k6builder'

export function EditorNav({ language }: { language: Language }) {
  const t = dictionary[language]

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-card px-4 md:px-6">
      <Link href="/" className="flex items-center gap-2.5">
        <Activity className="size-5 text-primary" aria-hidden="true" />
        <span className="text-sm font-semibold tracking-tight">k6builder</span>
      </Link>
      <span className="rounded-full border border-primary/40 bg-accent px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent-foreground">
        {t.editorBadge}
      </span>

      <nav className="ml-2 hidden items-center gap-1 md:flex">
        <Link
          href="/"
          className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {t.editorNavGenerator}
        </Link>
        <span
          aria-current="page"
          className={cn('rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground')}
        >
          {t.editorNavEditor}
        </span>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {t.editorNavGithub}
        </a>
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <Link
          href="/"
          className="hidden items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:flex"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          {t.editorBackButton}
        </Link>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub"
          className="flex size-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Github className="size-4" aria-hidden="true" />
        </a>
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </header>
  )
}
