import { SecondaryHeader } from '@/app/components/secondary-header'
import { Skeleton } from '@/components/ui/skeleton'

function CandidaturaCardSkeleton() {
  return (
    <div className="bg-card rounded-3xl p-4 flex flex-col gap-4">
      {/* Badge */}
      <Skeleton className="h-6 w-24 rounded-full" />

      {/* Título + empresa */}
      <div className="flex-1 flex flex-col justify-center space-y-1.5">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>

      {/* Área de progresso */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-1.5 w-full rounded-full" />
      </div>
    </div>
  )
}

export default function MinhasCandidaturasLoading() {
  return (
    <main className="max-w-4xl min-h-lvh mx-auto text-foreground pb-10">
      <SecondaryHeader fixed={false} title="Minhas candidaturas" />

      <div className="px-4">
        <div className="flex flex-col gap-2 md:grid md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <CandidaturaCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </main>
  )
}
