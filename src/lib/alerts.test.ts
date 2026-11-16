import { describe, expect, it } from 'vitest'
import type { AreaBenchmark, DeveloperRecord, Property, PropertyId } from '@/types'
import { alertCell, alertId, alertSeverity, evaluateAlerts, type Alert } from './alerts'
import { deriveMetrics } from './calculations'
import { buildViews } from './view'

const rules = (alerts: Alert[]) => alerts.map((alert) => alert.rule)

/** A property that triggers nothing, used as the base for boundary cases. */
const baseProperty: Property = {
  id: 'P1',
  project: { en: 'Base', ar: 'أساس' },
  areaId: 'business-bay',
  developerId: 'northlight',
  unitType: '1BR',
  unitAreaSqft: 1000,
  priceAed: 1_000_000,
  agentYieldPct: 6,
  serviceChargePerSqft: 10,
  paymentPlan: { constructionPct: 60, handoverPct: 40, postHandoverPct: 0, postHandoverMonths: null },
  handover: { quarter: 1, year: 2028 },
}

const baseArea: AreaBenchmark = {
  id: 'business-bay',
  name: { en: 'Area', ar: 'منطقة' },
  shortName: { en: 'Area', ar: 'منطقة' },
  pricePerSqft: 1000,
  annualRent: { '1BR': 60_000, '2BR': null },
}

const baseDeveloper: DeveloperRecord = {
  id: 'northlight',
  name: { en: 'Developer', ar: 'مطوّر' },
  delivered: 10,
  onTime: 8,
  delayed: 2,
  avgDelayMonths: 3,
}

function alertsFor(
  property: Partial<Property> = {},
  area: Partial<AreaBenchmark> = {},
  developer: Partial<DeveloperRecord> = {},
): Alert[] {
  const p = { ...baseProperty, ...property }
  return evaluateAlerts(p, deriveMetrics(p, { ...baseArea, ...area }, { ...baseDeveloper, ...developer }))
}

describe('alerts for the six properties', () => {
  const expected: Record<PropertyId, number[]> = {
    P1: [6],
    P2: [2, 3],
    P3: [4],
    P4: [5, 7],
    P5: [1],
    P6: [],
  }

  const views = buildViews(['P1', 'P2', 'P3', 'P4', 'P5', 'P6'])

  for (const view of views) {
    it(`${view.property.id} triggers exactly rules [${expected[view.property.id].join(', ')}]`, () => {
      expect(rules(view.alerts)).toEqual(expected[view.property.id])
    })
  }

  it('P5 is asked for the missing service charge', () => {
    const p5 = views.find((view) => view.property.id === 'P5')!
    expect(p5.alerts).toEqual([{ rule: 1, item: 'serviceCharge' }])
  })

  it('P4 carries the post-handover share and amount', () => {
    const p4 = views.find((view) => view.property.id === 'P4')!
    expect(p4.alerts).toContainEqual({
      rule: 7,
      postHandoverPct: 30,
      postHandoverAmount: 351_000,
      months: 24,
    })
  })
})

describe('alert thresholds are strict', () => {
  it('the base case triggers nothing', () => {
    expect(alertsFor()).toEqual([])
  })

  it('rule 2: yield gap of exactly 1.0 point does not trigger, above it does', () => {
    // Area rent 60,000 on a price of 1,000,000 is a 6.00% yield.
    expect(rules(alertsFor({ agentYieldPct: 7.0 }))).toEqual([])
    expect(rules(alertsFor({ agentYieldPct: 7.01 }))).toEqual([2])
    expect(rules(alertsFor({ agentYieldPct: 5.0 }))).toEqual([])
  })

  it('rule 3: exactly 10% above the benchmark does not trigger, above it does', () => {
    expect(rules(alertsFor({ priceAed: 1_100_000, agentYieldPct: 5 }))).toEqual([])
    expect(rules(alertsFor({ priceAed: 1_101_000, agentYieldPct: 5 }))).toEqual([3])
    expect(rules(alertsFor({ priceAed: 800_000, agentYieldPct: 7.5 }))).toEqual([])
  })

  it('rule 4: an average delay of exactly 6 months does not trigger, above it does', () => {
    expect(rules(alertsFor({}, {}, { avgDelayMonths: 6 }))).toEqual([])
    expect(rules(alertsFor({}, {}, { avgDelayMonths: 6.5 }))).toEqual([4])
  })

  it('rule 4: no delayed project means no delay to review', () => {
    expect(rules(alertsFor({}, {}, { delayed: 0, onTime: 10, avgDelayMonths: null }))).toEqual([])
  })

  it('rule 5: three delivered projects is not a limited record, two is', () => {
    expect(rules(alertsFor({}, {}, { delivered: 3, onTime: 2, delayed: 1 }))).toEqual([])
    expect(rules(alertsFor({}, {}, { delivered: 2, onTime: 1, delayed: 1 }))).toEqual([5])
  })

  it('rule 6: a service charge of exactly AED 20 does not trigger, above it does', () => {
    expect(rules(alertsFor({ serviceChargePerSqft: 20 }))).toEqual([])
    expect(rules(alertsFor({ serviceChargePerSqft: 20.5 }))).toEqual([6])
  })

  it('rule 7: any share due after handover triggers', () => {
    const plan = { constructionPct: 60, handoverPct: 39, postHandoverPct: 1, postHandoverMonths: 6 }
    expect(rules(alertsFor({ paymentPlan: plan }))).toEqual([7])
  })
})

