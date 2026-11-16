import { Info, TriangleAlert } from 'lucide-react'
import { Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger } from '@/components/ui/popover'
import { useI18n } from '@/i18n'
import { alertSeverity, type Alert, type AlertSeverity } from '@/lib/alerts'
import { alertRuleText, alertText } from '@/lib/describe'
import { cn } from '@/lib/utils'

/** Amber triangle for a point to verify, neutral circle for information. Shape differs as well as colour. */
export function AlertIcon({ severity, className }: { severity: AlertSeverity; className?: string }) {
  return severity === 'verify' ? (
    <TriangleAlert aria-hidden="true" className={cn('size-3.5 shrink-0 text-alert', className)} />
  ) : (
    <Info aria-hidden="true" className={cn('size-3.5 shrink-0 text-muted-foreground', className)} />
  )
}

/**
 * An alert shown inside the cell it relates to: icon plus short text.
 * Selecting it shows the rule and threshold behind it.
 */
export function AlertNote({ alert, id, className }: { alert: Alert; id?: string; className?: string }) {
  const i18n = useI18n()
  const severity = alertSeverity(alert)
  const severityLabel = i18n.t.alerts.severity[severity]

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          data-alert={alert.rule}
          className={cn(
            'inline-flex w-fit max-w-full cursor-pointer items-start gap-1.5 rounded-md border px-1.5 py-1 text-start text-xs leading-4 transition-colors outline-none',
            'focus-visible:ring-2 focus-visible:ring-ring aria-expanded:ring-1 aria-expanded:ring-foreground/40',
            severity === 'verify'
              ? 'border-alert-border bg-alert-surface text-alert-foreground hover:border-alert'
              : 'border-border bg-muted text-foreground hover:border-border-strong',
            className,
          )}
        >
          <AlertIcon severity={severity} className="mt-px" />
          <span>
            <span className="sr-only">{severityLabel}: </span>
            {alertText(alert, i18n)}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" collisionPadding={12} className="w-72 gap-2 p-3.5 text-[13px] leading-5">
        <PopoverHeader>
          <PopoverTitle className="flex items-center gap-1.5 text-sm">
            <AlertIcon severity={severity} className="size-4" />
            {severityLabel}
          </PopoverTitle>
        </PopoverHeader>
        <p>{alertRuleText(alert, i18n)}</p>
      </PopoverContent>
    </Popover>
  )
}
