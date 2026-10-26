import { SecondaryHeader } from '@/app/components/secondary-header'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Skeleton da tela de revisão.
 *
 * A simulação à vista atravessa o ePortal (reconsulta das CDAs + simulação), então a tela em
 * branco pareceria travada sem ele. O desenho imita o layout real — o resumo com os cards por
 * CDA dentro dele e os dois botões no rodapé.
 */
export default function RevisaoLoading() {
  return (
    <div className="mx-auto flex min-h-lvh max-w-4xl flex-col pt-20 pb-4 text-foreground">
      <SecondaryHeader
        title=""
        className="max-w-4xl"
        route="/divida-ativa/parcelamento"
      />

      <div className="flex flex-1 flex-col px-4">
        <div className="flex flex-col gap-2 pt-2 pb-6">
          <Skeleton className="h-8 w-full max-w-80" />
          <Skeleton className="h-8 w-56" />
        </div>

        <div className="flex flex-col gap-2 rounded-2xl bg-card p-4">
          <div className="flex flex-col gap-1 pb-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="flex flex-col gap-1 pb-4">
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-5 w-60" />
          </div>

          {[0, 1].map(indice => (
            <div
              key={indice}
              className="flex flex-col gap-4 rounded-2xl bg-background p-4"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 shrink-0 rounded-full" />
                <Skeleton className="h-5 w-16" />
              </div>
              <div className="flex flex-col gap-1">
                <Skeleton className="h-5 w-full max-w-64" />
                <Skeleton className="h-5 w-full max-w-72" />
                <Skeleton className="h-5 w-full max-w-60" />
                <Skeleton className="h-5 w-44" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-2 pt-6">
          <Skeleton className="h-13 w-full rounded-full" />
          <Skeleton className="h-13 w-full rounded-full" />
        </div>
      </div>
    </div>
  )
}
