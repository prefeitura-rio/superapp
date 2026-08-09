import type { CirculationRule } from '@/lib/riomob/types'
import { CIRCULATION_RULES } from '../../mocks/vehicles'

export function CirculationRulesSection() {
  return (
    <div className="flex flex-col gap-2">
      {CIRCULATION_RULES.map(rule => (
        <RuleCard key={rule.title} rule={rule} />
      ))}
    </div>
  )
}

function RuleCard({ rule }: { rule: CirculationRule }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-background p-4">
      <p className="text-sm font-medium leading-4 text-foreground">
        {rule.title}
      </p>
      <p className="text-sm leading-5 text-foreground-light">
        {rule.description}
      </p>
    </div>
  )
}
