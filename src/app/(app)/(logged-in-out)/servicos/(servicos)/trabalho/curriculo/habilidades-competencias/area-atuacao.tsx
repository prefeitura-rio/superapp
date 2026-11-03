'use client'

import { CustomInput } from '@/components/ui/custom/custom-input'
import { Search } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { AreaAtuacaoViewModel } from './types'

interface AreaAtuacaoProps {
  value?: string
  areasAtuacao: AreaAtuacaoViewModel[]
  onSelect: (area: AreaAtuacaoViewModel) => void
}

export function AreaAtuacao({
  value,
  areasAtuacao,
  onSelect,
}: AreaAtuacaoProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [termoBusca, setTermoBusca] = useState(value ?? '')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => setTermoBusca(value ?? ''), [value])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const areasFiltradas = useMemo(() => {
    const palavras = termoBusca
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(Boolean)
    if (palavras.length === 0) return areasAtuacao

    return areasAtuacao.filter(area => {
      const texto = area.nome.toLowerCase()
      return palavras.every(palavra => texto.includes(palavra))
    })
  }, [areasAtuacao, termoBusca])

  return (
    <div ref={dropdownRef} className="relative w-full space-y-1">
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-5 z-10 size-6  text-theme-color-card-foreground"
          strokeWidth={1.4}
          aria-hidden="true"
        />

        <CustomInput
          id="area-atuacao"
          label="Área de atuação"
          value={termoBusca}
          onChange={event => {
            setTermoBusca(event.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Pesquisar"
          className="h-16 w-full rounded-xl border-[1.4px] border-theme-color-border bg-theme-color-card pl-16 text-sm placeholder:text-theme-color-muted-foreground"
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-border bg-background py-1 shadow-xl">
          {areasFiltradas.length > 0 ? (
            areasFiltradas.map(area => (
              <button
                key={area.nome}
                type="button"
                onClick={() => {
                  onSelect(area)
                  setTermoBusca(area.nome)
                  setIsOpen(false)
                }}
                className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left text-sm hover:bg-muted"
              >
                <span className="flex-1">{area.nome}</span>
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-[#A1A1A1]">
                  {area.checked && (
                    <span className="size-4 rounded-full bg-[#13335A]" />
                  )}
                </span>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-sm italic text-muted-foreground">
              Nenhuma área encontrada
            </div>
          )}
        </div>
      )}
    </div>
  )
}
