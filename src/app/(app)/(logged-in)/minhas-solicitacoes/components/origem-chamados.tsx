'use client'

import { useState } from 'react'
import { formatDate, mapCategoria, normalizeStatus } from '../helpers'
import { type RequestItem, RequestsList } from './requests-list'

const BOTOES = [
  { id: 'salesforce', rotulo: 'Chamados recentes' },
  { id: 'sgrc', rotulo: 'Chamados antigos' },
] as const

type Origem = (typeof BOTOES)[number]['id']

interface ProtocoloLista {
  protocolo?: string
  status?: string
  dataAbertura?: string
  ordens_de_servico?: {
    codigoOs?: string
    servico?: string
    subtema?: string
    categoria?: string
    status?: string
    dataAbertura?: string
    isAcessoInformacao?: boolean
  }[]
}

function itensDe(protocolos: ProtocoloLista[]): RequestItem[] {
  return protocolos.flatMap(protocolo =>
    (protocolo.ordens_de_servico ?? []).map(os => ({
      protocolo: protocolo.protocolo ?? '',
      codigoOs: os.codigoOs ?? '',
      servico: os.servico ?? os.subtema ?? '—',
      categoria: mapCategoria(os.categoria),
      status: normalizeStatus(os.status ?? protocolo.status),
      dataAbertura: formatDate(os.dataAbertura ?? protocolo.dataAbertura),
      isAcessoInformacao: os.isAcessoInformacao ?? false,
    }))
  )
}

export function OrigemChamados({ salesforce }: { salesforce: RequestItem[] }) {
  const [origem, setOrigem] = useState<Origem>('salesforce')
  const [sgrc, setSgrc] = useState<RequestItem[] | null>(null)
  const [carregando, setCarregando] = useState(false)

  async function selecionar(proxima: Origem) {
    setOrigem(proxima)
    if (proxima !== 'sgrc' || sgrc) return

    setCarregando(true)
    try {
      const resposta = await fetch('/api/chamados?origem=sgrc')
      const json = await resposta.json()
      setSgrc(itensDe(json?.protocolos ?? []))
    } catch {
      setSgrc([])
    } finally {
      setCarregando(false)
    }
  }

  const itens = origem === 'sgrc' ? (sgrc ?? []) : salesforce

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {BOTOES.map(botao => (
          <button
            key={botao.id}
            type="button"
            onClick={() => selecionar(botao.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
              origem === botao.id
                ? 'border border-foreground bg-secondary text-foreground'
                : 'bg-card text-foreground border border-transparent hover:bg-card/70'
            }`}
          >
            {botao.rotulo}
          </button>
        ))}
      </div>
      {carregando ? (
        <p className="text-sm text-foreground-light">Carregando histórico…</p>
      ) : (
        <RequestsList
          key={origem}
          items={itens}
          filtros={origem === 'sgrc' ? ['Todos'] : undefined}
        />
      )}
    </div>
  )
}
