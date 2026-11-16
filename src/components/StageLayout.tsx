import type { ReactNode } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'

export const STAGE_TITLE_ID = 'stage-title'

interface StageLayoutProps {
  title: string
  intro: string
  children: ReactNode
  /** Actions that stay in view at the bottom of the stage. */
  footer?: ReactNode
}

/**
 * The scrolling body of a stage with an action bar pinned beneath it.
 * The body is the only scroller, so sticky table headers and columns follow it.
 */
export function StageLayout({ title, intro, children, footer }: StageLayoutProps) {
  return (
    <>
      <ScrollArea type="auto" horizontal className="min-h-0 flex-1">
        <main id="main" className="mx-auto w-full max-w-[1360px] px-6 pt-7 pb-12 xl:px-10">
          <header className="mb-6 max-w-3xl">
            <h1
              id={STAGE_TITLE_ID}
              tabIndex={-1}
              className="text-2xl font-semibold outline-none ltr:tracking-tight"
            >
              {title}
            </h1>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{intro}</p>
          </header>
          {children}
        </main>
      </ScrollArea>
      {footer ? (
        <div className="shrink-0 border-t border-border-strong bg-card">
          <div className="mx-auto flex min-h-16 w-full max-w-[1360px] items-center gap-5 px-6 py-3 xl:px-10">
            {footer}
          </div>
        </div>
      ) : null}
    </>
  )
}
