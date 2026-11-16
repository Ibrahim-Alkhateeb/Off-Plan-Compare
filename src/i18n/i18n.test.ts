import { describe, expect, it } from 'vitest'
import benchmarksSource from '@/data/benchmarks.ts?raw'
import developersSource from '@/data/developers.ts?raw'
import propertiesSource from '@/data/properties.ts?raw'
import { alertId } from '@/lib/alerts'
import {
  advantageText,
  alertDetail,
  alertQuestion,
  alertRuleText,
  alertText,
  avgDelayText,
  benchmarkDiffText,
  explainFigure,
  type Wording,
} from '@/lib/describe'
import { FIGURE_SOURCE, type FigureKey } from '@/lib/figures'
import { createFormatter, stripIsolates } from '@/lib/format'
import { buildSummaries } from '@/lib/summary'
import { buildPropertyView, buildViews, type PropertyView } from '@/lib/view'
import { getProperty } from '@/data/properties'
import type { PropertyId } from '@/types'
import { ar } from './ar'
import arSource from './ar.ts?raw'
import { en } from './en'
import enSource from './en.ts?raw'

const english: Wording = { lang: 'en', t: en, fmt: createFormatter('en', en) }
const arabic: Wording = { lang: 'ar', t: ar, fmt: createFormatter('ar', ar) }

const SELECTIONS: PropertyId[][] = [
  ['P1', 'P2', 'P3'],
  ['P4', 'P5'],
  ['P2', 'P6'],
  ['P4', 'P5', 'P6'],
]

/** A property with every optional value missing, to cover the "not available" wording. */
const sparseView = buildPropertyView({
  ...getProperty('P5'),
  agentYieldPct: null,
  paymentPlan: null,
  handover: null,
})

/** Every sentence the tool can produce for the given views. */
function renderEverything(views: PropertyView[], wording: Wording): string[] {
  const output: string[] = []
  const figures = Object.keys(FIGURE_SOURCE) as FigureKey[]

  for (const summary of buildSummaries(views)) {
    const view = views.find((candidate) => candidate.property.id === summary.propertyId)!
    output.push(view.property.project[wording.lang], view.area.name[wording.lang])
    output.push(view.area.shortName[wording.lang], view.developer.name[wording.lang])
    output.push(benchmarkDiffText(view, wording))
    if (view.metrics.avgDelayMonths !== null) {
      output.push(avgDelayText(view.metrics.avgDelayMonths, view.metrics.delayed, wording))
    }
    for (const advantage of summary.advantages) output.push(advantageText(advantage, view, wording))
    for (const alert of summary.allWatchPoints) {
      output.push(alertText(alert, wording), alertRuleText(alert, wording))
      output.push(alertDetail(alert, view, wording), alertQuestion(alert, wording))
    }
    for (const figure of figures) {
      const explanation = explainFigure(figure, view, wording)
      if (explanation.kind === 'calculated') {
        output.push(explanation.formula, explanation.inputs)
        output.push(explanation.worked ?? '', explanation.unavailable ?? '')
      } else {
        output.push(explanation.text)
      }
    }
  }
  return output.filter((text) => text !== '')
}

/** Every plain string in a language file, with its path. */
function stringLeaves(node: unknown, path = ''): [string, string][] {
  if (typeof node === 'string') return [[path, node]]
  if (node === null || typeof node !== 'object') return []
  return Object.entries(node).flatMap(([key, value]) => stringLeaves(value, path ? `${path}.${key}` : key))
}

