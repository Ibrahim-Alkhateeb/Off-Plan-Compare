import { Check, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'
import { STAGES, type Stage } from '@/stages'

interface StepperProps {
  current: Stage
  /** Whether the investor can move to a stage right now. */
  canGoTo: (stage: Stage) => boolean
  /** Why a stage cannot be opened yet, shown as a hint. */
  lockedReason: (stage: Stage) => string
  onNavigate: (stage: Stage) => void
}

export function Stepper({ current, canGoTo, lockedReason, onNavigate }: StepperProps) {
  const { t, fmt } = useI18n()
  const currentIndex = STAGES.indexOf(current)

  return (
    <nav aria-label={t.stepper.label}>
      <ol className="flex items-center gap-1">
        {STAGES.map((stage, index) => {
          const isCurrent = index === currentIndex
          const isDone = index < currentIndex
          const reachable = canGoTo(stage)

          const button = (
            <Button
              variant="ghost"
              aria-current={isCurrent ? 'step' : undefined}
              aria-disabled={reachable ? undefined : true}
              onClick={() => {
                if (reachable && !isCurrent) onNavigate(stage)
              }}
              className={cn(
                'h-9 gap-2 px-2.5',
                isCurrent ? 'text-foreground' : 'font-normal text-muted-foreground',
                !reachable && 'cursor-not-allowed opacity-60 hover:bg-transparent hover:text-muted-foreground',
              )}
            >
              <span
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold tabular-nums',
                  isCurrent && 'border-primary bg-primary text-primary-foreground',
                  isDone && 'border-primary text-primary',
                  !isCurrent && !isDone && 'border-input text-muted-foreground',
                )}
              >
                {isDone ? <Check aria-hidden="true" className="size-3.5" /> : fmt.number(index + 1)}
              </span>
              <span>{t.stepper.steps[stage]}</span>
              {isCurrent ? <span className="sr-only">({t.stepper.current})</span> : null}
              {isDone ? <span className="sr-only">({t.stepper.completed})</span> : null}
            </Button>
          )

          return (
            <li key={stage} className="flex items-center gap-1">
              {index > 0 ? (
                <ChevronRight aria-hidden="true" className="size-4 text-muted-foreground rtl:rotate-180" />
              ) : null}
              {reachable ? (
                button
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>{button}</TooltipTrigger>
                  <TooltipContent side="bottom">{lockedReason(stage)}</TooltipContent>
                </Tooltip>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
