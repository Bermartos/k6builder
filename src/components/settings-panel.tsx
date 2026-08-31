'use client'

import { Check } from 'lucide-react'
import type { BuilderConfig } from '@/lib/generate-k6-script'
import { dictionary, type Language } from '@/lib/i18n'

type Toggle = 'checks200' | 'thinkTime' | 'authTokens'

function LoadCurve({
  vus,
  rampUp,
  duration,
  t,
}: {
  vus: number
  rampUp: number
  duration: number
  t: (typeof dictionary)['en']
}) {
  const total = Math.max(duration, rampUp * 2 + 1)
  const up = (rampUp / total) * 100
  const down = 100 - up
  const points = `0,100 ${up},4 ${down},4 100,100`

  return (
    <div className="rounded-lg border border-border bg-muted/40 p-4">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          {t.loadProfileChartLabel}
        </span>
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
          {rampUp}s ↑ · {Math.max(duration - rampUp * 2, 0)}s → · {rampUp}s ↓
        </span>
      </div>
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="mt-3 h-20 w-full" aria-hidden="true">
        <polygon points={points} fill="var(--accent)" stroke="none" transform="scale(1,0.4)" />
        <polyline
          points={points}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="1.2"
          vectorEffect="non-scaling-stroke"
          transform="scale(1,0.4)"
        />
      </svg>
      <p className="sr-only">{t.loadCurveSr(rampUp, vus, duration)}</p>
    </div>
  )
}

export function SettingsPanel({
  language,
  config,
  onChange,
}: {
  language: Language
  config: BuilderConfig
  onChange: (patch: Partial<BuilderConfig>) => void
}) {
  const t = dictionary[language]
  const TOGGLES: { id: Toggle; label: string; hint: string }[] = [
    { id: 'checks200', label: t.checks200Label, hint: t.checks200Hint },
    { id: 'thinkTime', label: t.thinkTimeLabel, hint: t.thinkTimeHint },
    { id: 'authTokens', label: t.authTokensLabel, hint: t.authTokensHint },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="flex items-end justify-between gap-4">
            <label htmlFor="vus" className="text-sm font-medium">
              {t.vusLabel}
            </label>
            <output
              htmlFor="vus"
              className="font-mono text-3xl leading-none tabular-nums tracking-tight text-primary"
            >
              {config.vus}
            </output>
          </div>
          <input
            id="vus"
            type="range"
            min={1}
            max={500}
            step={1}
            value={config.vus}
            onChange={(e) => onChange({ vus: Number(e.target.value) })}
            className="vu-slider w-full"
          />
          <div className="flex justify-between font-mono text-[11px] tabular-nums text-muted-foreground">
            <span>1</span>
            <span>250</span>
            <span>500</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ramp" className="text-sm font-medium">
                {t.rampLabel}
              </label>
              <input
                id="ramp"
                type="number"
                min={0}
                max={600}
                value={config.rampUp}
                onChange={(e) => onChange({ rampUp: Number(e.target.value) })}
                className="rounded-md border border-input bg-card px-3 py-2 font-mono text-sm tabular-nums focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="duration" className="text-sm font-medium">
                {t.durationLabel}
              </label>
              <input
                id="duration"
                type="number"
                min={1}
                max={7200}
                value={config.duration}
                onChange={(e) => onChange({ duration: Number(e.target.value) })}
                className="rounded-md border border-input bg-card px-3 py-2 font-mono text-sm tabular-nums focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
              />
            </div>
          </div>
        </div>

        <LoadCurve vus={config.vus} rampUp={config.rampUp} duration={config.duration} t={t} />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          {t.scriptConfigLegend}
        </legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {TOGGLES.map((toggle) => {
            const checked = config[toggle.id]
            return (
              <label
                key={toggle.id}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                  checked ? 'border-primary bg-accent' : 'border-border bg-muted/40 hover:border-input'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => onChange({ [toggle.id]: e.target.checked } as Partial<BuilderConfig>)}
                  className="peer sr-only"
                />
                <span
                  aria-hidden="true"
                  className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring ${
                    checked ? 'border-primary bg-primary text-primary-foreground' : 'border-input bg-card'
                  }`}
                >
                  {checked && <Check className="size-3" strokeWidth={3} />}
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium leading-none">{toggle.label}</span>
                  <span className="text-xs leading-relaxed text-muted-foreground">{toggle.hint}</span>
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>
    </div>
  )
}
