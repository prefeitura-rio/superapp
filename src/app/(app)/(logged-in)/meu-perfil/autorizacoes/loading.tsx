import { ProfileHeaderWrapper } from '@/app/components/profile-header-wrapper'
import { Skeleton } from '@/components/ui/skeleton'

export default function UserAuthorizationsLoading() {
  return (
    <div className="max-w-4xl mx-auto flex flex-col space-y-6">
      <ProfileHeaderWrapper menuHref="/meu-perfil" />

      <div className="mx-4 flex flex-col gap-2">
        {/* Heading skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-3/4" />
        </div>

        {/* Paragraphs skeleton — no gap between them, matches page */}
        <div className="space-y-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>

      {/* OptInSwitch skeleton */}
      <div className="mx-4 flex justify-start items-center gap-4">
        <Skeleton className="h-6 w-9" />
        <Skeleton className="h-5 w-24" />
      </div>
    </div>
  )
}
