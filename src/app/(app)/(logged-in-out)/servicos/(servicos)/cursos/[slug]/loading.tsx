import { OportunidadesSubHeader } from '@/app/components/oportunidades/oportunidades-sub-header'
import { Skeleton } from '@/components/ui/skeleton'

export default function CourseDetailLoading() {
  return (
    <div className="bg-white dark:bg-background">
      <OportunidadesSubHeader
        menuHref="/servicos/cursos/opcoes"
        logoHref="/servicos/cursos"
        showSearchIcon
        searchUrl="/servicos/cursos/busca"
      />
      <div className="flex flex-col items-center pb-20">
        <div className="w-full max-w-4xl px-4">
          {/* Cover image */}
          <Skeleton className="w-full h-70 md:h-85 rounded-2xl" />

          {/* Bottom-sheet container */}
          <div className="flex flex-col items-center self-stretch rounded-t-2xl bg-background -mt-4 relative z-10">
            {/* Drag indicator */}
            <div className="w-9.25 h-1 rounded-full bg-[#E4E4E4] mt-4 mb-0 shrink-0" />

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

              {/* Location/class selection */}
              <div className="space-y-4 pt-4">
                <Skeleton className="h-4 w-44" />
                <div className="w-full overflow-x-hidden">
                  <div className="flex gap-3 pb-2">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div
                        key={i}
                        className="shrink-0 w-50 p-4 rounded-xl bg-card flex flex-col gap-2"
                      >
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    ))}
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
              <div className="mt-8 space-y-6">
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
    </div>
  )
}
