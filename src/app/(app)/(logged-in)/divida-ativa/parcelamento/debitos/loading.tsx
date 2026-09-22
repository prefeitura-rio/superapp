import { SecondaryHeader } from '@/app/components/secondary-header'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Skeleton da tela de débitos.
 *
 * Aqui ele não é enfeite: a consulta atravessa o ePortal e leva ~16 s, tempo em que uma tela
 * em branco parece travada. O desenho imita o layout real — título, cards e o "Continuar" no
 * rodapé — para que o conteúdo não pule quando chegar.
 *
 * Três cards porque é a quantidade que preenche a dobra sem prometer três CDAs: o número
 * real só se sabe depois da resposta.
 */
export default function DebitosLoading() {
  return (
    <div className="mx-auto flex min-h-lvh max-w-4xl flex-col pt-20 pb-4 text-foreground">
      <SecondaryHeader
        title=""
        className="max-w-4xl"
        route="/divida-ativa/parcelamento"
      />

      <div className="flex flex-1 flex-col px-4">
        <div className="flex flex-col gap-2 pt-2 pb-6">
          <Skeleton className="h-8 w-full max-w-72" />
          <Skeleton className="h-8 w-48" />
        </div>

        <div className="flex flex-col gap-2">
          {[0, 1, 2].map(indice => (
            <div
              key={indice}
              className="flex items-start gap-4 rounded-2xl bg-card p-4"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-8 shrink-0 rounded-lg" />
                  <Skeleton className="h-5 w-16" />
                </div>

                <div className="flex flex-col gap-1">
                  <Skeleton className="h-5 w-full max-w-64" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-full max-w-56" />
                  <Skeleton className="h-5 w-32" />
                </div>

                <Skeleton className="h-5 w-16" />
              </div>

              <Skeleton className="size-[22px] self-center rounded" />
            </div>
          ))}
        </div>

        <Skeleton className="mt-auto h-13 w-full rounded-full" />
      </div>
    </div>
  )
}
