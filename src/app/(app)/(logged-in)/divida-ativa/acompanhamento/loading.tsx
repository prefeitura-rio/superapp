import { SecondaryHeader } from '@/app/components/secondary-header'
import { Skeleton } from '@/components/ui/skeleton'

/** Skeleton fiel à entrada do acompanhamento: título, card, divisor, campo e botão. */
export default function AcompanhamentoLoading() {
  return (
    <div className="mx-auto flex min-h-lvh max-w-4xl flex-col pt-20 pb-4 text-foreground">
      <SecondaryHeader title="" className="max-w-4xl" route="/divida-ativa" />

      <div className="flex flex-1 flex-col px-4">
        <div className="flex flex-col gap-2 pt-2 pb-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-8 w-48" />
        </div>

        <Skeleton className="h-13 w-full rounded-2xl" />

        <hr className="my-6 border-t border-dashed border-border" />

        <div className="space-y-2">
          <Skeleton className="h-5 w-72" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>

        <div className="mt-auto pt-6">
          <Skeleton className="h-13 w-full rounded-full" />
        </div>
      </div>
    </div>
  )
}
