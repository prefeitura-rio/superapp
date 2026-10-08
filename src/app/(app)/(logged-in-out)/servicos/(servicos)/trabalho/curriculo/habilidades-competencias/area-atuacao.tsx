'use client'

import { CustomInput } from '@/components/ui/custom/custom-input'
import { ChevronDown, ChevronUp } from 'lucide-react'
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
        <CustomInput
          id="area-atuacao"
          label="Área de atuação"
          value={termoBusca}
          onChange={event => {
            setTermoBusca(event.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Digite para pesquisar área..."
          className="pr-12"
        />
        <button
          type="button"
          aria-label={isOpen ? 'Fechar lista de áreas' : 'Abrir lista de áreas'}
          onClick={() => setIsOpen(open => !open)}
          className="absolute inset-y-0 right-0 flex cursor-pointer items-center px-4 text-primary"
        >
          {isOpen ? (
            <ChevronUp className="size-5" />
          ) : (
            <ChevronDown className="size-5" />
          )}
        </button>
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
                <span
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full ${
                    area.checked ? 'bg-primary/50' : 'bg-primary/20'
                  }`}
                >
                  {area.checked && (
                    <span className="size-2.5 rounded-full bg-background" />
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
