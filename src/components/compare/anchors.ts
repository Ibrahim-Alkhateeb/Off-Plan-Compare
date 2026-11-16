import { alertId, type Alert } from '@/lib/alerts'
import type { SectionKey } from '@/lib/figures'
import type { PropertyId } from '@/types'

/** Ids of the places in the comparison that can be jumped to. */
export const sectionAnchor = (key: SectionKey) => `criterion-${key}`

export const alertAnchor = (propertyId: PropertyId, alert: Alert) => `alert-${propertyId}-${alertId(alert)}`

/** Smooth scrolling, unless the reader has asked the system for less motion. */
function scrollBehavior(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
}

/** Scrolls a criterion to the top of the table body and moves focus to its heading. */
export function jumpToSection(key: SectionKey) {
  const heading = document.getElementById(sectionAnchor(key))
  if (!heading) return
  // The heading's block carries the scroll margin that clears the sticky header.
  ;(heading.closest<HTMLElement>('[data-jump-target]') ?? heading).scrollIntoView({
    block: 'start',
    behavior: scrollBehavior(),
  })
  heading.focus({ preventScroll: true })
}

/** Brings one alert into view, moves focus to it and flashes a ring around it. */
export function jumpToAlert(propertyId: PropertyId, alert: Alert) {
  const target = document.getElementById(alertAnchor(propertyId, alert))
  if (!target) return
  target.scrollIntoView({ block: 'center', behavior: scrollBehavior() })
  target.focus({ preventScroll: true })
  target.animate(
    [
      { boxShadow: '0 0 0 4px var(--ring)', offset: 0 },
      { boxShadow: '0 0 0 4px var(--ring)', offset: 0.6 },
      { boxShadow: '0 0 0 4px transparent', offset: 1 },
    ],
    { duration: 1800, easing: 'ease-out' },
  )
}
