import { describe, expect, it } from 'vitest'
import { getProperty } from '@/data/properties'
import type { Property, PropertyId } from '@/types'
import {
  buildSummaries,
  rateProperties,
  relativeAdvantages,
  relativeTags,
  type PropertySummary,
} from './summary'
import { buildPropertyView, buildViews } from './view'

const kinds = (summary: PropertySummary) => summary.advantages.map((advantage) => advantage.kind)
const rules = (summary: PropertySummary) => summary.watchPoints.map((alert) => alert.rule)

function summariesFor(ids: PropertyId[]): Map<PropertyId, PropertySummary> {
  return new Map(buildSummaries(buildViews(ids)).map((summary) => [summary.propertyId, summary]))
}

/** A copy of a real property with some values changed. */
function variant(id: PropertyId, changes: Partial<Property>) {
  return buildPropertyView({ ...getProperty(id), ...changes })
}

describe('relative tags', () => {
  it('tags the single highest and single lowest value', () => {
    expect(relativeTags([2588.2, 1400, 2166.7], 0)).toEqual(['highest', 'lowest', null])
    expect(relativeTags([15, 19], 0)).toEqual(['lowest', 'highest'])
  })

  it('gives no tag when all values are equal', () => {
    expect(relativeTags([6.5, 6.5], 2)).toEqual([null, null])
  })

  it('gives no tag for an extreme that is shared', () => {
    expect(relativeTags([6.5, 8.5, 6.5], 2)).toEqual([null, 'highest', null])
  })

  it('gives no tag when a value in the row is missing', () => {
    expect(relativeTags([14, null, 19], 0)).toEqual([null, null, null])
    expect(relativeTags([14, null], 0)).toEqual([null, null])
  })

  it('treats values that display the same as equal', () => {
    expect(relativeTags([5.004, 5.0041], 2)).toEqual([null, null])
  })
})

describe('relative advantages', () => {
  it('P1 + P2 + P3', () => {
    const summaries = summariesFor(['P1', 'P2', 'P3'])
    expect(kinds(summaries.get('P1')!)).toEqual(['onTimeRate'])
    expect(kinds(summaries.get('P2')!)).toEqual(['yieldAfterServiceCharges', 'serviceCharge'])
    expect(kinds(summaries.get('P3')!)).toEqual(['benchmarkDiff', 'preHandoverShare'])
  })

  it('P4 + P5: nothing is claimed on a figure only one of them has', () => {
    const summaries = summariesFor(['P4', 'P5'])
    // P5 has no service charge, and both pay 50% before handover (a tie).
    expect(kinds(summaries.get('P4')!)).toEqual(['benchmarkDiff'])
    expect(kinds(summaries.get('P5')!)).toEqual(['handover'])
  })

  it('P2 + P6', () => {
    const summaries = summariesFor(['P2', 'P6'])
    expect(kinds(summaries.get('P2')!)).toEqual(['yieldAfterServiceCharges', 'serviceCharge'])
    expect(kinds(summaries.get('P6')!)).toEqual(['benchmarkDiff', 'onTimeRate'])
  })

  it('never gives more than two, taking the first two candidates that apply', () => {
    // Against P6, P2 leads on four measures; only the first two are kept.
    const all = relativeAdvantages(buildViews(['P2', 'P6']))
    expect(all.get('P2')).toHaveLength(2)
    for (const advantages of all.values()) {
      expect(advantages.length).toBeLessThanOrEqual(2)
    }
  })

  it('a tie produces no advantage', () => {
    const views = [variant('P1', {}), variant('P3', { serviceChargePerSqft: 22 })]
    const advantages = relativeAdvantages(views)
    const allKinds = [...advantages.values()].flat().map((advantage) => advantage.kind)
    expect(allKinds).not.toContain('serviceCharge')
  })

  it('a property can have no advantage at all', () => {
    // An identical pair ties on every measure.
    const twin = { ...variant('P2', {}), property: { ...getProperty('P2'), id: 'P3' as PropertyId } }
    const advantages = relativeAdvantages([variant('P2', {}), twin])
    expect(advantages.get('P2')).toEqual([])
    expect(advantages.get('P3')).toEqual([])
  })

  it('compares the on-time rate only among developers with at least three delivered projects', () => {
    // P4's developer has two delivered projects, so the rate is compared between P5 and P6 only.
    const summaries = summariesFor(['P4', 'P5', 'P6'])
    const onTime = summaries.get('P6')!.advantages.find((advantage) => advantage.kind === 'onTimeRate')
    expect(onTime).toEqual({ kind: 'onTimeRate', comparedCount: 2, selectedCount: 3 })
    expect(kinds(summaries.get('P4')!)).not.toContain('onTimeRate')
  })

  it('records how many properties were compared when one lacks the figure', () => {
    const summaries = summariesFor(['P4', 'P5', 'P6'])
    expect(summaries.get('P4')!.advantages).toEqual([
      { kind: 'yieldAfterServiceCharges', comparedCount: 2, selectedCount: 3 },
      { kind: 'serviceCharge', comparedCount: 2, selectedCount: 3 },
    ])
  })
})

