import { useId } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { MissingValue } from '@/components/MissingValue'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'
import type { PropertyView } from '@/lib/view'

interface PropertyCardProps {
  view: PropertyView
  /** Position in the comparison, starting at 1. `null` when not selected. */
  position: number | null
  /** True when the comparison is full and this property is not part of it. */
  locked: boolean
  onToggle: () => void
  /** Called when a locked card is clicked, to explain why nothing happened. */
  onLockedAttempt: () => void
}

export function PropertyCard({ view, position, locked, onToggle, onLockedAttempt }: PropertyCardProps) {
  const { t, fmt, text } = useI18n()
  const { property, area, developer } = view
  const titleId = useId()
  const checkboxId = useId()
  const selected = position !== null

  return (
    <Card
      className={cn(
        'h-full gap-0 py-0 transition-shadow',
        selected ? 'ring-2 ring-primary' : 'hover:ring-foreground/20',
      )}
    >
      <CardHeader className="gap-0.5 px-5 pt-5 pb-4">
        <CardTitle>
          <h2 id={titleId} className="text-base font-semibold">
            {text(property.project)}
          </h2>
        </CardTitle>
        <CardDescription>{text(area.name)}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 px-5 pb-5">
        <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-2.5 text-sm">
          <dt className="text-muted-foreground">{t.shortlist.labels.developer}</dt>
          <dd>{text(developer.name)}</dd>

          <dt className="text-muted-foreground">{t.shortlist.labels.unit}</dt>
          <dd className="tabular-nums">
            {t.format.join([fmt.unitType(property.unitType), fmt.sqft(property.unitAreaSqft)])}
          </dd>

          <dt className="text-muted-foreground">{t.shortlist.labels.price}</dt>
          <dd className="font-semibold tabular-nums">{fmt.aed(property.priceAed)}</dd>

          <dt className="text-muted-foreground">{t.shortlist.labels.handover}</dt>
          <dd className="tabular-nums">
            {property.handover ? fmt.quarter(property.handover) : <MissingValue />}
          </dd>
        </dl>
      </CardContent>

      <CardFooter className="justify-between gap-3 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <Checkbox
            id={checkboxId}
            checked={selected}
            // Kept focusable and clickable when locked, so the reason can be given.
            aria-disabled={locked || undefined}
            aria-describedby={titleId}
            onCheckedChange={() => (locked ? onLockedAttempt() : onToggle())}
            className={cn('bg-card', locked && 'cursor-not-allowed opacity-50')}
          />
          <label
            htmlFor={checkboxId}
            className={cn(
              'cursor-pointer text-sm font-medium select-none',
              locked && 'cursor-not-allowed text-muted-foreground',
            )}
          >
            {t.shortlist.addToComparison}
          </label>
        </div>
        {selected ? (
          <Badge variant="secondary" className="rounded-md font-normal tabular-nums">
            {t.shortlist.columnPosition(fmt.number(position))}
          </Badge>
        ) : null}
      </CardFooter>
    </Card>
  )
}
