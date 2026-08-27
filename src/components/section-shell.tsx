import type { ReactNode } from 'react'

export function SectionShell({
  step,
  title,
  hint,
  children,
}: {
  step: string
  title: string
  hint: string
  children: ReactNode
}) {
  return (
    <section className="rounded-xl border border-border bg-card">
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-border px-5 py-4 md:px-6">
        <span className="font-mono text-xs tabular-nums text-primary">{step}</span>
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        <p className="w-full text-sm leading-relaxed text-muted-foreground md:ml-auto md:w-auto">{hint}</p>
      </header>
      <div className="px-5 py-5 md:px-6 md:py-6">{children}</div>
    </section>
  )
}
