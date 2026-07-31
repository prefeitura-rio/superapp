'use client'

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
    <Link href={`/solicitacoes/${item.protocolo}`}>
      <div className="bg-card rounded-2xl p-4 cursor-pointer active:opacity-80 transition-opacity h-full">
        <div className="flex items-start justify-between gap-3 mb-2">
          <p className="text-xs text-foreground-light">{item.dataAbertura}</p>
          <StatusBadge status={item.status} />
        </div>
        <h3 className="text-sm font-semibold text-card-foreground leading-snug mb-1">
          {item.servico}
        </h3>
        <p className="text-xs text-foreground-light">
          Protocolo {item.protocolo} • {item.categoria}
        </p>
      </div>
    </Link>
  )
}

function EmptyState() {
  return (
    <div className="flex justify-center items-center gap-2.5 self-stretch rounded-2xl bg-card p-4">
      <p className="text-foreground-light text-sm font-normal leading-5 tracking-normal">
        Você ainda não possui solicitações para acompanhar.
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
    <div className="pt-24 pb-32 flex flex-col gap-4 px-4">
      {/* Filter chips */}
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div className="flex gap-2 w-max">
          {FILTER_TABS.map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === tab
                  ? 'border border-foreground bg-secondary text-foreground'
                  : 'bg-card text-foreground border border-transparent'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative flex items-center">
        <svg
          className="absolute left-3 h-4 w-4 text-foreground-light pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Encontre sua solicitação"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-card text-card-foreground placeholder:text-foreground-light text-sm rounded-full pl-9 pr-4 py-3 border border-border outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState />
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
