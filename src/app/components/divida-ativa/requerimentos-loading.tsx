import { SecondaryHeader } from '@/app/components/secondary-header'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Skeleton das telas de requerimentos — a consulta atravessa o DAM e demora. Imita o
 * layout real (título e cards) para o conteúdo não pular quando chegar. A lista mostra
 * dois cards sem prometer dois requerimentos; a consulta por protocolo, um.
 */
export function RequerimentosLoading({ cards }: { cards: 1 | 2 }) {
  return (
    <div className="mx-auto flex min-h-lvh max-w-4xl flex-col pt-20 pb-4 text-foreground">
      <SecondaryHeader
        title=""
        className="max-w-4xl"
        route="/divida-ativa/acompanhamento"
      />

      <div className="flex flex-1 flex-col px-4">
        <div className="flex flex-col gap-2 pt-2 pb-6">
          <Skeleton className="h-8 w-full max-w-80" />
          <Skeleton className="h-8 w-48" />
        </div>

        <div className="flex flex-col gap-3">
          {Array.from({ length: cards }, (_, indice) => (
            <div
              key={indice}
              className="flex flex-col gap-2 rounded-2xl bg-card p-4"
            >
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-7 w-full max-w-64" />
              <div className="flex flex-col gap-1 pt-2">
                <Skeleton className="h-5 w-56" />
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-44" />
                <Skeleton className="h-5 w-60" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
