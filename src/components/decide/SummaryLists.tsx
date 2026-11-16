import { AlertIcon } from '@/components/AlertNote'
import { FigureSource } from '@/components/SourceLabel'
import { useI18n } from '@/i18n'
import { alertId, alertSeverity, type Alert } from '@/lib/alerts'
import {
  advantageFigure,
  advantageText,
  alertDetail,
  alertFigure,
  alertQuestion,
  alertText,
  questionFigure,
} from '@/lib/describe'
import type { Advantage } from '@/lib/summary'
import type { PropertyView } from '@/lib/view'

const emptyClasses = 'text-sm leading-6 text-muted-foreground'

/** Relative advantages, each a description with its figure and source. */
export function AdvantageList({ advantages, view }: { advantages: Advantage[]; view: PropertyView }) {
  const i18n = useI18n()

  if (advantages.length === 0) {
    return <p className={emptyClasses}>{i18n.t.decide.noAdvantage}</p>
  }

  return (
    <ul className="flex flex-col gap-3.5">
      {advantages.map((advantage) => (
        <li key={advantage.kind} className="flex flex-col items-start gap-1.5">
          <p className="text-sm leading-6">{advantageText(advantage, view, i18n)}</p>
          <FigureSource figure={advantageFigure(advantage.kind)} view={view} />
        </li>
      ))}
    </ul>
  )
}

interface WatchPointListProps {
  alerts: Alert[]
  view: PropertyView
  /** Alerts not listed here but visible in the comparison. */
  more?: number
}

/** Triggered alerts with this property's figures. */
export function WatchPointList({ alerts, view, more = 0 }: WatchPointListProps) {
  const i18n = useI18n()
  const { t, fmt } = i18n

  if (alerts.length === 0) {
    return <p className={emptyClasses}>{t.decide.noWatchPoints}</p>
  }

  return (
    <div className="flex flex-col gap-3.5">
      <ul className="flex flex-col gap-3.5">
        {alerts.map((alert) => {
          const severity = alertSeverity(alert)
          const figure = alertFigure(alert)
          return (
            <li key={alertId(alert)} className="flex items-start gap-2">
              <AlertIcon severity={severity} className="mt-[5px]" />
              <div className="flex min-w-0 flex-col items-start gap-1.5">
                <div>
                  <p className="text-sm leading-6 font-medium">
                    <span className="sr-only">{t.alerts.severity[severity]}: </span>
                    {alertText(alert, i18n)}
                  </p>
                  <p className="text-sm leading-6">{alertDetail(alert, view, i18n)}</p>
                </div>
                {figure ? <FigureSource figure={figure} view={view} /> : null}
              </div>
            </li>
          )
        })}
      </ul>
      {more > 0 ? <p className="text-xs text-muted-foreground">{t.decide.more(fmt.number(more))}</p> : null}
    </div>
  )
}

/** One question for the agent per alert. */
export function QuestionList({ alerts, view }: { alerts: Alert[]; view: PropertyView }) {
  const i18n = useI18n()

  if (alerts.length === 0) {
    return <p className={emptyClasses}>{i18n.t.decide.noQuestions}</p>
  }

  return (
    <ol className="flex flex-col gap-3.5">
      {alerts.map((alert, index) => {
        const figure = questionFigure(alert)
        return (
          <li key={alertId(alert)} className="flex items-start gap-2.5">
            <span
              aria-hidden="true"
              className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-medium text-muted-foreground tabular-nums"
            >
              {i18n.fmt.number(index + 1)}
            </span>
            <div className="flex min-w-0 flex-col items-start gap-1.5">
              <p className="text-sm leading-6">{alertQuestion(alert, i18n)}</p>
              {figure ? <FigureSource figure={figure} view={view} /> : null}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