describe('language files', () => {
  it('Arabic has every key English has, and nothing is left empty', () => {
    const englishKeys = stringLeaves(en).map(([path]) => path)
    const arabicLeaves = stringLeaves(ar)
    expect(arabicLeaves.map(([path]) => path)).toEqual(englishKeys)
    for (const [path, value] of arabicLeaves) {
      expect(value.trim(), path).not.toBe('')
    }
  })

  it('the required phrases are worded as specified', () => {
    expect(en.app.mockNotice).toBe(
      'All data shown is mock and illustrative. Verify every figure before any real investment decision.',
    )
    expect(en.compare.notAvailable).toBe('Not available – please ask the agent')
    expect(ar.compare.notAvailable).toBe('غير متوفر – يرجى سؤال الوكيل')
    expect(en.decide.decision.myPick('The Quay Residences')).toBe('My Pick: The Quay Residences')
    expect(ar.decide.decision.myPick('ذا كي ريزيدنسز')).toBe('اختياري: ذا كي ريزيدنسز')
    expect(en.decide.decision.none).toBe('None of These')
    expect(ar.decide.decision.none).toBe('لا يناسبني أي من الخيارات')
    expect(en.shortlist.maxToast).toBe('You can compare up to three properties. Remove one to add another.')
    expect(en.compare.thresholdNote).toBe(
      'These are trial thresholds specific to this prototype, not official market standards.',
    )
  })

  it('source labels are named as specified', () => {
    expect(en.sources.labels).toEqual({
      agent: 'Agent data',
      benchmark: 'Area benchmark – mock data',
      developer: 'Developer record – mock data',
      calculated: 'Calculated figure',
    })
    expect(new Set(Object.values(ar.sources.labels)).size).toBe(4)
  })
})

describe('product stance in the wording', () => {
  const sources = {
    'en.ts': enSource,
    'ar.ts': arSource,
    'properties.ts': propertiesSource,
    'benchmarks.ts': benchmarksSource,
    'developers.ts': developersSource,
  }

  // The Decide stage rates the selected properties against each other ("Highest rated",
  // "Average", "Lowest rated"), so rating wording is allowed. These words are still not.
  const forbiddenEnglish = /\b(buy|buys|buying|recommend\w*|best|winner\w*|top pick|score\w*|stars?)\b/i
  const forbiddenArabic = /(أفضل|الأفضل|شراء|اشتر|موصى|نوصي|فائز|الفائز|درجة|نجوم)/

  for (const [name, source] of Object.entries(sources)) {
    it(`${name} has no buy, recommend, winner, top-pick, score or star wording`, () => {
      expect(source).not.toMatch(forbiddenEnglish)
      expect(source).not.toMatch(forbiddenArabic)
    })
  }

  it('the rating labels are worded as asked, and say what they rest on', () => {
    expect(en.decide.rating.labels).toEqual({
      highest: 'Highest rated',
      average: 'Average',
      lowest: 'Lowest rated',
    })
    expect(new Set(Object.values(ar.decide.rating.labels)).size).toBe(3)
    expect(en.decide.rating.basis('2', '1', '1')).toBe(
      'Relative advantages listed (2) minus points to verify (1) = 1.',
    )
    expect(en.decide.rating.note).toMatch(/not advice/)
    expect(en.decide.rating.scope).toMatch(/not advice/)
  })

  it('advantages are descriptions, not verdicts', () => {
    for (const ids of SELECTIONS) {
      for (const wording of [english, arabic]) {
        for (const sentence of renderEverything(buildViews(ids), wording)) {
          expect(sentence).not.toMatch(/\b(better|worse|good|bad|great|ideal|bargain|cheap)\b/i)
        }
      }
    }
  })
})

