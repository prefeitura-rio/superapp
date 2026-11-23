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
import { useEffect, useState } from 'react'
import { formatDate, mapCategoria, normalizeStatus } from '../helpers'
import { type RequestItem, RequestsList } from './requests-list'
import { RequestsListSkeleton } from './requests-list-skeleton'

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

interface PaginaSgrc {
  itens: RequestItem[]
  totalPages: number
}

type StatusSgrc = 'carregando' | 'erro' | 'pronto'

interface OrigemChamadosProps {
  salesforce: RequestItem[]
  filtroInicial?: string
}

export function OrigemChamados({
  salesforce,
  filtroInicial,
}: OrigemChamadosProps) {
  const [selectedOrigem, setSelectedOrigem] = useState<Origem>(DEFAULT_ORIGEM)
  const [draft, setDraft] = useState<Origem>(selectedOrigem)
  const [open, setOpen] = useState(false)
  // Objeto novo a cada pedido: "tentar novamente" refaz a mesma página.
  const [consulta, setConsulta] = useState({ pagina: 1 })
  // A última página recebida fica na tela enquanto a próxima carrega (troca de
  // página, volta do Salesforce): a lista não some nem pisca.
  const [historico, setHistorico] = useState<PaginaSgrc | null>(null)
  const [status, setStatus] = useState<StatusSgrc>('carregando')

  useEffect(() => {
    if (selectedOrigem !== 'sgrc') return

    let ativo = true
    const controller = new AbortController()
    setStatus('carregando')

    fetch(`/api/chamados?origem=sgrc&page=${consulta.pagina}`, {
      signal: controller.signal,
    })
      .then(async resposta => {
        if (!resposta.ok) {
          throw new Error(
            `Falha ao carregar histórico SGRC: ${resposta.status}`
          )
        }
        const json = await resposta.json()
        if (!ativo) return
        setHistorico({
          itens: itensDe(json?.protocolos ?? []),
          totalPages: json?.pagination?.totalPages ?? 1,
        })
        setStatus('pronto')
      })
      .catch(() => {
        if (ativo) setStatus('erro')
      })

    return () => {
      ativo = false
      controller.abort()
    }
  }, [selectedOrigem, consulta])

  function openSheet() {
    setDraft(selectedOrigem)
    setOpen(true)
  }

  function handleApply() {
    setSelectedOrigem(draft)
    setOpen(false)
  }

  function handleClear() {
    setDraft(DEFAULT_ORIGEM)
  }

  function renderSgrc() {
    if (status === 'erro') {
      return (
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-2xl bg-card p-4"
        >
          <p className="text-sm text-foreground-light text-center">
            Não foi possível carregar o histórico de solicitações.
          </p>
          <CustomButton
            variant="secondary"
            size="lg"
            onClick={() => setConsulta(atual => ({ ...atual }))}
          >
            Tentar novamente
          </CustomButton>
        </div>
      )
    }

    // Primeira carga: o mesmo skeleton da rota, sem texto piscando.
    if (!historico) return <RequestsListSkeleton />

    const atualizando = status === 'carregando'
    return (
      <div
        aria-busy={atualizando}
        className={cn(
          'transition-opacity duration-200',
          // Só esmaece se a resposta demorar: página rápida não pisca.
          atualizando && 'pointer-events-none opacity-60 delay-150'
        )}
      >
        <RequestsList
          key="sgrc"
          items={historico.itens}
          filtros={['Todos']}
          filtroInicial={filtroInicial}
          pagination={{
            page: consulta.pagina,
            totalPages: historico.totalPages,
            onPageChange: pagina => setConsulta({ pagina }),
          }}
        />
      </div>
    )
  }

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

      {selectedOrigem === 'sgrc' ? (
        renderSgrc()
      ) : (
        <RequestsList
          key="salesforce"
          items={salesforce}
          filtroInicial={filtroInicial}
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
