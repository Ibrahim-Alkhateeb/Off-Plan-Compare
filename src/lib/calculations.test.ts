import { describe, expect, it } from 'vitest'
import { config } from '@/config'
import { properties } from '@/data/properties'
import type { PropertyId } from '@/types'
import {
  annualServiceCharge,
  benchmarkDifferencePct,
  exceeds,
  grossYieldFromRentPct,
  onTimeRatePct,
  planSharesTotal,
  pricePerSqft,
  quarterIndex,
  registrationFee,
  roundForDisplay,
  stageAmounts,
  totalCommitment,
  yieldAfterServiceChargesPct,
  yieldGapPoints,
} from './calculations'
import { formatNumber } from './format'
import { buildViews } from './view'

const ALL_IDS: PropertyId[] = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6']

const maybe = (value: number | null, decimals: number) =>
  value === null ? null : formatNumber(value, decimals)

const signed = (value: number, decimals: number) =>
  `${value < 0 ? '−' : '+'}${formatNumber(Math.abs(value), decimals)}%`

describe('formulas', () => {
  it('price per sqft = price ÷ unit area', () => {
    expect(pricePerSqft(2_200_000, 850)).toBeCloseTo(2588.235, 3)
  })

  it('difference to benchmark = (price per sqft − benchmark) ÷ benchmark × 100', () => {
    expect(benchmarkDifferencePct(1400, 1250)).toBeCloseTo(12, 10)
    expect(benchmarkDifferencePct(2400, 2500)).toBeCloseTo(-4, 10)
  })

  it('gross yield from area rent = area annual rent ÷ price × 100', () => {
    expect(grossYieldFromRentPct(130_000, 2_200_000)).toBeCloseTo(5.909, 3)
  })

  it('annual service charge = service charge per sqft × unit area', () => {
    expect(annualServiceCharge(22, 850)).toBe(18_700)
  })

  it('yield after service charges = (area annual rent − annual service charge) ÷ price × 100', () => {
    expect(yieldAfterServiceChargesPct(130_000, 18_700, 2_200_000)).toBeCloseTo(5.059, 3)
  })

  it('registration fee = price × 4%, total commitment = price + registration fee', () => {
    expect(config.registrationFeePct).toBe(4)
    expect(registrationFee(2_200_000)).toBe(88_000)
    expect(totalCommitment(2_200_000)).toBe(2_288_000)
  })

  it('on-time delivery rate = on-time ÷ delivered × 100, from three delivered projects', () => {
    expect(onTimeRatePct(21, 24)).toBeCloseTo(87.5, 10)
    expect(onTimeRatePct(2, 3)).toBeCloseTo(66.667, 3)
    expect(onTimeRatePct(1, 2)).toBeNull()
    expect(onTimeRatePct(0, 0)).toBeNull()
  })

  it('agent yield gap is expressed in percentage points', () => {
    expect(yieldGapPoints(8.5, 7.5)).toBeCloseTo(1, 10)
    expect(yieldGapPoints(null, 7.5)).toBeNull()
    expect(yieldGapPoints(8.5, null)).toBeNull()
  })

  it('orders quarters chronologically', () => {
    expect(quarterIndex({ quarter: 4, year: 2027 })).toBeLessThan(quarterIndex({ quarter: 1, year: 2028 }))
    expect(quarterIndex({ quarter: 3, year: 2027 })).toBeLessThan(quarterIndex({ quarter: 4, year: 2027 }))
  })
})

describe('missing inputs', () => {
  it('never turn into zero: a missing input gives a missing result', () => {
    expect(grossYieldFromRentPct(null, 1_000_000)).toBeNull()
    expect(annualServiceCharge(null, 1100)).toBeNull()
    expect(yieldAfterServiceChargesPct(110_000, null, 1_650_000)).toBeNull()
    expect(yieldAfterServiceChargesPct(null, 20_000, 1_650_000)).toBeNull()
  })
})

describe('payment stages', () => {
  it('sum to the price exactly, even when a share does not divide evenly', () => {
    const plan = { constructionPct: 33, handoverPct: 34, postHandoverPct: 33, postHandoverMonths: 12 }
    const amounts = stageAmounts(1_000_001, plan)
    expect(amounts.construction + amounts.handover + amounts.postHandover).toBe(1_000_001)
    expect(Number.isInteger(amounts.construction)).toBe(true)
    expect(Number.isInteger(amounts.handover)).toBe(true)
    expect(Number.isInteger(amounts.postHandover)).toBe(true)
  })

  it('reject shares that do not sum to 100%', () => {
    const plan = { constructionPct: 50, handoverPct: 40, postHandoverPct: 0, postHandoverMonths: null }
    expect(() => stageAmounts(1_000_000, plan)).toThrow(RangeError)
  })

  it('every property in the data has shares summing to 100%', () => {
    for (const property of properties) {
      expect(property.paymentPlan && planSharesTotal(property.paymentPlan)).toBe(100)
    }
  })
})

