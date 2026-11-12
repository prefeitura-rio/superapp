'use client'

import { Check, X } from 'lucide-react'

interface HabilidadesAccordionMarkProps {
  preenchida: boolean
  erro: boolean
}

export function HabilidadesAccordionMark({
  preenchida,
  erro,
}: HabilidadesAccordionMarkProps) {
  if (erro) {
    return (
      <span
        data-testid="habilidades-error"
        className="flex size-5 shrink-0 items-center justify-center rounded-full bg-destructive"
      >
        <X className="size-3.5 text-white stroke-3" />
      </span>
    )
  }

  if (!preenchida) return null

  return (
    <span
      data-testid="habilidades-check"
      className="flex size-5 shrink-0 items-center justify-center rounded-full bg-wallet-2b"
    >
      <Check className="size-3.5 text-white stroke-3" />
    </span>
  )
}
