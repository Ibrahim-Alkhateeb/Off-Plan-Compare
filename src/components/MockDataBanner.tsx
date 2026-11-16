import { FlaskConical } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useI18n } from '@/i18n'

/** Permanent notice, visible at every stage and not dismissible. */
export function MockDataBanner() {
  const { t } = useI18n()
  return (
    <Alert
      role="note"
      className="flex shrink-0 items-center justify-center gap-2 rounded-none border-x-0 border-t-0 border-b-border-strong bg-secondary px-6 py-1.5"
    >
      <FlaskConical aria-hidden="true" className="size-3.5! shrink-0 translate-y-0! text-muted-foreground" />
      <AlertDescription className="text-xs font-medium text-foreground">{t.app.mockNotice}</AlertDescription>
    </Alert>
  )
}
