'use client'

import { type ReactNode, createContext, useContext, useMemo } from 'react'
import type { ExperienciaOptions } from './experiencia-options-types'

interface ExperienciaApiContextValue {
  tiposConquista: ExperienciaOptions['tiposConquista']
}

const ExperienciaApiContext = createContext<ExperienciaApiContextValue | null>(
  null
)

interface ExperienciaApiProviderProps {
  initialData: ExperienciaOptions
  children: ReactNode
}

export function ExperienciaApiProvider({
  initialData,
  children,
}: ExperienciaApiProviderProps) {
  const value = useMemo<ExperienciaApiContextValue>(
    () => ({
      tiposConquista: initialData.tiposConquista,
    }),
    [initialData.tiposConquista]
  )
  return (
    <ExperienciaApiContext.Provider value={value}>
      {children}
    </ExperienciaApiContext.Provider>
  )
}

export function useExperienciaApi() {
  const ctx = useContext(ExperienciaApiContext)
  if (!ctx)
    throw new Error('useExperienciaApi must be used within ExperienciaApiProvider')
  return ctx
}
