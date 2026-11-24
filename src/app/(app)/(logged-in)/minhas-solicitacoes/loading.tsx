import { BreadcrumbSkeleton } from '@/app/components/breadcrumb-skeleton'
import { ProfileHeaderWrapper } from '@/app/components/profile-header-wrapper'
import { RequestsListSkeleton } from './components/requests-list-skeleton'

export default function Loading() {
  return (
    <div className="text-foreground">
      <ProfileHeaderWrapper />
      <BreadcrumbSkeleton />
      <div className="max-w-4xl mx-auto px-4 pb-4">
        <h1 className="text-3xl font-medium text-foreground pt-2 pb-2">
          Minhas Solicitações
        </h1>

        <div className="flex flex-col gap-2">
          {/* Pill skeleton */}
          <div className="h-8 w-36 rounded-full bg-muted animate-pulse" />

          <RequestsListSkeleton />
        </div>
      </div>
    </div>
  )
}
