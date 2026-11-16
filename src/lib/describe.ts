import { config } from '@/config'
import type { Translations } from '@/i18n/en'
import type { Lang } from '@/types'
import type { Alert, MissingItem } from './alerts'
import { roundForDisplay } from './calculations'
import { FIGURE_SOURCE, type FigureKey } from './figures'
import type { Formatter } from './format'
import type { Advantage, AdvantageKind } from './summary'
import type { PropertyView } from './view'

/**
 * Turns figures, alerts and advantages into sentences.
 * All wording comes from the language files; this module only fills in the values.
 */

export interface Wording {
  lang: Lang
  t: Translations
  fmt: Formatter
}

/** "5.6% above the Business Bay benchmark" */
export function benchmarkDiffText(view: PropertyView, { lang, t, fmt }: Wording): string {
  const decimals = config.display.benchmarkDiffDecimals
  const diff = view.metrics.benchmarkDiffPct
  const area = view.area.shortName[lang]
  const shown = roundForDisplay(diff, decimals)
  if (shown === 0) return t.compare.values.benchmarkLevel(area)
  const pct = fmt.percent(Math.abs(diff), decimals)
  return shown > 0 ? t.compare.values.benchmarkAbove(pct, area) : t.compare.values.benchmarkBelow(pct, area)
}

/** "8 months, based on 4 delayed projects" */
export function avgDelayText(months: number, delayedProjects: number, { t, fmt }: Wording): string {
  return t.compare.values.avgDelayBasis(fmt.months(months), delayedProjects, fmt.number(delayedProjects))
}

/** The short alert text shown in the comparison cell. */
export function alertText(alert: Alert, { t }: Wording): string {
  return t.alerts.text[alert.rule]
}

/** The rule behind an alert, with its threshold. */
export function alertRuleText(alert: Alert, { t, fmt }: Wording): string {
  const thresholds = config.alerts
  switch (alert.rule) {
    case 1:
      return t.alerts.rule.missing
    case 2:
      return t.alerts.rule.yieldGap(fmt.points(thresholds.yieldGapPoints, 1))
    case 3:
      return t.alerts.rule.priceAboveBenchmark(fmt.share(thresholds.priceAboveBenchmarkPct))
    case 4:
      return t.alerts.rule.historicalDelay(fmt.months(thresholds.avgDelayMonths))
    case 5:
      return t.alerts.rule.limitedRecord(fmt.number(thresholds.minDeliveredProjects))
    case 6:
      return t.alerts.rule.serviceCharge(fmt.aedPerSqftYear(thresholds.serviceChargePerSqft))
    case 7:
      return t.alerts.rule.postHandover
  }
}

/** The alert with this property's figures, used for watch points. */
export function alertDetail(alert: Alert, view: PropertyView, wording: Wording): string {
  const { t, fmt } = wording
  switch (alert.rule) {
    case 1:
      return t.alerts.detail.missing(t.alerts.missingItems[alert.item])
    case 2:
      return t.alerts.detail.yieldGap(
        fmt.yieldPct(alert.agentYieldPct),
        fmt.yieldPct(alert.yieldFromRentPct),
        fmt.points(alert.gapPoints, config.display.yieldDecimals),
      )
    case 3:
      return t.alerts.detail.priceAboveBenchmark(benchmarkDiffText(view, wording))
    case 4:
      return t.alerts.detail.historicalDelay(avgDelayText(alert.avgDelayMonths, alert.delayedProjects, wording))
    case 5:
      return t.alerts.detail.limitedRecord(
        alert.delivered,
        fmt.number(alert.delivered),
        fmt.number(config.alerts.minDeliveredProjects),
      )
    case 6:
      return t.alerts.detail.serviceCharge(
        fmt.aedPerSqftYear(alert.serviceChargePerSqft),
        fmt.aedPerSqftYear(config.alerts.serviceChargePerSqft),
      )
    case 7:
      return t.alerts.detail.postHandover(
        fmt.share(alert.postHandoverPct),
        fmt.aed(alert.postHandoverAmount),
        alert.months === null ? null : fmt.months(alert.months),
      )
  }
}

/** The question each alert generates for the agent. */
export function alertQuestion(alert: Alert, { t, fmt }: Wording): string {
  switch (alert.rule) {
    case 1:
      return t.alerts.questions.missing(t.alerts.missingItems[alert.item])
    case 2:
      return t.alerts.questions.yieldGap(fmt.yieldPct(alert.agentYieldPct))
    case 3:
      return t.alerts.questions.priceAboveBenchmark(
        fmt.percent(alert.diffPct, config.display.benchmarkDiffDecimals),
      )
    case 4:
      return t.alerts.questions.historicalDelay
    case 5:
      return t.alerts.questions.limitedRecord
    case 6:
      return t.alerts.questions.serviceCharge
    case 7:
      return t.alerts.questions.postHandover
  }
}

