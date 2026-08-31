'use client'

import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { EditorNav } from '@/components/editor/editor-nav'
import { FileExplorer } from '@/components/editor/file-explorer'
import { CodeWorkbench } from '@/components/editor/code-workbench'
import { useLanguage } from '@/components/language-switcher'
import { findFile } from '@/lib/editor-files'

export function EditorPageClient() {
  const { language, t } = useLanguage()
  const [activePath, setActivePath] = useState('main.js')

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const activeFile = findFile(activePath) ?? findFile('main.js')!

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <EditorNav language={language} />

      <div className="flex items-center gap-2 border-b border-border bg-accent/40 px-4 py-2 text-xs text-accent-foreground md:px-6">
        <Sparkles className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
        <p className="leading-relaxed text-pretty">
          <span className="font-medium">{t.editorHeroKicker}.</span> {t.editorHeroDescription}
        </p>
      </div>

      <div className="flex min-h-0 flex-1">
        <FileExplorer language={language} activePath={activeFile.path} onSelect={setActivePath} />
        <CodeWorkbench language={language} file={activeFile} />
      </div>
    </div>
  )
}
