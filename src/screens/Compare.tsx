import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useId } from 'react'
import { ComparisonTable, type RowsShown } from '@/components/compare/ComparisonTable'
import { Legend } from '@/components/compare/Legend'
import { StageLayout } from '@/components/StageLayout'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useI18n } from '@/i18n'
import type { PropertyView } from '@/lib/view'

interface CompareProps {
  /** Selected properties, in selection order. */
  views: PropertyView[]
  /** Whether the table shows only the key figures, or every row. */
  rowsShown: RowsShown
  onRowsShownChange: (rows: RowsShown) => void
  onBack: () => void
  onContinue: () => void
}

export function Compare({ views, rowsShown, onRowsShownChange, onBack, onContinue }: CompareProps) {
  const { t } = useI18n()
  const view = t.compare.view
  const labelId = useId()
  const itemClasses =
    'px-3 text-muted-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:hover:bg-primary'

  return (
    <StageLayout
      title={t.compare.title}
      intro={t.compare.intro}
      footer={
        <>
          <Button variant="outline" size="lg" onClick={onBack} className="px-4">
            <ArrowLeft aria-hidden="true" className="rtl:rotate-180" />
            {t.compare.back}
          </Button>
          <Button size="lg" onClick={onContinue} className="ms-auto px-4">
            {t.compare.continue}
            <ArrowRight aria-hidden="true" className="rtl:rotate-180" />
          </Button>
        </>
      }
    >
      <Legend />

      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <p aria-live="polite" className="text-xs leading-5 text-muted-foreground">
          {rowsShown === 'key' ? view.keyHint : view.allHint}
        </p>
        <div className="flex items-center gap-2.5">
          <span id={labelId} className="text-xs font-medium">
            {view.label}
          </span>
          <ToggleGroup
            type="single"
            size="sm"
            variant="outline"
            spacing={0}
            value={rowsShown}
            // Radix sends an empty value when the active item is pressed again; one view is always on.
            onValueChange={(value) => {
              if (value) onRowsShownChange(value as RowsShown)
            }}
            aria-labelledby={labelId}
          >
            <ToggleGroupItem value="key" className={itemClasses}>
              {view.key}
            </ToggleGroupItem>
            <ToggleGroupItem value="all" className={itemClasses}>
              {view.all}
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <ComparisonTable views={views} show={rowsShown} />
    </StageLayout>
  )
}