/** The figure whose source label accompanies an alert's detail. `null` when the detail has no number. */
export function alertFigure(alert: Alert): FigureKey | null {
  switch (alert.rule) {
    case 1:
      return null
    case 2:
      return 'yieldGap'
    case 3:
      return 'benchmarkDiff'
    case 4:
      return 'avgDelay'
    case 5:
      return 'projectsDelivered'
    case 6:
      return 'serviceChargePerSqft'
    case 7:
      return 'planPostHandoverAmount'
  }
}

/** The figure quoted inside an alert's question. `null` when the question has no number. */
export function questionFigure(alert: Alert): FigureKey | null {
  if (alert.rule === 2) return 'agentYield'
  if (alert.rule === 3) return 'benchmarkDiff'
  return null
}

const ADVANTAGE_FIGURE: Record<AdvantageKind, FigureKey> = {
  benchmarkDiff: 'benchmarkDiff',
  yieldAfterServiceCharges: 'yieldAfterServiceCharges',
  serviceCharge: 'serviceChargePerSqft',
  preHandoverShare: 'planConstructionPct',
  handover: 'handover',
  onTimeRate: 'onTimeRate',
}

export function advantageFigure(kind: AdvantageKind): FigureKey {
  return ADVANTAGE_FIGURE[kind]
}

function advantageValue(kind: AdvantageKind, view: PropertyView, wording: Wording): string | null {
  const { fmt } = wording
  const { metrics, property } = view
  switch (kind) {
    case 'benchmarkDiff':
      return benchmarkDiffText(view, wording)
    case 'yieldAfterServiceCharges':
      return metrics.yieldAfterServiceChargesPct === null
        ? null
        : fmt.yieldPct(metrics.yieldAfterServiceChargesPct)
    case 'serviceCharge':
      return metrics.serviceChargePerSqft === null ? null : fmt.aedPerSqftYear(metrics.serviceChargePerSqft)
    case 'preHandoverShare':
      return property.paymentPlan ? fmt.share(property.paymentPlan.constructionPct) : null
    case 'handover':
      return property.handover ? fmt.quarter(property.handover) : null
    case 'onTimeRate':
      return metrics.onTimeRatePct === null
        ? null
        : fmt.percent(metrics.onTimeRatePct, config.display.onTimeRateDecimals)
  }
}

/** "Lowest service charge of the three: AED 15 per sqft per year." A description, never a verdict. */
export function advantageText(advantage: Advantage, view: PropertyView, wording: Wording): string {
  const { t } = wording
  const scope =
    advantage.comparedCount === advantage.selectedCount
      ? t.decide.scopeAll(advantage.selectedCount)
      : t.decide.scopePartial(advantage.comparedCount)
  const value = advantageValue(advantage.kind, view, wording) ?? t.compare.notAvailable
  return t.decide.advantages[advantage.kind](scope, value)
}

export type FigureExplanation =
  | { kind: 'agent' | 'benchmark' | 'developer'; text: string }
  | {
      kind: 'calculated'
      /** The formula in words. */
      formula: string
      /** The same formula with this property's inputs. `null` when an input is missing. */
      worked: string | null
      /** Why the figure cannot be calculated. `null` when it can. */
      unavailable: string | null
      /** Where the inputs come from. */
      inputs: string
    }

