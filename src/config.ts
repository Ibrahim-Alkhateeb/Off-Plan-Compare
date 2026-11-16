/**
 * Every threshold and assumption used by the tool, in one place.
 * These are trial values for this prototype, not market standards.
 */
export const config = {
  selection: {
    min: 2,
    max: 3,
  },

  /** Assumed registration fee, as a percentage of the price. */
  registrationFeePct: 4,

  /** Alert thresholds. All comparisons are strict: a value on the threshold does not trigger. */
  alerts: {
    /** Rule 2: agent's yield above the yield from area rent, in percentage points. */
    yieldGapPoints: 1.0,
    /** Rule 3: price per sqft above the area benchmark, in percent. */
    priceAboveBenchmarkPct: 10,
    /** Rule 4: average historical delay, in months. */
    avgDelayMonths: 6,
    /** Rule 5: delivered projects needed before a record stops being "limited". */
    minDeliveredProjects: 3,
    /** Rule 6: service charge, in AED per sqft per year. */
    serviceChargePerSqft: 20,
  },

  summary: {
    maxAdvantages: 2,
    maxWatchPoints: 2,
  },

  /** Decimals used wherever a figure is displayed. */
  display: {
    yieldDecimals: 2,
    benchmarkDiffDecimals: 1,
    onTimeRateDecimals: 0,
  },
} as const
