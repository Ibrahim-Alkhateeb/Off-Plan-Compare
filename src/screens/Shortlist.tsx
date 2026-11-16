import { useMemo } from 'react'
import { toast } from 'sonner'
import { config } from '@/config'
import { PropertyCard } from '@/components/shortlist/PropertyCard'
import { SelectionBar } from '@/components/shortlist/SelectionBar'
import { StageLayout } from '@/components/StageLayout'
import { properties } from '@/data/properties'
import { useI18n } from '@/i18n'
import { buildPropertyView } from '@/lib/view'
import type { PropertyId } from '@/types'

interface ShortlistProps {
  /** Selected properties, in the order they were picked. */
  selectedIds: PropertyId[]
  onToggle: (id: PropertyId) => void
  onCompare: () => void
}

export function Shortlist({ selectedIds, onToggle, onCompare }: ShortlistProps) {
  const { t } = useI18n()
  const views = useMemo(() => properties.map(buildPropertyView), [])
  const full = selectedIds.length >= config.selection.max

  const selectedViews = selectedIds.flatMap((id) => views.filter((view) => view.property.id === id))

  const explainLimit = () => {
    // One id, so repeated clicks refresh the same toast instead of stacking.
    toast(t.shortlist.maxToast, { id: 'selection-limit' })
  }

  return (
    <StageLayout
      title={t.shortlist.title}
      intro={t.shortlist.intro}
      footer={<SelectionBar selected={selectedViews} onRemove={onToggle} onCompare={onCompare} />}
    >
      <ul className="grid grid-cols-3 gap-5">
        {views.map((view) => {
          const index = selectedIds.indexOf(view.property.id)
          const selected = index !== -1
          return (
            <li key={view.property.id}>
              <PropertyCard
                view={view}
                position={selected ? index + 1 : null}
                locked={full && !selected}
                onToggle={() => onToggle(view.property.id)}
                onLockedAttempt={explainLimit}
              />
            </li>
          )
        })}
      </ul>
      <p className="mt-5 text-xs text-muted-foreground">{t.shortlist.asStated}</p>
    </StageLayout>
  )
}