describe('rating', () => {
  const levels = (ids: PropertyId[]) =>
    Object.fromEntries(buildSummaries(buildViews(ids)).map((summary) => [summary.propertyId, summary.rating.level]))

  it('is relative advantages listed minus points to verify', () => {
    const [p1, p2, p3] = buildSummaries(buildViews(['P1', 'P2', 'P3']))
    expect(p1.rating).toEqual({ level: 'average', advantages: 1, pointsToVerify: 1, net: 0 })
    // Level with P1 on net, but with more points to verify.
    expect(p2.rating).toEqual({ level: 'lowest', advantages: 2, pointsToVerify: 2, net: 0 })
    expect(p3.rating).toEqual({ level: 'highest', advantages: 2, pointsToVerify: 1, net: 1 })
  })

  it('when level on net, fewer points to verify rates higher', () => {
    const ratings = rateProperties([
      { advantages: 2, pointsToVerify: 2 },
      { advantages: 0, pointsToVerify: 0 },
    ])
    expect(ratings.map((rating) => rating.level)).toEqual(['lowest', 'highest'])
  })

  it('net always outweighs the tie-break', () => {
    const ratings = rateProperties([
      { advantages: 2, pointsToVerify: 5 },
      { advantages: 0, pointsToVerify: 4 },
      { advantages: 0, pointsToVerify: 0 },
    ])
    // Nets are -3, -4 and 0: the one with four points sits below the one with five.
    expect(ratings.map((rating) => rating.level)).toEqual(['average', 'lowest', 'highest'])
  })

  it('uses the counts shown on the card', () => {
    for (const summary of buildSummaries(buildViews(['P4', 'P5', 'P6']))) {
      expect(summary.rating.advantages).toBe(summary.advantages.length)
      expect(summary.rating.pointsToVerify).toBe(summary.allWatchPoints.length)
      expect(summary.rating.net).toBe(summary.advantages.length - summary.allWatchPoints.length)
    }
  })

  it('P4 + P5 and P2 + P6', () => {
    expect(levels(['P4', 'P5'])).toEqual({ P4: 'lowest', P5: 'highest' })
    expect(levels(['P2', 'P6'])).toEqual({ P2: 'lowest', P6: 'highest' })
  })

  it('gives highest, average and lowest when all three differ', () => {
    const ratings = rateProperties([
      { advantages: 2, pointsToVerify: 0 },
      { advantages: 1, pointsToVerify: 1 },
      { advantages: 0, pointsToVerify: 3 },
    ])
    expect(ratings.map((rating) => rating.level)).toEqual(['highest', 'average', 'lowest'])
    expect(ratings.map((rating) => rating.net)).toEqual([2, 0, -3])
  })

  it('a tie for an extreme is average, never a shared highest or lowest', () => {
    const tiedTop = rateProperties([
      { advantages: 2, pointsToVerify: 0 },
      { advantages: 2, pointsToVerify: 0 },
      { advantages: 0, pointsToVerify: 1 },
    ])
    expect(tiedTop.map((rating) => rating.level)).toEqual(['average', 'average', 'lowest'])

    const allEqual = rateProperties([
      { advantages: 1, pointsToVerify: 1 },
      { advantages: 1, pointsToVerify: 1 },
    ])
    expect(allEqual.map((rating) => rating.level)).toEqual(['average', 'average'])
  })

  it('a single property has nothing to be rated against', () => {
    expect(rateProperties([{ advantages: 2, pointsToVerify: 0 }])[0].level).toBe('average')
  })
})

describe('watch points and questions', () => {
  it('watch points are the triggered alerts in rule order', () => {
    const summaries = summariesFor(['P1', 'P2', 'P3'])
    expect(rules(summaries.get('P1')!)).toEqual([6])
    expect(rules(summaries.get('P2')!)).toEqual([2, 3])
    expect(rules(summaries.get('P3')!)).toEqual([4])
  })

  it('shows two watch points and counts the rest', () => {
    const heavy = variant('P4', { agentYieldPct: 9, serviceChargePerSqft: 25 })
    const [summary] = buildSummaries([heavy, variant('P6', {})])
    expect(heavy.alerts.map((alert) => alert.rule)).toEqual([2, 5, 6, 7])
    expect(rules(summary)).toEqual([2, 5])
    expect(summary.moreWatchPoints).toBe(2)
    expect(summary.allWatchPoints).toHaveLength(4)
  })

  it('generates one question per alert, with no cap', () => {
    const heavy = variant('P4', { agentYieldPct: 9, serviceChargePerSqft: 25 })
    const [summary] = buildSummaries([heavy, variant('P6', {})])
    expect(summary.questions).toHaveLength(4)
  })

  it('generates one question per missing value', () => {
    const sparse = variant('P5', { agentYieldPct: null, handover: null })
    const [summary] = buildSummaries([sparse, variant('P6', {})])
    expect(summary.questions).toEqual([
      { rule: 1, item: 'agentYield' },
      { rule: 1, item: 'serviceCharge' },
      { rule: 1, item: 'handover' },
    ])
  })

  it('P4 + P5 and P2 + P6', () => {
    const first = summariesFor(['P4', 'P5'])
    expect(rules(first.get('P4')!)).toEqual([5, 7])
    expect(first.get('P4')!.questions).toHaveLength(2)
    expect(rules(first.get('P5')!)).toEqual([1])
    expect(first.get('P5')!.questions).toHaveLength(1)

    const second = summariesFor(['P2', 'P6'])
    expect(rules(second.get('P6')!)).toEqual([])
    expect(second.get('P6')!.questions).toEqual([])
    expect(second.get('P6')!.moreWatchPoints).toBe(0)
  })

  it('keeps selection order', () => {
    expect(buildSummaries(buildViews(['P3', 'P1', 'P2'])).map((summary) => summary.propertyId)).toEqual([
      'P3',
      'P1',
      'P2',
    ])
  })
})
