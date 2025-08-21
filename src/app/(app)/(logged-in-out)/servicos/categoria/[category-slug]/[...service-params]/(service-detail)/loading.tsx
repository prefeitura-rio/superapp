import { SecondaryHeader } from '@/app/components/secondary-header'
import { Skeleton } from '@/components/ui/skeleton'

export default function ServiceDetailLoading() {
  return (
    <div className="min-h-lvh max-w-4xl mx-auto flex flex-col">
      <SecondaryHeader title="Descrição do Serviço" showSearchButton />

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-20 md:pt-22 pb-20">
          {/* Service Title */}
          <Skeleton className="h-8 w-3/4 mb-2" />

          {/* Service Description */}
          <div className="space-y-2 mb-6">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-5/6" />
            <Skeleton className="h-5 w-4/5" />
          </div>

          {/* Access Service Button */}
          <Skeleton className="h-12 w-40 mb-6 rounded-full" />

          {/* Divider */}
          <div className="border-b border-border mb-6" />

          {/* Prazo Section */}
          <div className="mb-4">
            <Skeleton className="h-5 w-16 mb-1" />
            <Skeleton className="h-5 w-2/3" />
          </div>

          {/* Custo Section */}
          <div className="mb-4">
            <Skeleton className="h-5 w-16 mb-2" />
            <Skeleton className="h-5 w-1/2" />
          </div>

          {/* Como solicitar Section */}
          <div className="mb-4">
            <Skeleton className="h-5 w-32 mb-2" />
            <div className="space-y-3">
              <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-5/6" />
              </div>
              <Skeleton className="h-12 w-32 rounded-full" />
            </div>
          </div>

          {/* Documentos Section */}
          <div className="mb-4">
            <Skeleton className="h-5 w-40 mb-2" />
            <div className="space-y-2">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Skeleton className="h-2 w-2 mt-2 flex-shrink-0" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-5 w-full" />
                    {index === 0 && <Skeleton className="h-4 w-32" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Este serviço não cobre Section */}
          <div className="mb-4">
            <Skeleton className="h-5 w-40 mb-2" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-5/6" />
              <Skeleton className="h-5 w-4/5" />
            </div>
          </div>

          {/* Descrição Section */}
          <div className="mb-4">
            <Skeleton className="h-5 w-24 mb-2" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-5/6" />
              <Skeleton className="h-5 w-4/5" />
            </div>
          </div>

          {/* Legislação Section */}
          <div className="mb-4">
            <Skeleton className="h-5 w-24 mb-2" />
            <div className="space-y-1">
              {Array.from({ length: 2 }, (_, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Skeleton className="h-2 w-2 mt-2 flex-shrink-0" />
                  <Skeleton className="h-5 w-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Baixar App Section */}
          <div className="mb-6">
            <Skeleton className="h-5 w-16 mb-2" />
            <div className="space-y-3">
              <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-5/6" />
                <Skeleton className="h-5 w-4/5" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-12 w-32" />
                <Skeleton className="h-12 w-32" />
              </div>
            </div>
          </div>

          {/* Atendimento Presencial Section */}
          <div className="mb-6">
            <Skeleton className="h-5 w-40 mb-2" />
            <Skeleton className="h-5 w-full" />
          </div>

          {/* Órgão Gestor Section */}
          <div className="mb-6">
            <Skeleton className="h-5 w-24 mb-2" />
            <Skeleton className="h-5 w-2/3" />
          </div>
        </div>
      </div>
    </div>
  )
}
