import { SecondaryHeader } from '@/app/components/secondary-header'
import { Skeleton } from '@/components/ui/skeleton'

/** Skeleton fiel ao layout real: título e cards de imóvel com quatro linhas de conteúdo. */
export default function MeusImoveisLoading() {
  return (
    <div className="mx-auto flex min-h-lvh max-w-xl flex-col pt-20 pb-4 text-foreground">
      <SecondaryHeader title="" className="max-w-xl" route="/divida-ativa" />

      <div className="px-4 pt-2 pb-6">
        <Skeleton className="h-8 w-52" />
      </div>

      <div className="flex flex-col gap-2 px-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton key={index} className="h-48 w-full rounded-2xl" />
        ))}
        <Skeleton className="h-14 w-full rounded-2xl" />
      </div>
    </div>
  )
}
