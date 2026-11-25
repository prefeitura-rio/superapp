'use client'

import { SearchIcon20 } from '@/assets/icons/search-icon'
import { Pagination } from '@/components/ui/pagination'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { TAB_TO_FILTRO_PARAM } from '../helpers'
import type { RequestItem, RequestStatus } from '../types'
import { StatusBadge } from './status-badge'

export type { RequestItem }

/** Paginação feita pelo backend: a lista recebe só os itens da página. */
export interface RequestsPagination {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

const FILTER_TABS = ['Todos', 'Serviços', 'Ouvidoria', 'Acesso à informação']

const CARD_CLASS =
  'bg-card rounded-2xl flex flex-col justify-between p-4 h-33 transition-all'
const CARD_INTERACTIVE_CLASS =
  'cursor-pointer hover:bg-card/70 active:opacity-80 active:scale-[0.98] md:active:scale-100'

function RequestCard({ item }: { item: RequestItem }) {
  const tipo = item.isAcessoInformacao ? 'LAI' : item.categoria
  const conteudo = (
    <>
      <div className="flex items-start justify-between gap-3 w-full">
        <p className="text-xs text-foreground-light">{item.dataAbertura}</p>
        <StatusBadge status={item.status} />
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-base font-medium text-foreground leading-5 tracking-normal line-clamp-2">
          {item.servico}
        </h3>
        <p className="text-xs font-normal text-foreground-light leading-4 tracking-normal truncate">
          {item.protocolo ? `Protocolo ${item.protocolo} • ${tipo}` : tipo}
        </p>
      </div>
    </>
  )

  if (!item.protocolo) {
    return <div className={CARD_CLASS}>{conteudo}</div>
  }

  return (
    <Link href={`/solicitacoes/${item.protocolo}?os=${item.codigoOs}`}>
      <div className={`${CARD_CLASS} ${CARD_INTERACTIVE_CLASS}`}>
        {conteudo}
      </div>
    </Link>
  )
}

const MENSAGEM_VAZIA_PADRAO =
  'Você ainda não possui solicitações para acompanhar.'

function EmptyState({
  filtered,
  mensagemVazia = MENSAGEM_VAZIA_PADRAO,
}: { filtered: boolean; mensagemVazia?: string }) {
  return (
    <div className="flex justify-center items-center gap-2.5 self-stretch rounded-2xl bg-card p-4">
      <p className="text-foreground-light text-sm font-normal leading-5 tracking-normal">
        {filtered
          ? 'Nenhuma solicitação encontrada para esse filtro.'
          : mensagemVazia}
      </p>
    </div>
  )
}

export function RequestsList({
  items,
  filtros = FILTER_TABS,
  filtroInicial,
  pagination,
  mensagemVazia,
  searchable = false,
}: {
  items: RequestItem[]
  filtros?: readonly string[]
  filtroInicial?: string
  pagination?: RequestsPagination
  /**
   * Texto da lista sem nenhum item (sem filtro de aba nem busca). Com filtro, a
   * mensagem continua sendo a do filtro.
   */
  mensagemVazia?: string
  /**
   * Campo "Encontre sua solicitação". Desligado em todas as origens até o RMI
   * ter um query param de busca para o histórico SGRC. O filtro abaixo é local
   * (só nos itens recebidos): não serve para listas paginadas pelo backend.
   */
  searchable?: boolean
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeFilter, setActiveFilter] = useState(
    filtroInicial && filtros.includes(filtroInicial) ? filtroInicial : 'Todos'
  )
  const [search, setSearch] = useState('')

  function handleFilterChange(tab: string) {
    setActiveFilter(tab)
    const param = TAB_TO_FILTRO_PARAM[tab]
    // Preserva os demais params (ex.: `?o=`): só `filtro` muda.
    const next = new URLSearchParams(searchParams.toString())
    if (param) next.set('filtro', param)
    else next.delete('filtro')
    const query = next.toString()
    router.replace(
      query ? `/minhas-solicitacoes?${query}` : '/minhas-solicitacoes',
      { scroll: false }
    )
  }

  const termo = searchable ? search : ''

  const filtered = items.filter(r => {
    const matchesFilter =
      activeFilter === 'Todos' ||
      (activeFilter === 'Acesso à informação'
        ? r.isAcessoInformacao === true
        : r.categoria?.toLowerCase() === activeFilter.toLowerCase())

    const matchesSearch =
      termo.length < 2 ||
      r.servico.toLowerCase().includes(termo.toLowerCase()) ||
      r.protocolo.toLowerCase().includes(termo.toLowerCase())

    return matchesFilter && matchesSearch
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
          <div className="flex gap-2 w-max">
            {filtros.map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => handleFilterChange(tab)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  activeFilter === tab
                    ? 'border border-foreground bg-secondary text-foreground'
                    : 'bg-card text-foreground border border-transparent hover:bg-card/70'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        {searchable && (
          <div className="relative flex items-center">
            <SearchIcon20 className="absolute left-5 text-foreground-light pointer-events-none shrink-0" />
            <input
              type="text"
              placeholder="Encontre sua solicitação"
              value={search}
              onChange={event => setSearch(event.target.value)}
              className="w-full bg-card text-card-foreground placeholder:text-foreground-light placeholder:text-sm placeholder:font-normal placeholder:leading-5 placeholder:tracking-normal text-sm rounded-full pl-11 pr-5 py-4 outline-none hover:bg-card/80 transition-colors cursor-text"
            />
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          filtered={activeFilter !== 'Todos' || termo.length >= 2}
          mensagemVazia={mensagemVazia}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map(item => (
            <RequestCard
              key={`${item.protocolo}-${item.codigoOs}`}
              item={item}
            />
          ))}
        </div>
      )}

      {pagination && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={pagination.onPageChange}
          className="pt-4"
        />
      )}
    </div>
  )
}
