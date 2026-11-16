import type { Property, PropertyId } from '@/types'

/**
 * The six offers. Mock data; all projects are fictional.
 * `null` means the agent did not provide the value.
 */
export const properties: readonly Property[] = [
  {
    id: 'P1',
    project: { en: 'The Quay Residences', ar: 'ذا كي ريزيدنسز' },
    areaId: 'business-bay',
    developerId: 'northlight',
    unitType: '1BR',
    unitAreaSqft: 850,
    priceAed: 2_200_000,
    agentYieldPct: 6.5,
    serviceChargePerSqft: 22,
    paymentPlan: { constructionPct: 80, handoverPct: 20, postHandoverPct: 0, postHandoverMonths: null },
    handover: { quarter: 4, year: 2027 },
  },
  {
    id: 'P2',
    project: { en: 'Circle Park One', ar: 'سيركل بارك ون' },
    areaId: 'jvc',
    developerId: 'cedar-stone',
    unitType: '1BR',
    unitAreaSqft: 750,
    priceAed: 1_050_000,
    agentYieldPct: 8.5,
    serviceChargePerSqft: 15,
    paymentPlan: { constructionPct: 60, handoverPct: 40, postHandoverPct: 0, postHandoverMonths: null },
    handover: { quarter: 3, year: 2027 },
  },
  {
    id: 'P3',
    project: { en: 'Island Shore Two', ar: 'آيلاند شور تو' },
    areaId: 'dubai-islands',
    developerId: 'bluewake',
    unitType: '2BR',
    unitAreaSqft: 1200,
    priceAed: 2_600_000,
    agentYieldPct: 6.5,
    serviceChargePerSqft: 18,
    paymentPlan: { constructionPct: 40, handoverPct: 60, postHandoverPct: 0, postHandoverMonths: null },
    handover: { quarter: 1, year: 2028 },
  },
  {
    id: 'P4',
    project: { en: 'Southfield Gate', ar: 'ساوثفيلد غيت' },
    areaId: 'dubai-south',
    developerId: 'firstbrick',
    unitType: '1BR',
    unitAreaSqft: 780,
    priceAed: 1_170_000,
    agentYieldPct: 7.5,
    serviceChargePerSqft: 14,
    paymentPlan: { constructionPct: 50, handoverPct: 20, postHandoverPct: 30, postHandoverMonths: 24 },
    handover: { quarter: 2, year: 2028 },
  },
  {
    id: 'P5',
    project: { en: 'Arjan Terraces', ar: 'أرجان تيراسز' },
    areaId: 'arjan',
    developerId: 'almas-ridge',
    unitType: '2BR',
    unitAreaSqft: 1100,
    priceAed: 1_650_000,
    agentYieldPct: 7.0,
    serviceChargePerSqft: null,
    paymentPlan: { constructionPct: 50, handoverPct: 50, postHandoverPct: 0, postHandoverMonths: null },
    handover: { quarter: 4, year: 2027 },
  },
  {
    id: 'P6',
    project: { en: 'Hillside Row', ar: 'هيلسايد رو' },
    areaId: 'dubai-hills-estate',
    developerId: 'greenline',
    unitType: '2BR',
    unitAreaSqft: 1150,
    priceAed: 2_760_000,
    agentYieldPct: 6.0,
    serviceChargePerSqft: 19,
    paymentPlan: { constructionPct: 70, handoverPct: 30, postHandoverPct: 0, postHandoverMonths: null },
    handover: { quarter: 3, year: 2028 },
  },
]

export function getProperty(id: PropertyId): Property {
  const property = properties.find((p) => p.id === id)
  if (!property) throw new Error(`Unknown property: ${id}`)
  return property
}
