import { useEffect, useRef, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useI18n } from '@/i18n'
import type { PropertySummary } from '@/lib/summary'
import type { PropertyView } from '@/lib/view'
import type { Choice } from '@/stages'
import { AdvantageList, QuestionList, WatchPointList } from './SummaryLists'

interface DecisionPanelProps {
  views: PropertyView[]
  summaries: PropertySummary[]
  choice: Choice
  onChange: () => void
  onStartNew: () => void
}

function Answer({ step, title, hint, children }: { step?: string; title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-start gap-2.5">
        {step ? (
          <span
            aria-hidden="true"
            className="mt-px flex size-6 shrink-0 items-center justify-center rounded-md bg-foreground text-xs font-semibold text-background tabular-nums"
          >
            {step}
          </span>
        ) : null}
        <div>
          <h3 className="text-sm leading-6 font-semibold">{title}</h3>
          {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
        </div>
      </div>
      {children}
    </section>
  )
}

/**
 * The recorded decision, set out as the three questions the investor should be able to answer:
 * why this property, which risks are accepted, and what is not yet verified.
 */
export function DecisionPanel({ views, summaries, choice, onChange, onStartNew }: DecisionPanelProps) {
  const { t, fmt, text } = useI18n()
  const panel = t.decide.panel
  const headingRef = useRef<HTMLHeadingElement>(null)

  // Move focus to the result, so keyboard and screen-reader users land on what just appeared.
  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  const pickedIndex = views.findIndex((view) => view.property.id === choice)
  const picked = pickedIndex === -1 ? null : { view: views[pickedIndex], summary: summaries[pickedIndex] }

  return (
    <Card className="gap-0 py-0 ring-2 ring-primary">
      <CardHeader className="gap-1 border-b px-5 py-4">
        <p className="text-xs font-medium text-muted-foreground">{panel.title}</p>
        <CardTitle>
          <h2 ref={headingRef} tabIndex={-1} className="text-lg font-semibold outline-none">
            {picked ? t.decide.decision.myPick(text(picked.view.property.project)) : t.decide.decision.none}
          </h2>
        </CardTitle>
      </CardHeader>

      <CardContent className="px-5 py-5">
        {picked ? (
          <div className="grid grid-cols-3 gap-x-8">
            <Answer step={fmt.number(1)} title={panel.why}>
              <AdvantageList advantages={picked.summary.advantages} view={picked.view} />
            </Answer>
            <Answer step={fmt.number(2)} title={panel.risks}>
              <WatchPointList alerts={picked.summary.allWatchPoints} view={picked.view} />
            </Answer>
            <Answer step={fmt.number(3)} title={panel.unverified} hint={panel.unverifiedHint}>
              <QuestionList alerts={picked.summary.questions} view={picked.view} />
            </Answer>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <h3 className="text-sm font-semibold">{panel.noneTitle}</h3>
            <div className="grid auto-cols-fr grid-flow-col gap-x-8">
              {views.map((view, index) => (
                <section key={view.property.id} className="flex flex-col gap-4">
                  <h4 className="border-b pb-2 text-sm font-semibold">{text(view.property.project)}</h4>
                  <Answer title={panel.watchPoints}>
                    <WatchPointList alerts={summaries[index].allWatchPoints} view={view} />
                  </Answer>
                  <Answer title={panel.openQuestions}>
                    <QuestionList alerts={summaries[index].questions} view={view} />
                  </Answer>
                </section>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="justify-between gap-4 px-5 py-3.5">
        <p className="text-xs text-muted-foreground">{t.decide.decision.notSaved}</p>
        <div className="flex shrink-0 items-center gap-2.5">
          <Button variant="outline" size="lg" onClick={onChange} className="px-4">
            {panel.change}
          </Button>
          <Button variant="outline" size="lg" onClick={onStartNew} className="px-4">
            {panel.startNew}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
