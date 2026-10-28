'use client'

import type { AreaAtuacaoViewModel, HabilidadeVinculoViewModel } from './types'

interface ConhecimentosProps {
  area: AreaAtuacaoViewModel | null
  onToggle: (idTupla: number) => void
}

const obterClassName = (habilidade: HabilidadeVinculoViewModel) => {
  if (habilidade.checked) {
    return 'size- px-4 py-1.5 bg-[#E4E4E7] rounded-[999px] outline outline-1 outline-offset-[-1px] outline-black inline-flex justify-center items-center gap-1.5'
  }

  return 'size- px-4 py-1.5 bg-theme-color-card rounded-[999px] inline-flex justify-center items-center gap-1.5'
}

export function Conhecimentos({ area, onToggle }: ConhecimentosProps) {
  if (!area || area.vinculos.length === 0) return null

  return (
    <div className="mt-4 w-full space-y-2">
      <span className="text-primary text-sm font-normal">
        Selecione conhecimentos
      </span>
      <div className="flex w-full flex-wrap gap-2 mt-3">
        {area.vinculos.map(habilidade => (
          <button
            key={habilidade.idTupla}
            type="button"
            onClick={() => onToggle(habilidade.idTupla)}
            className={obterClassName(habilidade)}
          >
            <div className="justify-start text-theme-color-foreground text-sm font-normal font-['DM_Sans'] leading-5">
              {habilidade.nome}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
