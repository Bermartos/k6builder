'use client'

import { useEffect, useState } from 'react'
import { Activity } from 'lucide-react'
import { SectionShell } from '@/components/section-shell'
import { SourcePanel } from '@/components/source-panel'
import { SettingsPanel } from '@/components/settings-panel'
import { ScriptPreview } from '@/components/script-preview'
import { ThemeToggle } from '@/components/theme-toggle'
import { CoffeeButton, LanguageSwitcher, useLanguage } from '@/components/language-switcher'
import { SiteFooter } from '@/components/site-footer'
import { generateK6Script, type BuilderConfig } from '@/lib/generate-k6-script'
import { parseCurl } from '@/lib/curl'
import { parsePostman, type ParsedCollection } from '@/lib/postman'

export default function Page() {
  const { language, t } = useLanguage()

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

    try {
      const parsed = config.source === 'curl'
        ? parseCurl(payload.content)
        : config.source === 'postman'
          ? parsePostman(JSON.parse(payload.content))
          : null

      if (!parsed) {
        setCollection(null)
        setError(t.parseUnavailable(config.source))
        setHasGenerated(true)
        return
      }
      setCollection(parsed)
      setError(null)
      setHasGenerated(true)
    } catch (err) {
      setCollection(null)
      setError(err instanceof Error ? err.message : t.invalidJson)
    }
  }

  const handleGenerate = () => {
    setHasGenerated(true)
    setScript(generateK6Script(config, collection))
  }

  const requestCount = collection?.requests.length ?? 0

  return (
    <div className="flex min-h-screen flex-col">
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 md:px-8 md:py-12 lg:px-12">
      <header className="flex flex-col gap-4 pb-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex flex-col gap-3">
          <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-primary">
            <Activity className="size-4" aria-hidden="true" />
            k6 Script Builder
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">
            {t.heroTitle}
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground text-pretty">
            {t.heroDescription}
            <span className="font-mono"> k6 run load-test.js</span>.
          </p>
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto sm:justify-end">
          <CoffeeButton />
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-col gap-6">
        <SectionShell step="01" title={t.sourceTitle} hint={t.sourceHint}>
          <SourcePanel
            language={language}
            source={config.source}
            onSourceChange={(source) => patch({ source })}
            fileName={config.fileName}
            onFileChange={handleFile}
            error={error}
          />
        </SectionShell>

        <SectionShell step="02" title={t.loadProfileTitle} hint={t.loadProfileHint}>
          <SettingsPanel language={language} config={config} onChange={patch} />
        </SectionShell>

        <SectionShell step="03" title={t.scriptTitle} hint={t.scriptHint}>
          <ScriptPreview language={language} script={script} disabled={false} onGenerate={handleGenerate} />
        </SectionShell>

        <p className="px-1 text-xs leading-relaxed text-muted-foreground">
          {collection
            ? t.summaryWithFile(collection.name, requestCount, config.vus, config.rampUp, config.duration)
            : t.summaryWithoutFile(config.vus, config.rampUp, config.duration)}
        </p>
      </div>
    </main>
    <SiteFooter />
    </div>
  )
}
