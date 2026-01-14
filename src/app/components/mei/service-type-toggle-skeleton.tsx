'use client'

import { Skeleton } from '@/components/ui/skeleton'

type ServiceType = 'mei' | 'cursos'

interface ServiceTypeToggleSkeletonProps {
  activeType?: ServiceType
}

export function ServiceTypeToggleSkeleton({
  activeType = 'cursos',
}: ServiceTypeToggleSkeletonProps) {
  return (
    <div className="flex items-center bg-card/70 rounded-full p-1 w-full px-10">
      <Skeleton
        className={`flex-1 h-10 rounded-full ${activeType === 'mei' ? '' : 'bg-card/80'}`}
      />
      <Skeleton
        className={`flex-1 h-10 rounded-full ${activeType === 'cursos' ? '' : 'bg-card/80'}`}
      />
    </div>
  )
}
