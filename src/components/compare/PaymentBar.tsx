import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'
import type { PaymentPlan } from '@/types'

/** The three stages differ by fill pattern as well as shade. */
const SEGMENT_CLASSES = {
  construction: 'bg-primary',
  handover: 'bg-primary/40',
  postHandover: 'hatch border border-primary/60 bg-card',
} as const

export type StageSegment = keyof typeof SEGMENT_CLASSES

/** A horizontal bar split into the three payment shares. */
export function PaymentBar({ plan }: { plan: PaymentPlan }) {
  const { t, fmt } = useI18n()
  const shares: [StageSegment, number][] = [
    ['construction', plan.constructionPct],
    ['handover', plan.handoverPct],
    ['postHandover', plan.postHandoverPct],
  ]
  const label = t.compare.planSharesLabel(
    fmt.share(plan.constructionPct),
    fmt.share(plan.handoverPct),
    plan.postHandoverPct > 0 ? fmt.share(plan.postHandoverPct) : t.compare.values.none,
  )

  return (
    <div role="img" aria-label={label} className="flex h-3 w-full max-w-72 gap-0.5">
      {shares
        .filter(([, share]) => share > 0)
        .map(([segment, share]) => (
          <div
            key={segment}
            className={cn('h-full rounded-[2px]', SEGMENT_CLASSES[segment])}
            style={{ flex: `${share} 1 0%` }}
          />
        ))}
    </div>
  )
}

/**
 * The fill one stage has in the bar. Shown beside the stage's row name,
 * so the bar can be read without a separate key.
 */
export function StageSwatch({ segment }: { segment: StageSegment }) {
  return <span aria-hidden="true" className={cn('size-2.5 shrink-0 rounded-[2px]', SEGMENT_CLASSES[segment])} />
}
