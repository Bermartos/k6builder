'use client'

import { Fragment, useState } from 'react'
import { Check, Copy, Download, Terminal } from 'lucide-react'

const TOKEN =
  /(\/\/[^\n]*)|('(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|"(?:[^"\\]|\\.)*")|\b(import|from|export|const|function|return|default|new|let|of)\b|\b(\d+(?:\.\d+)?)\b/g

function highlight(line: string) {
  const nodes: React.ReactNode[] = []
  let last = 0
  let match: RegExpExecArray | null
  TOKEN.lastIndex = 0

  while ((match = TOKEN.exec(line)) !== null) {
    if (match.index > last) nodes.push(line.slice(last, match.index))
    const [full, comment, str, keyword, num] = match
    const key = `${match.index}-${full.length}`
    if (comment) {
      nodes.push(
        <span key={key} className="text-code-muted italic">
          {full}
        </span>,
      )
    } else if (str) {
      nodes.push(
        <span key={key} className="text-code-string">
          {full}
        </span>,
      )
    } else if (keyword) {
      nodes.push(
        <span key={key} className="text-code-key">
          {full}
        </span>,
      )
    } else if (num) {
      nodes.push(
        <span key={key} className="text-code-string">
          {full}
        </span>,
      )
    }
    last = match.index + full.length
  }
  if (last < line.length) nodes.push(line.slice(last))

  return nodes.map((node, i) => <Fragment key={i}>{node}</Fragment>)
}

export function ScriptPreview({
  script,
  onGenerate,
  disabled,
}: {
  script: string | null
  onGenerate: () => void
  disabled: boolean
}) {
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

  const lines = script ? script.split('\n') : []

  return (
    <div className="flex flex-col gap-5">
      <button
        type="button"
        onClick={onGenerate}
        disabled={disabled}
        className="group flex w-full items-center justify-center gap-2.5 rounded-lg bg-primary px-6 py-4 text-base font-semibold text-primary-foreground transition-[transform,background-color] hover:brightness-110 active:scale-[0.995] disabled:pointer-events-none disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <Terminal className="size-5" aria-hidden="true" />
        Generar Script de k6
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
              {copied ? 'Copiado' : 'Copiar'}
            </button>
            <button
              type="button"
              onClick={download}
              disabled={!script}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wider text-code-muted transition-colors hover:bg-white/10 hover:text-code-foreground disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <Download className="size-3.5" aria-hidden="true" />
              Descargar
            </button>
          </span>
        </div>

        {script ? (
          <pre
            aria-live="polite"
            className="max-h-96 overflow-auto p-4 font-mono text-[13px] leading-6 text-code-foreground"
          >
            <code>
              {lines.map((line, i) => (
                <span key={i} className="flex gap-4">
                  <span className="w-6 shrink-0 select-none text-right text-code-muted/60 tabular-nums">
                    {i + 1}
                  </span>
                  <span className="min-w-0 whitespace-pre-wrap">{highlight(line) as React.ReactNode}</span>
                </span>
              ))}
            </code>
          </pre>
        ) : (
          <div className="flex min-h-56 flex-col items-center justify-center gap-2 px-6 py-14 text-center">
            <p className="font-mono text-sm text-code-foreground">Sin script todavía</p>
            <p className="max-w-xs text-sm leading-relaxed text-code-muted text-pretty">
              Sube un archivo de origen y ajusta la carga. La previsualización aparecerá aquí.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
