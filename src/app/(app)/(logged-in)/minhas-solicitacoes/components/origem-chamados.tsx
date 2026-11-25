'use client'

import { CustomButton } from '@/components/ui/custom/custom-button'
import { RadioList } from '@/components/ui/custom/radio-list'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerTitle,
} from '@/components/ui/drawer'
import { useChamadosSgrc } from '@/hooks/chamados/use-chamados'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import {
  DEFAULT_ORIGEM,
  ORIGEM_LABEL,
  ORIGEM_PARAM,
  type Origem,
  mensagemSemChamados,
  origemToParam,
} from '../origem'
import { RequestsList } from './requests-list'
import { RequestsListSkeleton } from './requests-list-skeleton'
import { SalesforceLista } from './salesforce-lista'

const OPCOES: { label: string; value: Origem }[] = [
  { label: ORIGEM_LABEL.sgrc, value: 'sgrc' },
  { label: ORIGEM_LABEL.salesforce, value: 'salesforce' },
]

interface OrigemChamadosProps {
  filtroInicial?: string
  /** Origem aberta ao entrar (ver `resolveOrigemInicial`). Padrão: SGRC. */
  origemInicial?: Origem
  /** Origem do botão "Limpar" (padrão do acesso direto). Padrão: SGRC. */
  origemPadrao?: Origem
}

/**
 * Mantém `?o=` na URL sem navegar (sem nova renderização no servidor):
 * recarregar ou compartilhar o link preserva a escolha. O `?filtro=` é da aba
 * do Salesforce e não vale para o outro lado.
 */
function sincronizarOrigemNaUrl(origem: Origem) {
  const url = new URL(window.location.href)
  url.searchParams.set(ORIGEM_PARAM, origemToParam(origem))
  url.searchParams.delete('filtro')
  window.history.replaceState(null, '', url)
}

export function OrigemChamados({
  filtroInicial,
  origemInicial = DEFAULT_ORIGEM,
  origemPadrao = DEFAULT_ORIGEM,
}: OrigemChamadosProps) {
  const [selectedOrigem, setSelectedOrigem] = useState<Origem>(origemInicial)
  const [draft, setDraft] = useState<Origem>(selectedOrigem)
  const [open, setOpen] = useState(false)
  const [pagina, setPagina] = useState(1)
  // Cache por página no TanStack Query: voltar a uma página já vista é
  // instantâneo. Na troca, a anterior fica na tela (`isPlaceholderData`).
  const sgrc = useChamadosSgrc(pagina, { enabled: selectedOrigem === 'sgrc' })

  function openSheet() {
    setDraft(selectedOrigem)
    setOpen(true)
  }

  function handleApply() {
    setSelectedOrigem(draft)
    if (draft !== selectedOrigem) sincronizarOrigemNaUrl(draft)
    setOpen(false)
  }

  function handleClear() {
    setDraft(origemPadrao)
  }

  function renderSgrc() {
    if (sgrc.isError) {
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
            onClick={() => sgrc.refetch()}
          >
            Tentar novamente
          </CustomButton>
        </div>
      )
    }

    // Primeira carga: o mesmo skeleton da rota, sem texto piscando.
    const historico = sgrc.data
    if (!historico) return <RequestsListSkeleton />

    const atualizando = sgrc.isPlaceholderData
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
          mensagemVazia={mensagemSemChamados('sgrc')}
          pagination={{
            page: pagina,
            totalPages: historico.totalPages,
            onPageChange: setPagina,
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
        <SalesforceLista
          key="salesforce"
          filtroInicial={filtroInicial}
          mensagemVazia={mensagemSemChamados('salesforce')}
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
