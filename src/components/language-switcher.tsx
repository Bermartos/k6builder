'use client'

import { useEffect, useState } from 'react'
import { Languages, Coffee } from 'lucide-react'

type Language = 'es' | 'en'

const copy = {
  es: {
    toggle: 'English',
    coffee: 'Invítame a un café',
  },
  en: {
    toggle: 'Español',
    coffee: 'Buy me a Coffee',
  },
} as const

export function useLanguage() {
  const [language, setLanguage] = useState<Language>('en')

  useEffect(() => {
    const saved = document.cookie.match(/(?:^|; )k6-language=(es|en)/)?.[1] as Language | undefined
    const browserLanguage = navigator.language.toLowerCase()
    setLanguage(saved ?? (browserLanguage.startsWith('es-') ? 'es' : 'en'))
    const sync = (event: Event) => setLanguage((event as CustomEvent<Language>).detail)
    window.addEventListener('k6-language-change', sync)
    return () => window.removeEventListener('k6-language-change', sync)
  }, [])

  const toggleLanguage = () => {
    const next: Language = language === 'es' ? 'en' : 'es'
    document.cookie = `k6-language=${next}; path=/; max-age=31536000; samesite=lax`
    document.documentElement.lang = next
    window.dispatchEvent(new CustomEvent('k6-language-change', { detail: next }))
    setLanguage(next)
  }

  return { language, toggleLanguage, copy: copy[language] }
}

export function LanguageSwitcher() {
  const { language, toggleLanguage, copy } = useLanguage()
  const nextLanguage = language === 'es' ? 'English' : 'Español'

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={`Cambiar idioma a ${nextLanguage}`}
      title={`Cambiar idioma a ${nextLanguage}`}
      className="flex min-h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-md border border-input bg-card px-3 py-2 font-mono text-[11px] uppercase tracking-wider transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:min-h-10 sm:flex-none sm:px-3 sm:text-xs"
    >
      <Languages className="size-4" aria-hidden="true" />
      {copy.toggle}
    </button>
  )
}

export function CoffeeButton() {
  const { copy } = useLanguage()
  return (
    <a
      href="https://buymeacoffee.com/bermartosy"
      target="_blank"
      rel="noreferrer"
      className="flex min-h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-md border border-primary/40 bg-accent px-3 py-2 text-sm font-medium text-accent-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:min-h-10 sm:flex-none"
    >
      <Coffee className="size-4" aria-hidden="true" />
      <span className="hidden sm:inline">{copy.coffee}</span>
      <span className="sm:hidden">Coffee</span>
    </a>
  )
}
