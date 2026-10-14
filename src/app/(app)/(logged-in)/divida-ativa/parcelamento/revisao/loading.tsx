import { SecondaryHeader } from '@/app/components/secondary-header'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Skeleton da tela de revisão.
 *
 * Mesma razão do skeleton de `/debitos`: esta rota repete a consulta que atravessa o ePortal
 * (~16 s), então a tela em branco pareceria travada sem ele. O desenho imita o layout real —
 * resumo, cards por CDA e os dois botões no rodapé.
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
        <div className="pt-2 pb-6">
          <Skeleton className="h-8 w-full max-w-80" />
        </div>

        <div className="flex flex-col gap-2 rounded-2xl bg-card p-4">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-5 w-32" />
          <div className="flex flex-col gap-2 pt-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-6">
          {[0, 1].map(indice => (
            <div
              key={indice}
              className="flex flex-col gap-3 rounded-2xl bg-card p-4"
            >
              <div className="flex items-center gap-2">
                <Skeleton className="size-8 shrink-0 rounded-lg" />
                <Skeleton className="h-5 w-16" />
              </div>
              <div className="flex flex-col gap-1">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full max-w-64" />
                <Skeleton className="h-5 w-full max-w-56" />
                <Skeleton className="h-5 w-32" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-3 pt-6">
          <Skeleton className="h-13 w-full rounded-full" />
          <Skeleton className="h-13 w-full rounded-full" />
        </div>
      </div>
    </div>
  )
}
