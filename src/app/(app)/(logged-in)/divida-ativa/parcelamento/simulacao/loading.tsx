import { SecondaryHeader } from '@/app/components/secondary-header'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Skeleton da simulação de parcelamento.
 *
 * Serve para as duas etapas (seleção de data e seleção de parcelas): o layout é igual —
 * título + lista + botão — então um skeleton único cobre os dois sem piscar.
 */
export default function SimulacaoLoading() {
  return (
    <div className="mx-auto flex min-h-lvh max-w-4xl flex-col pt-20 pb-4 text-foreground">
      <SecondaryHeader
        title=""
        className="max-w-4xl"
        route="/divida-ativa/parcelamento/debitos"
      />

      <div className="flex flex-1 flex-col px-4">
        <div className="flex flex-col gap-2 pt-2 pb-6">
          <Skeleton className="h-8 w-full max-w-80" />
          <Skeleton className="h-8 w-56" />
        </div>

        <div className="flex flex-col gap-2">
          {[0, 1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-14 w-full rounded-2xl" />
          ))}
        </div>

        <div className="mt-auto pt-6">
          <Skeleton className="h-13 w-full rounded-full" />
        </div>
      </div>
    </div>
  )
}
