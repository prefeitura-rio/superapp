'use client'

import { type ReactNode, createContext, useContext, useMemo } from 'react'
import type {
  SituacaoOptionItem,
  SituacaoOptions,
} from './situacao-options-types'

interface SituacaoApiContextValue {
  situacoesAtual: SituacaoOptionItem[]
  disponibilidades: SituacaoOptionItem[]
  regimesContratacao: SituacaoOptionItem[]
}

const SituacaoApiContext = createContext<SituacaoApiContextValue | null>(null)

interface SituacaoApiProviderProps {
  initialData: SituacaoOptions
  children: ReactNode
}

export function SituacaoApiProvider({
  initialData,
  children,
}: SituacaoApiProviderProps) {
  const value = useMemo<SituacaoApiContextValue>(
    () => ({
      situacoesAtual: initialData.situacoesAtual,
      disponibilidades: initialData.disponibilidades,
      regimesContratacao: initialData.regimesContratacao,
    }),
    [
      initialData.situacoesAtual,
      initialData.disponibilidades,
      initialData.regimesContratacao,
    ]
  )
  return (
    <SituacaoApiContext.Provider value={value}>
      {children}
    </SituacaoApiContext.Provider>
  )
}

export function useSituacaoApi() {
  const ctx = useContext(SituacaoApiContext)
  if (!ctx)
    throw new Error('useSituacaoApi must be used within SituacaoApiProvider')
  return ctx
}
