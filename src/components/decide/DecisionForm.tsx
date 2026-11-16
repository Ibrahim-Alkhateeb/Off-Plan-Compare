import { useId } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useI18n } from '@/i18n'
import type { PropertyView } from '@/lib/view'
import type { Choice } from '@/stages'

interface DecisionFormProps {
  views: PropertyView[]
  choice: Choice | null
  onChoose: (choice: Choice) => void
  onRecord: () => void
}

const optionClasses =
  'flex cursor-pointer items-start gap-3 rounded-lg border border-border-strong bg-card px-4 py-3.5 text-sm transition-colors hover:bg-muted has-data-checked:border-primary has-data-checked:bg-primary/5 has-data-checked:ring-1 has-data-checked:ring-primary'

/** One radio group: a pick for each compared property, or none of them. */
export function DecisionForm({ views, choice, onChoose, onRecord }: DecisionFormProps) {
  const { t, text } = useI18n()
  const decision = t.decide.decision
  const legendId = useId()
  const helperId = useId()

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="gap-0.5 px-5 pt-5 pb-4">
        <CardTitle>
          <h2 className="text-base font-semibold">{decision.title}</h2>
        </CardTitle>
        <CardDescription id={legendId}>{decision.legend}</CardDescription>
      </CardHeader>

      <CardContent className="px-5 pb-5">
        <RadioGroup
          // An empty value keeps the group controlled while nothing is chosen.
          value={choice ?? ''}
          onValueChange={(value) => onChoose(value as Choice)}
          aria-labelledby={legendId}
          className="grid auto-cols-fr grid-flow-col gap-3"
        >
          {views.map((view) => (
            <label key={view.property.id} className={optionClasses}>
              <RadioGroupItem value={view.property.id} className="mt-0.5 bg-card" />
              <span className="font-medium">{decision.myPick(text(view.property.project))}</span>
            </label>
          ))}
          <label className={optionClasses}>
            <RadioGroupItem value="none" className="mt-0.5 bg-card" />
            <span className="flex flex-col gap-0.5">
              <span className="font-medium">{decision.none}</span>
              <span className="text-xs text-muted-foreground">{decision.noneHint}</span>
            </span>
          </label>
        </RadioGroup>
      </CardContent>

      <CardFooter className="justify-between gap-4 px-5 py-3.5">
        <p className="text-xs text-muted-foreground">{decision.notSaved}</p>
        <div className="flex shrink-0 items-center gap-4">
          {choice === null ? (
            <p id={helperId} className="text-sm text-muted-foreground">
              {decision.recordHelper}
            </p>
          ) : null}
          <Button
            size="lg"
            disabled={choice === null}
            aria-describedby={choice === null ? helperId : undefined}
            onClick={onRecord}
            className="px-4"
          >
            {decision.record}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
