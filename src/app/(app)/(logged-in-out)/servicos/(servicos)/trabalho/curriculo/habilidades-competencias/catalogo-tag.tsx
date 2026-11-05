'use client'

import { cn } from '@/lib/utils'

interface CatalogoTagProps {
  selected: boolean
  onClick: () => void
  children: string
}

export function CatalogoTag({ selected, onClick, children }: CatalogoTagProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        'inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-normal text-foreground transition-all duration-200',
        selected
          ? 'bg-secondary ring-1 ring-inset ring-black hover:brightness-95'
          : 'bg-card hover:bg-secondary'
      )}
    >
      {children}
    </button>
  )
}
