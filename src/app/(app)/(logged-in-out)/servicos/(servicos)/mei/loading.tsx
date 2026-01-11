import { MeiHeader } from '@/app/components/mei/mei-header'
import { Skeleton } from '@/components/ui/skeleton'
import { getUserInfoFromToken } from '@/lib/user-info'

function MeiOpportunityCardSkeleton() {
  return (
    <div className="w-full rounded-xl overflow-hidden bg-background flex gap-3 sm:flex-col sm:gap-0">
      {/* Image container */}
      <div className="relative shrink-0 overflow-hidden rounded-xl bg-muted w-26 h-26 sm:w-full sm:h-[120px]">
        <Skeleton className="w-full h-full" />
      </div>
      {/* Content */}
      <div className="flex-1 flex flex-col justify-center min-w-0 py-2 sm:py-2">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  )
}

function MeiOpportunitiesSectionSkeleton() {
  return (
    <section className="mb-8">
      <Skeleton className="h-5 w-40 mb-4" />
      {/* Mobile: column layout */}
      <div className="flex flex-col sm:hidden">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index}>
            <MeiOpportunityCardSkeleton />
            {index < 2 && <div className="h-px w-full bg-border my-4" />}
          </div>
        ))}
      </div>
      {/* Desktop: grid layout - 4 columns */}
      <div className="hidden sm:grid sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <MeiOpportunityCardSkeleton key={index} />
        ))}
      </div>
    </section>
  )
}

export default async function MeiLoading() {
  const userInfo = await getUserInfoFromToken()
  const isLoggedIn = !!(userInfo.cpf && userInfo.name)

  return (
    <div className="min-h-lvh">
      <MeiHeader isLoggedIn={isLoggedIn} />
      <main className="max-w-4xl mx-auto pb-34 px-4">
        {/* Minhas oportunidades - só mostra skeleton se logado */}
        {isLoggedIn && (
          <section className="mb-8">
            <Skeleton className="h-5 w-40 mb-4" />
            {/* Mobile: column layout */}
            <div className="flex flex-col sm:hidden">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index}>
                  <MeiOpportunityCardSkeleton />
                  {index < 1 && <div className="h-px w-full bg-border my-4" />}
                </div>
              ))}
            </div>
            {/* Desktop: grid layout - 4 columns */}
            <div className="hidden sm:grid sm:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <MeiOpportunityCardSkeleton key={index} />
              ))}
            </div>
          </section>
        )}

        {/* Todas as oportunidades */}
        <MeiOpportunitiesSectionSkeleton />
      </main>
    </div>
  )
}
