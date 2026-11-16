import type { DeveloperId, DeveloperRecord } from '@/types'

/** Developer delivery records. Mock data; all developers are fictional. */
export const developers: Record<DeveloperId, DeveloperRecord> = {
  northlight: {
    id: 'northlight',
    name: { en: 'Northlight Developments', ar: 'نورث لايت للتطوير' },
    delivered: 24,
    onTime: 21,
    delayed: 3,
    avgDelayMonths: 2,
  },
  'cedar-stone': {
    id: 'cedar-stone',
    name: { en: 'Cedar & Stone Properties', ar: 'سيدار آند ستون العقارية' },
    delivered: 9,
    onTime: 6,
    delayed: 3,
    avgDelayMonths: 4,
  },
  bluewake: {
    id: 'bluewake',
    name: { en: 'Bluewake Group', ar: 'مجموعة بلو ويك' },
    delivered: 14,
    onTime: 10,
    delayed: 4,
    avgDelayMonths: 8,
  },
  firstbrick: {
    id: 'firstbrick',
    name: { en: 'Firstbrick Homes', ar: 'فيرست بريك هومز' },
    delivered: 2,
    onTime: 1,
    delayed: 1,
    avgDelayMonths: 5,
  },
  'almas-ridge': {
    id: 'almas-ridge',
    name: { en: 'Almas Ridge Development', ar: 'ألماس ريدج للتطوير' },
    delivered: 6,
    onTime: 5,
    delayed: 1,
    avgDelayMonths: 3,
  },
  greenline: {
    id: 'greenline',
    name: { en: 'Greenline Estates', ar: 'غرين لاين العقارية' },
    delivered: 31,
    onTime: 29,
    delayed: 2,
    avgDelayMonths: 3,
  },
}
