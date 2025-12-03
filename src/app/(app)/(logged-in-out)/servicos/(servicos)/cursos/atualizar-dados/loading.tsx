import { SecondaryHeader } from '@/app/components/secondary-header'
import { Skeleton } from '@/components/ui/skeleton'

export default function AtualizarDadosLoading() {
  return (
    <div className="pt-20 min-h-lvh max-w-xl mx-auto text-foreground flex flex-col">
      <SecondaryHeader title="" route="/servicos/cursos/" />

      <div className="px-4">
        {/* Title skeleton */}
        <div className="pt-2 pb-6">
          <Skeleton className="h-9 w-80" />
        </div>

        {/* Menu items skeleton */}
        <div className="space-y-0">
          {/* First menu item - Celular */}
          <div className="flex items-center justify-between py-5 gap-4 border-b border-border">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <Skeleton className="h-5 w-5 rounded" />
              <div className="flex flex-col min-w-0 flex-1 gap-2">
                <Skeleton className="h-4 w-16" />
                <div className="flex items-center gap-2 min-w-0">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              </div>
            </div>
            <Skeleton className="h-5 w-5 rounded" />
          </div>

          {/* Second menu item - E-mail */}
          <div className="flex items-center justify-between py-5 gap-4">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <Skeleton className="h-5 w-5 rounded" />
              <div className="flex flex-col min-w-0 flex-1 gap-2">
                <Skeleton className="h-4 w-16" />
                <div className="flex items-center gap-2 min-w-0">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              </div>
            </div>
            <Skeleton className="h-5 w-5 rounded" />
          </div>
        </div>

        {/* Footer text skeleton */}
        <div className="pt-8 space-y-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4" />
        </div>
      </div>
    </div>
  )
}
