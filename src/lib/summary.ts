import { config } from '@/config'
import type { PropertyId } from '@/types'
import type { Alert } from './alerts'
import { quarterIndex, roundForDisplay } from './calculations'
import type { PropertyView } from './view'

/**
 * Rule-based summaries for the Decide stage: relative advantages, watch points
 * and questions for the agent, plus a simple rating of the selected properties
 * against each other (see `rateProperties`).
 */

export type RelativeTag = 'highest' | 'lowest' | null

/** Position of the single highest and single lowest value, or -1 where the extreme is shared. */
function uniqueExtremes(values: readonly number[]): { highest: number; lowest: number } {
  const max = Math.max(...values)
  const min = Math.min(...values)
  const only = (target: number) =>
    values.filter((value) => value === target).length === 1 ? values.indexOf(target) : -1
  return { highest: only(max), lowest: only(min) }
}

/**
 * Neutral "highest" / "lowest" descriptors for one comparison row.
 * No tag is given when any value in the row is missing, or when the extreme
 * is shared at the precision the reader sees.
 */
export function relativeTags(values: readonly (number | null)[], decimals: number): RelativeTag[] {
  const none: RelativeTag[] = values.map(() => null)
  if (values.length < 2 || values.some((value) => value === null)) return none

  const shown = (values as number[]).map((value) => roundForDisplay(value, decimals))
  const { highest, lowest } = uniqueExtremes(shown)
  return shown.map((_, index) => (index === highest ? 'highest' : index === lowest ? 'lowest' : null))
}

/** The advantage candidates, in the order they are checked. */
export type AdvantageKind =
  | 'benchmarkDiff'
  | 'yieldAfterServiceCharges'
  | 'serviceCharge'
  | 'preHandoverShare'
  | 'handover'
  | 'onTimeRate'

export interface Advantage {
  kind: AdvantageKind
  /** How many of the selected properties had this figure and were compared. */
  comparedCount: number
  /** How many properties are selected in total. */
  selectedCount: number
}

interface Candidate {
  kind: AdvantageKind
  direction: 'lowest' | 'highest'
  decimals: number
  measure: (view: PropertyView) => number | null
}

const CANDIDATES: readonly Candidate[] = [
  {
    kind: 'benchmarkDiff',
    direction: 'lowest',
    decimals: config.display.benchmarkDiffDecimals,
    measure: (view) => view.metrics.benchmarkDiffPct,
  },
  {
    kind: 'yieldAfterServiceCharges',
    direction: 'highest',
    decimals: config.display.yieldDecimals,
    measure: (view) => view.metrics.yieldAfterServiceChargesPct,
  },
  {
    kind: 'serviceCharge',
    direction: 'lowest',
    decimals: 0,
    measure: (view) => view.metrics.serviceChargePerSqft,
  },
  {
    kind: 'preHandoverShare',
    direction: 'lowest',
    decimals: 0,
    measure: (view) => view.property.paymentPlan?.constructionPct ?? null,
  },
  {
    kind: 'handover',
    direction: 'lowest',
    decimals: 0,
    measure: (view) => (view.property.handover ? quarterIndex(view.property.handover) : null),
  },
  {
    kind: 'onTimeRate',
    direction: 'highest',
    decimals: config.display.onTimeRateDecimals,
    // `null` for a developer with a limited record, which keeps it out of this comparison.
    measure: (view) => view.metrics.onTimeRatePct,
  },
]

/**
 * Relative advantages for each selected property, compared only among the selection.
 * A candidate applies to a property only when its own figure is available, at least one
 * other selected property has the figure too, and it is the single extreme. Ties give nothing.
 */
export function relativeAdvantages(views: readonly PropertyView[]): Map<PropertyId, Advantage[]> {
  const result = new Map<PropertyId, Advantage[]>(views.map((view) => [view.property.id, []]))

  for (const candidate of CANDIDATES) {
    const compared = views
      .map((view) => ({ id: view.property.id, value: candidate.measure(view) }))
      .filter((entry): entry is { id: PropertyId; value: number } => entry.value !== null)
    if (compared.length < 2) continue

    const shown = compared.map((entry) => roundForDisplay(entry.value, candidate.decimals))
    const position = uniqueExtremes(shown)[candidate.direction]
    if (position === -1) continue

    const advantages = result.get(compared[position].id)
    if (advantages && advantages.length < config.summary.maxAdvantages) {
      advantages.push({
        kind: candidate.kind,
        comparedCount: compared.length,
        selectedCount: views.length,
      })
    }
  }

  return result
}

export type RatingLevel = 'highest' | 'average' | 'lowest'

/**
 * Where a property stands among the selected ones, and the two counts it rests on.
 * Both counts are visible on the property's Decide card, so the rating can be checked by eye.
 */
export interface Rating {
  level: RatingLevel
  /** Relative advantages listed for the property. */
  advantages: number
  /** Every alert triggered for the property. */
  pointsToVerify: number
  /** Advantages minus points to verify. */
  net: number
}

/**
 * Rates the selected properties against each other. A trial rule, not advice:
 * net = relative advantages listed − points to verify.
 * When two properties are level on net, the one with fewer points to verify rates higher.
 * The single top one is "highest", the single bottom one is "lowest";
 * everything else, including any remaining tie for an extreme, is "average".
 */
export function rateProperties(
  counts: readonly { advantages: number; pointsToVerify: number }[],
): Rating[] {
  const nets = counts.map((count) => count.advantages - count.pointsToVerify)
  // One comparable number per property: net decides, points to verify only break a tie on net.
  const tieBreakScale = 1 + Math.max(0, ...counts.map((count) => count.pointsToVerify))
  const standings = counts.map((count, index) => nets[index] * tieBreakScale - count.pointsToVerify)
  const { highest, lowest } = counts.length > 1 ? uniqueExtremes(standings) : { highest: -1, lowest: -1 }

  return counts.map((count, index) => ({
    level: index === highest ? 'highest' : index === lowest ? 'lowest' : 'average',
    advantages: count.advantages,
    pointsToVerify: count.pointsToVerify,
    net: nets[index],
  }))
}

export interface PropertySummary {
  propertyId: PropertyId
  /** Up to two, in candidate order. May be empty. */
  advantages: Advantage[]
  /** The first two triggered alerts, in rule order. */
  watchPoints: Alert[]
  /** Alerts beyond the first two, visible in the comparison. */
  moreWatchPoints: number
  /** Every triggered alert, in rule order. */
  allWatchPoints: Alert[]
  /** One question per alert; a missing value is itself an alert. */
  questions: Alert[]
  /** Standing among the selected properties. */
  rating: Rating
}

/** Summaries in selection order. */
export function buildSummaries(views: readonly PropertyView[]): PropertySummary[] {
  const advantages = relativeAdvantages(views)
  const { maxWatchPoints } = config.summary

  const summaries = views.map((view) => ({
    propertyId: view.property.id,
    advantages: advantages.get(view.property.id) ?? [],
    watchPoints: view.alerts.slice(0, maxWatchPoints),
    moreWatchPoints: Math.max(0, view.alerts.length - maxWatchPoints),
    allWatchPoints: view.alerts,
    questions: view.alerts,
  }))

  const ratings = rateProperties(
    summaries.map((summary) => ({
      advantages: summary.advantages.length,
      pointsToVerify: summary.allWatchPoints.length,
    })),
  )

  return summaries.map((summary, index) => ({ ...summary, rating: ratings[index] }))
}
