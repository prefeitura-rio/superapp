'use client'

import {
  contarParaAcompanhar,
  selecionarItensSalesforce,
  selecionarPaginaSgrc,
} from '@/lib/chamados/mappers'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  chamadoDetalheQueryOptions,
  chamadosSalesforceQueryOptions,
  chamadosSgrcQueryOptions,
} from './chamados-query-options'

/** Itens da lista do novo 1746, prontos para a tela. */
export function useChamadosSalesforce() {
  return useQuery({
    ...chamadosSalesforceQueryOptions(),
    select: selecionarItensSalesforce,
  })
}

/**
 * Quantas solicitações o banner da home mostra. Mesma query (e mesma
 * requisição) da lista de Minhas Solicitações: só o `select` muda.
 */
export function useChamadosParaAcompanhar({ enabled }: { enabled: boolean }) {
  return useQuery({
    ...chamadosSalesforceQueryOptions(),
    select: contarParaAcompanhar,
    enabled,
  })
}

/**
 * Uma página do histórico SGRC. Na troca de página, a anterior continua em
 * `data` (com `isPlaceholderData`) até a nova chegar: a lista não some.
 */
export function useChamadosSgrc(
  page: number,
  { enabled }: { enabled: boolean }
) {
  return useQuery({
    ...chamadosSgrcQueryOptions(page),
    select: selecionarPaginaSgrc,
    placeholderData: keepPreviousData,
    enabled,
  })
}

export function useChamadoDetalhe(protocolo: string) {
  return useQuery(chamadoDetalheQueryOptions(protocolo))
}
