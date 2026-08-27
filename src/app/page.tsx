'use client'

import { useEffect, useState } from 'react'
import { Activity } from 'lucide-react'
import { SectionShell } from '@/components/section-shell'
import { SourcePanel } from '@/components/source-panel'
import { SettingsPanel } from '@/components/settings-panel'
import { ScriptPreview } from '@/components/script-preview'
import { ThemeToggle } from '@/components/theme-toggle'
import { CoffeeButton, LanguageSwitcher, useLanguage } from '@/components/language-switcher'
import { generateK6Script, type BuilderConfig } from '@/lib/generate-k6-script'
import { parsePostman, type ParsedCollection } from '@/lib/postman'

export default function Page() {
  const { language } = useLanguage()
  const isSpanish = language === 'es'

  const [config, setConfig] = useState<BuilderConfig>({
    source: 'postman',
    fileName: null,
    vus: 50,
    rampUp: 30,
    duration: 300,
    checks200: true,
    thinkTime: true,
    authTokens: false,
  })
  const [collection, setCollection] = useState<ParsedCollection | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [script, setScript] = useState<string | null>(null)
  const [hasGenerated, setHasGenerated] = useState(false)

  const patch = (next: Partial<BuilderConfig>) => setConfig((prev) => ({ ...prev, ...next }))

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  // Regenera en vivo una vez que existe un primer script (al cambiar cualquier ajuste).
  useEffect(() => {
    if (!hasGenerated) return
    setScript(generateK6Script(config, collection))
  }, [config, collection, hasGenerated])

  const handleFile = (payload: { name: string; content: string; error?: string } | null) => {
    if (!payload) {
      setCollection(null)
      setError(null)
      patch({ fileName: null })
      return
    }

    patch({ fileName: payload.name })

    // Error surgido durante la lectura en el navegador (tamaño, FileReader).
    if (payload.error) {
      setCollection(null)
      setError(payload.error)
      return
    }

    if (config.source !== 'postman') {
      setCollection(null)
      setError(
        `El análisis automático está disponible para colecciones de Postman. Con "${config.source}" se usará la colección de ejemplo.`,
      )
      setHasGenerated(true)
      return
    }

    try {
      const json = JSON.parse(payload.content)
      const parsed = parsePostman(json)
      setCollection(parsed)
      setError(null)
      setHasGenerated(true)
    } catch (err) {
      setCollection(null)
      setError(err instanceof Error ? err.message : 'No se pudo leer el archivo como JSON válido.')
    }
  }

  const handleGenerate = () => {
    setHasGenerated(true)
    setScript(generateK6Script(config, collection))
  }

  const requestCount = collection?.requests.length ?? 0

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 md:px-8 md:py-12 lg:px-12">
      <header className="flex items-start justify-between gap-4 pb-2">
        <div className="flex flex-col gap-3">
          <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-primary">
            <Activity className="size-4" aria-hidden="true" />
            k6 Script Builder
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">
            {isSpanish ? 'De tu colección de APIs a una prueba de carga ejecutable' : 'From your API collection to an executable load test'}
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground text-pretty">
            {isSpanish ? 'Importa Postman, Swagger, HAR o cURL, define el perfil de carga y obtén un script de k6 listo para' : 'Import Postman, Swagger, HAR, or cURL, define the load profile, and get a k6 script ready for'}
            <span className="font-mono"> k6 run load-test.js</span>.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <CoffeeButton />
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-col gap-6">
        <SectionShell step="01" title={isSpanish ? 'Origen' : 'Source'} hint={isSpanish ? 'Elige el formato e importa el archivo' : 'Choose a format and import your file'}>
          <SourcePanel
            source={config.source}
            onSourceChange={(source) => patch({ source })}
            fileName={config.fileName}
            onFileChange={handleFile}
            error={error}
          />
        </SectionShell>

        <SectionShell step="02" title={isSpanish ? 'Perfil de carga' : 'Load profile'} hint={isSpanish ? 'Concurrencia, tiempos y opciones del script' : 'Concurrency, timing, and script options'}>
          <SettingsPanel config={config} onChange={patch} />
        </SectionShell>

        <SectionShell step="03" title={isSpanish ? 'Script' : 'Script'} hint={isSpanish ? 'Genera, revisa y exporta' : 'Generate, review, and export'}>
          <ScriptPreview script={script} disabled={false} onGenerate={handleGenerate} />
        </SectionShell>

        <p className="px-1 text-xs leading-relaxed text-muted-foreground">
          {collection
            ? `${collection.name}: ${requestCount} solicitud(es) · ${config.vus} VUs · rampa ${config.rampUp}s · total ${config.duration}s`
            : `Sin archivo: se usará la colección de ejemplo · ${config.vus} VUs · rampa ${config.rampUp}s · total ${config.duration}s`}
        </p>
      </div>
    </main>
  )
}
