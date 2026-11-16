import type { ReactNode } from 'react'
import { AlertNote } from '@/components/AlertNote'
import { MissingValue } from '@/components/MissingValue'
import { FigureSource } from '@/components/SourceLabel'
import { useI18n } from '@/i18n'
import { alertCell, alertId } from '@/lib/alerts'
import { FIGURE_SOURCE, type FigureKey } from '@/lib/figures'
import { cn } from '@/lib/utils'
import type { PropertyView } from '@/lib/view'
import { alertAnchor } from './anchors'

/**
 * Key figures are set larger and heavier than the inputs behind them.
 * A row marks itself as `data-tone="detail"` to step its figures down.
 */
const figureClasses =
  'text-[15px] leading-5 font-semibold tabular-nums group-data-[tone=detail]/row:text-sm group-data-[tone=detail]/row:font-normal'

/** A figure that is a short sentence rather than a number reads better a little lighter. */
const sentenceClasses = 'text-sm leading-5 font-medium group-data-[tone=detail]/row:font-normal'

/**
 * The figure and its source label share a line when the column is wide enough,
 * and stack when it is not. Either way the figure comes first.
 */
const figureLineClasses = 'flex flex-wrap items-center gap-x-2.5 gap-y-1'

/** Alerts that belong in the cell of a given figure. Each can be jumped to by id. */
export function CellAlerts({ view, figure }: { view: PropertyView; figure: FigureKey }) {
  const alerts = view.alerts.filter((alert) => alertCell(alert) === figure)
  return (
    <>
      {alerts.map((alert) => (
        <AlertNote key={alertId(alert)} id={alertAnchor(view.property.id, alert)} alert={alert} />
      ))}
    </>
  )
}

interface FigureCellProps {
  view: PropertyView
  figure: FigureKey
  /** The formatted figure, or `null` when it is not available. */
  value: string | null
  /** What the figure is measured against, shown smaller after it: "per sqft". */
  unit?: string
  /** True when the figure is a sentence, not a number. */
  sentence?: boolean
  /** Context shown under the figure. */
  sub?: string
  /** Neutral "highest" / "lowest" descriptor. */
  tag?: ReactNode
}

/** One figure: the value, its source label, and any alert that relates to it. */
export function FigureCell({ view, figure, value, unit, sentence, sub, tag }: FigureCellProps) {
  // A missing calculated figure keeps its label, which explains what could not be calculated.
  const showSource = value !== null || FIGURE_SOURCE[figure] === 'calculated'
  const source = showSource ? <FigureSource figure={figure} view={view} variant="quiet" /> : null

  return (
    <div className="flex flex-col items-start gap-1.5">
      <div className={figureLineClasses}>
        {value === null ? (
          <MissingValue />
        ) : (
          <span className={sentence ? sentenceClasses : figureClasses}>
            {value}
            {unit ? (
              <>
                {' '}
                <span className="text-xs font-normal text-muted-foreground">{unit}</span>
              </>
            ) : null}
          </span>
        )}
        {source}
        {value !== null ? tag : null}
      </div>
      {sub && value !== null ? <span className="text-xs leading-4 text-muted-foreground">{sub}</span> : null}
      <CellAlerts view={view} figure={figure} />
    </div>
  )
}

interface StageCellProps {
  view: PropertyView
  /** Share of the price, in percent. `null` when no payment plan was provided. */
  share: number | null
  amount: number | null
  shareFigure: FigureKey
  amountFigure: FigureKey
  sub?: string
}

/** One payment stage: its share of the price and the amount, each with its own source. */
export function StageCell({ view, share, amount, shareFigure, amountFigure, sub }: StageCellProps) {
  const { t, fmt } = useI18n()

  if (share === null || amount === null) {
    return (
      <div className="flex flex-col items-start gap-1.5">
        <MissingValue />
        <CellAlerts view={view} figure={shareFigure} />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      {share === 0 ? (
        <div className={figureLineClasses}>
          <span className={cn(sentenceClasses, 'font-semibold')}>{t.compare.values.none}</span>
          <FigureSource figure={shareFigure} view={view} variant="quiet" />
        </div>
      ) : (
        <div className="grid grid-cols-[minmax(5.25rem,auto)_1fr] gap-x-3">
          <div className="flex flex-col items-start gap-1">
            <span className={figureClasses}>{fmt.share(share)}</span>
            <FigureSource figure={shareFigure} view={view} variant="quiet" />
          </div>
          <div className="flex flex-col items-start gap-1">
            <span className={figureClasses}>{fmt.aed(amount)}</span>
            <FigureSource figure={amountFigure} view={view} variant="quiet" />
          </div>
        </div>
      )}
      {sub ? <span className="text-xs leading-4 text-muted-foreground">{sub}</span> : null}
      <CellAlerts view={view} figure={shareFigure} />
    </div>
  )
}
