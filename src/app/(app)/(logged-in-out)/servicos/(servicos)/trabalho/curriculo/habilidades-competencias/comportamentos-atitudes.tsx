'use client'

import { ReactNode } from 'react'
import type { ComportamentoAtitudeViewModel } from './types'

interface ComportamentosAtitudesProps {
  itens: ComportamentoAtitudeViewModel[]
  onToggle: (id: number) => void
}

export function ComportamentosAtitudes({
  itens,
  onToggle,
}: ComportamentosAtitudesProps) {
  const obterClassName = (item: ComportamentoAtitudeViewModel) => {
    if (item.clicked) {
      return 'size- px-4 py-1.5 bg-[#E4E4E7] rounded-[999px] outline outline-1 outline-offset-[-1px] outline-black inline-flex justify-center items-center gap-1.5'
    }

    return 'size- px-4 py-1.5 bg-theme-color-card rounded-[999px] inline-flex justify-center items-center gap-1.5'
  }

  return (
    <div className="w-full">
      <span className="text-primary text-sm font-normal">
        Selecione comportamentos e atitudes
      </span>
      <div className="flex w-full flex-wrap mt-3">
        {itens.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => onToggle(item.id)}
            className={obterClassName(item)}
          >
            <div className="justify-start text-theme-color-foreground text-sm font-normal font-['DM_Sans'] leading-5">
              {item.nome}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
