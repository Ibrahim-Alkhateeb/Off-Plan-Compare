import { AlertIcon } from '@/components/AlertNote'
import { useI18n } from '@/i18n'
import type { AlertSeverity } from '@/lib/alerts'
import type { SectionKey } from '@/lib/figures'
import { cn } from '@/lib/utils'

export interface SectionNavItem {
  key: SectionKey
  index: string
  short: string
  title: string
  /** Alerts raised in this criterion, across all compared properties. */
  alertCount: number
  /** `verify` if any of them needs verifying, otherwise `info`. `null` when there is none. */
  severity: AlertSeverity | null
}

interface SectionNavProps {
  items: SectionNavItem[]
  /** The criterion currently at the top of the table body. */
  active: SectionKey
  onJump: (key: SectionKey) => void
}

/**
 * A compact index of the six criteria. It lives in the sticky corner of the table,
 * so it stays in view, shows where the reader is, and marks where the alerts are.
 */
export function SectionNav({ items, active, onJump }: SectionNavProps) {
  const { t, fmt } = useI18n()

  return (
    <nav aria-label={t.compare.nav.label} className="font-normal">
      <p aria-hidden="true" className="mb-1 text-[11px] leading-4 text-muted-foreground">
        {t.compare.nav.title}
      </p>
      <ul className="grid grid-cols-2 gap-x-1 gap-y-0.5">
        {items.map((item) => {
          const isActive = item.key === active
          return (
            <li key={item.key} className="min-w-0">
              <button
                type="button"
                title={item.title}
                aria-current={isActive ? 'true' : undefined}
                onClick={() => onJump(item.key)}
                className={cn(
                  'flex w-full min-w-0 cursor-pointer items-center gap-1.5 rounded-md py-0.5 ps-0.5 pe-1 text-start text-xs leading-4 transition-colors outline-none',
                  'hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring',
                  isActive ? 'bg-secondary font-semibold text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex size-[18px] shrink-0 items-center justify-center rounded text-[10px] leading-none font-semibold',
                    isActive ? 'bg-foreground text-background' : 'bg-foreground/10 text-foreground',
                  )}
                >
                  {item.index}
                </span>
                <span className="truncate">{item.short}</span>
                {item.severity ? (
                  <>
                    <AlertIcon severity={item.severity} className="size-3" />
                    <span className="sr-only">{t.compare.nav.alerts(item.alertCount, fmt.number(item.alertCount))}</span>
                  </>
                ) : null}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
