export type Lang = 'en' | 'ar'

/** Text that exists in both interface languages. */
export type Localized = Record<Lang, string>

export type UnitType = '1BR' | '2BR'

export type PropertyId = 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6'

export type AreaId =
  | 'business-bay'
  | 'jvc'
  | 'dubai-islands'
  | 'dubai-south'
  | 'arjan'
  | 'dubai-hills-estate'

export type DeveloperId =
  | 'northlight'
  | 'cedar-stone'
  | 'bluewake'
  | 'firstbrick'
  | 'almas-ridge'
  | 'greenline'

export interface Quarter {
  quarter: 1 | 2 | 3 | 4
  year: number
}

/** Shares of the price, in percent. The three shares sum to 100. */
export interface PaymentPlan {
  constructionPct: number
  handoverPct: number
  postHandoverPct: number
  /** Period over which the post-handover share is paid, when one exists. */
  postHandoverMonths: number | null
}

/**
 * One offer as received from an agent.
 * `null` means the agent did not provide the value.
 */
export interface Property {
  id: PropertyId
  project: Localized
  areaId: AreaId
  developerId: DeveloperId
  unitType: UnitType
  unitAreaSqft: number
  priceAed: number
  agentYieldPct: number | null
  serviceChargePerSqft: number | null
  paymentPlan: PaymentPlan | null
  handover: Quarter | null
}

export interface AreaBenchmark {
  id: AreaId
  name: Localized
  /** Compact name used inside sentences. */
  shortName: Localized
  pricePerSqft: number
  /** `null` where no reference rent exists for the unit type. */
  annualRent: Record<UnitType, number | null>
}

export interface DeveloperRecord {
  id: DeveloperId
  name: Localized
  delivered: number
  onTime: number
  delayed: number
  /** Average delay of the delayed projects, in months. */
  avgDelayMonths: number | null
}
