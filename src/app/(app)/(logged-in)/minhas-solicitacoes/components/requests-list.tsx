'use client'

import { SearchIcon20 } from '@/assets/icons/search-icon'
import Link from 'next/link'
import { useState } from 'react'
import type { RequestStatus } from '../types'
import { StatusBadge } from './status-badge'

interface RequestItem {
  protocolo: string
  codigoOs: string
  servico: string
  categoria: string
  status: RequestStatus
  dataAbertura: string
}

const FILTER_TABS = ['Todos', 'Serviços', 'Ouvidoria', 'Acesso à informação']

function RequestCard({ item }: { item: RequestItem }) {
  return (
    <Link href={`/solicitacoes/${item.protocolo}?os=${item.codigoOs}`}>
      <div className="bg-card rounded-2xl p-4 cursor-pointer hover:bg-card/70 active:opacity-80 active:scale-[0.98] md:active:scale-100 transition-all h-full">
        <div className="flex items-start justify-between gap-3 mb-2">
          <p className="text-xs text-foreground-light">{item.dataAbertura}</p>
          <StatusBadge status={item.status} />
        </div>
        <h3 className="text-base font-medium text-foreground leading-5 tracking-normal mb-1">
          {item.servico}
        </h3>
        <p className="text-xs font-normal text-foreground-light leading-4 tracking-normal">
          Protocolo {item.protocolo} • {item.categoria}
        </p>
      </div>
    </Link>
  )
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex justify-center items-center gap-2.5 self-stretch rounded-2xl bg-card p-4">
      <p className="text-foreground-light text-sm font-normal leading-5 tracking-normal">
        {filtered
          ? 'Nenhuma solicitação encontrada para esse filtro.'
          : 'Você ainda não possui solicitações para acompanhar.'}
      </p>
    </div>
  )
}

export function RequestsList({ items }: { items: RequestItem[] }) {
  const [activeFilter, setActiveFilter] = useState('Todos')
  const [search, setSearch] = useState('')

  const filtered = items.filter(r => {
    const matchesFilter =
      activeFilter === 'Todos' || r.categoria === activeFilter

    const matchesSearch =
      search.length < 2 ||
      r.servico.toLowerCase().includes(search.toLowerCase()) ||
      r.protocolo.toLowerCase().includes(search.toLowerCase())

    return matchesFilter && matchesSearch
  })

  return (
    <div className="pt-[100px] pb-32 flex flex-col gap-4 px-4">
      {/* Filter chips + Search — gap-2 entre eles */}
      <div className="flex flex-col gap-2">
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
          <div className="flex gap-2 w-max">
            {FILTER_TABS.map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveFilter(tab)}
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

        {/* Search */}
        <div className="relative flex items-center">
          <SearchIcon20 className="absolute left-5 text-foreground-light pointer-events-none shrink-0" />
          <input
            type="text"
            placeholder="Encontre sua solicitação"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-card text-card-foreground placeholder:text-foreground-light placeholder:text-sm placeholder:font-normal placeholder:leading-5 placeholder:tracking-normal text-sm rounded-full pl-11 pr-5 py-4 outline-none hover:bg-card/80 transition-colors cursor-text"
          />
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState filtered={activeFilter !== 'Todos' || search.length >= 2} />
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
    </div>
  )
}