/** What the source label of a figure says when it is opened. */
export function explainFigure(figure: FigureKey, view: PropertyView, wording: Wording): FigureExplanation {
  const { lang, t, fmt } = wording
  const { property, metrics, area } = view
  const source = FIGURE_SOURCE[figure]

  if (source === 'agent') return { kind: 'agent', text: t.sources.agent }
  if (source === 'benchmark') return { kind: 'benchmark', text: t.sources.benchmark(area.name[lang]) }
  if (source === 'developer') return { kind: 'developer', text: t.sources.developer }

  const formulas = t.sources.formulas
  const price = fmt.aed(property.priceAed)
  const unitArea = fmt.sqft(property.unitAreaSqft)
  const feePct = fmt.share(config.registrationFeePct)

  const calculated = (formula: string, inputs: string, worked: string): FigureExplanation => ({
    kind: 'calculated',
    formula,
    worked,
    unavailable: null,
    inputs,
  })
  const unavailable = (formula: string, inputs: string, missing: MissingItem): FigureExplanation => ({
    kind: 'calculated',
    formula,
    worked: null,
    unavailable: t.sources.calculated.unavailable(t.alerts.missingItems[missing]),
    inputs,
  })

  switch (figure) {
    case 'pricePerSqft': {
      const f = formulas.pricePerSqft
      return calculated(f.words, f.inputs, f.worked(price, unitArea, fmt.aedPerSqft(metrics.pricePerSqft)))
    }

    case 'benchmarkDiff': {
      const f = formulas.benchmarkDiff
      return calculated(
        f.words,
        f.inputs,
        f.worked(
          fmt.aed(metrics.pricePerSqft),
          fmt.aed(metrics.benchmarkPricePerSqft),
          benchmarkDiffText(view, wording),
        ),
      )
    }

    case 'yieldFromRent': {
      const f = formulas.yieldFromRent
      if (metrics.areaAnnualRent === null || metrics.yieldFromRentPct === null) {
        return unavailable(f.words, f.inputs, 'areaRent')
      }
      return calculated(
        f.words,
        f.inputs,
        f.worked(fmt.aed(metrics.areaAnnualRent), price, fmt.yieldPct(metrics.yieldFromRentPct)),
      )
    }

    case 'annualServiceCharge': {
      const f = formulas.annualServiceCharge
      if (metrics.serviceChargePerSqft === null || metrics.annualServiceCharge === null) {
        return unavailable(f.words, f.inputs, 'serviceCharge')
      }
      return calculated(
        f.words,
        f.inputs,
        f.worked(
          fmt.aed(metrics.serviceChargePerSqft),
          unitArea,
          fmt.aedPerYear(metrics.annualServiceCharge),
        ),
      )
    }

    case 'yieldAfterServiceCharges': {
      const f = formulas.yieldAfterServiceCharges
      if (metrics.areaAnnualRent === null) return unavailable(f.words, f.inputs, 'areaRent')
      if (metrics.annualServiceCharge === null || metrics.yieldAfterServiceChargesPct === null) {
        return unavailable(f.words, f.inputs, 'serviceCharge')
      }
      return calculated(
        f.words,
        f.inputs,
        f.worked(
          fmt.aed(metrics.areaAnnualRent),
          fmt.aed(metrics.annualServiceCharge),
          price,
          fmt.yieldPct(metrics.yieldAfterServiceChargesPct),
        ),
      )
    }

    case 'yieldGap': {
      const f = formulas.yieldGap
      if (metrics.agentYieldPct === null) return unavailable(f.words, f.inputs, 'agentYield')
      if (metrics.yieldFromRentPct === null || metrics.yieldGapPoints === null) {
        return unavailable(f.words, f.inputs, 'areaRent')
      }
      return calculated(
        f.words,
        f.inputs,
        f.worked(
          fmt.yieldPct(metrics.agentYieldPct),
          fmt.yieldPct(metrics.yieldFromRentPct),
          fmt.points(metrics.yieldGapPoints, config.display.yieldDecimals),
        ),
      )
    }

    case 'planConstructionAmount':
    case 'planHandoverAmount':
    case 'planPostHandoverAmount': {
      const f = formulas.stageAmount
      const plan = property.paymentPlan
      const amounts = metrics.stageAmounts
      if (!plan || !amounts) return unavailable(f.words, f.inputs, 'paymentPlan')
      const [share, amount] =
        figure === 'planConstructionAmount'
          ? [plan.constructionPct, amounts.construction]
          : figure === 'planHandoverAmount'
            ? [plan.handoverPct, amounts.handover]
            : [plan.postHandoverPct, amounts.postHandover]
      return calculated(f.words, f.inputs, f.worked(price, fmt.share(share), fmt.aed(amount)))
    }

    case 'registrationFee': {
      const f = formulas.registrationFee
      return calculated(
        f.words(feePct),
        f.inputs(feePct),
        f.worked(price, feePct, fmt.aed(metrics.registrationFee)),
      )
    }

    case 'totalCommitment': {
      const f = formulas.totalCommitment
      return calculated(
        f.words,
        f.inputs,
        f.worked(price, fmt.aed(metrics.registrationFee), fmt.aed(metrics.totalCommitment)),
      )
    }

    case 'onTimeRate': {
      // No rate is reported for a limited record; the label then points to the developer record itself.
      if (metrics.onTimeRatePct === null) return { kind: 'developer', text: t.sources.developer }
      const f = formulas.onTimeRate
      return calculated(
        f.words,
        f.inputs,
        f.worked(
          fmt.number(metrics.onTime),
          fmt.number(metrics.delivered),
          fmt.percent(metrics.onTimeRatePct, config.display.onTimeRateDecimals),
        ),
      )
    }

    default:
      return { kind: 'agent', text: t.sources.agent }
  }
}
