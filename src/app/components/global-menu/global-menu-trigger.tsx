'use client'

import { MenuIcon } from '@/assets/icons/menu-icon'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { GlobalMenu } from './global-menu'

interface GlobalMenuTriggerProps {
  className?: string
}

export function GlobalMenuTrigger({ className }: GlobalMenuTriggerProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          'flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-card transition-colors hover:bg-secondary',
          className
        )}
      >
        <MenuIcon className="h-5 w-5 text-foreground" />
        <span className="sr-only">Abrir menu</span>
      </button>

      <GlobalMenu open={open} onOpenChange={setOpen} />
    </>
  )
}
