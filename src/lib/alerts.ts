import { config } from '@/config'
import type { Property } from '@/types'
import { exceeds, type PropertyMetrics } from './calculations'
import type { FigureKey } from './figures'

/** An offer value that can be absent. Listed in the order of the six criteria. */
export type MissingItem = 'agentYield' | 'areaRent' | 'serviceCharge' | 'paymentPlan' | 'handover'

/**
 * A triggered alert. `rule` is the row number in the alert rules table.
 * Each alert carries the figures that triggered it, so text can be built without recalculating.
 */
export type Alert =
  | { rule: 1; item: MissingItem }
  | { rule: 2; agentYieldPct: number; yieldFromRentPct: number; gapPoints: number }
  | { rule: 3; diffPct: number }
  | { rule: 4; avgDelayMonths: number; delayedProjects: number }
  | { rule: 5; delivered: number }
  | { rule: 6; serviceChargePerSqft: number }
  | { rule: 7; postHandoverPct: number; postHandoverAmount: number; months: number | null }

export type AlertRule = Alert['rule']

/** `verify` is shown in amber. `info` is neutral: it flags something to know, not a concern. */
export type AlertSeverity = 'verify' | 'info'

export function alertSeverity(alert: Alert): AlertSeverity {
  return alert.rule === 7 ? 'info' : 'verify'
}

export function alertId(alert: Alert): string {
  return alert.rule === 1 ? `1-${alert.item}` : String(alert.rule)
}

const MISSING_ITEM_CELL: Record<MissingItem, FigureKey> = {
  agentYield: 'agentYield',
  areaRent: 'areaRent',
  serviceCharge: 'serviceChargePerSqft',
  paymentPlan: 'planConstructionPct',
  handover: 'handover',
}

/** The comparison cell an alert is shown in. */
export function alertCell(alert: Alert): FigureKey {
  switch (alert.rule) {
    case 1:
      return MISSING_ITEM_CELL[alert.item]
    case 2:
      return 'agentYield'
    case 3:
      return 'benchmarkDiff'
    case 4:
      return 'avgDelay'
    case 5:
      return 'projectsDelivered'
    case 6:
      return 'serviceChargePerSqft'
    case 7:
      return 'planPostHandoverPct'
  }
}

/** The values the agent or the reference data did not provide for this property. */
export function missingItems(property: Property, metrics: PropertyMetrics): MissingItem[] {
  const items: MissingItem[] = []
  if (property.agentYieldPct === null) items.push('agentYield')
  if (metrics.areaAnnualRent === null) items.push('areaRent')
  if (property.serviceChargePerSqft === null) items.push('serviceCharge')
  if (property.paymentPlan === null) items.push('paymentPlan')
  if (property.handover === null) items.push('handover')
  return items
}

/**
 * Evaluates the seven alert rules, returned in rule order.
 * Rule 1 produces one alert per missing value.
 */
export function evaluateAlerts(property: Property, metrics: PropertyMetrics): Alert[] {
  const thresholds = config.alerts
  const alerts: Alert[] = []

  for (const item of missingItems(property, metrics)) {
    alerts.push({ rule: 1, item })
  }

  if (
    metrics.agentYieldPct !== null &&
    metrics.yieldFromRentPct !== null &&
    metrics.yieldGapPoints !== null &&
    exceeds(metrics.yieldGapPoints, thresholds.yieldGapPoints)
  ) {
    alerts.push({
      rule: 2,
      agentYieldPct: metrics.agentYieldPct,
      yieldFromRentPct: metrics.yieldFromRentPct,
      gapPoints: metrics.yieldGapPoints,
    })
  }

  if (exceeds(metrics.benchmarkDiffPct, thresholds.priceAboveBenchmarkPct)) {
    alerts.push({ rule: 3, diffPct: metrics.benchmarkDiffPct })
  }

  if (metrics.avgDelayMonths !== null && exceeds(metrics.avgDelayMonths, thresholds.avgDelayMonths)) {
    alerts.push({ rule: 4, avgDelayMonths: metrics.avgDelayMonths, delayedProjects: metrics.delayed })
  }

  if (metrics.hasLimitedRecord) {
    alerts.push({ rule: 5, delivered: metrics.delivered })
  }

  if (
    metrics.serviceChargePerSqft !== null &&
    exceeds(metrics.serviceChargePerSqft, thresholds.serviceChargePerSqft)
  ) {
    alerts.push({ rule: 6, serviceChargePerSqft: metrics.serviceChargePerSqft })
  }

  if (property.paymentPlan && metrics.stageAmounts && property.paymentPlan.postHandoverPct > 0) {
    alerts.push({
      rule: 7,
      postHandoverPct: property.paymentPlan.postHandoverPct,
      postHandoverAmount: metrics.stageAmounts.postHandover,
      months: property.paymentPlan.postHandoverMonths,
    })
  }

  return alerts
}
