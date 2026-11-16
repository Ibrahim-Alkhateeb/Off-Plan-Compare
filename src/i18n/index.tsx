import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { createFormatter, type Formatter } from '@/lib/format'
import type { Lang, Localized } from '@/types'
import { ar } from './ar'
import { en, type Translations } from './en'

export type Direction = 'ltr' | 'rtl'

const DICTIONARIES: Record<Lang, Translations> = { en, ar }
const DIRECTIONS: Record<Lang, Direction> = { en: 'ltr', ar: 'rtl' }

export function getTranslations(lang: Lang): Translations {
  return DICTIONARIES[lang]
}

export interface I18n {
  lang: Lang
  dir: Direction
  t: Translations
  fmt: Formatter
  /** Picks the current language from text held in the data. */
  text: (value: Localized) => string
  setLang: (lang: Lang) => void
}

const I18nContext = createContext<I18n | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')

  const value = useMemo<I18n>(() => {
    const t = DICTIONARIES[lang]
    return {
      lang,
      dir: DIRECTIONS[lang],
      t,
      fmt: createFormatter(lang, t),
      text: (localized) => localized[lang],
      setLang,
    }
  }, [lang])

  useEffect(() => {
    const root = document.documentElement
    root.lang = lang
    root.dir = DIRECTIONS[lang]
    document.title = DICTIONARIES[lang].app.name
  }, [lang])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18n {
  const value = useContext(I18nContext)
  if (!value) throw new Error('useI18n must be used inside I18nProvider')
  return value
}
