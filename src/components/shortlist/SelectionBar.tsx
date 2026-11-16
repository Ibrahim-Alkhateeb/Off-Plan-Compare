import { ArrowRight, X } from 'lucide-react'
import { config } from '@/config'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useI18n } from '@/i18n'
import type { PropertyView } from '@/lib/view'
import type { PropertyId } from '@/types'

interface SelectionBarProps {
  /** Selected properties, in selection order. */
  selected: PropertyView[]
  onRemove: (id: PropertyId) => void
  onCompare: () => void
}

/** Selection count, the selected properties in order, and the Compare action. */
export function SelectionBar({ selected, onRemove, onCompare }: SelectionBarProps) {
  const { t, fmt, text } = useI18n()
  const { min, max } = config.selection
  const count = selected.length
  const ready = count >= min

  const helper = !ready
    ? t.shortlist.helperMin
    : count < max
      ? t.shortlist.helperCanAdd
      : t.shortlist.helperMax

  return (
    <>
      <div className="flex w-40 shrink-0 flex-col gap-2">
        <p id="selection-count" aria-live="polite" className="text-sm font-semibold tabular-nums">
          {t.shortlist.selectedCount(fmt.number(count), fmt.number(max))}
        </p>
        <Progress value={(count / max) * 100} aria-labelledby="selection-count" className="h-1.5" />
      </div>

      <ul aria-label={t.shortlist.selectionLabel} className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        {count === 0 ? (
          <li className="text-sm text-muted-foreground">{t.shortlist.noneSelected}</li>
        ) : (
          selected.map((view, index) => {
            const name = text(view.property.project)
            return (
              <li key={view.property.id}>
                <Badge variant="outline" className="h-8 gap-2 rounded-md border-border-strong ps-1.5 pe-1 text-sm">
                  <span className="flex size-5 items-center justify-center rounded bg-secondary text-xs font-semibold tabular-nums">
                    {fmt.number(index + 1)}
                  </span>
                  {name}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label={t.shortlist.remove(name)}
                        onClick={() => onRemove(view.property.id)}
                      >
                        <X aria-hidden="true" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">{t.shortlist.remove(name)}</TooltipContent>
                  </Tooltip>
                </Badge>
              </li>
            )
          })
        )}
      </ul>

      <div className="flex shrink-0 items-center gap-4">
        <p id="compare-helper" className="text-sm text-muted-foreground">
          {helper}
        </p>
        <Button size="lg" disabled={!ready} aria-describedby="compare-helper" onClick={onCompare} className="px-4">
          {t.shortlist.compare}
          <ArrowRight aria-hidden="true" className="rtl:rotate-180" />
        </Button>
      </div>
    </>
  )
}
