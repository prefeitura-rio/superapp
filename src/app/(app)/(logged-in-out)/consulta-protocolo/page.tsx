'use client'

import { StatusBadge } from '@/app/(app)/(logged-in)/minhas-solicitacoes/components/status-badge'
import {
  formatDate,
  normalizeStatus,
} from '@/app/(app)/(logged-in)/minhas-solicitacoes/helpers'
import { FloatNavigationWrapper } from '@/app/components/float-navigation-wrapper'
import { SecondaryHeader } from '@/app/components/secondary-header'
import { ChevronLeftIcon } from '@/assets/icons/chevron-left-icon'
import { IconButton } from '@/components/ui/custom/icon-button'
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
        servico: os.servico ?? os.subtema ?? os.tema ?? '—',
        // TODO: remover fallback 'Serviço' quando API retornar subcategoria corretamente para Ouvidoria e LAI
        categoria: data.subcategoria ?? 'Serviço',
        status: os.status ?? '',
        dataAbertura: data.dataAbertura ?? '',
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
        <header
          className="px-4 fixed w-full max-w-4xl mx-auto z-50 bg-background"
          style={{ paddingTop: '24px', paddingBottom: '24px', top: 0 }}
        >
          <IconButton icon={ChevronLeftIcon} onClick={handleBack} />
        </header>

        <div className="pt-23 pb-32 px-4 flex flex-col gap-4">
          <div className="bg-card rounded-2xl p-4">
            <p className="text-sm text-foreground-light leading-5">
              Encontramos{' '}
              <span className="text-foreground">
                {results.length} solicitações
              </span>{' '}
              associadas ao número de protocolo {searchedProtocolo}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
                className="w-full text-left bg-card rounded-2xl p-4 cursor-pointer hover:bg-card/70 active:opacity-80 active:scale-[0.98] md:active:scale-100 transition-all flex flex-col justify-between"
                style={{ height: '132px' }}
              >
                <div className="flex items-start justify-between gap-3 w-full">
                  <p className="text-xs text-foreground-light">
                    {item.dataAbertura ? formatDate(item.dataAbertura) : ''}
                  </p>
                  <StatusBadge status={normalizeStatus(item.status)} />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-base font-medium text-foreground leading-5 tracking-normal line-clamp-2">
                    {item.servico}
                  </h3>
                  <p className="text-xs text-foreground-light truncate">
                    Protocolo {item.protocolo} • {item.categoria}
                  </p>
                </div>
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
      <SecondaryHeader
        route="/"
        style={{ paddingTop: '24px', paddingBottom: '24px' }}
      />

      <div className="pt-25 pb-32 px-4 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-medium text-foreground leading-9 tracking-tight">
            Consulte seu protocolo
          </h1>
          <p className="text-sm font-normal text-foreground-light leading-5 tracking-normal">
            A consulta neste campo não permite a visualização de todos os
            detalhes da solicitação
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="protocolo"
              className="text-sm font-normal text-primary leading-5 tracking-normal"
            >
              Número de protocolo
            </label>
            <input
              id="protocolo"
              type="text"
              placeholder="Escreva aqui seu número de protocolo"
              value={protocolo}
              onChange={e => setProtocolo(e.target.value)}
              className="w-full bg-transparent text-foreground text-sm font-normal leading-5 tracking-normal placeholder:text-foreground-light placeholder:text-sm placeholder:font-normal placeholder:leading-5 placeholder:tracking-normal h-16 rounded-xl px-5 border-[1.4px] border-border outline-none focus:border-primary transition-colors"
            />
            <p className="text-sm font-normal text-muted-foreground leading-5 tracking-normal">
              Escreva no formato: RIO-12345678-9
            </p>
            {pageState === 'error' && (
              <p className="text-xs text-red-500">{errorMsg}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!protocolo.trim()}
            className={`w-full text-sm font-medium leading-5 tracking-normal rounded-full py-4 px-6 flex items-center justify-center gap-3 transition-colors ${
              pageState === 'loading'
                ? 'bg-primary text-primary-foreground opacity-70 cursor-not-allowed'
                : 'bg-primary text-primary-foreground disabled:bg-card disabled:text-zinc-400 disabled:font-normal disabled:cursor-not-allowed'
            }`}
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
