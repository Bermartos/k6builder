'use client'

import { useState } from 'react'
import { Check, Copy, Download, Terminal } from 'lucide-react'
import { dictionary, type Language } from '@/lib/i18n'
import { CodeLines } from '@/lib/highlight-code'

export function ScriptPreview({
  language,
  script,
  onGenerate,
  disabled,
}: {
  language: Language
  script: string | null
  onGenerate: () => void
  disabled: boolean
}) {
  const t = dictionary[language]
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    if (!script) return
    try {
      await navigator.clipboard.writeText(script)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch (error) {
      console.log('[v0] clipboard error:', error)
    }
  }

  const download = () => {
    if (!script) return
    const blob = new Blob([script], { type: 'text/javascript' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'load-test.js'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-5">
      <button
        type="button"
        onClick={onGenerate}
        disabled={disabled}
        className="group flex w-full items-center justify-center gap-2.5 rounded-lg bg-primary px-6 py-4 text-base font-semibold text-primary-foreground transition-[transform,background-color] hover:brightness-110 active:scale-[0.995] disabled:pointer-events-none disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <Terminal className="size-5" aria-hidden="true" />
        {t.generateButton}
      </button>

      <div className="overflow-hidden rounded-lg bg-code">
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-2.5">
          <span className="font-mono text-xs text-code-muted">load-test.js</span>
          <span className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={copy}
              disabled={!script}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wider text-code-muted transition-colors hover:bg-white/10 hover:text-code-foreground disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {copied ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
              {copied ? t.copied : t.copy}
            </button>
            <button
              type="button"
              onClick={download}
              disabled={!script}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wider text-code-muted transition-colors hover:bg-white/10 hover:text-code-foreground disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <Download className="size-3.5" aria-hidden="true" />
              {t.download}
            </button>
          </span>
        </div>

        {script ? (
          <pre
            aria-live="polite"
            className="max-h-96 overflow-auto p-4 font-mono text-[13px] leading-6 text-code-foreground"
          >
            <CodeLines code={script} />
          </pre>
        ) : (
          <div className="flex min-h-56 flex-col items-center justify-center gap-2 px-6 py-14 text-center">
            <p className="font-mono text-sm text-code-foreground">{t.noScriptYet}</p>
            <p className="max-w-xs text-sm leading-relaxed text-code-muted text-pretty">
              {t.noScriptHint}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
