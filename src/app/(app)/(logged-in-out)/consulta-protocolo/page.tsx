'use client'

import { StatusBadge } from '@/app/(app)/(logged-in)/minhas-solicitacoes/components/status-badge'
import {
  formatDate,
  normalizeStatus,
} from '@/app/(app)/(logged-in)/minhas-solicitacoes/helpers'
import { FloatNavigationWrapper } from '@/app/components/float-navigation-wrapper'
import { SecondaryHeader } from '@/app/components/secondary-header'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface OsItem {
  codigoOs: string
  servico: string
  categoria: string
  status: string
  dataAbertura: string
  protocolo: string
}

type PageState = 'form' | 'loading' | 'results' | 'error'

export default function ConsultaProtocoloPage() {
  const router = useRouter()
  const [protocolo, setProtocolo] = useState('')
  const [pageState, setPageState] = useState<PageState>('form')
  const [errorMsg, setErrorMsg] = useState('')
  const [results, setResults] = useState<OsItem[]>([])
  const [searchedProtocolo, setSearchedProtocolo] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = protocolo.trim()
    if (!trimmed) return

    setPageState('loading')
    setErrorMsg('')
    setSearchedProtocolo(trimmed)

    try {
      const res = await fetch(
        `/api/chamados-publico/${encodeURIComponent(trimmed)}`
      )

      if (res.status === 404 || res.status === 204) {
        setErrorMsg('Nenhuma solicitação encontrada para este protocolo.')
        setPageState('error')
        return
      }

      if (!res.ok) {
        setErrorMsg(
          'Ocorreu um erro ao consultar o protocolo. Tente novamente.'
        )
        setPageState('error')
        return
      }

      const data = await res.json()
      const ordens: any[] = data?.ordens_de_servico ?? []

      if (ordens.length === 0) {
        setErrorMsg('Nenhuma solicitação encontrada para este protocolo.')
        setPageState('error')
        return
      }

      if (ordens.length === 1) {
        const codigoOs = ordens[0]?.codigoOs
        const href = codigoOs
          ? `/solicitacoes/${trimmed}?os=${codigoOs}`
          : `/solicitacoes/${trimmed}`
        router.push(href)
        return
      }

      const items: OsItem[] = ordens.map((os: any) => ({
        codigoOs: os.codigoOs ?? '',
        servico: os.servico ?? '—',
        categoria: os.categoria ?? 'Serviço',
        status: os.status ?? '',
        dataAbertura: os.dataAbertura ?? '',
        protocolo: trimmed,
      }))

      setResults(items)
      setPageState('results')
    } catch {
      setErrorMsg('Ocorreu um erro ao consultar o protocolo. Tente novamente.')
      setPageState('error')
    }
  }

  const handleBack = () => {
    setPageState('form')
    setErrorMsg('')
    setResults([])
  }

  if (pageState === 'results') {
    return (
      <div className="max-w-4xl min-h-lvh mx-auto text-foreground">
        <SecondaryHeader route="/consulta-protocolo" forceRoute />

        <div className="pt-24 pb-32 px-4 flex flex-col gap-3">
          <div className="bg-card rounded-2xl p-4">
            <p className="text-sm text-foreground-light leading-5">
              Encontramos{' '}
              <span className="font-semibold text-foreground">
                {results.length} solicitações
              </span>{' '}
              associadas ao número de protocolo {searchedProtocolo}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {results.map(item => (
              <button
                key={item.codigoOs}
                type="button"
                onClick={() =>
                  router.push(
                    item.codigoOs
                      ? `/solicitacoes/${item.protocolo}?os=${item.codigoOs}`
                      : `/solicitacoes/${item.protocolo}`
                  )
                }
                className="w-full text-left bg-card rounded-2xl p-4 cursor-pointer hover:bg-card/70 active:opacity-80 active:scale-[0.98] md:active:scale-100 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="text-xs text-foreground-light">
                    {formatDate(item.dataAbertura)}
                  </p>
                  <StatusBadge status={normalizeStatus(item.status)} />
                </div>
                <h3 className="text-sm font-semibold text-card-foreground leading-snug mb-1">
                  {item.servico}
                </h3>
                <p className="text-xs text-foreground-light">
                  Protocolo {item.protocolo} • {item.categoria}
                </p>
              </button>
            ))}
          </div>
        </div>

        <FloatNavigationWrapper />
      </div>
    )
  }

  return (
    <div className="max-w-4xl min-h-lvh mx-auto text-foreground">
      <SecondaryHeader route="/" />

      <div className="pt-24 pb-32 px-4 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold text-foreground leading-tight">
            Consulte seu protocolo
          </h1>
          <p className="text-sm text-foreground-light leading-5">
            A consulta neste campo não permite a visualização de todos os
            detalhes da solicitação
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="protocolo"
              className="text-sm font-medium text-primary"
            >
              Número de protocolo
            </label>
            <input
              id="protocolo"
              type="text"
              placeholder="Escreva aqui seu número de protocolo"
              value={protocolo}
              onChange={e => setProtocolo(e.target.value)}
              className="w-full bg-transparent text-foreground placeholder:text-foreground-light text-sm h-16 rounded-xl px-5 border-[1.4px] border-border outline-none focus:border-primary transition-colors"
            />
            <p className="text-xs text-foreground-light">
              Escreva no formato: RIO-12345678-9
            </p>
            {pageState === 'error' && (
              <p className="text-xs text-red-500">{errorMsg}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!protocolo.trim() || pageState === 'loading'}
            className="w-full h-14 bg-primary text-primary-foreground text-sm font-medium rounded-full disabled:opacity-40 transition-opacity flex items-center justify-center gap-2"
          >
            {pageState === 'loading' && (
              <svg
                className="animate-spin h-4 w-4 text-primary-foreground"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            )}
            {pageState === 'loading' ? 'Consultando...' : 'Consultar protocolo'}
          </button>
        </form>
      </div>

      <FloatNavigationWrapper />
    </div>
  )
}
