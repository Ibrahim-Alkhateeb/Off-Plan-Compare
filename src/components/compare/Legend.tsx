import { AlertIcon } from '@/components/AlertNote'
import { SourceTag } from '@/components/SourceLabel'
import { useI18n } from '@/i18n'
import type { SourceKind } from '@/lib/figures'

const SOURCE_KINDS: SourceKind[] = ['agent', 'benchmark', 'developer', 'calculated']

/** How to read the comparison: the four source labels and the two kinds of alert. */
export function Legend() {
  const { t } = useI18n()
  const legend = t.compare.legend

  return (
    <section
      aria-label={legend.title}
      className="mb-5 flex flex-col gap-2 rounded-lg border bg-card px-4 py-3 text-xs leading-5"
    >
      <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h2 className="font-semibold">{legend.sources}</h2>
          <ul className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {SOURCE_KINDS.map((kind) => (
              <li key={kind}>
                <SourceTag kind={kind} variant="quiet" />
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h2 className="font-semibold">{legend.alerts}</h2>
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <li className="flex items-center gap-1.5">
              <AlertIcon severity="verify" />
              {legend.verify}
            </li>
            <li className="flex items-center gap-1.5">
              <AlertIcon severity="info" />
              {legend.info}
            </li>
          </ul>
        </div>
      </div>
      <p className="text-muted-foreground">
        {legend.hint} {legend.tags}{' '}
        <span className="font-medium text-foreground">{t.compare.thresholdNote}</span>
      </p>
    </section>
  )
}
