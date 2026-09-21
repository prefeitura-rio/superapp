import { SecondaryHeader } from '@/app/components/secondary-header'
import { Skeleton } from '@/components/ui/skeleton'

/** Skeleton fiel ao layout da entrada: título de três linhas e os três itens da lista. */
export default function ParcelamentoLoading() {
  return (
    <div className="mx-auto flex min-h-lvh max-w-4xl flex-col pt-20 pb-4 text-foreground">
      <SecondaryHeader title="" className="max-w-4xl" route="/divida-ativa" />

      <div className="px-4 pt-2 pb-6">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="mt-2 h-9 w-4/5" />
        <Skeleton className="mt-2 h-9 w-2/5" />
      </div>

      <div className="flex flex-col gap-2 px-4">
        <Skeleton className="h-14 w-full rounded-2xl" />
        <Skeleton className="h-14 w-full rounded-2xl" />
        <Skeleton className="h-14 w-full rounded-2xl" />
      </div>
    </div>
  )
}
