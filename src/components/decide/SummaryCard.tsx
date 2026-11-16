import type { ReactNode } from 'react'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useI18n } from '@/i18n'
import type { PropertySummary } from '@/lib/summary'
import type { PropertyView } from '@/lib/view'
import { RatingBadge } from './RatingBadge'
import { AdvantageList, QuestionList, WatchPointList } from './SummaryLists'

function Block({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      {children}
    </section>
  )
}

/** What the comparison shows for one property: its rating, advantages, watch points and questions. */
export function SummaryCard({ view, summary }: { view: PropertyView; summary: PropertySummary }) {
  const { t, text } = useI18n()

  return (
    <Card className="h-full gap-0 py-0">
      <CardHeader className="gap-x-3 gap-y-0.5 border-b px-5 py-4">
        <CardTitle>
          <h2 className="text-base font-semibold">{text(view.property.project)}</h2>
        </CardTitle>
        <CardAction>
          <RatingBadge rating={summary.rating} />
        </CardAction>
        <CardDescription>{t.format.join([text(view.area.name), text(view.developer.name)])}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-5 px-5 py-5">
        <Block title={t.decide.advantagesTitle} hint={t.decide.advantagesHint}>
          <AdvantageList advantages={summary.advantages} view={view} />
        </Block>
        <Separator />
        <Block title={t.decide.watchPointsTitle}>
          <WatchPointList alerts={summary.watchPoints} view={view} more={summary.moreWatchPoints} />
        </Block>
        <Separator />
        <Block title={t.decide.questionsTitle}>
          <QuestionList alerts={summary.questions} view={view} />
        </Block>
      </CardContent>
    </Card>
  )
}
