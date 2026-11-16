import { useEffect, useMemo, useRef, useState } from 'react'
import { config } from '@/config'
import { AppHeader } from '@/components/AppHeader'
import type { RowsShown } from '@/components/compare/ComparisonTable'
import { MockDataBanner } from '@/components/MockDataBanner'
import { STAGE_TITLE_ID } from '@/components/StageLayout'
import { Stepper } from '@/components/Stepper'
import { DirectionProvider } from '@/components/ui/direction'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { I18nProvider, useI18n } from '@/i18n'
import { buildViews } from '@/lib/view'
import { Compare } from '@/screens/Compare'
import { Decide } from '@/screens/Decide'
import { Shortlist } from '@/screens/Shortlist'
import { STAGES, type Choice, type Stage } from '@/stages'
import type { PropertyId } from '@/types'

/**
 * One page, three stages. All state lives here and is lost on refresh:
 * nothing is saved, sent or shared.
 */
function Workspace() {
  const { t, dir } = useI18n()

  const [stage, setStage] = useState<Stage>('shortlist')
  /** The latest stage reached with the current selection. Stages up to it can be reopened. */
  const [furthest, setFurthest] = useState<Stage>('shortlist')
  /** In selection order, which is also the column order. */
  const [selectedIds, setSelectedIds] = useState<PropertyId[]>([])
  const [choice, setChoice] = useState<Choice | null>(null)
  const [recorded, setRecorded] = useState(false)
  /** Kept here so the chosen view survives a trip to another stage and back. */
  const [rowsShown, setRowsShown] = useState<RowsShown>('key')

  const views = useMemo(() => buildViews(selectedIds), [selectedIds])
  const hasEnough = selectedIds.length >= config.selection.min

  const canGoTo = (target: Stage) =>
    target === 'shortlist' || (hasEnough && STAGES.indexOf(target) <= STAGES.indexOf(furthest))

  const goTo = (target: Stage) => {
    if (STAGES.indexOf(target) > STAGES.indexOf(furthest)) setFurthest(target)
    setStage(target)
  }

  const toggleProperty = (id: PropertyId) => {
    setSelectedIds((current) => {
      if (current.includes(id)) return current.filter((selected) => selected !== id)
      if (current.length >= config.selection.max) return current
      return [...current, id]
    })
    // A different selection is a different comparison: the earlier decision no longer applies.
    setFurthest('shortlist')
    setChoice(null)
    setRecorded(false)
  }

  const startNew = () => {
    setSelectedIds([])
    setChoice(null)
    setRecorded(false)
    setFurthest('shortlist')
    setStage('shortlist')
  }

  // On a stage change, move focus to the new stage's title so it is announced.
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    document.getElementById(STAGE_TITLE_ID)?.focus()
  }, [stage])

  return (
    <DirectionProvider dir={dir}>
      <TooltipProvider delayDuration={150}>
        <div className="flex h-dvh min-w-[1024px] flex-col">
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground"
          >
            {t.app.skipToContent}
          </a>

          <AppHeader
            stepper={
              <Stepper
                current={stage}
                canGoTo={canGoTo}
                lockedReason={(target) =>
                  target === 'decide' && hasEnough ? t.stepper.lockedCompare : t.stepper.lockedSelect
                }
                onNavigate={goTo}
              />
            }
          />
          <MockDataBanner />

          {stage === 'shortlist' ? (
            <Shortlist selectedIds={selectedIds} onToggle={toggleProperty} onCompare={() => goTo('compare')} />
          ) : null}

          {stage === 'compare' ? (
            <Compare
              views={views}
              rowsShown={rowsShown}
              onRowsShownChange={setRowsShown}
              onBack={() => goTo('shortlist')}
              onContinue={() => goTo('decide')}
            />
          ) : null}

          {stage === 'decide' ? (
            <Decide
              views={views}
              choice={choice}
              recorded={recorded}
              onChoose={setChoice}
              onRecord={() => setRecorded(true)}
              onChangeDecision={() => setRecorded(false)}
              onStartNew={startNew}
              onBack={() => goTo('compare')}
            />
          ) : null}
        </div>
        <Toaster position="top-center" dir={dir} offset={104} />
      </TooltipProvider>
    </DirectionProvider>
  )
}

export default function App() {
  return (
    <I18nProvider>
      <Workspace />
    </I18nProvider>
  )
}
