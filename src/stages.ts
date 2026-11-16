import type { PropertyId } from '@/types'

/** The three stages of the flow, in order. */
export const STAGES = ['shortlist', 'compare', 'decide'] as const

export type Stage = (typeof STAGES)[number]

/** The investor's decision: one of the compared properties, or none of them. */
export type Choice = PropertyId | 'none'
