'use client'

import { useState } from 'react'
import { Check, ChevronRight, Copy, Download, Loader2 } from 'lucide-react'
import { editorProject, PROJECT_ROOT, type EditorFile } from '@/lib/editor-files'
import { CodeLines } from '@/lib/highlight-code'
import { dictionary, type Language } from '@/lib/i18n'

export function CodeWorkbench({ language, file }: { language: Language; file: EditorFile }) {
  const t = dictionary[language]
  const [copied, setCopied] = useState(false)
  const [zipping, setZipping] = useState(false)

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(file.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch (error) {
      console.log('[v0] clipboard error:', error)
    }
  }

  const downloadZip = async () => {
    setZipping(true)
    try {
      const { default: JSZip } = await import('jszip')
      const zip = new JSZip()
      const root = zip.folder(PROJECT_ROOT)
      editorProject.files.forEach((f) => root?.file(f.name, f.content))
      editorProject.folders?.forEach((folder) => {
        const sub = root?.folder(folder.name)
        folder.files.forEach((f) => sub?.file(f.name, f.content))
      })
      const blob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${PROJECT_ROOT}.zip`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.log('[v0] zip error:', error)
    } finally {
      setZipping(false)
    }
  }

  const breadcrumbParts = [PROJECT_ROOT, ...file.path.split('/')]

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-card px-4 py-2.5">
        <nav aria-label={t.editorBreadcrumbLabel} className="flex min-w-0 items-center gap-1.5 font-mono text-xs text-muted-foreground">
          {breadcrumbParts.map((part, i) => (
            <span key={`${part}-${i}`} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="size-3 shrink-0 text-muted-foreground/50" aria-hidden="true" />}
              <span className={i === breadcrumbParts.length - 1 ? 'text-foreground' : ''}>{part}</span>
            </span>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={copyCode}
            className="flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {copied ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
            {copied ? t.copied : t.editorCopyCode}
          </button>
          <button
            type="button"
            onClick={downloadZip}
            disabled={zipping}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:brightness-110 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {zipping ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="size-3.5" aria-hidden="true" />
            )}
            {zipping ? t.editorZipping : t.editorDownloadZip}
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto bg-code">
        <pre className="min-w-max p-4 font-mono text-[13px] leading-6 text-code-foreground">
          <CodeLines code={file.content} />
        </pre>
      </div>
    </div>
  )
}
