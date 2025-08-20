import { SecondaryHeader } from '@/app/components/secondary-header'
import { Skeleton } from '@/components/ui/skeleton'

export default function UserPersonalInfoLoading() {
  return (
    <div className="min-h-screen max-w-4xl mx-auto pt-24 pb-10 bg-background">
      <SecondaryHeader title="Informações pessoais" route="/user-profile" />
      <div className="space-y-6 p-4">
        {/* CPF Field Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-16 w-full rounded-xl border-2" />
        </div>

        {/* Nome completo Field Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-16 w-full rounded-xl border-2" />
        </div>

        {/* Nome social ActionDiv Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-16 w-full rounded-xl border-2" />
        </div>

        {/* Nacionalidade Field Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-16 w-full rounded-xl border-2" />
        </div>

        {/* Cor / Raça ActionDiv Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-16 w-full rounded-xl border-2" />
        </div>

        {/* Data de nascimento Field Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-16 w-full rounded-xl border-2" />
        </div>

        {/* Sexo Field Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-16 w-full rounded-xl border-2" />
        </div>

        {/* Celular ActionDiv Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-16 w-full rounded-xl border-2" />
        </div>

        {/* E-mail ActionDiv Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-16 w-full rounded-xl border-2" />
        </div>
      </div>
    </div>
  )
}
