import { Info } from 'lucide-react'
import type { ReactNode } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

/** A standing note that qualifies the figures around it. */
export function FixedNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Alert role="note" className={cn('border-0 bg-transparent p-0 text-xs', className)}>
      <Info aria-hidden="true" className="size-3.5! text-muted-foreground" />
      <AlertDescription className="max-w-3xl text-xs leading-5 text-pretty">{children}</AlertDescription>
    </Alert>
  )
}
