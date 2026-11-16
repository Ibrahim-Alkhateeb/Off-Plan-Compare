import type { AlertRule, MissingItem } from '@/lib/alerts'
import type { SourceKind } from '@/lib/figures'
import type { AdvantageKind, RatingLevel } from '@/lib/summary'
import type { UnitType } from '@/types'

const plural = (count: number, one: string, other: string) => (count === 1 ? one : other)

const countWord = (count: number) => (count === 2 ? 'two' : count === 3 ? 'three' : String(count))

/**
 * English interface strings.
 * Functions receive values that are already formatted, unless a raw count is needed for plurals.
 */
export const en = {
  app: {
    name: 'Off-Plan Compare',
    tagline: 'Dubai off-plan offers, on the same basis',
    skipToContent: 'Skip to main content',
    mockNotice:
      'All data shown is mock and illustrative. Verify every figure before any real investment decision.',
    language: {
      label: 'Language',
      en: 'EN',
      ar: 'العربية',
      enName: 'English',
      arName: 'Arabic',
    },
  },

  format: {
    aed: (amount: string) => `AED ${amount}`,
    /** What an amount is measured against. Follows the amount: "AED 2,588 per sqft". */
    per: {
      sqft: 'per sqft',
      sqftYear: 'per sqft per year',
      year: 'per year',
    },
    sqft: (area: string) => `${area} sqft`,
    quarter: (quarter: number, year: string) => `Q${quarter} ${year}`,
    months: (count: number, formatted: string) => `${formatted} ${plural(count, 'month', 'months')}`,
    percentagePoints: (value: string) => `${value} percentage points`,
    unitType: { '1BR': '1 BR', '2BR': '2 BR' } as Record<UnitType, string>,
    join: (parts: string[]) => parts.join(' · '),
  },

  stepper: {
    label: 'Stages',
    steps: {
      shortlist: 'Shortlist',
      compare: 'Compare',
      decide: 'Decide',
    },
    current: 'current stage',
    completed: 'completed',
    lockedSelect: 'Select at least two properties first',
    lockedCompare: 'Open the comparison first',
  },

  shortlist: {
    title: 'Shortlist',
    intro: 'Choose two or three of the agents’ offers to compare on the same basis.',
    labels: {
      developer: 'Developer',
      unit: 'Unit',
      price: 'Price',
      handover: 'Stated handover',
    },
    addToComparison: 'Add to comparison',
    columnPosition: (position: string) => `Column ${position}`,
    asStated: 'Figures are as stated in each agent’s offer and have not been independently checked.',
    selectionLabel: 'Selected properties',
    selectedCount: (count: string, max: string) => `${count} of ${max} selected`,
    noneSelected: 'No property selected yet',
    remove: (name: string) => `Remove ${name} from the comparison`,
    helperMin: 'Select at least two properties',
    helperCanAdd: 'Compare these two, or add one more',
    helperMax: 'Three is the maximum',
    compare: 'Compare',
    maxToast: 'You can compare up to three properties. Remove one to add another.',
  },

  compare: {
    title: 'Compare',
    intro:
      'The same rows, in the same units, for every property. Each figure carries a label showing where it came from.',
    criterion: 'Criterion',
    caption: 'Comparison of the selected properties across six criteria',
    /** `short` is the name used in the jump index. `description` says what the criterion shows, in plain words. */
    sections: {
      price: {
        index: 'A',
        title: 'Price per sqft',
        short: 'Price',
        description: 'What each square foot costs, set against a reference price for the same area.',
      },
      yield: {
        index: 'B',
        title: 'Expected rental yield',
        short: 'Yield',
        description:
          'A year of rent as a share of the price: the agent’s figure, and one worked out from area rents.',
      },
      serviceCharges: {
        index: 'C',
        title: 'Service charges',
        short: 'Charges',
        description: 'The yearly fee for running and maintaining the building, paid by the owner.',
      },
      paymentPlan: {
        index: 'D',
        title: 'Payment plan',
        short: 'Payment',
        description:
          'When the price is paid: during construction, at handover and after it. The registration fee is shown apart.',
      },
      handover: {
        index: 'E',
        title: 'Handover date',
        short: 'Handover',
        description: 'When the offer says the unit will be handed over.',
      },
      developer: {
        index: 'F',
        title: 'Developer track record',
        short: 'Developer',
        description: 'How the developer’s earlier projects were delivered, for context.',
      },
    },
    nav: {
      title: 'Jump to',
      label: 'Jump to a criterion',
      alerts: (count: number, formatted: string) => `${formatted} ${plural(count, 'alert', 'alerts')}`,
    },
    points: {
      hint: 'Select a point to show it in the table.',
    },
    view: {
      label: 'Rows shown',
      key: 'Key figures',
      all: 'All rows',
      keyHint: 'Showing the key figures for each criterion. Choose All rows to see the inputs behind them.',
      allHint: 'Showing every row, including the inputs behind each key figure.',
    },
    rows: {
      price: 'Price',
      unitArea: 'Unit area',
      pricePerSqft: 'Price per sqft',
      benchmarkPricePerSqft: 'Area benchmark price per sqft',
      benchmarkDiff: 'Difference to benchmark',
      agentYield: 'Gross yield stated by the agent',
      areaRent: 'Area annual rent used',
      yieldFromRent: 'Gross yield from area rent',
      yieldAfterServiceCharges: 'Estimated yield after service charges',
      serviceChargePerSqft: 'Service charge per sqft per year',
      annualServiceCharge: 'Annual service charge',
      planConstruction: 'During construction',
      planHandover: 'At handover',
      planPostHandover: 'After handover',
      planShares: 'Payment shares',
      registrationFee: (pct: string) => `Registration fee (assumed ${pct})`,
      totalCommitment: 'Illustrative total commitment',
      handover: 'Stated handover',
      projectsDelivered: 'Projects delivered',
      onTimeRate: 'On-time delivery rate',
      avgDelay: 'Average historical delay',
    },
    hints: {
      areaRent: 'Reference rent for the same unit type in the area',
      registrationFee: 'Separate from the developer payments',
      totalCommitment: 'Price plus registration fee',
      handover: 'As stated in the offer, never adjusted',
      onTimeRate: 'Shown from three delivered projects',
      avgDelay: 'Of delayed projects only',
    },
    values: {
      none: 'None',
      limitedRecord: 'Limited project record',
      noDelays: 'No delayed project on record',
      benchmarkAbove: (pct: string, area: string) => `${pct} above the ${area} benchmark`,
      benchmarkBelow: (pct: string, area: string) => `${pct} below the ${area} benchmark`,
      benchmarkLevel: (area: string) => `Level with the ${area} benchmark`,
      avgDelayBasis: (delay: string, count: number, formatted: string) =>
        `${delay}, based on ${formatted} delayed ${plural(count, 'project', 'projects')}`,
      postHandoverPeriod: (period: string) => `Paid over ${period} after handover`,
      rentBasis: (unit: string, area: string) => `${unit}, ${area}`,
    },
    notAvailable: 'Not available – please ask the agent',
    tags: {
      highest: (count: string) => `Highest of ${count}`,
      lowest: (count: string) => `Lowest of ${count}`,
    },
    notes: {
      yield:
        'Yield after service charges does not include other running and ownership costs. It is not the full return on the investment.',
      paymentPlan: (pct: string) =>
        `Payment dates and percentages are illustrative assumptions, not the terms of a real contract. The ${pct} registration fee is an assumption; verify the actual fee and any exemptions.`,
      developer: 'Past performance is shown for context. It is not a prediction of this project’s handover.',
    },
    planSharesLabel: (construction: string, handover: string, postHandover: string) =>
      `${construction} during construction, ${handover} at handover, ${postHandover} after handover`,
    pointsToVerify: (count: number, formatted: string) =>
      `${formatted} ${plural(count, 'point', 'points')} to verify`,
    noPoints: 'No alert threshold crossed',
    thresholdNote: 'These are trial thresholds specific to this prototype, not official market standards.',
    legend: {
      title: 'How to read the comparison',
      sources: 'Source labels',
      alerts: 'Alerts',
      verify: 'A point to verify with the agent',
      info: 'Shown for information',
      hint: 'Select any label or alert in the table to see the detail behind it.',
      tags: 'Highest and lowest tags describe position among the selected properties. They are not a judgement.',
    },
    back: 'Back to shortlist',
    continue: 'Continue to decision',
  },

  sources: {
    labels: {
      agent: 'Agent data',
      benchmark: 'Area benchmark – mock data',
      developer: 'Developer record – mock data',
      calculated: 'Calculated figure',
    } as Record<SourceKind, string>,
    open: (label: string) => `${label}. Show where this figure comes from`,
    agent: 'Provided in the agent’s offer. Not independently checked.',
    benchmark: (area: string) =>
      `Illustrative reference for ${area}. Mock data, not a verified market figure.`,
    developer: 'Illustrative developer history. Mock data, not a verified record.',
    calculated: {
      formula: 'Formula',
      worked: 'With this property’s figures',
      inputs: 'Inputs',
      unavailable: (missing: string) => `Cannot be calculated: ${missing} is not available.`,
    },
    formulas: {
      pricePerSqft: {
        words: 'Price ÷ unit area',
        worked: (price: string, area: string, result: string) => `${price} ÷ ${area} = ${result}`,
        inputs: 'Price and unit area are agent data.',
      },
      benchmarkDiff: {
        words: '(Price per sqft − area benchmark) ÷ area benchmark × 100',
        worked: (perSqft: string, benchmark: string, result: string) =>
          `(${perSqft} − ${benchmark}) ÷ ${benchmark} × 100 = ${result}`,
        inputs: 'Price per sqft is calculated from agent data. The area benchmark is mock data.',
      },
      yieldFromRent: {
        words: 'Area annual rent ÷ price × 100',
        worked: (rent: string, price: string, result: string) => `${rent} ÷ ${price} × 100 = ${result}`,
        inputs: 'Area annual rent is an area benchmark (mock data). Price is agent data.',
      },
      annualServiceCharge: {
        words: 'Service charge per sqft × unit area',
        worked: (charge: string, area: string, result: string) => `${charge} × ${area} = ${result}`,
        inputs: 'Service charge and unit area are agent data.',
      },
      yieldAfterServiceCharges: {
        words: '(Area annual rent − annual service charge) ÷ price × 100',
        worked: (rent: string, charge: string, price: string, result: string) =>
          `(${rent} − ${charge}) ÷ ${price} × 100 = ${result}`,
        inputs:
          'Area annual rent is an area benchmark (mock data). Service charge and price are agent data.',
      },
      yieldGap: {
        words: 'Agent’s stated yield − gross yield from area rent',
        worked: (agentYield: string, areaYield: string, result: string) =>
          `${agentYield} − ${areaYield} = ${result}`,
        inputs:
          'The stated yield is agent data. The yield from area rent is calculated from an area benchmark (mock data).',
      },
      stageAmount: {
        words: 'Price × stage percentage',
        worked: (price: string, share: string, result: string) => `${price} × ${share} = ${result}`,
        inputs: 'Price and stage percentage are agent data.',
      },
      registrationFee: {
        words: (pct: string) => `Price × ${pct} assumed registration fee`,
        worked: (price: string, pct: string, result: string) => `${price} × ${pct} = ${result}`,
        inputs: (pct: string) => `Price is agent data. The ${pct} fee is an assumption of this tool.`,
      },
      totalCommitment: {
        words: 'Price + registration fee',
        worked: (price: string, fee: string, result: string) => `${price} + ${fee} = ${result}`,
        inputs: 'Price is agent data. The registration fee is calculated on an assumed rate.',
      },
      onTimeRate: {
        words: 'On-time projects ÷ delivered projects × 100',
        worked: (onTime: string, delivered: string, result: string) =>
          `${onTime} ÷ ${delivered} × 100 = ${result}`,
        inputs: 'Project counts come from the developer record (mock data).',
      },
    },
  },

  alerts: {
    severity: {
      verify: 'Point to verify',
      info: 'For information',
    },
    text: {
      1: 'Request the information from the agent.',
      2: 'Verify the rent estimate.',
      3: 'Review the price against the area.',
      4: 'Review the past delivery record.',
      5: 'Limited developer record.',
      6: 'Review the service charges.',
      7: 'Later commitments are shown separately.',
    } as Record<AlertRule, string>,
    rule: {
      missing: 'Shown when a value is not provided.',
      yieldGap: (threshold: string) =>
        `Shown when the agent’s yield is more than ${threshold} above the yield from area rent.`,
      priceAboveBenchmark: (threshold: string) =>
        `Shown when the price per sqft is more than ${threshold} above the area benchmark.`,
      historicalDelay: (threshold: string) =>
        `Shown when the developer’s average historical delay is more than ${threshold}.`,
      limitedRecord: (min: string) => `Shown when the developer has fewer than ${min} delivered projects.`,
      serviceCharge: (threshold: string) => `Shown when the service charge is above ${threshold}.`,
      postHandover: 'Shown when any part of the price is due after handover.',
    },
    detail: {
      missing: (item: string) => `Not provided: ${item}.`,
      yieldGap: (agentYield: string, areaYield: string, gap: string) =>
        `The agent’s yield of ${agentYield} is ${gap} above the yield from area rent of ${areaYield}.`,
      priceAboveBenchmark: (difference: string) => `Price per sqft is ${difference}.`,
      historicalDelay: (delay: string) =>
        `Average historical delay of ${delay}. This is history, not a prediction for this project.`,
      limitedRecord: (count: number, formatted: string, min: string) =>
        `${formatted} delivered ${plural(count, 'project', 'projects')} on record. An on-time rate is shown from ${min} delivered projects.`,
      serviceCharge: (charge: string, threshold: string) =>
        `Stated service charge of ${charge}, above the trial threshold of ${threshold}.`,
      postHandover: (share: string, amount: string, period: string | null) =>
        period
          ? `${share} of the price (${amount}) is due after handover, paid over ${period}.`
          : `${share} of the price (${amount}) is due after handover.`,
    },
    missingItems: {
      agentYield: 'the gross rental yield',
      areaRent: 'the annual rent for comparable units in the area',
      serviceCharge: 'the service charge per sqft per year',
      paymentPlan: 'the payment plan',
      handover: 'the handover date',
    } as Record<MissingItem, string>,
    questions: {
      missing: (item: string) => `Can you confirm ${item} in writing?`,
      yieldGap: (agentYield: string) =>
        `Which annual rent is your ${agentYield} yield based on, and which comparable lettings support it?`,
      priceAboveBenchmark: (pct: string) =>
        `What justifies a price ${pct} above the area reference for this unit?`,
      historicalDelay:
        'What is the current construction progress, and what happens contractually if handover is late?',
      limitedRecord:
        'Which projects has the developer completed, and when were they handed over against the original dates?',
      serviceCharge: 'What does the service charge cover, and is the stated rate estimated or approved?',
      postHandover: 'What are the exact dates and conditions of the post-handover payments?',
    },
  },

  decide: {
    title: 'Decide',
    intro:
      'What the comparison shows for each property, side by side. The decision, and the reasons for it, are yours.',
    advantagesTitle: 'Relative advantages',
    advantagesHint: 'Compared only among the selected properties',
    watchPointsTitle: 'Watch points',
    questionsTitle: 'Questions to ask the agent',
    noAdvantage: 'No relative advantage on the measured criteria among the selected properties.',
    noWatchPoints: 'No alert threshold was crossed. The agent’s figures are still not independently checked.',
    noQuestions:
      'The alert rules produced no question. You can still ask the agent to confirm each figure in writing.',
    more: (count: string) => `+${count} more in the comparison`,
    rating: {
      labels: {
        highest: 'Highest rated',
        average: 'Average',
        lowest: 'Lowest rated',
      } as Record<RatingLevel, string>,
      open: (label: string) => `${label}. Show how this is rated`,
      basisTitle: 'How this is rated',
      basis: (advantages: string, points: string, net: string) =>
        `Relative advantages listed (${advantages}) minus points to verify (${points}) = ${net}.`,
      tieBreak: 'When two properties are level, the one with fewer points to verify rates higher.',
      scope:
        'Rated only against the other selected properties, by a trial rule of this prototype. It is not advice.',
      note: 'Ratings compare the selected properties with each other: relative advantages listed minus points to verify. When level, fewer points to verify rates higher. A trial rule of this prototype, not advice.',
    },
    scopeAll: (count: number) => `of the ${countWord(count)}`,
    scopePartial: (count: number) => `among the ${countWord(count)} with this figure available`,
    advantages: {
      benchmarkDiff: (scope: string, value: string) =>
        `Lowest price per sqft relative to its own area benchmark ${scope}: ${value}.`,
      yieldAfterServiceCharges: (scope: string, value: string) =>
        `Highest estimated yield after service charges ${scope}: ${value}.`,
      serviceCharge: (scope: string, value: string) => `Lowest service charge ${scope}: ${value}.`,
      preHandoverShare: (scope: string, value: string) =>
        `Smallest share of the price due before handover ${scope}: ${value} during construction.`,
      handover: (scope: string, value: string) => `Earliest stated handover ${scope}: ${value}.`,
      onTimeRate: (scope: string, value: string) =>
        `Highest developer on-time delivery rate ${scope}: ${value}.`,
    } as Record<AdvantageKind, (scope: string, value: string) => string>,
    decision: {
      title: 'Record your decision',
      legend: 'Which option reflects your decision?',
      myPick: (name: string) => `My Pick: ${name}`,
      none: 'None of These',
      noneHint: 'Turning all of them down is a valid outcome.',
      record: 'Record my decision',
      recordHelper: 'Choose an option to record your decision',
      notSaved: 'Nothing is saved or shared. Refreshing the page clears everything.',
    },
    panel: {
      title: 'Your decision',
      why: 'Why this property and not the others',
      risks: 'Risks you are accepting',
      unverified: 'Not yet verified',
      unverifiedHint: 'Questions to ask the agent',
      noneTitle: 'Why none of these, for now',
      watchPoints: 'Watch points',
      openQuestions: 'Open questions',
      change: 'Change decision',
      startNew: 'Start a new comparison',
    },
    back: 'Back to comparison',
  },
}

export type Translations = typeof en
