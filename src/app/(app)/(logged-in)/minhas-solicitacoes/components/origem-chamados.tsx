'use client'

import { CustomButton } from '@/components/ui/custom/custom-button'
import { RadioList } from '@/components/ui/custom/radio-list'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerTitle,
} from '@/components/ui/drawer'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { formatDate, mapCategoria, normalizeStatus } from '../helpers'
import { type RequestItem, RequestsList } from './requests-list'

type Origem = 'sgrc' | 'salesforce'

const DEFAULT_ORIGEM: Origem = 'sgrc'

const OPCOES: { label: string; value: Origem }[] = [
  { label: 'abertas até 26/11/2026', value: 'sgrc' },
  { label: 'abertas a partir de 27/11/2026', value: 'salesforce' },
]

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

interface OrigemChamadosProps {
  salesforce: RequestItem[]
  historicoSgrc: boolean
  filtroInicial?: string
}

export function OrigemChamados({
  salesforce,
  historicoSgrc,
  filtroInicial,
}: OrigemChamadosProps) {
  const [selectedOrigem, setSelectedOrigem] = useState<Origem>(
    historicoSgrc ? DEFAULT_ORIGEM : 'salesforce'
  )
  const [draft, setDraft] = useState<Origem>(selectedOrigem)
  const [sgrc, setSgrc] = useState<RequestItem[] | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [open, setOpen] = useState(false)

  const loadSgrc = useCallback(async () => {
    if (sgrc) return

    setCarregando(true)
    try {
      const resposta = await fetch('/api/chamados?origem=sgrc')
      if (!resposta.ok) {
        throw new Error(`Falha ao carregar histórico SGRC: ${resposta.status}`)
      }
      const json = await resposta.json()
      setSgrc(itensDe(json?.protocolos ?? []))
    } finally {
      setCarregando(false)
    }
  }, [sgrc])

  useEffect(() => {
    if (historicoSgrc && selectedOrigem === 'sgrc') {
      void loadSgrc()
    }
  }, [historicoSgrc, loadSgrc, selectedOrigem])

  function openSheet() {
    setDraft(selectedOrigem)
    setOpen(true)
  }

  async function handleApply() {
    setSelectedOrigem(draft)
    setOpen(false)
    if (draft === 'sgrc') await loadSgrc()
  }

  function handleClear() {
    setDraft(DEFAULT_ORIGEM)
  }

  if (!historicoSgrc) {
    return <RequestsList items={salesforce} filtroInicial={filtroInicial} />
  }

  const itens = selectedOrigem === 'sgrc' ? (sgrc ?? []) : salesforce

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        <button
          type="button"
          onClick={openSheet}
          className="flex h-8 items-center gap-1.5 px-4 rounded-full border whitespace-nowrap transition-colors shrink-0 cursor-pointer text-sm font-normal leading-5 tracking-normal border-foreground bg-card"
        >
          Data de abertura
          <ChevronDown
            className={cn(
              'size-3.5 shrink-0 transition-transform duration-200',
              open && 'rotate-180'
            )}
          />
        </button>
      </div>

      {carregando ? (
        <p className="text-sm text-foreground-light">Carregando histórico…</p>
      ) : (
        <RequestsList
          key={selectedOrigem}
          items={itens}
          filtros={selectedOrigem === 'sgrc' ? ['Todos'] : undefined}
          filtroInicial={filtroInicial}
          paginated={selectedOrigem === 'sgrc'}
        />
      )}

      <Drawer
        open={open}
        onOpenChange={isOpen => {
          if (!isOpen) setOpen(false)
        }}
      >
        <DrawerContent className="max-w-4xl mx-auto rounded-t-3xl! pb-0 flex flex-col">
          <DrawerTitle className="sr-only">
            Data de abertura das solicitações
          </DrawerTitle>
          <div className="flex justify-center pt-8 pb-6 shrink-0">
            <div className="w-8.5 h-1 rounded-full bg-popover-line" />
          </div>
          <div className="px-8 overflow-y-auto max-h-[70vh]">
            <RadioList
              name="periodo-chamados"
              options={OPCOES}
              value={draft}
              onValueChange={value => setDraft(value as Origem)}
            />
          </div>
          <DrawerFooter className="flex-row gap-2 px-8 pt-6 pb-10 shrink-0">
            <CustomButton
              variant="secondary"
              onClick={handleClear}
              size="lg"
              className="flex-1"
            >
              Limpar
            </CustomButton>
            <CustomButton
              variant="primary"
              onClick={handleApply}
              size="lg"
              className="flex-1"
            >
              Aplicar
            </CustomButton>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
