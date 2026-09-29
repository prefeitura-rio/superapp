'use client'

import type { AreaAtuacaoViewModel } from './types'

interface ConhecimentosProps {
  area: AreaAtuacaoViewModel | null
  onToggle: (idTupla: number) => void
}

export function Conhecimentos({ area, onToggle }: ConhecimentosProps) {
  if (!area || area.vinculos.length === 0) return null

  return (
    <div className="mt-4 w-full space-y-2">
      <span className="text-primary text-sm font-normal">
        Selecione conhecimentos
      </span>
      <div className="flex w-full flex-wrap gap-2">
        {area.vinculos.map(habilidade => (
          <button
            key={habilidade.idTupla}
            type="button"
            onClick={() => onToggle(habilidade.idTupla)}
            className={`cursor-pointer rounded-full px-4 py-2 text-sm transition-all ${
              habilidade.checked
                ? 'border border-foreground bg-primary/20 font-medium text-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {habilidade.nome}
          </button>
        ))}
      </div>
    </div>
  )
}
