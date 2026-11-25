'use client'

import { CustomButton } from '@/components/ui/custom/custom-button'
import { useChamadosSalesforce } from '@/hooks/chamados/use-chamados'
import { RequestsList } from './requests-list'
import { RequestsListSkeleton } from './requests-list-skeleton'

interface SalesforceListaProps {
  filtroInicial?: string
  /** Texto da lista vazia (ver `RequestsList`). */
  mensagemVazia?: string
}

/**
 * Chamados do novo 1746 (Mulesoft/Salesforce). Os dados vêm do cache do
 * TanStack Query, hidratado pelo servidor em `page.tsx` e compartilhado com o
 * banner da home.
 */
export function SalesforceLista({
  filtroInicial,
  mensagemVazia,
}: SalesforceListaProps) {
  const { data: itens, isPending, isError, refetch } = useChamadosSalesforce()

  if (isError) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-3 rounded-2xl bg-card p-4"
      >
        <p className="text-sm text-foreground-light text-center">
          Não foi possível carregar as suas solicitações.
        </p>
        <CustomButton variant="secondary" size="lg" onClick={() => refetch()}>
          Tentar novamente
        </CustomButton>
      </div>
    )
  }

  if (isPending) return <RequestsListSkeleton />

  return (
    <RequestsList
      items={itens}
      filtroInicial={filtroInicial}
      mensagemVazia={mensagemVazia}
    />
  )
}
