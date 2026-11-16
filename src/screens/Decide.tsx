import { ArrowLeft } from 'lucide-react'
import { useMemo } from 'react'
import { DecisionForm } from '@/components/decide/DecisionForm'
import { DecisionPanel } from '@/components/decide/DecisionPanel'
import { SummaryCard } from '@/components/decide/SummaryCard'
import { StageLayout } from '@/components/StageLayout'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n'
import { buildSummaries } from '@/lib/summary'
import type { PropertyView } from '@/lib/view'
import type { Choice } from '@/stages'

interface DecideProps {
  /** Selected properties, in selection order. */
  views: PropertyView[]
  choice: Choice | null
  recorded: boolean
  onChoose: (choice: Choice) => void
  onRecord: () => void
  onChangeDecision: () => void
  onStartNew: () => void
  onBack: () => void
}

export function Decide({
  views,
  choice,
  recorded,
  onChoose,
  onRecord,
  onChangeDecision,
  onStartNew,
  onBack,
}: DecideProps) {
  const { t } = useI18n()
  const summaries = useMemo(() => buildSummaries(views), [views])

  return (
    <StageLayout
      title={t.decide.title}
      intro={t.decide.intro}
      footer={
        <Button variant="outline" size="lg" onClick={onBack} className="px-4">
          <ArrowLeft aria-hidden="true" className="rtl:rotate-180" />
          {t.decide.back}
        </Button>
      }
    >
      <ul className="grid auto-cols-fr grid-flow-col gap-5">
        {views.map((view, index) => (
          <li key={view.property.id}>
            <SummaryCard view={view} summary={summaries[index]} />
          </li>
        ))}
      </ul>
      <div className="mt-4 mb-8 flex flex-col gap-1 text-xs text-muted-foreground">
        <p>{t.decide.rating.note}</p>
        <p>{t.compare.thresholdNote}</p>
      </div>

      {recorded && choice !== null ? (
        <DecisionPanel
          views={views}
          summaries={summaries}
          choice={choice}
          onChange={onChangeDecision}
          onStartNew={onStartNew}
        />
      ) : (
        <DecisionForm views={views} choice={choice} onChoose={onChoose} onRecord={onRecord} />
      )}
    </StageLayout>
  )
}
