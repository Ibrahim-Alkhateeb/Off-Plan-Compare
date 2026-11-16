import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { config } from '@/config'
import { FixedNote } from '@/components/FixedNote'
import { MissingValue } from '@/components/MissingValue'
import { FigureSource } from '@/components/SourceLabel'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useI18n } from '@/i18n'
import { alertCell, alertSeverity } from '@/lib/alerts'
import { avgDelayText, benchmarkDiffText } from '@/lib/describe'
import { FIGURE_SECTION, SECTION_KEYS, type FigureKey, type SectionKey } from '@/lib/figures'
import { relativeTags, type RelativeTag } from '@/lib/summary'
import { cn } from '@/lib/utils'
import type { PropertyView } from '@/lib/view'
import { jumpToSection, sectionAnchor } from './anchors'
import { FigureCell, StageCell } from './cells'
import { PaymentBar, StageSwatch } from './PaymentBar'
import { PointsToVerify } from './PointsToVerify'
import { SectionNav, type SectionNavItem } from './SectionNav'

interface Row {
  key: string
  label: string
  /** A small mark before the row name, such as the fill a payment stage has in the bar. */
  marker?: ReactNode
  /** Small print under the row name. */
  hint?: ReactNode
  /** The figures shown in this row. Used to tell whether the row carries an alert. */
  figures: FigureKey[]
  /**
   * An input behind a key figure. Set smaller and lighter, and left out of the
   * "key figures" view unless one of the selected properties has an alert in it.
   */
  detail?: boolean
  /** Draws a heavier rule above the row, setting it apart from the rows before it. */
  divided?: boolean
  cell: (view: PropertyView, index: number) => ReactNode
}

interface Section {
  key: SectionKey
  index: string
  title: string
  short: string
  description: string
  rows: Row[]
  note?: string
}

/** `key` leaves out the input rows; `all` shows every row. */
export type RowsShown = 'key' | 'all'

const stickyColumn = 'sticky start-0 z-10'
const cellPadding = 'px-4 py-2.5'

/**
 * The comparison: criteria down the side, one column per property in selection order.
 * Every property shows the same rows in the same units.
 */
