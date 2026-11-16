import { describe, expect, it } from 'vitest'
import { ar } from '@/i18n/ar'
import { en } from '@/i18n/en'
import { createFormatter, formatNumber, isolate, stripIsolates } from './format'

const enFmt = createFormatter('en', en)
const arFmt = createFormatter('ar', ar)

describe('number formatting', () => {
  it('uses thousands separators and rounds to whole numbers by default', () => {
    expect(formatNumber(2_200_000)).toBe('2,200,000')
    expect(formatNumber(2588.235)).toBe('2,588')
    expect(formatNumber(2166.667)).toBe('2,167')
  })

  it('keeps a fixed count of decimals', () => {
    expect(formatNumber(5.9, 2)).toBe('5.90')
    expect(formatNumber(12, 1)).toBe('12.0')
  })
})

describe('English', () => {
  it('formats currency as AED before the amount', () => {
    expect(enFmt.aed(2_200_000)).toBe('AED 2,200,000')
    expect(enFmt.aedPerSqft(2588.235)).toBe('AED 2,588 per sqft')
    expect(enFmt.aedPerSqftYear(22)).toBe('AED 22 per sqft per year')
    expect(enFmt.aedPerYear(18_700)).toBe('AED 18,700 per year')
  })

  it('formats percentages, areas, quarters and durations', () => {
    expect(enFmt.yieldPct(5.909)).toBe('5.91%')
    expect(enFmt.percent(5.642, 1)).toBe('5.6%')
    expect(enFmt.percent(87.5, 0)).toBe('88%')
    expect(enFmt.share(80)).toBe('80%')
    expect(enFmt.share(4)).toBe('4%')
    expect(enFmt.sqft(850)).toBe('850 sqft')
    expect(enFmt.quarter({ quarter: 4, year: 2027 })).toBe('Q4 2027')
    expect(enFmt.months(1)).toBe('1 month')
    expect(enFmt.months(8)).toBe('8 months')
    expect(enFmt.points(1.357, 2)).toBe('1.36 percentage points')
    expect(enFmt.unitType('1BR')).toBe('1 BR')
  })

  it('adds no direction marks', () => {
    expect(enFmt.aed(1_050_000)).toBe(stripIsolates(enFmt.aed(1_050_000)))
  })
})

describe('Arabic', () => {
  it('keeps Western digits and puts the currency after the amount', () => {
    expect(stripIsolates(arFmt.aed(2_200_000))).toBe('2,200,000 درهم')
    expect(stripIsolates(arFmt.aedPerSqft(2588.235))).toBe('2,588 درهم للقدم المربعة')
    expect(stripIsolates(arFmt.sqft(850))).toBe('850 قدم مربعة')
  })

  it('formats percentages, quarters and durations', () => {
    expect(stripIsolates(arFmt.yieldPct(5.909))).toBe('5.91%')
    expect(stripIsolates(arFmt.quarter({ quarter: 4, year: 2027 }))).toBe('الربع الرابع 2027')
    expect(stripIsolates(arFmt.months(1))).toBe('شهر واحد')
    expect(stripIsolates(arFmt.months(2))).toBe('شهران')
    expect(stripIsolates(arFmt.months(8))).toBe('8 أشهر')
    expect(stripIsolates(arFmt.months(24))).toBe('24 شهرًا')
    expect(arFmt.unitType('2BR')).toBe('غرفتا نوم')
  })

  it('never uses Eastern Arabic digits', () => {
    const samples = [arFmt.aed(1_234_567), arFmt.yieldPct(6.07), arFmt.quarter({ quarter: 1, year: 2028 })]
    for (const sample of samples) {
      expect(sample).not.toMatch(/[٠-٩۰-۹]/)
    }
  })

  it('isolates numbers so they read left to right inside right-to-left text', () => {
    expect(arFmt.percent(5.6, 1)).toBe(isolate('5.6%'))
    expect(arFmt.aed(88_000)).toBe(`${isolate('88,000')} درهم`)
  })
})