describe('rule 1: missing values', () => {
  it('raises one alert per missing value, in criteria order', () => {
    const alerts = alertsFor({
      agentYieldPct: null,
      serviceChargePerSqft: null,
      paymentPlan: null,
      handover: null,
    })
    expect(alerts).toEqual([
      { rule: 1, item: 'agentYield' },
      { rule: 1, item: 'serviceCharge' },
      { rule: 1, item: 'paymentPlan' },
      { rule: 1, item: 'handover' },
    ])
  })

  it('covers a missing area rent', () => {
    const alerts = alertsFor({}, { annualRent: { '1BR': null, '2BR': null } })
    expect(alerts).toEqual([{ rule: 1, item: 'areaRent' }])
  })

  it('a missing value never triggers the rule that needs it', () => {
    expect(rules(alertsFor({ agentYieldPct: null }))).toEqual([1])
    expect(rules(alertsFor({ serviceChargePerSqft: null }))).toEqual([1])
  })
})

describe('alert presentation', () => {
  it('returns alerts in rule order', () => {
    const alerts = alertsFor(
      {
        priceAed: 1_200_000,
        agentYieldPct: 9,
        serviceChargePerSqft: 25,
        paymentPlan: { constructionPct: 50, handoverPct: 20, postHandoverPct: 30, postHandoverMonths: 24 },
        handover: null,
      },
      {},
      { delivered: 2, onTime: 0, delayed: 2, avgDelayMonths: 9 },
    )
    expect(rules(alerts)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('only rule 7 is informational', () => {
    expect(alertSeverity({ rule: 7, postHandoverPct: 30, postHandoverAmount: 1, months: 24 })).toBe('info')
    expect(alertSeverity({ rule: 6, serviceChargePerSqft: 22 })).toBe('verify')
    expect(alertSeverity({ rule: 1, item: 'serviceCharge' })).toBe('verify')
  })

  it('places each alert in the cell it relates to', () => {
    expect(alertCell({ rule: 1, item: 'serviceCharge' })).toBe('serviceChargePerSqft')
    expect(alertCell({ rule: 2, agentYieldPct: 8.5, yieldFromRentPct: 7.1, gapPoints: 1.4 })).toBe('agentYield')
    expect(alertCell({ rule: 3, diffPct: 12 })).toBe('benchmarkDiff')
    expect(alertCell({ rule: 4, avgDelayMonths: 8, delayedProjects: 4 })).toBe('avgDelay')
    expect(alertCell({ rule: 5, delivered: 2 })).toBe('projectsDelivered')
    expect(alertCell({ rule: 6, serviceChargePerSqft: 22 })).toBe('serviceChargePerSqft')
    expect(alertCell({ rule: 7, postHandoverPct: 30, postHandoverAmount: 1, months: 24 })).toBe(
      'planPostHandoverPct',
    )
  })

  it('gives each alert of a property a distinct id', () => {
    const alerts = alertsFor({ agentYieldPct: null, serviceChargePerSqft: null })
    expect(new Set(alerts.map(alertId)).size).toBe(alerts.length)
  })
})
