'use client'

import { useRef, useState } from 'react'
import { AlertCircle, ClipboardPaste, FileJson, Upload, X } from 'lucide-react'
import type { SourceType } from '@/lib/generate-k6-script'

const TABS: { id: SourceType; label: string; accept: string; note: string }[] = [
  { id: 'postman', label: 'Postman', accept: '.json', note: 'collection.json v2.1' },
  { id: 'swagger', label: 'Swagger', accept: '.json,.yaml,.yml', note: 'OpenAPI 3.x' },
  { id: 'har', label: 'HAR', accept: '.har,.json', note: 'captura del navegador' },
  { id: 'curl', label: 'cURL', accept: '.txt,.sh', note: 'comandos sin procesar' },
]

export function SourcePanel({
  source,
  onSourceChange,
  fileName,
  onFileChange,
  error,
}: {
  source: SourceType
  onSourceChange: (s: SourceType) => void
  fileName: string | null
  onFileChange: (payload: { name: string; content: string; error?: string } | null) => void
  error?: string | null
}) {
  const [dragging, setDragging] = useState(false)
  const [curlText, setCurlText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const active = TABS.find((t) => t.id === source) ?? TABS[0]

  // Lectura 100% en el navegador con la API FileReader. El contenido nunca
  // sale del cliente: se entrega al estado local de React vía onFileChange.
  const MAX_BYTES = 10 * 1024 * 1024 // 10 MB

  const readFile = (file: File) => {
    if (file.size > MAX_BYTES) {
      onFileChange({ name: file.name, content: '', error: 'El archivo supera el máximo de 10 MB.' })
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const content = String(reader.result ?? '')
      if (source === 'curl') setCurlText(content)
      onFileChange({ name: file.name, content })
    }
    reader.onerror = () => {
      console.log('[v0] FileReader error:', reader.error)
      onFileChange({ name: file.name, content: '', error: 'No se pudo leer el archivo en el navegador.' })
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex flex-col gap-5">
      <div
        role="tablist"
        aria-label="Tipo de archivo de origen"
        className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1 sm:grid-cols-4"
      >
        {TABS.map((tab) => {
          const selected = tab.id === source
          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              aria-selected={selected}
              onClick={() => onSourceChange(tab.id)}
              className={`rounded-md px-3 py-2 font-mono text-xs uppercase tracking-wider transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                selected
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {fileName && source !== 'curl' ? (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/60 px-4 py-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <FileJson className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-mono text-sm">{fileName}</p>
            <p className="text-xs text-muted-foreground">
              {error ? 'No se pudo analizar' : 'Analizado correctamente'} · {active.label} · {active.note}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onFileChange(null)}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-card hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">Quitar archivo</span>
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            const file = e.dataTransfer.files?.[0]
            if (file) readFile(file)
          }}
          className={`rounded-lg border border-dashed p-8 text-center transition-colors ${
            dragging ? 'border-primary bg-accent' : 'border-input bg-muted/40'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={active.accept}
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) readFile(file)
              // Permite volver a seleccionar el mismo archivo.
              e.target.value = ''
            }}
          />
          {source === 'curl' ? (
            <div className="mx-auto flex max-w-2xl flex-col gap-3 text-left">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ClipboardPaste className="size-4 text-primary" aria-hidden="true" />
                <label htmlFor="curl-input">Pega tu comando cURL</label>
              </div>
              <textarea
                id="curl-input"
                value={curlText}
                onChange={(e) => {
                  const content = e.target.value
                  setCurlText(content)
                  if (content.trim()) {
                    onFileChange({ name: 'comando-curl.txt', content })
                  } else {
                    onFileChange(null)
                  }
                }}
                placeholder={'curl --request GET \\\n  --url https://api.example.com/items'}
                rows={5}
                spellCheck={false}
                className="w-full resize-y rounded-md border border-input bg-card px-3 py-2 font-mono text-xs leading-relaxed outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/30"
              />
              <p className="text-xs text-muted-foreground">Pega uno o varios comandos, o arrastra/sube un archivo .txt o .sh.</p>
            </div>
          ) : (
            <>
              <Upload className="mx-auto size-6 text-muted-foreground" aria-hidden="true" />
              <p className="mt-3 text-sm text-pretty">
                Arrastra tu archivo <span className="font-mono">{active.accept}</span> aquí
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Máx. 10 MB · {active.note}</p>
            </> 
          )}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-4 rounded-md border border-input bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Seleccionar archivo
          </button>
        </div>
      )}

      {error ? (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span className="text-pretty">{error}</span>
        </div>
      ) : null}
    </div>
  )
}
