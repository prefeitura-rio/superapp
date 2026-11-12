'use client'

import { MenuIcon } from '@/assets/icons/menu-icon'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { GlobalMenu } from './global-menu'

interface GlobalMenuTriggerProps {
  className?: string
}

/**
 * Botão "Menu" do Header Global: abre o menu global em qualquer tela.
 * Estado focused no hover (desktop) e enquanto pressionado (toque).
 */
export function GlobalMenuTrigger({ className }: GlobalMenuTriggerProps) {
  const [open, setOpen] = useState(false)
  // O menu só é montado no primeiro clique (e fica montado para a animação de
  // fechar): o header aparece em todas as telas e não precisa carregar o menu.
  const [mounted, setMounted] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setMounted(true)
          setOpen(true)
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          'flex shrink-0 cursor-pointer items-center justify-center rounded-full bg-card p-3 transition-colors hover:bg-secondary active:bg-secondary',
          className
        )}
      >
        <MenuIcon className="h-5 w-5 text-foreground" />
        <span className="sr-only">Menu</span>
      </button>

      {mounted && <GlobalMenu open={open} onOpenChange={setOpen} />}
    </>
  )
}
