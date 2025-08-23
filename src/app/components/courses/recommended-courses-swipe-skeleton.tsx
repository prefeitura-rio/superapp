'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function RecommendedCoursesSwipeSkeleton() {
  return (
    <>
      {/* Mobile - Scroll horizontal como o componente original */}
      <div className="block sm:hidden">
        <div className="px-4 mt-8">
          <div className="pb-2">
            <Skeleton className="h-5 w-32" />
          </div>

          <div className="relative w-full overflow-x-auto pb-2 no-scrollbar">
            <div className="flex gap-4 w-max">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[197px] rounded-xl overflow-hidden bg-background shrink-0"
                >
                  {/* Imagem do curso */}
                  <div className="relative w-full h-[120px] overflow-hidden rounded-xl">
                    <Skeleton className="w-full h-full" />

                    {/* Ícone do provider */}
                    <div className="absolute top-2 left-2 z-20 w-6 h-6 rounded-full flex items-center justify-center shadow-sm">
                      <Skeleton className="w-[15px] h-[15px] rounded-full" />
                    </div>
                  </div>

                  {/* Conteúdo do card */}
                  <div className="py-2">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                    <div className="mt-1">
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop - Swiper com grid */}
      <div className="hidden sm:block">
        <div className="px-4 pb-6 mt-8">
          <div className="pb-2">
            <Skeleton className="h-5 w-32" />
          </div>

          <div className="relative">
            <div className="overflow-hidden">
              <div className="grid grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-full rounded-xl overflow-hidden bg-background"
                  >
                    <div className="relative w-full h-[120px] overflow-hidden rounded-xl">
                      <Skeleton className="w-full h-full" />

                      <div className="absolute top-2 left-2 z-20 w-6 h-6 rounded-full flex items-center justify-center shadow-sm">
                        <Skeleton className="w-[15px] h-[15px] rounded-full" />
                      </div>
                    </div>

                    <div className="py-2">
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                      <div className="mt-1">
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Paginação - só no desktop */}
            <div className="flex justify-center items-center gap-1 mt-4">
              <Skeleton className="w-1.5 h-1.5 rounded-full" />
              <Skeleton className="w-1.5 h-1.5 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
