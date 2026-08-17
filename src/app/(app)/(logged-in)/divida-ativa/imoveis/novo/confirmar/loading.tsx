import { SecondaryHeader } from '@/app/components/secondary-header'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Este skeleton é o que o cidadão vê durante a consulta ao sistema fiscal — a espera real
 * deste fluxo. Fiel ao layout: título em duas linhas, card de conferência e dois botões.
 */
export default function ConfirmarImovelLoading() {
  return (
    <div className="mx-auto flex min-h-lvh max-w-xl flex-col pt-20 pb-4 text-foreground">
      <SecondaryHeader
        title=""
        className="max-w-xl"
        route="/divida-ativa/imoveis/novo"
      />

      <div className="px-4 pt-2 pb-6">
        <Skeleton className="mb-2 h-8 w-full" />
        <Skeleton className="h-8 w-44" />
      </div>

      <div className="px-4">
        <Skeleton className="h-44 w-full rounded-2xl" />
      </div>

      <div className="mt-8 flex gap-3 px-4">
        <Skeleton className="h-13 flex-1 rounded-full" />
        <Skeleton className="h-13 flex-1 rounded-full" />
      </div>
    </div>
  )
}
