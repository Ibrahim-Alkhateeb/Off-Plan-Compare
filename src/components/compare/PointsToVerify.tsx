import { ChevronDown } from 'lucide-react'
import { useRef, useState } from 'react'
import { AlertIcon } from '@/components/AlertNote'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useI18n } from '@/i18n'
import { alertCell, alertId, alertSeverity, type Alert } from '@/lib/alerts'
import { alertText } from '@/lib/describe'
import { FIGURE_SECTION } from '@/lib/figures'
import { cn } from '@/lib/utils'
import type { PropertyView } from '@/lib/view'
import { jumpToAlert } from './anchors'

const badgeClasses = 'inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-xs leading-4'

/**
 * How many alerts a property triggered, shown in its sticky header.
 * Opening it lists them; choosing one goes straight to it in the table.
 */
export function PointsToVerify({ view }: { view: PropertyView }) {
  const i18n = useI18n()
  const { t, fmt } = i18n
  const [open, setOpen] = useState(false)
  /** The alert to go to once the list has closed. */
  const pending = useRef<Alert | null>(null)
  const count = view.alerts.length

  if (count === 0) {
    return (
      <span className={cn(badgeClasses, 'font-normal whitespace-nowrap text-muted-foreground')}>
        {t.compare.noPoints}
      </span>
    )
  }

  const needsVerifying = view.alerts.some((alert) => alertSeverity(alert) === 'verify')
  const label = t.compare.pointsToVerify(count, fmt.number(count))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-points={count}
          className={cn(
            badgeClasses,
            'cursor-pointer font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
            needsVerifying
              ? 'border-alert-border bg-alert-surface text-alert-foreground hover:border-alert'
              : 'bg-muted text-foreground hover:border-border-strong',
          )}
        >
          <AlertIcon severity={needsVerifying ? 'verify' : 'info'} />
          {label}
          <ChevronDown aria-hidden="true" className={cn('size-3 transition-transform', open && 'rotate-180')} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        collisionPadding={12}
        className="w-80 gap-1.5 p-2"
        onCloseAutoFocus={(event) => {
          // After a choice, focus goes to the chosen alert instead of back to this button.
          const alert = pending.current
          if (!alert) return
          pending.current = null
          event.preventDefault()
          jumpToAlert(view.property.id, alert)
        }}
      >
        <PopoverHeader className="px-1.5 pt-1">
          <PopoverTitle>{label}</PopoverTitle>
          <PopoverDescription className="text-xs">{t.compare.points.hint}</PopoverDescription>
        </PopoverHeader>
        <ul>
          {view.alerts.map((alert) => {
            const section = t.compare.sections[FIGURE_SECTION[alertCell(alert)]]
            return (
              <li key={alertId(alert)}>
                <button
                  type="button"
                  onClick={() => {
                    pending.current = alert
                    setOpen(false)
                  }}
                  className="flex w-full cursor-pointer items-start gap-2 rounded-md px-1.5 py-1.5 text-start text-[13px] leading-5 outline-none hover:bg-muted focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <AlertIcon severity={alertSeverity(alert)} className="mt-[3px]" />
                  <span>
                    <span className="block font-medium">{alertText(alert, i18n)}</span>
                    <span className="block text-xs text-muted-foreground">
                      {t.format.join([section.index, section.title])}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
