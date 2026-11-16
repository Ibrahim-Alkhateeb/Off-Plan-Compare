import { config } from '@/config'
import type { AreaBenchmark, DeveloperRecord, PaymentPlan, Property, Quarter } from '@/types'

/**
 * Pure calculation functions. No UI, no formatting.
 * Everything is computed on unrounded values; rounding happens only at display.
 * A `null` input means the value is missing, and yields a `null` result.
 */

const EPSILON = 1e-9

/** Strict "greater than" that ignores floating-point noise, so a value on the threshold never passes. */
export function exceeds(value: number, threshold: number): boolean {
  return value - threshold > EPSILON
}

const fixedFormatters = new Map<number, Intl.NumberFormat>()

/**
 * The value as it appears once displayed with the given decimals.
 * Used to decide whether two figures look equal to the reader.
 */
export function roundForDisplay(value: number, decimals: number): number {
  let formatter = fixedFormatters.get(decimals)
  if (!formatter) {
    formatter = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: false,
    })
    fixedFormatters.set(decimals, formatter)
  }
  return Number(formatter.format(value))
}

/** Price per sqft = price ÷ unit area */
export function pricePerSqft(priceAed: number, unitAreaSqft: number): number {
  return priceAed / unitAreaSqft
}

/** Difference to benchmark (%) = (price per sqft − area benchmark) ÷ area benchmark × 100 */
export function benchmarkDifferencePct(pricePerSqftAed: number, benchmarkPerSqft: number): number {
  return ((pricePerSqftAed - benchmarkPerSqft) / benchmarkPerSqft) * 100
}

/** Gross yield from area rent (%) = area annual rent ÷ price × 100 */
export function grossYieldFromRentPct(areaAnnualRent: number | null, priceAed: number): number | null {
  if (areaAnnualRent === null) return null
  return (areaAnnualRent / priceAed) * 100
}

/** Annual service charge = service charge per sqft × unit area */
export function annualServiceCharge(serviceChargePerSqft: number | null, unitAreaSqft: number): number | null {
  if (serviceChargePerSqft === null) return null
  return serviceChargePerSqft * unitAreaSqft
}

/** Yield after service charges (%) = (area annual rent − annual service charge) ÷ price × 100 */
export function yieldAfterServiceChargesPct(
  areaAnnualRent: number | null,
  annualServiceChargeAed: number | null,
  priceAed: number,
): number | null {
  if (areaAnnualRent === null || annualServiceChargeAed === null) return null
  return ((areaAnnualRent - annualServiceChargeAed) / priceAed) * 100
}

/** Agent's yield minus the yield from area rent, in percentage points. */
export function yieldGapPoints(agentYieldPct: number | null, yieldFromRentPct: number | null): number | null {
  if (agentYieldPct === null || yieldFromRentPct === null) return null
  return agentYieldPct - yieldFromRentPct
}

export interface StageAmounts {
  construction: number
  handover: number
  postHandover: number
}

export function planSharesTotal(plan: PaymentPlan): number {
  return plan.constructionPct + plan.handoverPct + plan.postHandoverPct
}

/**
 * Stage amount = price × stage percentage.
 * The three shares must sum to 100%, and the three amounts sum to the price exactly:
 * the handover stage absorbs any rounding remainder.
 */
export function stageAmounts(priceAed: number, plan: PaymentPlan): StageAmounts {
  if (Math.abs(planSharesTotal(plan) - 100) > EPSILON) {
    throw new RangeError('Payment plan shares must sum to 100%')
  }
  const construction = Math.round((priceAed * plan.constructionPct) / 100)
  const postHandover = Math.round((priceAed * plan.postHandoverPct) / 100)
  const handover = priceAed - construction - postHandover
  return { construction, handover, postHandover }
}

/** Registration fee = price × assumed fee percentage */
export function registrationFee(priceAed: number, feePct: number = config.registrationFeePct): number {
  return (priceAed * feePct) / 100
}

/** Illustrative total commitment = price + registration fee */
export function totalCommitment(priceAed: number, feePct: number = config.registrationFeePct): number {
  return priceAed + registrationFee(priceAed, feePct)
}

export function hasLimitedRecord(
  delivered: number,
  minDelivered: number = config.alerts.minDeliveredProjects,
): boolean {
  return delivered < minDelivered
}

/**
 * On-time delivery rate (%) = on-time projects ÷ delivered projects × 100.
 * Not reported (`null`) for a developer with a limited record.
 */
export function onTimeRatePct(
  onTime: number,
  delivered: number,
  minDelivered: number = config.alerts.minDeliveredProjects,
): number | null {
  if (delivered <= 0 || hasLimitedRecord(delivered, minDelivered)) return null
  return (onTime / delivered) * 100
}

/** Orders quarters chronologically. */
export function quarterIndex(quarter: Quarter): number {
  return quarter.year * 4 + (quarter.quarter - 1)
}

export interface PropertyMetrics {
  pricePerSqft: number
  benchmarkPricePerSqft: number
  benchmarkDiffPct: number
  agentYieldPct: number | null
  areaAnnualRent: number | null
  yieldFromRentPct: number | null
  yieldGapPoints: number | null
  serviceChargePerSqft: number | null
  annualServiceCharge: number | null
  yieldAfterServiceChargesPct: number | null
  stageAmounts: StageAmounts | null
  registrationFee: number
  totalCommitment: number
  delivered: number
  onTime: number
  delayed: number
  hasLimitedRecord: boolean
  onTimeRatePct: number | null
  /** `null` when the developer has no delayed project on record. */
  avgDelayMonths: number | null
}

export function deriveMetrics(
  property: Property,
  area: AreaBenchmark,
  developer: DeveloperRecord,
): PropertyMetrics {
  const perSqft = pricePerSqft(property.priceAed, property.unitAreaSqft)
  const areaAnnualRent = area.annualRent[property.unitType]
  const yieldFromRent = grossYieldFromRentPct(areaAnnualRent, property.priceAed)
  const annualCharge = annualServiceCharge(property.serviceChargePerSqft, property.unitAreaSqft)

  return {
    pricePerSqft: perSqft,
    benchmarkPricePerSqft: area.pricePerSqft,
    benchmarkDiffPct: benchmarkDifferencePct(perSqft, area.pricePerSqft),
    agentYieldPct: property.agentYieldPct,
    areaAnnualRent,
    yieldFromRentPct: yieldFromRent,
    yieldGapPoints: yieldGapPoints(property.agentYieldPct, yieldFromRent),
    serviceChargePerSqft: property.serviceChargePerSqft,
    annualServiceCharge: annualCharge,
    yieldAfterServiceChargesPct: yieldAfterServiceChargesPct(areaAnnualRent, annualCharge, property.priceAed),
    stageAmounts: property.paymentPlan ? stageAmounts(property.priceAed, property.paymentPlan) : null,
    registrationFee: registrationFee(property.priceAed),
    totalCommitment: totalCommitment(property.priceAed),
    delivered: developer.delivered,
    onTime: developer.onTime,
    delayed: developer.delayed,
    hasLimitedRecord: hasLimitedRecord(developer.delivered),
    onTimeRatePct: onTimeRatePct(developer.onTime, developer.delivered),
    avgDelayMonths: developer.delayed > 0 ? developer.avgDelayMonths : null,
  }
}
