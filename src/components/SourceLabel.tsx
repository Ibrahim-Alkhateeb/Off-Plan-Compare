import { Building2, Calculator, FileText, MapPin, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger } from '@/components/ui/popover'
import { useI18n } from '@/i18n'
import { explainFigure } from '@/lib/describe'
import type { FigureKey, SourceKind } from '@/lib/figures'
import { cn } from '@/lib/utils'
import type { PropertyView } from '@/lib/view'

/** Each source has its own icon and wording, so labels never differ by colour alone. */
export const SOURCE_ICONS: Record<SourceKind, LucideIcon> = {
  agent: FileText,
  benchmark: MapPin,
  developer: Building2,
  calculated: Calculator,
}

/**
 * `outline` is a bordered tag. `quiet` drops the border, for dense tables
 * where dozens of labels sit side by side and should recede until needed.
 */
export type SourceLabelVariant = 'outline' | 'quiet'

const baseClasses =
  'h-auto min-h-5 max-w-full gap-1 rounded-md text-[11px] leading-4 font-normal whitespace-normal text-muted-foreground'

const variantClasses: Record<SourceLabelVariant, string> = {
  outline: 'border-border px-1.5 py-0.5',
  // No padding, so the label's icon lines up with the figure above it.
  quiet: 'rounded-sm border-transparent px-0 py-0',
}

/** The quiet label has no padding to tint, so its hover and open states spread a halo instead. */
const quietStateClasses =
  'hover:shadow-[0_0_0_3px_var(--muted)] aria-expanded:bg-secondary aria-expanded:shadow-[0_0_0_3px_var(--secondary)]'

/** The label as a plain tag, for legends. */
export function SourceTag({
  kind,
  variant = 'outline',
  className,
}: {
  kind: SourceKind
  variant?: SourceLabelVariant
  className?: string
}) {
  const { t } = useI18n()
  const Icon = SOURCE_ICONS[kind]
  return (
    <Badge variant="outline" className={cn(baseClasses, variantClasses[variant], className)}>
      <Icon aria-hidden="true" />
      {t.sources.labels[kind]}
    </Badge>
  )
}

interface SourceLabelProps {
  kind: SourceKind
  variant?: SourceLabelVariant
  /** What the popover explains about this figure. */
  children: ReactNode
  className?: string
}

/**
 * The source of a figure: a quiet label that opens an explanation.
 * Every number in the Compare and Decide stages carries one.
 */
export function SourceLabel({ kind, variant = 'outline', children, className }: SourceLabelProps) {
  const { t } = useI18n()
  const Icon = SOURCE_ICONS[kind]
  const label = t.sources.labels[kind]

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Badge
          asChild
          variant="outline"
          className={cn(
            baseClasses,
            variantClasses[variant],
            'cursor-pointer text-start underline decoration-border-strong decoration-dotted underline-offset-[3px] transition-colors outline-none',
            'hover:bg-muted hover:text-foreground hover:decoration-foreground',
            'focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-ring',
            'aria-expanded:bg-muted aria-expanded:text-foreground',
            variant === 'outline'
              ? 'hover:border-border-strong focus-visible:border-ring aria-expanded:border-primary'
              : quietStateClasses,
            className,
          )}
        >
          <button type="button" data-source={kind} aria-label={t.sources.open(label)}>
            <Icon aria-hidden="true" />
            {label}
          </button>
        </Badge>
      </PopoverTrigger>
      <PopoverContent align="start" collisionPadding={12} className="w-80 gap-2 p-3.5 text-[13px] leading-5">
        <PopoverHeader>
          <PopoverTitle className="flex items-center gap-1.5 text-sm">
            <Icon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
            {label}
          </PopoverTitle>
        </PopoverHeader>
        {children}
      </PopoverContent>
    </Popover>
  )
}

interface FigureSourceProps {
  figure: FigureKey
  view: PropertyView
  variant?: SourceLabelVariant
  className?: string
}

/** The source label for one figure of one property, with its explanation filled in. */
export function FigureSource({ figure, view, variant, className }: FigureSourceProps) {
  const i18n = useI18n()
  const { t } = i18n
  const explanation = explainFigure(figure, view, i18n)

  if (explanation.kind !== 'calculated') {
    return (
      <SourceLabel kind={explanation.kind} variant={variant} className={className}>
        <p>{explanation.text}</p>
      </SourceLabel>
    )
  }

  return (
    <SourceLabel kind="calculated" variant={variant} className={className}>
      <dl className="flex flex-col gap-2">
        <div>
          <dt className="text-xs text-muted-foreground">{t.sources.calculated.formula}</dt>
          <dd>{explanation.formula}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">{t.sources.calculated.worked}</dt>
          <dd className="font-medium tabular-nums">{explanation.worked ?? explanation.unavailable}</dd>
        </div>
        <div className="border-t pt-2">
          <dt className="text-xs text-muted-foreground">{t.sources.calculated.inputs}</dt>
          <dd className="text-xs leading-5">{explanation.inputs}</dd>
        </div>
      </dl>
    </SourceLabel>
  )
}
