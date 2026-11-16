import { ChevronsDown, ChevronsUp, Minus, type LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger } from '@/components/ui/popover'
import { useI18n } from '@/i18n'
import type { Rating, RatingLevel } from '@/lib/summary'
import { cn } from '@/lib/utils'

/** Each level has its own icon and wording. Neutral tones only: no red or green. */
const ICONS: Record<RatingLevel, LucideIcon> = {
  highest: ChevronsUp,
  average: Minus,
  lowest: ChevronsDown,
}

const LEVEL_CLASSES: Record<RatingLevel, string> = {
  highest: 'border-primary bg-primary/10 text-primary hover:bg-primary/15',
  average: 'border-border-strong bg-secondary text-foreground hover:bg-muted',
  lowest: 'border-border-strong bg-card text-muted-foreground hover:bg-muted',
}

/**
 * Where a property stands among the selected ones.
 * Opening it shows the counts and the rule the rating rests on.
 */
export function RatingBadge({ rating }: { rating: Rating }) {
  const { t, fmt } = useI18n()
  const Icon = ICONS[rating.level]
  const label = t.decide.rating.labels[rating.level]

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Badge
          asChild
          variant="outline"
          className={cn(
            'h-6 cursor-pointer gap-1 rounded-md px-2 text-xs font-medium transition-colors outline-none',
            'focus-visible:ring-2 focus-visible:ring-ring aria-expanded:ring-1 aria-expanded:ring-foreground/40',
            LEVEL_CLASSES[rating.level],
          )}
        >
          <button type="button" data-rating={rating.level} aria-label={t.decide.rating.open(label)}>
            <Icon aria-hidden="true" />
            {label}
          </button>
        </Badge>
      </PopoverTrigger>
      <PopoverContent align="end" collisionPadding={12} className="w-80 gap-2 p-3.5 text-[13px] leading-5">
        <PopoverHeader>
          <PopoverTitle className="text-sm">{t.decide.rating.basisTitle}</PopoverTitle>
        </PopoverHeader>
        <p className="font-medium tabular-nums">
          {t.decide.rating.basis(
            fmt.number(rating.advantages),
            fmt.number(rating.pointsToVerify),
            fmt.number(rating.net),
          )}
        </p>
        <p>{t.decide.rating.tieBreak}</p>
        <p className="text-xs leading-5 text-muted-foreground">{t.decide.rating.scope}</p>
      </PopoverContent>
    </Popover>
  )
}