export function ComparisonTable({ views, show }: { views: PropertyView[]; show: RowsShown }) {
  const i18n = useI18n()
  const { t, fmt, text } = i18n
  const rows = t.compare.rows
  const hints = t.compare.hints
  const per = t.format.per
  const feePct = fmt.share(config.registrationFeePct)

  /** Builds the neutral descriptor for one row, from the values of all selected properties. */
  const tagsFor = (values: (number | null)[], decimals: number) => {
    const tags = relativeTags(values, decimals)
    const count = fmt.number(views.length)
    return (index: number): ReactNode => {
      const tag: RelativeTag = tags[index]
      if (!tag) return null
      return (
        <Badge variant="secondary" className="rounded-md px-1.5 text-[11px] font-normal text-muted-foreground">
          {tag === 'highest' ? t.compare.tags.highest(count) : t.compare.tags.lowest(count)}
        </Badge>
      )
    }
  }

  const { yieldDecimals } = config.display
  const pricePerSqftTag = tagsFor(views.map((view) => view.metrics.pricePerSqft), 0)
  const agentYieldTag = tagsFor(views.map((view) => view.metrics.agentYieldPct), yieldDecimals)
  const yieldFromRentTag = tagsFor(views.map((view) => view.metrics.yieldFromRentPct), yieldDecimals)
  const yieldAfterChargesTag = tagsFor(
    views.map((view) => view.metrics.yieldAfterServiceChargesPct),
    yieldDecimals,
  )
  const serviceChargeTag = tagsFor(views.map((view) => view.metrics.serviceChargePerSqft), 0)

  const sections: Section[] = [
    {
      key: 'price',
      ...t.compare.sections.price,
      rows: [
        {
          key: 'price',
          figures: ['price'],
          detail: true,
          label: rows.price,
          cell: (view) => <FigureCell view={view} figure="price" value={fmt.aed(view.property.priceAed)} />,
        },
        {
          key: 'unitArea',
          figures: ['unitArea'],
          detail: true,
          label: rows.unitArea,
          cell: (view) => (
            <FigureCell
              view={view}
              figure="unitArea"
              value={fmt.sqft(view.property.unitAreaSqft)}
              sub={fmt.unitType(view.property.unitType)}
            />
          ),
        },
        {
          key: 'pricePerSqft',
          figures: ['pricePerSqft'],
          label: rows.pricePerSqft,
          cell: (view, index) => (
            <FigureCell
              view={view}
              figure="pricePerSqft"
              value={fmt.aed(view.metrics.pricePerSqft)}
              unit={per.sqft}
              tag={pricePerSqftTag(index)}
            />
          ),
        },
        {
          key: 'benchmarkPricePerSqft',
          figures: ['benchmarkPricePerSqft'],
          detail: true,
          label: rows.benchmarkPricePerSqft,
          cell: (view) => (
            <FigureCell
              view={view}
              figure="benchmarkPricePerSqft"
              value={fmt.aed(view.metrics.benchmarkPricePerSqft)}
              unit={per.sqft}
              sub={text(view.area.name)}
            />
          ),
        },
        {
          key: 'benchmarkDiff',
          figures: ['benchmarkDiff'],
          label: rows.benchmarkDiff,
          cell: (view) => (
            <FigureCell view={view} figure="benchmarkDiff" value={benchmarkDiffText(view, i18n)} sentence />
          ),
        },
      ],
    },
    {
      key: 'yield',
      ...t.compare.sections.yield,
      note: t.compare.notes.yield,
      rows: [
        {
          key: 'agentYield',
          figures: ['agentYield'],
          label: rows.agentYield,
          cell: (view, index) => (
            <FigureCell
              view={view}
              figure="agentYield"
              value={view.metrics.agentYieldPct === null ? null : fmt.yieldPct(view.metrics.agentYieldPct)}
              tag={agentYieldTag(index)}
            />
          ),
        },
        {
          key: 'areaRent',
          figures: ['areaRent'],
          detail: true,
          label: rows.areaRent,
          hint: hints.areaRent,
          cell: (view) => (
            <FigureCell
              view={view}
              figure="areaRent"
              value={view.metrics.areaAnnualRent === null ? null : fmt.aed(view.metrics.areaAnnualRent)}
              unit={per.year}
              sub={t.compare.values.rentBasis(fmt.unitType(view.property.unitType), text(view.area.name))}
            />
          ),
        },
        {
          key: 'yieldFromRent',
          figures: ['yieldFromRent'],
          label: rows.yieldFromRent,
          cell: (view, index) => (
            <FigureCell
              view={view}
              figure="yieldFromRent"
              value={
                view.metrics.yieldFromRentPct === null ? null : fmt.yieldPct(view.metrics.yieldFromRentPct)
              }
              tag={yieldFromRentTag(index)}
            />
          ),
        },
        {
          key: 'yieldAfterServiceCharges',
          figures: ['yieldAfterServiceCharges'],
          label: rows.yieldAfterServiceCharges,
          cell: (view, index) => (
            <FigureCell
              view={view}
              figure="yieldAfterServiceCharges"
              value={
                view.metrics.yieldAfterServiceChargesPct === null
                  ? null
                  : fmt.yieldPct(view.metrics.yieldAfterServiceChargesPct)
              }
              tag={yieldAfterChargesTag(index)}
            />
          ),
        },
      ],
    },
    {
      key: 'serviceCharges',
      ...t.compare.sections.serviceCharges,
      rows: [
        {
          key: 'serviceChargePerSqft',
          figures: ['serviceChargePerSqft'],
          label: rows.serviceChargePerSqft,
          cell: (view, index) => (
            <FigureCell
              view={view}
              figure="serviceChargePerSqft"
              value={
                view.metrics.serviceChargePerSqft === null ? null : fmt.aed(view.metrics.serviceChargePerSqft)
              }
              unit={per.sqftYear}
              tag={serviceChargeTag(index)}
            />
          ),
        },
        {
          key: 'annualServiceCharge',
          figures: ['annualServiceCharge'],
          detail: true,
          label: rows.annualServiceCharge,
          cell: (view) => (
            <FigureCell
              view={view}
              figure="annualServiceCharge"
              value={
                view.metrics.annualServiceCharge === null ? null : fmt.aed(view.metrics.annualServiceCharge)
              }
              unit={per.year}
            />
          ),
        },
      ],
    },
    {
      key: 'paymentPlan',
      ...t.compare.sections.paymentPlan,
      note: t.compare.notes.paymentPlan(feePct),
      rows: [
        {
          key: 'planConstruction',
          marker: <StageSwatch segment="construction" />,
          figures: ['planConstructionPct', 'planConstructionAmount'],
          label: rows.planConstruction,
          cell: (view) => (
            <StageCell
              view={view}
              share={view.property.paymentPlan?.constructionPct ?? null}
              amount={view.metrics.stageAmounts?.construction ?? null}
              shareFigure="planConstructionPct"
              amountFigure="planConstructionAmount"
            />
          ),
        },
        {
          key: 'planHandover',
          marker: <StageSwatch segment="handover" />,
          figures: ['planHandoverPct', 'planHandoverAmount'],
          label: rows.planHandover,
          cell: (view) => (
            <StageCell
              view={view}
              share={view.property.paymentPlan?.handoverPct ?? null}
              amount={view.metrics.stageAmounts?.handover ?? null}
              shareFigure="planHandoverPct"
              amountFigure="planHandoverAmount"
            />
          ),
        },
        {
          key: 'planPostHandover',
          marker: <StageSwatch segment="postHandover" />,
          figures: ['planPostHandoverPct', 'planPostHandoverAmount'],
          label: rows.planPostHandover,
          cell: (view) => {
            const plan = view.property.paymentPlan
            const period =
              plan && plan.postHandoverPct > 0 && plan.postHandoverMonths !== null
                ? t.compare.values.postHandoverPeriod(fmt.months(plan.postHandoverMonths))
                : undefined
            return (
              <StageCell
                view={view}
                share={plan?.postHandoverPct ?? null}
                amount={view.metrics.stageAmounts?.postHandover ?? null}
                shareFigure="planPostHandoverPct"
                amountFigure="planPostHandoverAmount"
                sub={period}
              />
            )
          },
        },
        {
          key: 'planShares',
          figures: [],
          label: rows.planShares,
          cell: (view) =>
            view.property.paymentPlan ? (
              <div className="pt-1.5">
                <PaymentBar plan={view.property.paymentPlan} />
              </div>
            ) : (
              <MissingValue />
            ),
        },
        {
          key: 'registrationFee',
          figures: ['registrationFee'],
          label: rows.registrationFee(feePct),
          hint: hints.registrationFee,
          divided: true,
          cell: (view) => (
            <FigureCell view={view} figure="registrationFee" value={fmt.aed(view.metrics.registrationFee)} />
          ),
        },
        {
          key: 'totalCommitment',
          figures: ['totalCommitment'],
          label: rows.totalCommitment,
          hint: hints.totalCommitment,
          cell: (view) => (
            <FigureCell view={view} figure="totalCommitment" value={fmt.aed(view.metrics.totalCommitment)} />
          ),
        },
      ],
    },
    {
      key: 'handover',
      ...t.compare.sections.handover,
      rows: [
        {
          key: 'handover',
          figures: ['handover'],
          label: rows.handover,
          hint: hints.handover,
          cell: (view) => (
            <FigureCell
              view={view}
              figure="handover"
              value={view.property.handover ? fmt.quarter(view.property.handover) : null}
            />
          ),
        },
      ],
    },
    {
      key: 'developer',
      ...t.compare.sections.developer,
      note: t.compare.notes.developer,
      rows: [
        {
          key: 'projectsDelivered',
          figures: ['projectsDelivered'],
          detail: true,
          label: rows.projectsDelivered,
          cell: (view) => (
            <FigureCell view={view} figure="projectsDelivered" value={fmt.number(view.metrics.delivered)} />
          ),
        },
        {
          key: 'onTimeRate',
          figures: ['onTimeRate'],
          label: rows.onTimeRate,
          hint: hints.onTimeRate,
          cell: (view) => (
            <FigureCell
              view={view}
              figure="onTimeRate"
              sentence={view.metrics.onTimeRatePct === null}
              value={
                view.metrics.onTimeRatePct === null
                  ? t.compare.values.limitedRecord
                  : fmt.percent(view.metrics.onTimeRatePct, config.display.onTimeRateDecimals)
              }
            />
          ),
        },
        {
          key: 'avgDelay',
          figures: ['avgDelay'],
          label: rows.avgDelay,
          hint: hints.avgDelay,
          cell: (view) => (
            <FigureCell
              view={view}
              figure="avgDelay"
              sentence
              value={
                view.metrics.avgDelayMonths === null
                  ? t.compare.values.noDelays
                  : avgDelayText(view.metrics.avgDelayMonths, view.metrics.delayed, i18n)
              }
            />
          ),
        },
      ],
    },
  ]

  /** The jump index: one entry per criterion, marked where any property has an alert. */
  const navItems = useMemo<SectionNavItem[]>(() => {
    const alerts = views.flatMap((view) => view.alerts)
    return SECTION_KEYS.map((key) => {
      const inSection = alerts.filter((alert) => FIGURE_SECTION[alertCell(alert)] === key)
      const section = t.compare.sections[key]
      return {
        key,
        index: section.index,
        short: section.short,
        title: section.title,
        alertCount: inSection.length,
        severity:
          inSection.length === 0
            ? null
            : inSection.some((alert) => alertSeverity(alert) === 'verify')
              ? 'verify'
              : 'info',
      }
    })
  }, [views, t])

  /** An alert is never hidden: a detail row stays in view when any property has one in it. */
  const carriesAlert = (row: Row) =>
    views.some((view) => view.alerts.some((alert) => row.figures.includes(alertCell(alert))))
  const isShown = (row: Row) => show === 'all' || !row.detail || carriesAlert(row)

  const wrapperRef = useRef<HTMLDivElement>(null)
  const [activeSection, setActiveSection] = useState<SectionKey>('price')

  // Track which criterion sits under the sticky header, and how tall that header is,
  // so the index can show the reader's place and jumps land just below the header.
  useEffect(() => {
    const wrapper = wrapperRef.current
    const corner = wrapper?.querySelector<HTMLElement>('thead th')
    const viewport = wrapper?.closest<HTMLElement>('[data-slot="scroll-area-viewport"]')
    if (!wrapper || !corner || !viewport) return

    let frame = 0
    const update = () => {
      frame = 0
      // A criterion becomes the current one once its heading reaches the upper third
      // of the space below the sticky header. At the very end, the last one is current.
      const headerBottom = corner.getBoundingClientRect().bottom
      const visible = viewport.getBoundingClientRect().bottom - headerBottom
      const line = headerBottom + Math.max(32, visible * 0.3)
      const atEnd = viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - 2

      let current: SectionKey = SECTION_KEYS[0]
      if (atEnd && viewport.scrollTop > 0) {
        current = SECTION_KEYS[SECTION_KEYS.length - 1]
      } else {
        for (const key of SECTION_KEYS) {
          const heading = document.getElementById(sectionAnchor(key))
          if (heading && heading.getBoundingClientRect().top <= line) current = key
        }
      }
      setActiveSection(current)
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    const measure = () => {
      wrapper.style.setProperty('--compare-header-h', `${corner.offsetHeight}px`)
      schedule()
    }
    const observer = new ResizeObserver(measure)
    observer.observe(corner)
    measure()

    viewport.addEventListener('scroll', schedule, { passive: true })
    return () => {
      viewport.removeEventListener('scroll', schedule)
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [show])

  const columnCount = views.length + 1

  return (
    <div ref={wrapperRef}>
      <Table
        // No scrolling wrapper: the page body scrolls, so the header row and first column can stick to it.
        containerClassName="overflow-visible"
        className={cn(
          'table-fixed border-separate border-spacing-0',
          views.length === 3 ? 'min-w-[960px]' : 'min-w-[760px]',
        )}
      >
        <caption className="sr-only">{t.compare.caption}</caption>
        <colgroup>
          <col className="w-60 xl:w-64" />
          {views.map((view) => (
            <col key={view.property.id} />
          ))}
        </colgroup>

        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead
              scope="col"
              className={cn(
                stickyColumn,
                'top-0 z-30 h-auto border-b border-border-strong bg-background px-3 py-3 align-top whitespace-normal',
              )}
            >
              <span className="sr-only">{t.compare.criterion}</span>
              <SectionNav items={navItems} active={activeSection} onJump={jumpToSection} />
            </TableHead>
            {views.map((view) => (
              <TableHead
                key={view.property.id}
                scope="col"
                className="sticky top-0 z-20 h-auto border-s border-b border-b-border-strong bg-background px-4 py-3 align-top whitespace-normal"
              >
                <div className="flex flex-col items-start gap-1">
                  <p className="text-base leading-snug font-semibold">{text(view.property.project)}</p>
                  <p className="text-xs leading-4 font-normal text-muted-foreground">
                    {t.format.join([text(view.area.name), text(view.developer.name)])}
                  </p>
                  {/* Unbreakable parts, so a narrow column wraps between them and never inside one. */}
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-sm tabular-nums">
                    <span className="font-normal whitespace-nowrap">
                      {t.format.join([fmt.unitType(view.property.unitType), fmt.sqft(view.property.unitAreaSqft)])}
                    </span>
                    <span className="font-semibold whitespace-nowrap">{fmt.aed(view.property.priceAed)}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <PointsToVerify view={view} />
                    <FigureSource figure="price" view={view} variant="quiet" />
                  </div>
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        {sections.map((section, sectionIndex) => (
          <TableBody key={section.key}>
            {/* Breathing room between criteria, so each reads as its own block. */}
            <TableRow aria-hidden="true" className="hover:bg-transparent">
              <TableCell colSpan={columnCount} className={cn('border-0 p-0', sectionIndex === 0 ? 'h-3' : 'h-5')} />
            </TableRow>

            <TableRow className="hover:bg-transparent">
              <TableHead
                scope="colgroup"
                colSpan={columnCount}
                className="h-auto rounded-lg bg-secondary px-0 py-2 text-start whitespace-normal"
              >
                <div
                  data-jump-target
                  className={cn(stickyColumn, 'flex w-fit max-w-[min(100%,64rem)] items-start gap-3 px-4')}
                  style={{ scrollMarginTop: 'calc(var(--compare-header-h, 7rem) + 0.75rem)' }}
                >
                  <span
                    aria-hidden="true"
                    className="flex size-6 shrink-0 items-center justify-center rounded-md bg-foreground text-xs font-semibold text-background"
                  >
                    {section.index}
                  </span>
                  <div className="flex flex-wrap items-baseline gap-x-3">
                    <h2
                      id={sectionAnchor(section.key)}
                      tabIndex={-1}
                      className="text-sm leading-6 font-semibold outline-none"
                    >
                      {section.title}
                    </h2>
                    <p className="text-xs leading-5 font-normal text-muted-foreground">{section.description}</p>
                  </div>
                </div>
              </TableHead>
            </TableRow>

            {section.rows.filter(isShown).map((row) => (
              <TableRow
                key={row.key}
                data-tone={row.detail ? 'detail' : 'key'}
                className="group/row hover:bg-transparent"
              >
                <TableHead
                  scope="row"
                  className={cn(
                    stickyColumn,
                    cellPadding,
                    'h-auto border-b bg-background align-top text-sm leading-5 font-medium whitespace-normal text-foreground group-hover/row:bg-muted',
                    'group-data-[tone=detail]/row:font-normal group-data-[tone=detail]/row:text-muted-foreground',
                    row.divided && 'border-t-2 border-t-border-strong',
                  )}
                >
                  {row.marker ? (
                    <span className="flex items-center gap-2">
                      {row.marker}
                      {row.label}
                    </span>
                  ) : (
                    row.label
                  )}
                  {typeof row.hint === 'string' ? (
                    <span className="block text-xs leading-4 font-normal text-muted-foreground">{row.hint}</span>
                  ) : (
                    row.hint
                  )}
                </TableHead>
                {views.map((view, index) => (
                  <TableCell
                    key={view.property.id}
                    className={cn(
                      cellPadding,
                      'border-s border-b align-top whitespace-normal group-hover/row:bg-muted',
                      row.divided && 'border-t-2 border-t-border-strong',
                    )}
                  >
                    {row.cell(view, index)}
                  </TableCell>
                ))}
              </TableRow>
            ))}

            {section.note ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columnCount} className="border-b px-0 py-2 whitespace-normal">
                  <div className={cn(stickyColumn, 'w-fit max-w-[min(100%,56rem)] px-4')}>
                    <FixedNote>{section.note}</FixedNote>
                  </div>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        ))}
      </Table>
    </div>
  )
}
