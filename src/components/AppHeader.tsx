import { Columns3 } from 'lucide-react'
import type { ReactNode } from 'react'
import { useI18n } from '@/i18n'
import { LanguageSwitch } from './LanguageSwitch'

/** Brand, stage stepper and language switch. */
export function AppHeader({ stepper }: { stepper: ReactNode }) {
  const { t } = useI18n()
  return (
    <header className="grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-4 border-b bg-card px-6 xl:px-10">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Columns3 aria-hidden="true" className="size-4" />
        </span>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-semibold">{t.app.name}</p>
          <p className="hidden truncate text-xs text-muted-foreground xl:block">{t.app.tagline}</p>
        </div>
      </div>
      {stepper}
      <div className="flex justify-end">
        <LanguageSwitch />
      </div>
    </header>
  )
}
