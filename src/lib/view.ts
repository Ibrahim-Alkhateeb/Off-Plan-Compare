import { benchmarks } from '@/data/benchmarks'
import { developers } from '@/data/developers'
import { getProperty } from '@/data/properties'
import type { AreaBenchmark, DeveloperRecord, Property, PropertyId } from '@/types'
import { evaluateAlerts, type Alert } from './alerts'
import { deriveMetrics, type PropertyMetrics } from './calculations'

/** A property joined with its reference data, derived figures and triggered alerts. */
export interface PropertyView {
  property: Property
  area: AreaBenchmark
  developer: DeveloperRecord
  metrics: PropertyMetrics
  alerts: Alert[]
}

export function buildPropertyView(property: Property): PropertyView {
  const area = benchmarks[property.areaId]
  const developer = developers[property.developerId]
  const metrics = deriveMetrics(property, area, developer)
  return { property, area, developer, metrics, alerts: evaluateAlerts(property, metrics) }
}

/** Views in the order given, which is the investor's selection order. */
export function buildViews(ids: readonly PropertyId[]): PropertyView[] {
  return ids.map((id) => buildPropertyView(getProperty(id)))
}
