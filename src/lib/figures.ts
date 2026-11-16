/** Where a figure comes from. Every displayed number carries exactly one of these. */
export type SourceKind = 'agent' | 'benchmark' | 'developer' | 'calculated'

/** Every figure the tool displays for a property. */
export type FigureKey =
  | 'price'
  | 'unitArea'
  | 'pricePerSqft'
  | 'benchmarkPricePerSqft'
  | 'benchmarkDiff'
  | 'agentYield'
  | 'areaRent'
  | 'yieldFromRent'
  | 'yieldAfterServiceCharges'
  | 'yieldGap'
  | 'serviceChargePerSqft'
  | 'annualServiceCharge'
  | 'planConstructionPct'
  | 'planConstructionAmount'
  | 'planHandoverPct'
  | 'planHandoverAmount'
  | 'planPostHandoverPct'
  | 'planPostHandoverAmount'
  | 'registrationFee'
  | 'totalCommitment'
  | 'handover'
  | 'projectsDelivered'
  | 'onTimeRate'
  | 'avgDelay'

/** The six criteria, in the fixed order they are compared. */
export const SECTION_KEYS = ['price', 'yield', 'serviceCharges', 'paymentPlan', 'handover', 'developer'] as const

export type SectionKey = (typeof SECTION_KEYS)[number]

/** The criterion each figure belongs to. */
export const FIGURE_SECTION: Record<FigureKey, SectionKey> = {
  price: 'price',
  unitArea: 'price',
  pricePerSqft: 'price',
  benchmarkPricePerSqft: 'price',
  benchmarkDiff: 'price',
  agentYield: 'yield',
  areaRent: 'yield',
  yieldFromRent: 'yield',
  yieldAfterServiceCharges: 'yield',
  yieldGap: 'yield',
  serviceChargePerSqft: 'serviceCharges',
  annualServiceCharge: 'serviceCharges',
  planConstructionPct: 'paymentPlan',
  planConstructionAmount: 'paymentPlan',
  planHandoverPct: 'paymentPlan',
  planHandoverAmount: 'paymentPlan',
  planPostHandoverPct: 'paymentPlan',
  planPostHandoverAmount: 'paymentPlan',
  registrationFee: 'paymentPlan',
  totalCommitment: 'paymentPlan',
  handover: 'handover',
  projectsDelivered: 'developer',
  onTimeRate: 'developer',
  avgDelay: 'developer',
}

export const FIGURE_SOURCE: Record<FigureKey, SourceKind> = {
  price: 'agent',
  unitArea: 'agent',
  pricePerSqft: 'calculated',
  benchmarkPricePerSqft: 'benchmark',
  benchmarkDiff: 'calculated',
  agentYield: 'agent',
  areaRent: 'benchmark',
  yieldFromRent: 'calculated',
  yieldAfterServiceCharges: 'calculated',
  yieldGap: 'calculated',
  serviceChargePerSqft: 'agent',
  annualServiceCharge: 'calculated',
  planConstructionPct: 'agent',
  planConstructionAmount: 'calculated',
  planHandoverPct: 'agent',
  planHandoverAmount: 'calculated',
  planPostHandoverPct: 'agent',
  planPostHandoverAmount: 'calculated',
  registrationFee: 'calculated',
  totalCommitment: 'calculated',
  handover: 'agent',
  projectsDelivered: 'developer',
  onTimeRate: 'calculated',
  avgDelay: 'developer',
}
