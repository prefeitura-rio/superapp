import { Skeleton } from '@/components/ui/skeleton'

export default function CourseDetailLoading() {
  return (
    <div className="flex flex-col items-center pb-20">
      <div className="w-full max-w-3xl">
        {/* Header — imagem de fundo com back button e logo */}
        <div className="h-[280px] md:h-[340px] w-full relative">
          <Skeleton className="w-full h-full rounded-none" />

          {/* Back button */}
          <Skeleton className="absolute top-4 left-4 z-10 h-10 w-10 rounded-full" />

          {/* Logo centralizado */}
          <div className="absolute top-4 inset-x-0 flex justify-center pointer-events-none z-10">
            <Skeleton className="h-[38px] w-[170px] rounded-md" />
          </div>
        </div>

        {/* Bottom-sheet container */}
        <div className="flex flex-col items-center self-stretch rounded-t-2xl bg-background -mt-4 relative z-10">
          {/* Drag indicator */}
          <div className="w-[37px] h-1 rounded-full bg-[#E4E4E4] mt-4 mb-0 shrink-0" />

          <div className="flex flex-col gap-4 px-4 w-full pt-4">
            {/* Título + data de inscrição */}
            <div className="flex flex-col gap-1">
              <Skeleton className="h-9 w-4/5 rounded-md" />
              <Skeleton className="h-4 w-40 rounded-md" />
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Metadata cards — grid 2 colunas */}
            <div className="grid grid-cols-2 gap-2 w-full">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col p-5 rounded-xl bg-card gap-1"
                >
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>

            {/* CourseInfo — card "Curso oferecido por" */}
            <div className="flex flex-col gap-2 w-full -mt-2">
              <div className="flex items-center p-5 rounded-xl bg-card gap-3">
                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            </div>

            {/* Botão de ação principal */}
            <div className="w-full mt-4">
              <Skeleton className="h-12 w-full rounded-full" />
            </div>

            {/* Location/class selection — scrollable cards */}
            <div className="space-y-4 pt-4">
              {/* Label da seção */}
              <Skeleton className="h-4 w-44" />

              {/* Cards horizontais scrolláveis */}
              <div className="w-full overflow-x-hidden">
                <div className="flex gap-3 pb-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div
                      key={i}
                      className="shrink-0 w-[200px] p-4 rounded-xl bg-card flex flex-col gap-2"
                    >
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  ))}
                  <div className="shrink-0 w-4" aria-hidden="true" />
                </div>
              </div>

              {/* Schedule card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                <div className="flex flex-col p-5 rounded-xl bg-card gap-2.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-4 w-4 shrink-0" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Course content sections */}
            <div className="mt-8 space-y-6 px-0">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-5 w-40 mb-2" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>

            {/* Botão bottom */}
            <div className="w-full pt-4 pb-4">
              <Skeleton className="h-12 w-full rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
