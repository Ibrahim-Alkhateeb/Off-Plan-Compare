import { CircleHelp } from 'lucide-react'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'

/** A value that was not provided. Never shown as zero, never left blank. */
export function MissingValue({ className }: { className?: string }) {
  const { t } = useI18n()
  return (
    <span className={cn('inline-flex items-start gap-1.5 text-sm text-foreground', className)}>
      <CircleHelp aria-hidden="true" className="mt-[3px] size-3.5 shrink-0 text-muted-foreground" />
      {t.compare.notAvailable}
    </span>
  )
}