describe('worked examples', () => {
  const p1 = buildViews(['P1'])[0]
  const p2 = buildViews(['P2'])[0]
  const p5 = buildViews(['P5'])[0]
  const p6 = buildViews(['P6'])[0]

  it('describes the difference to the benchmark with its context', () => {
    expect(benchmarkDiffText(p1, english)).toBe('5.6% above the Business Bay benchmark')
    expect(benchmarkDiffText(p6, english)).toBe('4.0% below the Dubai Hills Estate benchmark')
    expect(stripIsolates(benchmarkDiffText(p6, arabic))).toBe('أقل بنسبة 4.0% من مرجع دبي هيلز استيت')
  })

  it('shows the formula in words, then with this property’s inputs', () => {
    const explanation = explainFigure('pricePerSqft', p1, english)
    expect(explanation).toMatchObject({
      kind: 'calculated',
      formula: 'Price ÷ unit area',
      worked: 'AED 2,200,000 ÷ 850 sqft = AED 2,588 per sqft',
    })
  })

  it('explains why a figure cannot be calculated', () => {
    const explanation = explainFigure('yieldAfterServiceCharges', p5, english)
    expect(explanation).toMatchObject({
      kind: 'calculated',
      worked: null,
      unavailable: 'Cannot be calculated: the service charge per sqft per year is not available.',
    })
  })

  it('names the area in the benchmark explanation', () => {
    expect(explainFigure('areaRent', p1, english)).toEqual({
      kind: 'benchmark',
      text: 'Illustrative reference for Business Bay. Mock data, not a verified market figure.',
    })
  })

  it('words the questions as specified', () => {
    const [yieldGap, priceGap] = p2.alerts
    expect(alertQuestion(yieldGap, english)).toBe(
      'Which annual rent is your 8.50% yield based on, and which comparable lettings support it?',
    )
    expect(alertQuestion(priceGap, english)).toBe(
      'What justifies a price 12.0% above the area reference for this unit?',
    )
    expect(alertQuestion(p5.alerts[0], english)).toBe(
      'Can you confirm the service charge per sqft per year in writing?',
    )
  })

  it('words an advantage with its context', () => {
    const views = buildViews(['P1', 'P2', 'P3'])
    const p2Summary = buildSummaries(views)[1]
    expect(p2Summary.advantages.map((advantage) => advantageText(advantage, views[1], english))).toEqual([
      'Highest estimated yield after service charges of the three: 6.07%.',
      'Lowest service charge of the three: AED 15 per sqft per year.',
    ])
  })

  it('says how many properties were compared when one lacks the figure', () => {
    const views = buildViews(['P4', 'P5', 'P6'])
    const p4Summary = buildSummaries(views)[0]
    expect(advantageText(p4Summary.advantages[1], views[0], english)).toBe(
      'Lowest service charge among the two with this figure available: AED 14 per sqft per year.',
    )
  })

  it('states the basis of the average delay', () => {
    expect(avgDelayText(8, 4, english)).toBe('8 months, based on 4 delayed projects')
    expect(stripIsolates(avgDelayText(8, 4, arabic))).toBe('8 أشهر، استنادًا إلى 4 مشاريع متأخرة')
  })
})

describe('Arabic output', () => {
  const latinLetters = /[A-Za-z]/

  it('has no untranslated text in the language file', () => {
    const allowed = new Set(['app.language.en'])
    for (const [path, value] of stringLeaves(ar)) {
      if (allowed.has(path)) continue
      expect(value, path).not.toMatch(latinLetters)
    }
  })

  it('has no untranslated text in any generated sentence', () => {
    const viewSets = [...SELECTIONS.map((ids) => buildViews(ids)), [sparseView, buildViews(['P6'])[0]]]
    for (const views of viewSets) {
      for (const sentence of renderEverything(views, arabic)) {
        expect(sentence).not.toMatch(latinLetters)
        expect(sentence).not.toMatch(/undefined|null|NaN/)
      }
    }
  })

  it('never shows a missing value as a number', () => {
    for (const wording of [english, arabic]) {
      for (const sentence of renderEverything([sparseView, buildViews(['P6'])[0]], wording)) {
        expect(sentence).not.toMatch(/undefined|null|NaN/)
      }
    }
  })

  it('gives every alert of the sparse property its own question', () => {
    const questions = sparseView.alerts.map((alert) => alertQuestion(alert, arabic))
    expect(new Set(questions).size).toBe(sparseView.alerts.length)
    expect(new Set(sparseView.alerts.map(alertId)).size).toBe(sparseView.alerts.length)
  })
})
