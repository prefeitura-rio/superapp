'use client'

import { FloatNavigationWrapper } from '@/app/components/float-navigation-wrapper'
import { SecondaryHeader } from '@/app/components/secondary-header'
import Link from 'next/link'
import { useState } from 'react'
import { StatusBadge } from './components/status-badge'
import { MOCK_REQUESTS } from './mock-data'
import type { Request } from './types'

const FILTER_TABS = ['Todos', 'Serviços', 'Ouvidoria', 'Acesso à informação']

function RequestCard({ request }: { request: Request }) {
  return (
    <Link href={`/solicitacoes/${request.id}`}>
      <div className="bg-card rounded-2xl p-4 cursor-pointer active:opacity-80 transition-opacity h-full">
        <div className="flex items-start justify-between gap-3 mb-2">
          <p className="text-xs text-foreground-light">{request.date}</p>
          <StatusBadge status={request.status} />
        </div>
        <h3 className="text-sm font-semibold text-card-foreground leading-snug mb-1">
          {request.title}
        </h3>
        <p className="text-xs text-foreground-light">
          Protocolo {request.protocol} • {request.category}
        </p>
      </div>
    </Link>
  )
}

export default function MyRequestsPage() {
  const [activeFilter, setActiveFilter] = useState('Todos')
  const [search, setSearch] = useState('')

  const filtered = MOCK_REQUESTS.filter(r => {
    const matchesFilter =
      activeFilter === 'Todos' || r.category === activeFilter

    const matchesSearch =
      search.length < 2 ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.protocol.toLowerCase().includes(search.toLowerCase())

    return matchesFilter && matchesSearch
  })

  return (
    <div className="max-w-4xl min-h-lvh mx-auto text-foreground">
      <SecondaryHeader title="Minhas Solicitações" route="/" />

      <div className="pt-24 pb-32 flex flex-col gap-4 px-4">
        {/* Filter chips */}
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
          <div className="flex gap-2 w-max">
            {FILTER_TABS.map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveFilter(tab)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border border-border ${
                  activeFilter === tab
                    ? 'bg-secondary text-secondary-foreground'
                    : 'bg-transparent text-foreground'
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
            className="w-full bg-card text-card-foreground placeholder:text-foreground-light text-sm rounded-xl pl-9 pr-4 py-3 border border-border outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Grid: 1 col mobile, 2 cols md+ */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-foreground-light text-sm">
              Nenhuma solicitação encontrada.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map(request => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        )}
      </div>

      <FloatNavigationWrapper />
    </div>
  )
}
