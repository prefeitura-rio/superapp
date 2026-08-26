import { SecondaryHeader } from '@/app/components/secondary-header'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Skeleton fiel ao layout da landing do Marco 1: título, rótulo da seção e cinco itens.
 */
export default function DividaAtivaLoading() {
  return (
    <div className="mx-auto flex min-h-lvh max-w-xl flex-col pt-20 pb-4 text-foreground">
      <SecondaryHeader title="" className="max-w-xl" />

      <div className="px-4 pt-2 pb-6">
        <Skeleton className="h-8 w-48" />
      </div>

      <div className="px-4 pb-2">
        <Skeleton className="h-5 w-20" />
      </div>

      <div className="flex flex-col gap-2 px-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-14 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
