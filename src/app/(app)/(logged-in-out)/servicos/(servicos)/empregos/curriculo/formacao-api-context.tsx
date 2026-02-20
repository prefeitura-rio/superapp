'use client'

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react'
import type { FormacaoApiItem, FormacaoOptions } from './formacao-options-types'

interface FormacaoApiContextValue {
  escolaridades: FormacaoApiItem[]
  idiomas: FormacaoApiItem[]
  niveisIdioma: FormacaoApiItem[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const FormacaoApiContext = createContext<FormacaoApiContextValue | null>(null)

interface FormacaoApiProviderProps {
  /** Dados carregados no Server Component e passados como props. */
  initialData: FormacaoOptions
  children: ReactNode
}

export function FormacaoApiProvider({ initialData, children }: FormacaoApiProviderProps) {
  const value = useMemo<FormacaoApiContextValue>(
    () => ({
      escolaridades: initialData.escolaridades,
      idiomas: initialData.idiomas,
      niveisIdioma: initialData.niveisIdioma,
      isLoading: false,
      error: null,
      refetch: async () => {},
    }),
    [
      initialData.escolaridades,
      initialData.idiomas,
      initialData.niveisIdioma,
    ]
  )

  return (
    <FormacaoApiContext.Provider value={value}>
      {children}
    </FormacaoApiContext.Provider>
  )
}

export function useFormacaoApi() {
  const ctx = useContext(FormacaoApiContext)
  if (!ctx) {
    throw new Error('useFormacaoApi must be used within FormacaoApiProvider')
  }
  return ctx
}
