import type { AreaBenchmark, AreaId } from '@/types'

/** Area benchmarks. Mock data, not verified market figures. */
export const benchmarks: Record<AreaId, AreaBenchmark> = {
  'business-bay': {
    id: 'business-bay',
    name: { en: 'Business Bay', ar: 'الخليج التجاري' },
    shortName: { en: 'Business Bay', ar: 'الخليج التجاري' },
    pricePerSqft: 2450,
    annualRent: { '1BR': 130000, '2BR': null },
  },
  jvc: {
    id: 'jvc',
    name: { en: 'Jumeirah Village Circle (JVC)', ar: 'قرية جميرا الدائرية' },
    shortName: { en: 'JVC', ar: 'قرية جميرا الدائرية' },
    pricePerSqft: 1250,
    annualRent: { '1BR': 75000, '2BR': null },
  },
  'dubai-islands': {
    id: 'dubai-islands',
    name: { en: 'Dubai Islands', ar: 'جزر دبي' },
    shortName: { en: 'Dubai Islands', ar: 'جزر دبي' },
    pricePerSqft: 2100,
    annualRent: { '1BR': null, '2BR': 150000 },
  },
  'dubai-south': {
    id: 'dubai-south',
    name: { en: 'Dubai South', ar: 'دبي الجنوب' },
    shortName: { en: 'Dubai South', ar: 'دبي الجنوب' },
    pricePerSqft: 1450,
    annualRent: { '1BR': 80000, '2BR': null },
  },
  arjan: {
    id: 'arjan',
    name: { en: 'Arjan', ar: 'أرجان' },
    shortName: { en: 'Arjan', ar: 'أرجان' },
    pricePerSqft: 1400,
    annualRent: { '1BR': null, '2BR': 110000 },
  },
  'dubai-hills-estate': {
    id: 'dubai-hills-estate',
    name: { en: 'Dubai Hills Estate', ar: 'دبي هيلز استيت' },
    shortName: { en: 'Dubai Hills Estate', ar: 'دبي هيلز استيت' },
    pricePerSqft: 2500,
    annualRent: { '1BR': null, '2BR': 160000 },
  },
}
