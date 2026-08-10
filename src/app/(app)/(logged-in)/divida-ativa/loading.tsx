import { SecondaryHeader } from '@/app/components/secondary-header'
import { Skeleton } from '@/components/ui/skeleton'

/** Skeleton fiel ao layout real da landing: título em duas linhas e cinco itens de serviço. */
export default function DividaAtivaLoading() {
  return (
    <div className="mx-auto flex min-h-lvh max-w-xl flex-col pt-20 pb-4 text-foreground">
      <SecondaryHeader title="" className="max-w-xl" />

      <div className="px-4 pt-2 pb-6">
        <Skeleton className="mb-2 h-8 w-full" />
        <Skeleton className="h-8 w-40" />
      </div>

      <div className="flex flex-col gap-2 px-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-14 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
