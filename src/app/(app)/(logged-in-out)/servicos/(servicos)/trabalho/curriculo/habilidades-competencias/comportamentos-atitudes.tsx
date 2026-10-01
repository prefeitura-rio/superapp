'use client'

import type { ComportamentoAtitudeViewModel } from './types'

interface ComportamentosAtitudesProps {
  itens: ComportamentoAtitudeViewModel[]
  onToggle: (id: number) => void
}

export function ComportamentosAtitudes({
  itens,
  onToggle,
}: ComportamentosAtitudesProps) {
  return (
    <div className="w-full space-y-2">
      <span className="text-primary text-sm font-normal">
        Selecione comportamentos e atitudes
      </span>
      <div className="flex w-full flex-wrap gap-2">
        {itens.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => onToggle(item.id)}
            className={`cursor-pointer rounded-full px-4 py-2 text-sm transition-all ${
              item.clicked
                ? 'border border-foreground bg-primary/20 font-medium text-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {item.nome}
          </button>
        ))}
      </div>
    </div>
  )
}