describe('thresholds and rounding', () => {
  it('a value on the threshold does not exceed it', () => {
    expect(exceeds(20, 20)).toBe(false)
    expect(exceeds(20.01, 20)).toBe(true)
    // 0.1 + 0.2 is 0.30000000000000004 in floating point: still "on" 0.3.
    expect(exceeds(0.1 + 0.2, 0.3)).toBe(false)
  })

  it('rounds for display the way the formatter does', () => {
    expect(roundForDisplay(87.5, 0)).toBe(88)
    expect(roundForDisplay(5.0054, 2)).toBe(5.01)
    expect(roundForDisplay(3.448, 1)).toBe(3.4)
    expect(formatNumber(87.5, 0)).toBe('88')
  })
})

describe('expected results for the six properties', () => {
  const views = new Map(buildViews(ALL_IDS).map((view) => [view.property.id, view]))
  const metrics = (id: PropertyId) => views.get(id)!.metrics

  const expected: Record<
    PropertyId,
    {
      pricePerSqft: string
      vsBenchmark: string
      yieldFromRent: string
      yieldAfterServiceCharges: string | null
      registrationFee: number
      totalCommitment: number
      onTimeRate: string | null
      stages: [number, number, number]
    }
  > = {
    P1: {
      pricePerSqft: '2,588',
      vsBenchmark: '+5.6%',
      yieldFromRent: '5.91',
      yieldAfterServiceCharges: '5.06',
      registrationFee: 88_000,
      totalCommitment: 2_288_000,
      onTimeRate: '88',
      stages: [1_760_000, 440_000, 0],
    },
    P2: {
      pricePerSqft: '1,400',
      vsBenchmark: '+12.0%',
      yieldFromRent: '7.14',
      yieldAfterServiceCharges: '6.07',
      registrationFee: 42_000,
      totalCommitment: 1_092_000,
      onTimeRate: '67',
      stages: [630_000, 420_000, 0],
    },
    P3: {
      pricePerSqft: '2,167',
      vsBenchmark: '+3.2%',
      yieldFromRent: '5.77',
      yieldAfterServiceCharges: '4.94',
      registrationFee: 104_000,
      totalCommitment: 2_704_000,
      onTimeRate: '71',
      stages: [1_040_000, 1_560_000, 0],
    },
    P4: {
      pricePerSqft: '1,500',
      vsBenchmark: '+3.4%',
      yieldFromRent: '6.84',
      yieldAfterServiceCharges: '5.90',
      registrationFee: 46_800,
      totalCommitment: 1_216_800,
      onTimeRate: null,
      stages: [585_000, 234_000, 351_000],
    },
    P5: {
      pricePerSqft: '1,500',
      vsBenchmark: '+7.1%',
      yieldFromRent: '6.67',
      yieldAfterServiceCharges: null,
      registrationFee: 66_000,
      totalCommitment: 1_716_000,
      onTimeRate: '83',
      stages: [825_000, 825_000, 0],
    },
    P6: {
      pricePerSqft: '2,400',
      vsBenchmark: '−4.0%',
      yieldFromRent: '5.80',
      yieldAfterServiceCharges: '5.01',
      registrationFee: 110_400,
      totalCommitment: 2_870_400,
      onTimeRate: '94',
      stages: [1_932_000, 828_000, 0],
    },
  }

  for (const id of ALL_IDS) {
    describe(id, () => {
      const want = expected[id]

      it('price per sqft and difference to benchmark', () => {
        expect(formatNumber(metrics(id).pricePerSqft)).toBe(want.pricePerSqft)
        expect(signed(metrics(id).benchmarkDiffPct, 1)).toBe(want.vsBenchmark)
      })

      it('yield from area rent and yield after service charges', () => {
        expect(maybe(metrics(id).yieldFromRentPct, 2)).toBe(want.yieldFromRent)
        expect(maybe(metrics(id).yieldAfterServiceChargesPct, 2)).toBe(want.yieldAfterServiceCharges)
      })

      it('registration fee and total commitment', () => {
        expect(metrics(id).registrationFee).toBe(want.registrationFee)
        expect(metrics(id).totalCommitment).toBe(want.totalCommitment)
        expect(metrics(id).totalCommitment).toBe(views.get(id)!.property.priceAed + want.registrationFee)
      })

      it('on-time delivery rate', () => {
        expect(maybe(metrics(id).onTimeRatePct, 0)).toBe(want.onTimeRate)
      })

      it('payment stage amounts sum to the price', () => {
        const amounts = metrics(id).stageAmounts!
        expect([amounts.construction, amounts.handover, amounts.postHandover]).toEqual(want.stages)
        expect(amounts.construction + amounts.handover + amounts.postHandover).toBe(
          views.get(id)!.property.priceAed,
        )
      })
    })
  }

  it('P4 has a limited record, so no on-time rate is reported', () => {
    expect(metrics('P4').hasLimitedRecord).toBe(true)
    expect(metrics('P4').onTimeRatePct).toBeNull()
  })

  it('P5 has no service charge, so everything derived from it is missing', () => {
    expect(metrics('P5').serviceChargePerSqft).toBeNull()
    expect(metrics('P5').annualServiceCharge).toBeNull()
    expect(metrics('P5').yieldAfterServiceChargesPct).toBeNull()
  })
})
