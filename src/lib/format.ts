import { config } from '@/config'
import type { Translations } from '@/i18n/en'
import type { Lang, Quarter, UnitType } from '@/types'

/**
 * Display formatting. Numbers always use Western digits with thousands separators,
 * in both languages. Rounding happens here and nowhere else.
 */

const numberFormatters = new Map<string, Intl.NumberFormat>()

function numberFormatter(minDecimals: number, maxDecimals: number): Intl.NumberFormat {
  const key = `${minDecimals}-${maxDecimals}`
  let formatter = numberFormatters.get(key)
  if (!formatter) {
    formatter = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: minDecimals,
      maximumFractionDigits: maxDecimals,
    })
    numberFormatters.set(key, formatter)
  }
  return formatter
}

/** A number with thousands separators and a fixed count of decimals. */
export function formatNumber(value: number, decimals = 0): string {
  return numberFormatter(decimals, decimals).format(value)
}

const LEFT_TO_RIGHT_ISOLATE = '⁦'
const POP_DIRECTIONAL_ISOLATE = '⁩'

/** Keeps a number reading left to right when it sits inside right-to-left text. */
export function isolate(text: string): string {
  return `${LEFT_TO_RIGHT_ISOLATE}${text}${POP_DIRECTIONAL_ISOLATE}`
}

/** Removes the invisible direction marks added by `isolate`. */
export function stripIsolates(text: string): string {
  return text.replaceAll(LEFT_TO_RIGHT_ISOLATE, '').replaceAll(POP_DIRECTIONAL_ISOLATE, '')
}

export interface Formatter {
  /** Plain number, e.g. `2,588`. */
  number(value: number, decimals?: number): string
  /** Whole dirhams, e.g. `AED 2,200,000`. */
  aed(value: number): string
  aedPerSqft(value: number): string
  aedPerSqftYear(value: number): string
  aedPerYear(value: number): string
  sqft(value: number): string
  /** Percentage with a fixed count of decimals, e.g. `5.6%`. */
  percent(value: number, decimals: number): string
  /** A yield, to two decimals, e.g. `5.91%`. */
  yieldPct(value: number): string
  /** A share entered as data, shown without padding, e.g. `80%`. */
  share(value: number): string
  /** Percentage points, e.g. `1.36 percentage points`. */
  points(value: number, decimals: number): string
  quarter(value: Quarter): string
  months(value: number): string
  unitType(value: UnitType): string
}

export function createFormatter(lang: Lang, t: Translations): Formatter {
  const ltr = (text: string) => (lang === 'ar' ? isolate(text) : text)
  const number = (value: number, decimals = 0) => ltr(formatNumber(value, decimals))

  return {
    number,
    aed: (value) => t.format.aed(number(value)),
    aedPerSqft: (value) => `${t.format.aed(number(value))} ${t.format.per.sqft}`,
    aedPerSqftYear: (value) => `${t.format.aed(number(value))} ${t.format.per.sqftYear}`,
    aedPerYear: (value) => `${t.format.aed(number(value))} ${t.format.per.year}`,
    sqft: (value) => t.format.sqft(number(value)),
    percent: (value, decimals) => ltr(`${formatNumber(value, decimals)}%`),
    yieldPct: (value) => ltr(`${formatNumber(value, config.display.yieldDecimals)}%`),
    share: (value) => ltr(`${numberFormatter(0, 2).format(value)}%`),
    points: (value, decimals) => t.format.percentagePoints(number(value, decimals)),
    quarter: (value) => t.format.quarter(value.quarter, ltr(String(value.year))),
    months: (value) => t.format.months(value, number(value)),
    unitType: (value) => t.format.unitType[value],
  }
}
